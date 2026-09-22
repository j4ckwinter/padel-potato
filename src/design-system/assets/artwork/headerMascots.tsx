import { Image, type ImageSourcePropType } from 'react-native';

import { decorativeImageProps } from './decorativeArtwork';

const mascots = Object.freeze({
  create: require('../media/mascot-create.webp'),
  players: require('../media/mascot-players.webp'),
  profile: require('../media/mascot-profile.webp'),
  search: require('../media/mascot-search.webp'),
  wave: require('../media/mascot-wave.webp'),
} satisfies Readonly<Record<string, ImageSourcePropType>>);

export type HeaderMascotName = keyof typeof mascots;

export function HeaderMascot({ name }: Readonly<{ name: HeaderMascotName }>) {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={mascots[name]}
      style={{ height: 64, width: 64 }}
      testID={`phase3-artwork-${name}`}
    />
  );
}
