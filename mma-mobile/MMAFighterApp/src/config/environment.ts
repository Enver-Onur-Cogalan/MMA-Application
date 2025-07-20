import Config from 'react-native-config';
import { Platform } from 'react-native';

/**
 * Environment Configuration
 * 
 * This file handles environment variables securely.
 * Never commit sensitive data to version control.
 */

// Required environment variables
const requiredEnvVars = [
    'API_BASE_URL',
    'NODE_ENV',
] as const;

// Development fallbacks (only for local development)
const getDevelopmentFallbacks = () => {
    if (__DEV__) {
        return {
            API_BASE_URL: Platform.OS === 'android'
                ? 'http://10.0.2.2:3000'     // Android Emulator
                : 'http://localhost:3000',   // iOS Simulator
            NODE_ENV: 'development',
            DEBUG_MODE: 'true',
            API_TIMEOUT: '10000',
            APP_NAME: 'MMA Fighter App',
            APP_VERSION: '1.0.0',
        };
    }
    return {};
};

// Validate environment variables
const validateEnvironment = () => {
    const fallbacks = getDevelopmentFallbacks();

    for (const envVar of requiredEnvVars) {
        const value = Config[envVar] || fallbacks[envVar];
        if (!value) {
            const errorMsg = `❌ Missing required environment variable: ${envVar}`;

            if (__DEV__) {
                console.warn(errorMsg);
                console.warn('💡 Create a .env file based on .env.example');
            } else {
                throw new Error(errorMsg);
            }
        }
    }
};

// Validate on app start
validateEnvironment();

// Get environment value with fallback
const getEnvValue = (key: string, defaultValue?: string): string => {
    const fallbacks = getDevelopmentFallbacks();
    return Config[key] || fallbacks[key] || defaultValue || '';
};

export const environment = {
    // API Configuration
    API_BASE_URL: getEnvValue('API_BASE_URL'),
    API_TIMEOUT: parseInt(getEnvValue('API_TIMEOUT', '10000')),

    // App Configuration
    APP_NAME: getEnvValue('APP_NAME', 'MMA Fighter App'),
    APP_VERSION: getEnvValue('APP_VERSION', '1.0.0'),

    // Environment flags
    NODE_ENV: getEnvValue('NODE_ENV', 'development') as 'development' | 'production' | 'staging',
    DEBUG_MODE: getEnvValue('DEBUG_MODE', 'true') === 'true',
    ENABLE_FLIPPER: getEnvValue('ENABLE_FLIPPER', 'false') === 'true',

    // Platform specific
    ANDROID_KEYSTORE_PATH: getEnvValue('ANDROID_KEYSTORE_PATH'),
    ANDROID_KEYSTORE_PASSWORD: getEnvValue('ANDROID_KEYSTORE_PASSWORD'),
    ANDROID_KEY_ALIAS: getEnvValue('ANDROID_KEY_ALIAS'),
    IOS_BUNDLE_ID: getEnvValue('IOS_BUNDLE_ID'),

    // Helper functions
    isDevelopment: () => environment.NODE_ENV === 'development',
    isProduction: () => environment.NODE_ENV === 'production',
    isStaging: () => environment.NODE_ENV === 'staging',
};

// Type safety
export type Environment = typeof environment;

// Development logging (never in production)
if (__DEV__ && environment.DEBUG_MODE) {
    console.log('🌍 Environment loaded:', {
        NODE_ENV: environment.NODE_ENV,
        API_BASE_URL: environment.API_BASE_URL,
        DEBUG_MODE: environment.DEBUG_MODE,
        Platform: Platform.OS,
        // Never log sensitive data!
    });
}

// Security check
if (environment.isProduction() && environment.API_BASE_URL.includes('localhost')) {
    throw new Error('🚨 Security Error: localhost URL detected in production!');
}