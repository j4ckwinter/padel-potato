import fs from 'node:fs';

export function validateEvidence() {
  throw new Error('Penpot evidence validator not implemented');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(new URL(import.meta.url))) {
  validateEvidence();
}
