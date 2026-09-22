import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const STARTUP_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;
const LOOPBACK_HOST = '127.0.0.1';

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function reserveAvailablePort() {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, LOOPBACK_HOST, resolve);
  });

  const address = server.address();
  if (address === null || typeof address === 'string') {
    server.close();
    throw new Error('Could not reserve an available loopback port.');
  }

  const { port } = address;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

export async function terminateProcessTree(
  child,
  {
    platform = process.platform,
    spawnProcess = spawn,
    killProcess = process.kill.bind(process),
  } = {},
) {
  if (!Number.isInteger(child.pid) || child.pid <= 0) {
    return;
  }

  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  if (platform === 'win32') {
    await new Promise((resolve, reject) => {
      const killer = spawnProcess(
        'taskkill.exe',
        ['/pid', String(child.pid), '/t', '/f'],
        { stdio: 'ignore', windowsHide: true },
      );
      killer.once('error', reject);
      killer.once('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`taskkill exited with code ${code}`));
        }
      });
    });
    return;
  }

  try {
    killProcess(-child.pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
    return;
  }

  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(3_000),
  ]);

  if (child.exitCode === null && child.signalCode === null) {
    try {
      killProcess(-child.pid, 'SIGKILL');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
      return;
    }

    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      delay(3_000),
    ]);
    if (child.exitCode === null && child.signalCode === null) {
      throw new Error(`process group ${child.pid} did not exit after SIGKILL`);
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
    process.removeListener('uncaughtException', handleUncaughtException);
  };
  const cleanup = () => {
    cleanupPromise ??= terminateProcessTree(child).finally(removeHandlers);
    return cleanupPromise;
  };
  const handleSignal = (signal) => {
    void cleanup()
      .catch((error) => {
        console.error(
          `Storybook cleanup failed during ${signal}: ${error.message}`,
        );
      })
      .finally(() => {
        process.kill(process.pid, signal);
      });
  };
  const handleUncaughtException = (error) => {
    void cleanup()
      .catch((cleanupError) => {
        console.error(
          `Storybook cleanup failed after uncaught exception: ${cleanupError.message}`,
        );
      })
      .finally(() => {
        setImmediate(() => {
          throw error;
        });
      });
  };

  for (const signal of ['SIGINT', 'SIGTERM']) {
    const handler = () => handleSignal(signal);
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }
  process.once('uncaughtException', handleUncaughtException);

  return cleanup;
}

export async function finishCleanup(
  cleanup,
  primaryError,
  reportCleanupError = console.error,
) {
  try {
    await cleanup();
  } catch (cleanupError) {
    if (primaryError) {
      reportCleanupError(
        `Storybook cleanup also failed: ${cleanupError.message}`,
      );
      throw primaryError;
    }
    throw cleanupError;
  }

  if (primaryError) throw primaryError;
}

