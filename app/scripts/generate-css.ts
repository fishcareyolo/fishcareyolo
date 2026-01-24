#!/usr/bin/env bun

/**
 * Generates global.css from the theme config.
 * Run: bun scripts/generate-css.ts
 */

import { writeFileSync, readFileSync } from "fs"
import { join } from "path"
import { THEME_CONFIG } from "../lib/theme/config"

const generateCSSVars = (theme: Record<string, string>): string => {
    return Object.entries(theme)
        .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const cssVarName = key.replace(/([A-Z])/g, "-$1").toLowerCase()
            // Extract HSL values and convert to CSS custom property format
            const hslMatch = value.match(/hsl\((.*?)\)/)
            if (hslMatch) {
                return `--${cssVarName}: ${hslMatch[1]};`
            }
            return `--${cssVarName}: ${value};`
        })
        .join("\n        ")
}

const lightVars = generateCSSVars(THEME_CONFIG.light)
const darkVars = generateCSSVars(THEME_CONFIG.dark)

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        ${lightVars}
    }

    .dark:root {
        ${darkVars}
    }
}
`

const outputPath = join(import.meta.dir, "../global.css")
writeFileSync(outputPath, css, "utf-8")
console.log("✓ Generated app/global.css")
