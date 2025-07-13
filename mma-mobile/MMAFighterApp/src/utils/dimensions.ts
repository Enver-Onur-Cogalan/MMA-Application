import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design dimensions (iPhone 12 Pro base)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const screenData = {
    width: SCREEN_WIDTH,
    heigh: SCREEN_HEIGHT,
    isTablet: SCREEN_WIDTH >= 768,
    isSmallScreen: SCREEN_WIDTH < 375,
    isLargeScreen: SCREEN_WIDTH > 414,
    aspectRatio: SCREEN_HEIGHT / SCREEN_WIDTH,
};

export const scale = (size: number): number => {
    const screenRatio = SCREEN_WIDTH / BASE_WIDTH;
    return PixelRatio.roundToNearestPixel(size * screenRatio);
};

export const verticalScale = (size: number): number => {
    const scaleRatio = SCREEN_HEIGHT / BASE_HEIGHT;
    return PixelRatio.roundToNearestPixel(size * scaleRatio);
};

export const moderateScale = (size: number, factor = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

export const getFontSize = (size: number) => {
    if (screenData.isTablet) return size * 1.2;
    if (screenData.isSmallScreen) return size * 0.9;
    return moderateScale(size, 0.3);
};

export const getSpacing = (size: number) => {
    if (screenData.isTablet) return size * 1.3;
    return scale(size);
};