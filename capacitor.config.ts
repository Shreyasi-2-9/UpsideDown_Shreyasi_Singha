import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.homecare360.app",
  appName: "Homecare 360",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0c0f17",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0c0f17",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
}

export default config
