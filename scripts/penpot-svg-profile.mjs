const ALLOWED_TAGS = new Set(['svg', 'path', 'rect', 'ellipse']);
const ALLOWED_ATTRIBUTES = new Set([
  'xmlns', 'width', 'height', 'viewBox', 'fill', 'fill-opacity', 'stroke',
  'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
  'data-penpot-source-id', 'data-penpot-shape-id', 'd', 'x', 'y', 'cx',
  'cy', 'rx', 'ry',
]);
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const RAW_PAINT = '#0e1716';
const NORMALIZED_PAINT = 'currentColor';

const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};

function parseStartTag(xml, start, nameForErrors) {
  let end = start + 1;
  let quote = false;
  for (; end < xml.length; end += 1) {
    const character = xml[end];
    if (character === '"') quote = !quote;
    if (!quote && character === '>') break;
    assert(character !== '<', `${nameForErrors} has malformed tag content`);
  }
  assert(end < xml.length && !quote, `${nameForErrors} has an unterminated tag`);

  let body = xml.slice(start + 1, end);
  const selfClosing = /\/\s*$/u.test(body);
  if (selfClosing) body = body.replace(/\/\s*$/u, '');
  const nameMatch = body.match(/^([A-Za-z][A-Za-z0-9-]*)/u);
  assert(nameMatch, `${nameForErrors} has an invalid start tag`);
  const tag = nameMatch[1];
  assert(ALLOWED_TAGS.has(tag), `${nameForErrors} has unsupported tag ${tag}`);

  const attributes = new Map();
  let rest = body.slice(nameMatch[0].length);
  while (rest.length > 0) {
    const whitespace = rest.match(/^\s+/u);
    assert(whitespace, `${nameForErrors} has malformed attributes on ${tag}`);
    rest = rest.slice(whitespace[0].length);
    if (rest.length === 0) break;
    const attribute = rest.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=\s*"([^"<>]*)"/u);
    assert(attribute, `${nameForErrors} has malformed attributes on ${tag}`);
    const [, attributeName, value] = attribute;
    assert(ALLOWED_ATTRIBUTES.has(attributeName), `${nameForErrors} has unsupported attribute ${attributeName}`);
    assert(!attributes.has(attributeName), `${nameForErrors} has duplicate attribute ${attributeName}`);
    assert(!value.includes('&'), `${nameForErrors} contains an entity or character reference`);
    attributes.set(attributeName, value);
    rest = rest.slice(attribute[0].length);
  }

  return { attributes, end: end + 1, selfClosing, tag };
}

export function parseSvgProfile(xml, record, semantic = true) {
  const name = record?.name ?? 'SVG';
  assert(typeof xml === 'string' && xml.length > 0, `${name} has empty SVG content`);
  assert(!xml.startsWith('\uFEFF'), `${name} has an unsupported byte-order mark`);
  assert(!/NaN|Infinity/u.test(xml), `${name} contains non-finite numeric content`);

  const stack = [];
  const elements = [];
  let rootClosed = false;
  let position = 0;
  while (position < xml.length) {
    const whitespace = xml.slice(position).match(/^\s+/u)?.[0] ?? '';
    position += whitespace.length;
    if (position === xml.length) break;
    assert(!rootClosed, `${name} contains trailing XML content`);
    assert(xml[position] === '<', `${name} contains text content`);
    assert(!xml.startsWith('<?', position), `${name} contains a processing instruction`);
    assert(!xml.startsWith('<!', position), `${name} contains a declaration, DTD, comment, or CDATA`);

    if (xml.startsWith('</', position)) {
      const closing = xml.slice(position).match(/^<\/([A-Za-z][A-Za-z0-9-]*)\s*>/u);
      assert(closing, `${name} has a malformed closing tag`);
      const expected = stack.pop();
      assert(expected === closing[1], `${name} has malformed element nesting`);
      position += closing[0].length;
      if (stack.length === 0) rootClosed = true;
      continue;
    }

    const element = parseStartTag(xml, position, name);
    assert(elements.length > 0 || element.tag === 'svg', `${name} root must be svg`);
    assert(elements.length === 0 || stack.length > 0, `${name} contains multiple roots`);
    assert(stack.length === 0 || stack.at(-1) === 'svg', `${name} has unsupported nested shape content`);
    assert(element.tag === 'svg' ? !element.selfClosing : element.selfClosing, `${name} has invalid ${element.tag} element form`);
    if (!element.selfClosing) stack.push(element.tag);
    elements.push(element);
    position = element.end;
  }

  assert(rootClosed && stack.length === 0, `${name} has an unclosed SVG root`);
  assert(elements.length > 1, `${name} has no authored geometry`);
  const root = elements[0];
  assert(root.attributes.get('xmlns') === SVG_NAMESPACE, `${name} has invalid SVG namespace`);
  assert(root.attributes.get('data-penpot-source-id') === record.sourceNodeId, `${name} source-node attribute changed`);
  assert(elements.slice(1).every((element) => element.attributes.has('data-penpot-shape-id')), `${name} has geometry without a Penpot shape id`);

  const viewBox = root.attributes.get('viewBox')?.trim().split(/\s+/u).map(Number);
  assert(viewBox?.length === 4 && viewBox.every(Number.isFinite), `${name} has invalid viewBox`);
  assert(viewBox[2] === 20 && viewBox[3] === 20, `${name} canvas must be 20x20`);

  const expectedPaint = semantic ? NORMALIZED_PAINT : RAW_PAINT;
  const otherPaint = semantic ? RAW_PAINT : NORMALIZED_PAINT;
  let expectedPaintCount = 0;
  for (const element of elements) {
    for (const paintName of ['fill', 'stroke']) {
      const paint = element.attributes.get(paintName);
      if (paint === undefined || paint === 'none') continue;
      assert(paint === expectedPaint, `${name} has unsupported authored paint ${paint}`);
      expectedPaintCount += 1;
    }
    assert(![...element.attributes.values()].includes(otherPaint), `${name} mixes raw and normalized paint`);
    if (element.attributes.has('stroke')) {
      assert(element.attributes.get('stroke-width') === '1.75', `${name} stroke must retain authored width 1.75`);
    }
  }
  assert(expectedPaintCount > 0, `${name} paint evidence is invalid`);
  return { elements, viewBox };
}

export function normalizeRawSvg(xml, record) {
  parseSvgProfile(xml, record, false);
  const normalized = xml.replace(/(fill|stroke)="#0e1716"/gu, `$1="${NORMALIZED_PAINT}"`);
  parseSvgProfile(normalized, record, true);
  return normalized;
}
