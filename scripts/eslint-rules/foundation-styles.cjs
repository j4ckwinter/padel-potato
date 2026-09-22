const governedNumericProperties = new Set([
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'borderRightWidth',
  'borderTopWidth',
  'borderWidth',
  'columnGap',
  'gap',
  'height',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'opacity',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingVertical',
  'rowGap',
  'bottom',
  'left',
  'right',
  'top',
  'translateX',
  'translateY',
  'width',
]);

const colorProperties = new Set([
  'backgroundColor',
  'borderColor',
  'color',
  'outlineColor',
  'shadowColor',
]);

const typographyProperties = new Set([
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
]);

const structuralZeroProperties = new Set([
  'borderWidth',
  'bottom',
  'left',
  'minWidth',
  'right',
  'top',
  'width',
]);

const propertyName = (node) => {
  if (!node.computed && node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }
  return undefined;
};

const isStyleObject = (sourceCode, node) =>
  sourceCode.getAncestors(node).some((ancestor) => {
    if (ancestor.type === 'JSXExpressionContainer') {
      const attribute = sourceCode
        .getAncestors(ancestor)
        .find((candidate) => candidate.type === 'JSXAttribute');
      return attribute?.name?.name === 'style';
    }
    return (
      ancestor.type === 'CallExpression' &&
      ancestor.callee.type === 'MemberExpression' &&
      ancestor.callee.object.type === 'Identifier' &&
      ancestor.callee.object.name === 'StyleSheet' &&
      ancestor.callee.property.type === 'Identifier' &&
      ancestor.callee.property.name === 'create'
    );
  });

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require design-system visual styles to resolve from foundations.',
    },
    messages: {
      color: 'Use a foundation color token instead of a raw color value.',
      numeric:
        'Use a foundation token instead of a numeric {{property}} style value.',
      typography:
        'Use a typography foundation token instead of setting {{property}} directly.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      Property(node) {
        if (!isStyleObject(sourceCode, node)) return;
        const name = propertyName(node);
        if (!name) return;

        if (typographyProperties.has(name)) {
          context.report({
            node,
            messageId: 'typography',
            data: { property: name },
          });
          return;
        }

        if (
          colorProperties.has(name) &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          /^(?:#|rgba?\(|hsla?\(|transparent$)/iu.test(node.value.value)
        ) {
          context.report({ node, messageId: 'color' });
          return;
        }

        if (
          governedNumericProperties.has(name) &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          !(node.value.value === 0 && structuralZeroProperties.has(name))
        ) {
          context.report({
            node,
            messageId: 'numeric',
            data: { property: name },
          });
        }
      },
    };
  },
};
