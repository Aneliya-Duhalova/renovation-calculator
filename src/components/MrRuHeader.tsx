import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const logo = require('../../assets/branding/logo.png');
const heroBanner = require('../../assets/branding/hero-banner.png');

export function MrRuHeader() {
  return (
    <View style={styles.wrap}>
      <ImageBackground source={heroBanner} style={styles.banner} imageStyle={styles.bannerImage}>
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Калкулатор за ремонт и довършителни работи</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  banner: {
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: radius.lg,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.lg,
  },
  bannerContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  logo: {
    width: 200,
    height: 72,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
