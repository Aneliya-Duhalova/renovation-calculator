import { Image, ImageBackground, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { spacing } from '../theme';

const logo = require('../../assets/branding/logo.png');
const heroBanner = require('../../assets/branding/hero-banner.png');

const BANNER_HEIGHT = 220;

export function MrRuHeader() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.outer}>
      <ImageBackground
        source={heroBanner}
        style={[styles.banner, { width, height: BANNER_HEIGHT }]}
        imageStyle={styles.bannerImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Калкулатор за ремонт и довършителни работи</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: -spacing.md,
    marginTop: Platform.OS === 'web' ? -spacing.md : 0,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  banner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 1,
  },
  logo: {
    width: 220,
    height: 80,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
