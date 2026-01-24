import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native"
import { THEME_CONFIG } from "./config"

export type { ColorScheme } from "@/lib/theme/types"

export const THEME = THEME_CONFIG

export const NAV_THEME: Record<"light" | "dark", Theme> = {
    light: {
        ...DefaultTheme,
        colors: {
            background: THEME.light.background,
            border: THEME.light.border,
            card: THEME.light.card,
            notification: THEME.light.destructive,
            primary: THEME.light.primary,
            text: THEME.light.foreground,
        },
    },
    dark: {
        ...DarkTheme,
        colors: {
            background: THEME.dark.background,
            border: THEME.dark.border,
            card: THEME.dark.card,
            notification: THEME.dark.destructive,
            primary: THEME.dark.primary,
            text: THEME.dark.foreground,
        },
    },
}
