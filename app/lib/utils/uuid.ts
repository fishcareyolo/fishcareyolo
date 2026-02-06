import type { UUID } from "afterlog"

/**
 * Generate a UUID v4 compatible string.
 *
 * Uses crypto.randomUUID() when available (web), falls back to Math.random()
 * for React Native where crypto API isn't available.
 *
 * @returns UUID v4 string
 */
export function generateUUID(): UUID {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID() as UUID
    }

    // Fallback for React Native - RFC4122 v4 compatible
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    }) as UUID
}

/**
 * Generate a short ID (8 characters) for simpler use cases.
 * Not cryptographically secure, good for local IDs.
 *
 * @returns Short alphanumeric ID
 */
export function generateShortId(): string {
    return Math.random().toString(36).substring(2, 10)
}

export type { UUID }
