import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.creaj2026.app',
  appName: 'creaj2026',
  webDir: 'build',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '960550306965-tsc1go8io06cj32a4u1puodgef3k5hd8.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;