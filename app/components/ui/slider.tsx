import * as React from "react"
import { StyleSheet, View, useColorScheme } from "react-native"
import Slider from "@react-native-community/slider"
import { THEME } from "@/lib/theme/constants"

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 16,
    },
})

interface SliderProps {
    value: number
    onValueChange: (value: number) => void
    minimumValue?: number
    maximumValue?: number
    step?: number
    className?: string
}

export const SliderComponent = React.forwardRef<any, SliderProps>(
    (
        {
            value,
            onValueChange,
            minimumValue = 0,
            maximumValue = 100,
            step = 1,
            className,
        },
        ref,
    ) => {
        const colorScheme = useColorScheme()
        const theme = colorScheme === "dark" ? THEME.dark : THEME.light

        return (
            <View style={styles.container}>
                <Slider
                    ref={ref as any}
                    style={{
                        width: "100%",
                        height: 40,
                    }}
                    value={value}
                    onValueChange={onValueChange}
                    minimumValue={minimumValue}
                    maximumValue={maximumValue}
                    step={step}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.muted}
                    thumbTintColor={theme.primary}
                />
            </View>
        )
    },
)

SliderComponent.displayName = "SliderComponent"
