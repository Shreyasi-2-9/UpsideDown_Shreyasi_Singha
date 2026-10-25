import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { App as CapApp } from "@capacitor/app"

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform()

/**
 * Initializes native mobile app capabilities (Status Bar, Splash Screen, Back Button)
 */
export async function initNativeApp(onBackPress?: () => boolean | void) {
  if (!isNative) {
    return
  }

  try {
    // Status Bar styling
    await StatusBar.setStyle({ style: Style.Dark })
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#0c0f17" })
    }
  } catch (err) {
    console.warn("[NativeApp] StatusBar init error:", err)
  }

  try {
    // Hide native splash screen
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (err) {
    console.warn("[NativeApp] SplashScreen error:", err)
  }

  try {
    // Handle Android hardware back button
    CapApp.removeAllListeners()
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (onBackPress) {
        const handled = onBackPress()
        if (handled) return
      }

      if (canGoBack) {
        window.history.back()
      } else {
        CapApp.exitApp()
      }
    })
  } catch (err) {
    console.warn("[NativeApp] App backButton error:", err)
  }
}
