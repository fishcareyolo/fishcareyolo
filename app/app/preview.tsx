import { useLocalSearchParams, useRouter } from "expo-router"
import { XIcon } from "lucide-react-native"
import React from "react"
import { Image, Pressable, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Text } from "@/components/ui/text"

export default function PreviewScreen() {
    const router = useRouter()
    const navigation = useNavigation()
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>()

    React.useEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: "none" },
        })

        return () => {
            navigation.setOptions({
                tabBarStyle: undefined,
            })
        }
    }, [navigation])

    return (
        <View className="flex-1 bg-black">
            <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center pt-12 px-4">
                <Pressable
                    onPress={() => router.push("/")}
                    className="h-10 w-10 items-center justify-center rounded-full bg-background/80"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon as={XIcon} size={18} className="text-foreground" />
                </Pressable>
                <Text className="text-white font-medium">Preview</Text>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center">
                <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>

            <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
                <Button
                    onPress={() => {
                        console.log("Analyze image:", imageUri)
                    }}
                    className="h-12"
                >
                    <Text className="text-base font-medium">Analyze Fish</Text>
                </Button>
            </View>
        </View>
    )
}
