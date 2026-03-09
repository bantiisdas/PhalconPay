import { Image, StyleSheet, View } from "react-native";

const logoSource = require("../assets/images/In-App-Logo.png");

export interface InAppLogoProps {
  size?: number;
  style?: object;
}

export function InAppLogo({ size = 28, style }: InAppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={logoSource}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
        accessibilityLabel="App logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
