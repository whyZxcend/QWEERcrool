import { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://qwercrool.online';

const config: CapacitorConfig = {
  appId: 'online.qwercrool.app',
  appName: 'QWERcrool',
  webDir: 'dist',
  server: {
    url: serverUrl,
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: false,
    backgroundColor: '#0d0f17'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0d0f17',
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0d0f17',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0d0f17'
    },
    Keyboard: {
      resize: 'none',
      style: 'DARK',
      resizeOnFullScreen: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notification",
      iconColor: "#7c5bf5",
      sound: "default"
    }
  }
};

export default config;
