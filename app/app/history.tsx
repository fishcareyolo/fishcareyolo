import { useFocusEffect, useRouter } from "expo-router"
import React, { useCallback, useState } from "react"
import { FlatList, Pressable, View, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import { ClockIcon, ChevronRightIcon } from "lucide-react-native"
import { Icon } from "@/components/ui/icon"
import { Text } from "@/components/ui/text"
import { getHistoryItems } from "@/lib/history/storage"
import type { HistoryItem } from "@/lib/history/types"
import { getBoundingBoxColor, getDiseaseLabel } from "@/lib/model/disease/info"

export default function HistoryScreen() {
    const router = useRouter()
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            loadHistory()
        }, []),
    )

    const loadHistory = async () => {
        try {
            setIsLoading(true)
            const items = await getHistoryItems()
            const sorted = items.sort((a, b) => b.timestamp - a.timestamp)
            setHistoryItems(sorted)
        } catch (e) {
            console.error("Failed to load history:", e)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getPrimaryDetection = (item: HistoryItem) => {
        if (item.results.detections.length === 0) {
            return { label: "Healthy", color: getBoundingBoxColor("healthy") }
        }
        const topDetection = item.results.detections[0]
        const label = getDiseaseLabel(topDetection.diseaseClass)
        const color = getBoundingBoxColor(topDetection.diseaseClass)

        return { label, color, confidence: topDetection.confidence }
    }

    const renderItem = ({
        item,
        index,
    }: {
        item: HistoryItem
        index: number
    }) => {
        const primary = getPrimaryDetection(item)

        return (
            <Pressable
                className="flex-row items-center bg-card rounded-2xl p-4 mb-3 border border-primary/10"
                onPress={() =>
                    router.push({
                        pathname: "/results",
                        params: { historyId: item.id },
                    })
                }
                style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
            >
                <Image
                    source={{ uri: item.processedImageUri }}
                    className="w-20 h-20 rounded-xl bg-secondary"
                    contentFit="cover"
                    transition={300}
                />
                <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: primary.color }}
                        />
                        <Text className="font-semibold text-lg text-foreground">
                            {primary.label}
                        </Text>
                        {primary.confidence && (
                            <Text className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-auto">
                                {(primary.confidence * 100).toFixed(0)}%
                            </Text>
                        )}
                    </View>
                    <Text className="text-sm text-muted-foreground">
                        {formatDate(item.timestamp)}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                        {item.results.detections.length}{" "}
                        {item.results.detections.length === 1
                            ? "issue"
                            : "issues"}{" "}
                        found
                    </Text>
                </View>
                <Icon
                    as={ChevronRightIcon}
                    size={20}
                    className="text-primary/50 ml-2"
                />
            </Pressable>
        )
    }

    return (
        <View className="flex-1 bg-background">
            <View className="pt-12 pb-6 px-6 aquatic-gradient border-b border-primary/10">
                <Text className="text-3xl font-bold text-foreground">
                    History
                </Text>
                <Text className="text-muted-foreground mt-1">
                    Your recent scans
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <View className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </View>
            ) : historyItems.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center mb-6">
                        <Icon
                            as={ClockIcon}
                            size={40}
                            className="text-primary/40"
                        />
                    </View>
                    <Text className="text-xl font-semibold text-foreground text-center">
                        No scans yet
                    </Text>
                    <Text className="text-center text-muted-foreground mt-2">
                        Capture your first fish to start tracking health over
                        time.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={historyItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                />
            )}
        </View>
    )
}
