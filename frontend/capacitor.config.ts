import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calculator.spef',
  appName: 'spef-calculator-android',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
