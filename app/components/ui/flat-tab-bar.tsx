import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { CameraIcon, HistoryIcon, SettingsIcon } from "lucide-react-native"
import { Platform, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "@/components/ui/icon"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"

function TabItem({
    focused,
    label,
    icon,
    onPress,
}: {
    focused: boolean
    label: string
    icon: "camera" | "history" | "settings"
    onPress: () => void
}) {
    const IconCmp =
        icon === "camera"
            ? CameraIcon
            : icon === "history"
              ? HistoryIcon
              : SettingsIcon

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole={Platform.select({
                ios: "button",
                default: "tab",
            })}
            accessibilityState={focused ? { selected: true } : {}}
            className={cn("flex-1 items-center justify-center", "min-h-12")}
            style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
            })}
        >
            <View
                className={cn(
                    "relative items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200",
                    focused ? "bg-primary/10" : "",
                )}
            >
                <Icon
                    as={IconCmp}
                    size={22}
                    className={cn(
                        focused ? "text-primary" : "text-muted-foreground",
                    )}
                />
                <Text
                    className={cn(
                        "mt-1 text-[10px] font-semibold tracking-wide",
                        focused ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    {label}
                </Text>
                {focused && (
                    <View className="absolute bottom-0 w-8 h-1 rounded-full bg-primary" />
                )}
            </View>
        </Pressable>
    )
}

export function FlatTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets()

    const currentRoute = state.routes[state.index]?.name
    if (currentRoute === "crop" || currentRoute === "preview") {
        return null
    }

    return (
        <View
            className={cn(
                "border-t border-primary/10 bg-background/95 backdrop-blur-md",
                "flex-row items-end justify-around pb-safe",
            )}
            style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
            {state.routes
                .filter(
                    (route) =>
                        route.name === "index" ||
                        route.name === "history" ||
                        route.name === "settings",
                )
                .sort((a, b) => {
                    const order = ["history", "index", "settings"]
                    return order.indexOf(a.name) - order.indexOf(b.name)
                })
                .map((route) => {
                    const { options } = descriptors[route.key]
                    const label =
                        options.tabBarLabel !== undefined
                            ? String(options.tabBarLabel)
                            : options.title !== undefined
                              ? options.title
                              : route.name

                    const isFocused =
                        state.index ===
                        state.routes.findIndex((r) => r.key === route.key)

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        })

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name)
                        }
                    }

                    const icon: "camera" | "history" | "settings" =
                        route.name === "index"
                            ? "camera"
                            : route.name === "history"
                              ? "history"
                              : "settings"

                    return (
                        <TabItem
                            key={route.key}
                            focused={isFocused}
                            label={label}
                            icon={icon}
                            onPress={onPress}
                        />
                    )
                })}
        </View>
    )
}
