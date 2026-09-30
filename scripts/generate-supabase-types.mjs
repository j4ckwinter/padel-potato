import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const outputPath = fileURLToPath(
  new URL('../src/features/supabase/database.types.ts', import.meta.url),
);
const prettierPath = fileURLToPath(
  new URL('../node_modules/prettier/bin/prettier.cjs', import.meta.url),
);

const generatedTypes =
  process.platform === 'win32'
    ? execFileSync(
        'cmd.exe',
        [
          '/d',
          '/s',
          '/c',
          'npx supabase gen types typescript --local --schema public',
        ],
        { encoding: 'utf8' },
      )
    : execFileSync(
        'npx',
        [
          'supabase',
          'gen',
          'types',
          'typescript',
          '--local',
          '--schema',
          'public',
        ],
        { encoding: 'utf8' },
      );

writeFileSync(outputPath, generatedTypes);
execFileSync(process.execPath, [prettierPath, '--write', outputPath], {
  stdio: 'inherit',
});
