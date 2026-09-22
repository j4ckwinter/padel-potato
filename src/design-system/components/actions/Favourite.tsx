import { StyleSheet, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { Pressable } from '../../primitives/Pressable';
import { borders, colors, radii, sizing } from '../../tokens';
import { FavouriteHeartArtwork } from '../../assets/artwork/actionProviderArtwork';
import {
  assertOnlyKeys,
  isCallback,
  isNonEmptyString,
  unsupportedValue,
} from '../../internal/validation';

export type FavouriteProps = Readonly<{
  accessibilityLabel: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}>;

const supportedRuntimeProps = Object.freeze([
  'accessibilityLabel',
  'checked',
  'disabled',
  'onCheckedChange',
] as const);

const heartPath =
  'M1062.0,1119.25L1055.199951171875,1112.699951171875C1053.4603271484375,1110.9603271484375,1053.4603271484375,1108.1396484375,1055.199951171875,1106.4000244140625C1056.939697265625,1104.6602783203125,1059.76025390625,1104.6602783203125,1061.5,1106.4000244140625L1062.0,1106.949951171875L1062.5,1106.4000244140625C1064.23974609375,1104.6602783203125,1067.060302734375,1104.6602783203125,1068.800048828125,1106.4000244140625C1070.5396728515625,1108.1396484375,1070.5396728515625,1110.9603271484375,1068.800048828125,1112.699951171875L1062.0,1119.25L1062.0,1119.25';

function validateFavouriteProps(props: FavouriteProps) {
  assertOnlyKeys(props, supportedRuntimeProps);
  if (!isNonEmptyString(props.accessibilityLabel)) {
    unsupportedValue(props.accessibilityLabel, [
      'non-empty accessibility label',
    ]);
  }
  if (typeof props.checked !== 'boolean')
    unsupportedValue(props.checked, [true, false]);
  if (
    typeof props.disabled !== 'undefined' &&
    typeof props.disabled !== 'boolean'
  ) {
    unsupportedValue(props.disabled, [true, false]);
  }
  if (!isCallback(props.onCheckedChange)) {
    unsupportedValue(props.onCheckedChange, ['function']);
  }
}

function SelectedHeartFill() {
  return (
    <Svg
      accessibilityElementsHidden
      accessible={false}
      height={20}
      importantForAccessibility="no-hide-descendants"
      testID="favourite-selected-fill"
      viewBox="1052 1102 20 20"
      width={20}
    >
      <Path d={heartPath} fill={colors.accent} />
    </Svg>
  );
}

export function Favourite(props: FavouriteProps) {
  validateFavouriteProps(props);
  const {
    accessibilityLabel,
    checked,
    disabled = false,
    onCheckedChange,
  } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      size="controlHeight44"
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.content}
      >
        {checked ? <SelectedHeartFill /> : null}
        <View pointerEvents="none" style={styles.heartStroke}>
          <FavouriteHeartArtwork />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.radiusFull,
    borderWidth: borders.borderDefault,
    height: sizing.size44,
    justifyContent: 'center',
    width: sizing.size44,
  },
  heartStroke: {
    height: sizing.size20,
    position: 'absolute',
    width: sizing.size20,
  },
});
