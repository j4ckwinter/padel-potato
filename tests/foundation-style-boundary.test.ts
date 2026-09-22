import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

import { describe, expect, it } from '@jest/globals';

const root = process.cwd();
const sourceExtensions = new Set(['.ts', '.tsx']);

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : sourceExtensions.has(extname(path))
        ? [path]
        : [];
  });

const governedProperties =
  '(?:borderRadius|borderWidth|bottom|gap|height|left|letterSpacing|lineHeight|margin(?:Bottom|Horizontal|Left|Right|Top|Vertical)?|maxHeight|maxWidth|minHeight|minWidth|opacity|padding(?:Bottom|Horizontal|Left|Right|Top|Vertical)?|right|top|translateX|translateY|width)';
const numericStyle = new RegExp(
  `\\b(${governedProperties}):\\s*(-?\\d+(?:\\.\\d+)?)`,
  'gu',
);
const structuralZero = new Set([
  'borderWidth',
  'bottom',
  'left',
  'minWidth',
  'right',
  'top',
  'width',
]);

const activeFiles = [
  ...sourceFiles(join(root, 'src/design-system')),
  ...sourceFiles(join(root, '.rnstorybook')),
].filter(
  (file) =>
    !file.includes(`${join('assets', 'artwork')}`) &&
    !file.includes(`${join('design-system', 'tokens')}`) &&
    !file.endsWith('storybook.requires.ts'),
);

describe('foundation-owned styling boundary', () => {
  it('contains no unapproved numeric geometry literals', () => {
    const violations = activeFiles.flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(numericStyle)]
        .filter((match) => !(match[2] === '0' && structuralZero.has(match[1])))
        .map((match) => `${relative(root, file)}: ${match[0]}`);
    });

    expect(violations).toEqual([]);
  });

  it('contains no raw style colours or direct typography declarations', () => {
    const forbidden =
      /\b(?:backgroundColor|borderColor|color|outlineColor|shadowColor):\s*['"](?:#|rgba?\(|hsla?\(|transparent)|\b(?:fontFamily|fontSize|fontStyle|fontWeight|letterSpacing|lineHeight):/giu;
    const violations = activeFiles
      .filter((file) => forbidden.test(readFileSync(file, 'utf8')))
      .map((file) => relative(root, file));

    expect(violations).toEqual([]);
  });
});
