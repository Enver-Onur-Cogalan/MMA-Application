import Config from 'react-native-config';

// Environment variables validation
const requiredEnvVars = [
    'API_BASE_URL',
    'NODE_ENV',
] as const;

// Validate required environment variables
const validateEnvironment = () => {
    for (const envVar of requiredEnvVars) {
        if (!Config[envVar]) {
            throw new Error(`❌ Missing required environment variable: ${envVar}`);
        }
    }
};

// Validate on app start
validateEnvironment();

export const environment = {
    // API Configuration
    API_BASE_URL: Config.API_BASE_URL!,
    API_TIMEOUT: parseInt(Config.API_TIMEOUT!) || 10000,

    // App Configuration
    APP_NAME: Config.APP_NAME!,
    APP_VERSION: Config.APP_VERSION!,

    // Environment flags
    NODE_ENV: Config.NODE_ENV! as 'development' | 'production' | 'staging',
    DEBUG_MODE: Config.DEBUG_MODE === 'true',
    ENABLE_FLIPPER: Config.ENABLE_FLIPPER === 'true',

    // Platform specific (optional)
    ANDROID_KEYSTORE_PATH: Config.ANDROID_KEYSTORE_PATH,
    ANDROID_KEYSTORE_PASSWORD: Config.ANDROID_KEYSTORE_PASSWORD,
    ANDROID_KEY_ALIAS: Config.ANDROID_KEY_ALIAS,
    IOS_BUNDLE_ID: Config.IOS_BUNDLE_ID,

    // Helper functions
    isDevelopment: () => Config.NODE_ENV === 'development',
    isProduction: () => Config.NODE_ENV === 'production',
    isStaging: () => Config.NODE_ENV === 'staging',
};

// Type safety for environment
export type Environment = typeof environment;

// Log environment info in development
if (environment.DEBUG_MODE) {
    console.log('🌍 Environment loaded:', {
        NODE_ENV: environment.NODE_ENV,
        API_BASE_URL: environment.API_BASE_URL,
        DEBUG_MODE: environment.DEBUG_MODE,
    });
}