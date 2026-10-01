import { Image, StyleSheet, View } from 'react-native';

import { colors, radii, sizing } from '../tokens';
import { decorativeImageProps } from './artwork/decorativeArtwork';

export function WelcomeMascot() {
  return (
    <View {...decorativeImageProps} style={styles.circle}>
      <Image
        {...decorativeImageProps}
        resizeMode="contain"
        source={require('./media/mascot-wave.webp')}
        style={styles.mascot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAccent,
    borderRadius: radii.radiusFull,
    height: sizing.size112 + sizing.size48,
    justifyContent: 'center',
    width: sizing.size112 + sizing.size48,
  },
  mascot: {
    height: sizing.size112,
    width: sizing.size112,
  },
});
