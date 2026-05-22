/// <reference types="@capacitor/push-notifications" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.leidycleaner.profissional',
  appName: 'Leidy Cleaner Profissional',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['sound', 'alert', 'banner', 'list'],
    },
  },
};

export default config;