function bundleUrlsFromHtml(html, baseUrl) {
  const urls = new Set();
  const sourcePattern = /(?:src|href)=["']([^"']+)["']/giu;
  for (const match of html.matchAll(sourcePattern)) {
    const value = match[1];
    if (value.includes('.bundle') || value.includes('AppEntry')) {
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
    '.rnstorybook',
    'storybook.requires',
    'StorybookUIRoot',
    '@storybook/react-native',
  ];

  if (storybookMarkers.some((marker) => html.includes(marker))) {
    return;
  }

  if (candidates.length === 0) {
    throw new Error(
      'Served HTML did not reference an Expo application bundle.',
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
    'The served Expo bundle did not contain the React Native Storybook entry.',
  );
}

async function main() {
  const startedAt = Date.now();
  const port = await reserveAvailablePort();
  const url = `http://${LOOPBACK_HOST}:${port}`;
  const npmExecutable = process.env.npm_execpath
    ? process.execPath
    : process.platform === 'win32'
      ? (process.env.ComSpec ?? 'cmd.exe')
      : 'npm';
  const npmCommandArguments = [
    'run',
    'storybook:web',
    '--',
    '--port',
    String(port),
  ];
  const npmArguments = process.env.npm_execpath
    ? [process.env.npm_execpath, ...npmCommandArguments]
    : process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm.cmd', ...npmCommandArguments]
      : npmCommandArguments;
  const output = [];
  const child = spawn(npmExecutable, npmArguments, {
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      BROWSER: 'none',
      CI: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const cleanup = registerProcessCleanup(child);

  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      output.push(chunk);
      process.stdout.write(chunk);
    });
  }

  let childFailure;
  child.once('error', (error) => {
    childFailure = error;
  });
  child.once('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      childFailure = new Error(`Expo exited with code ${code}.`);
    } else if (signal !== null) {
      childFailure = new Error(`Expo exited from signal ${signal}.`);
    }
  });

  let successMessage;
  let primaryError;
  try {
    const deadline = startedAt + STARTUP_TIMEOUT_MS;
    let lastError = new Error('Expo web has not responded yet.');

    while (Date.now() < deadline) {
      if (childFailure) throw childFailure;
      try {
        await assertStorybookEntry(url);
        const duration = Date.now() - startedAt;
        successMessage = `Storybook web smoke passed: ${url} (${duration} ms, Storybook entry confirmed)`;
        break;
      } catch (error) {
        lastError = error;
        await delay(POLL_INTERVAL_MS);
      }
    }

    if (!successMessage) {
      const recentOutput = output.join('').slice(-4_000);
      throw new Error(
        `Timed out after ${STARTUP_TIMEOUT_MS} ms: ${lastError.message}\n${recentOutput}`,
      );
    }
  } catch (error) {
    primaryError = error;
  }

  await finishCleanup(cleanup, primaryError);
  console.log(successMessage);
}

async function expectCleanupFailure(label, action, pattern) {
  let message = '';
  try {
    await action();
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  if (!message || !pattern.test(message)) {
    throw new Error(
      `cleanup controlled rejection "${label}" failed; received: ${message || 'no error'}`,
    );
  }
}

async function runControlledCleanupChecks() {
  const child = { pid: 123, exitCode: null, signalCode: null };
  await expectCleanupFailure(
    'nonzero taskkill exit',
    () =>
      terminateProcessTree(child, {
        platform: 'win32',
        spawnProcess: () => ({
          once(event, handler) {
            if (event === 'exit') queueMicrotask(() => handler(1));
            return this;
          },
        }),
      }),
    /taskkill exited with code 1/u,
  );
  await expectCleanupFailure(
    'failed POSIX termination',
    () =>
      terminateProcessTree(child, {
        platform: 'linux',
        killProcess: () => {
          const error = new Error('operation not permitted');
          error.code = 'EPERM';
          throw error;
        },
      }),
    /operation not permitted/u,
  );
  await expectCleanupFailure(
    'cleanup-only smoke failure',
    () =>
      finishCleanup(async () => {
        throw new Error('cleanup was not proven');
      }),
    /cleanup was not proven/u,
  );

  const primaryError = new Error('primary launch failure');
  let reportedCleanupError = '';
  await expectCleanupFailure(
    'primary failure preservation',
    () =>
      finishCleanup(
        async () => {
          throw new Error('secondary cleanup failure');
        },
        primaryError,
        (message) => {
          reportedCleanupError = message;
        },
      ),
    /primary launch failure/u,
  );
  if (!reportedCleanupError.includes('secondary cleanup failure')) {
    throw new Error(
      'cleanup controlled rejection did not report the secondary failure',
    );
  }
}

async function run() {
  if (process.argv.includes('--self-test-cleanup')) {
    await runControlledCleanupChecks();
    console.log('Storybook cleanup controlled rejections passed.');
    return;
  }
  await main();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error) => {
    console.error(`Storybook web smoke failed: ${error.message}`);
    process.exitCode = 1;
  });
}
