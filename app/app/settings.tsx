import { MoonStarIcon, SunIcon } from "lucide-react-native"
import { View } from "react-native"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { Text } from "@/components/ui/text"
import { useTheme } from "@/lib/theme/context"

export default function SettingsScreen() {
    const { colorScheme, toggleColorScheme } = useTheme()
    const themeIcon = colorScheme === "dark" ? MoonStarIcon : SunIcon

    return (
        <View className="flex-1 bg-background">
            <View className="pt-12 pb-6 px-6 aquatic-gradient border-b border-primary/10">
                <Text className="text-3xl font-bold text-foreground">
                    Settings
                </Text>
                <Text className="text-muted-foreground mt-1">
                    Customize your experience
                </Text>
            </View>

            <View className="p-6">
                <View className="rounded-3xl border border-primary/15 bg-card overflow-hidden">
                    <View className="p-4 border-b border-primary/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <Icon
                                        as={themeIcon}
                                        size={20}
                                        className="text-primary"
                                    />
                                </View>
                                <View>
                                    <Text className="font-semibold text-foreground">
                                        Theme
                                    </Text>
                                    <Text className="text-sm text-muted-foreground">
                                        {colorScheme === "dark"
                                            ? "Dark mode"
                                            : "Light mode"}
                                    </Text>
                                </View>
                            </View>
                            <Button
                                variant="outline"
                                className="h-10 px-4 rounded-full border-primary/30"
                                onPress={toggleColorScheme}
                            >
                                <Icon
                                    as={themeIcon}
                                    size={16}
                                    className="text-primary mr-2"
                                />
                                <Text className="text-sm text-primary">
                                    {colorScheme === "dark" ? "Light" : "Dark"}
                                </Text>
                            </Button>
                        </View>
                    </View>

                    <View className="p-4 border-b border-primary/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <Icon
                                        as={SunIcon}
                                        size={20}
                                        className="text-primary"
                                    />
                                </View>
                                <View>
                                    <Text className="font-semibold text-foreground">
                                        Save to Photos
                                    </Text>
                                    <Text className="text-sm text-muted-foreground">
                                        Keep your scans in your gallery
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                checked={false}
                                onCheckedChange={() => {}}
                                className="data-[state=checked]:bg-primary"
                            />
                        </View>
                    </View>

                    <View className="p-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <Icon
                                        as={SunIcon}
                                        size={20}
                                        className="text-primary"
                                    />
                                </View>
                                <View>
                                    <Text className="font-semibold text-foreground">
                                        Photo Quality
                                    </Text>
                                    <Text className="text-sm text-muted-foreground">
                                        High resolution captures
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-sm text-primary font-medium">
                                High
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <Text className="text-sm text-muted-foreground text-center">
                        Mina v1.0.0 • Fish Disease Detection
                    </Text>
                    <Text className="text-xs text-muted-foreground/60 text-center mt-2">
                        Offline-first, on-device analysis
                    </Text>
                </View>
            </View>
        </View>
    )
}
