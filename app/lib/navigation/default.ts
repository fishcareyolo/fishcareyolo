import { useRouter } from "expo-router"
import { useEffect } from "react"

export function useDefaultTab() {
    const router = useRouter()

    useEffect(() => {
        router.replace("/")
    }, [router])
}
