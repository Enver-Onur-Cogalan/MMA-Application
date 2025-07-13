import React from "react";
import { Text, TextProps } from "react-native";
import { typography, colors } from "../../../utils/theme";
import { useAppStore } from "../../../store/RootStore";
import { observer } from 'mobx-react-lite';

interface ResponsiveTextProps extends TextProps {
    variant?: keyof typeof typography;
    color?: string;
    children: React.ReactNode;
    style?: any;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = observer(({
    variant = 'body1',
    color,
    style,
    children,
    ...props
}) => {
    const { theme } = useAppStore();
    const themeColors = colors[theme];

    const textStyle = [
        typography[variant],
        {
            color: color || themeColors.text,
        },
        style,
    ];

    return (
        <Text style={textStyle} {...props}>
            {children}
        </Text>
    );
});