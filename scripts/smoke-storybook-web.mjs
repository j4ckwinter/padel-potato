import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";

const STARTUP_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;
const LOOPBACK_HOST = "127.0.0.1";

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function reserveAvailablePort() {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, LOOPBACK_HOST, resolve);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new Error("Could not reserve an available loopback port.");
  }

  const { port } = address;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function terminateProcessTree(child) {
  if (!Number.isInteger(child.pid) || child.pid <= 0) {
    return;
  }

  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill.exe",
        ["/pid", String(child.pid), "/t", "/f"],
        { stdio: "ignore", windowsHide: true },
      );
      killer.once("error", resolve);
      killer.once("exit", resolve);
    });
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }

  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(3_000),
  ]);

  if (child.exitCode === null && child.signalCode === null) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
}

function registerProcessCleanup(child) {
  let cleanupPromise;

  const signalHandlers = new Map();
  const removeHandlers = () => {
    for (const [signal, handler] of signalHandlers) {
      process.removeListener(signal, handler);
    }
    process.removeListener("uncaughtException", handleUncaughtException);
  };
  const cleanup = () => {
    cleanupPromise ??= terminateProcessTree(child)
      .catch((error) => {
        console.error(`Storybook cleanup warning: ${error.message}`);
      })
      .finally(removeHandlers);
    return cleanupPromise;
  };
  const handleSignal = (signal) => {
    void cleanup().finally(() => {
      process.kill(process.pid, signal);
    });
  };
  const handleUncaughtException = (error) => {
    void cleanup().finally(() => {
      setImmediate(() => {
        throw error;
      });
    });
  };

  for (const signal of ["SIGINT", "SIGTERM"]) {
    const handler = () => handleSignal(signal);
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }
  process.once("uncaughtException", handleUncaughtException);

  return cleanup;
}

function bundleUrlsFromHtml(html, baseUrl) {
  const urls = new Set();
  const sourcePattern = /(?:src|href)=["']([^"']+)["']/giu;
  for (const match of html.matchAll(sourcePattern)) {
    const value = match[1];
    if (value.includes(".bundle") || value.includes("AppEntry")) {
      urls.add(new URL(value, baseUrl).href);
    }
  }
  return [...urls];
}

async function assertStorybookEntry(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`HTTP readiness returned ${response.status} at ${url}`);
  }

  const html = await response.text();
  const candidates = bundleUrlsFromHtml(html, url);
  const storybookMarkers = [
    ".rnstorybook",
    "storybook.requires",
    "StorybookUIRoot",
    "@storybook/react-native",
  ];

  if (storybookMarkers.some((marker) => html.includes(marker))) {
    return;
  }

  if (candidates.length === 0) {
    throw new Error(
      "Served HTML did not reference an Expo application bundle.",
    );
  }

  for (const bundleUrl of candidates) {
    const bundleResponse = await fetch(bundleUrl, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!bundleResponse.ok) continue;
    const bundle = await bundleResponse.text();
    if (storybookMarkers.some((marker) => bundle.includes(marker))) {
      return;
    }
  }

  throw new Error(
    "The served Expo bundle did not contain the React Native Storybook entry.",
  );
}

async function main() {
  const startedAt = Date.now();
  const port = await reserveAvailablePort();
  const url = `http://${LOOPBACK_HOST}:${port}`;
  const npmExecutable = process.env.npm_execpath
    ? process.execPath
    : process.platform === "win32"
      ? (process.env.ComSpec ?? "cmd.exe")
      : "npm";
  const npmCommandArguments = [
    "run",
    "storybook:web",
    "--",
    "--port",
    String(port),
  ];
  const npmArguments = process.env.npm_execpath
    ? [process.env.npm_execpath, ...npmCommandArguments]
    : process.platform === "win32"
      ? ["/d", "/s", "/c", "npm.cmd", ...npmCommandArguments]
      : npmCommandArguments;
  const output = [];
  const child = spawn(npmExecutable, npmArguments, {
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      BROWSER: "none",
      CI: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  const cleanup = registerProcessCleanup(child);

  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      output.push(chunk);
      process.stdout.write(chunk);
    });
  }

  let childFailure;
  child.once("error", (error) => {
    childFailure = error;
  });
  child.once("exit", (code, signal) => {
    if (code !== null && code !== 0) {
      childFailure = new Error(`Expo exited with code ${code}.`);
    } else if (signal !== null) {
      childFailure = new Error(`Expo exited from signal ${signal}.`);
    }
  });

  try {
    const deadline = startedAt + STARTUP_TIMEOUT_MS;
    let lastError = new Error("Expo web has not responded yet.");

    while (Date.now() < deadline) {
      if (childFailure) throw childFailure;
      try {
        await assertStorybookEntry(url);
        const duration = Date.now() - startedAt;
        console.log(
          `Storybook web smoke passed: ${url} (${duration} ms, Storybook entry confirmed)`,
        );
        return;
      } catch (error) {
        lastError = error;
        await delay(POLL_INTERVAL_MS);
      }
    }

    const recentOutput = output.join("").slice(-4_000);
    throw new Error(
      `Timed out after ${STARTUP_TIMEOUT_MS} ms: ${lastError.message}\n${recentOutput}`,
    );
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error(`Storybook web smoke failed: ${error.message}`);
  process.exitCode = 1;
});
