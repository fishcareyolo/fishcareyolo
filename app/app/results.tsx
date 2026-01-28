import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useModel } from "@/lib/model"
import type { InferenceResult } from "@/lib/model/inference"

export default function ResultsScreen() {
    const router = useRouter()
    const navigation = useNavigation()
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>()
    const { runInference, isReady } = useModel()

    const [isAnalyzing, setIsAnalyzing] = useState(true)
    const [results, setResults] = useState<InferenceResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: "none" },
        })

        return () => {
            navigation.setOptions({
                tabBarStyle: undefined,
            })
        }
    }, [navigation])

    useEffect(() => {
        async function analyze() {
            if (!imageUri) {
                setError("No image provided")
                setIsAnalyzing(false)
                return
            }

            if (!isReady) {
                setError("Model not ready")
                setIsAnalyzing(false)
                return
            }

            try {
                setIsAnalyzing(true)
                setError(null)
                const result = await runInference(imageUri)

                if (result) {
                    setResults(result)
                } else {
                    setError("Inference failed - no results returned")
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                setError(`Analysis failed: ${message}`)
            } finally {
                setIsAnalyzing(false)
            }
        }

        analyze()
    }, [imageUri, isReady, runInference])

    const getDiseaseLabel = (diseaseClass: string): string => {
        return diseaseClass
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    const getDiseaseColor = (diseaseClass: string): string => {
        switch (diseaseClass) {
            case "healthy":
                return "text-green-500"
            case "bacterial_infection":
                return "text-red-500"
            case "fungal_infection":
                return "text-orange-500"
            case "parasite":
                return "text-yellow-500"
            case "white_tail":
                return "text-purple-500"
            default:
                return "text-gray-500"
        }
    }

    return (
        <View className="flex-1 bg-black">
            <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-center items-center pt-12 px-4">
                <Text className="text-white font-medium">Analysis Results</Text>
            </View>

            <ScrollView className="flex-1 pt-20">
                {imageUri && (
                    <View className="items-center justify-center px-4 mb-6">
                        <Image
                            source={{ uri: imageUri }}
                            className="w-full h-64 rounded-lg"
                            resizeMode="contain"
                        />
                    </View>
                )}

                {isAnalyzing ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-4">
                            Analyzing fish...
                        </Text>
                    </View>
                ) : error ? (
                    <View className="items-center justify-center px-6 py-12">
                        <Text className="text-red-500 text-center text-lg mb-2">
                            Error
                        </Text>
                        <Text className="text-white text-center">{error}</Text>
                    </View>
                ) : results ? (
                    <View className="px-4">
                        <View className="bg-gray-900 rounded-lg p-4 mb-4">
                            <Text className="text-white text-sm mb-2">
                                Inference Time:{" "}
                                <Text className="text-gray-400">
                                    {results.inferenceTimeMs}ms
                                </Text>
                            </Text>
                            <Text className="text-white text-sm">
                                Detections Found:{" "}
                                <Text className="text-gray-400">
                                    {results.detections.length}
                                </Text>
                            </Text>
                        </View>

                        {results.detections.length === 0 ? (
                            <View className="bg-green-900/30 border border-green-500/30 rounded-lg p-6 items-center">
                                <Text className="text-green-400 text-lg font-semibold mb-2">
                                    Fish Appears Healthy
                                </Text>
                                <Text className="text-gray-300 text-center">
                                    No diseases detected in the image
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-white text-lg font-semibold mb-3">
                                    Detected Issues
                                </Text>
                                {results.detections.map((detection, index) => (
                                    <View
                                        key={detection.id}
                                        className="bg-gray-900 rounded-lg p-4 mb-3"
                                    >
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text
                                                className={`text-lg font-semibold ${getDiseaseColor(detection.diseaseClass)}`}
                                            >
                                                {getDiseaseLabel(
                                                    detection.diseaseClass,
                                                )}
                                            </Text>
                                            <Text className="text-white text-lg font-bold">
                                                {(
                                                    detection.confidence * 100
                                                ).toFixed(1)}
                                                %
                                            </Text>
                                        </View>
                                        <Text className="text-gray-400 text-xs">
                                            Detection ID: {detection.id}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-1">
                                            Location: (
                                            {detection.boundingBox.x.toFixed(3)}
                                            ,{" "}
                                            {detection.boundingBox.y.toFixed(3)}
                                            ) | Size:{" "}
                                            {detection.boundingBox.width.toFixed(
                                                3,
                                            )}{" "}
                                            x{" "}
                                            {detection.boundingBox.height.toFixed(
                                                3,
                                            )}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-4 pb-8">
                <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onPress={() => router.push("/")}
                    disabled={isAnalyzing}
                >
                    <Text>Done</Text>
                </Button>
                {results && results.detections.length > 0 && (
                    <Button
                        className="flex-1 h-12"
                        onPress={() => {
                            // TODO: Navigate to disease info or treatment recommendations
                            console.log(
                                "View details for detections:",
                                results.detections,
                            )
                        }}
                        disabled={isAnalyzing}
                    >
                        <Text>View Details</Text>
                    </Button>
                )}
            </View>
        </View>
    )
}
