import { Platform } from "react-native";
import { scale, getFontSize, getSpacing } from "./dimensions";

export const colors = {
    primary: '#FF6B35',
    secondary: '#1A1A1A',
    accent: '#FFD700',

    success: '#4CAF50',
    danger: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        shadow: '#000000',
    },
    dark: {
        background: '#0F0F0F',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        border: '#333333',
        shadow: '#000000',
    },

    weightClasses: {
        FLYWEIGHT: '#9C27B0',
        BANTAMWEIGHT: '#673AB7',
        FEATHERWEIGHT: '#3F51B5',
        LIGHTWEIGHT: '#2196F3',
        WELTERWEIGHT: '#00BCD4',
        MIDDLEWEIGHT: '#009688',
        LIGHT_HEAVYWEIGHT: '#FF9800',
        HEAVYWEIGHT: '#FF5722'
    }
};

export const typography = {
    h1: {
        fontSize: getFontSize(32),
        fontWeight: '700' as const,
        lineHeight: getFontSize(40),
    },
    h2: {
        fontSize: getFontSize(28),
        fontWeight: '600' as const,
        lineHeight: getFontSize(36),
    },
    h3: {
        fontSize: getFontSize(24),
        fontWeight: '600' as const,
        lineHeight: getFontSize(32),
    },
    h4: {
        fontSize: getFontSize(20),
        fontWeight: '500' as const,
        lineHeight: getFontSize(28),
    },
    body1: {
        fontSize: getFontSize(16),
        fontWeight: '400' as const,
        lineHeight: getFontSize(24),
    },
    body2: {
        fontSize: getFontSize(14),
        fontWeight: '400' as const,
        lineHeight: getFontSize(20),
    },
    caption: {
        fontSize: getFontSize(12),
        fontWeight: '400' as const,
        lineHeight: getFontSize(16),
    },
    button: {
        fontSize: getFontSize(16),
        fontWeight: '500' as const,
        lineHeight: getFontSize(20),
    }
};

export const spacing = {
    xs: getSpacing(4),
    sm: getSpacing(8),
    md: getSpacing(16),
    lg: getSpacing(24),
    xl: getSpacing(32),
    xxl: getSpacing(48),
};

export const borderRadius = {
    sm: scale(4),
    md: scale(8),
    lg: scale(12),
    xl: scale(16),
    round: scale(999),
};

export const shadows = {
    small: Platform.select({
        ios: {
            shadowColor: colors.light.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 2,
        },
    }),
    medium: Platform.select({
        ios: {
            shadowColor: colors.light.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
        },
        android: {
            elevation: 4,
        },
    }),
    large: Platform.select({
        ios: {
            shadowColor: colors.light.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
        },
        android: {
            elevation: 8,
        },
    }),
};