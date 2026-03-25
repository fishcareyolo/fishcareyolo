export type Severity = "healthy" | "low" | "medium" | "high"

export interface DiseaseInfo {
  name: string
  description: string
  symptoms: string[]
  treatment: string[]
  severity: Severity
}

const DISEASE_DB: Record<string, DiseaseInfo> = {
  bacterial_infection: {
    name: "Bacterial Infection",
    description:
      "Bacterial infections in fish can manifest as redness, ulcers, fin deterioration, or cotton-like growths on the body surface.",
    symptoms: [
      "Reddened or inflamed skin patches",
      "Ulcers or open sores",
      "Frayed or deteriorating fins",
      "Lethargy and loss of appetite",
    ],
    treatment: [
      "Improve water quality with partial water change",
      "Apply broad-spectrum antibiotics",
      "Add aquarium salt (1 tbsp per 5L)",
      "Quarantine affected fish",
    ],
    severity: "medium",
  },
  fungal_infection: {
    name: "Fungal Infection",
    description:
      "Fungal infections typically appear as white or grey cotton-like patches on the skin, fins, or gills of fish.",
    symptoms: [
      "White/grey cotton-like growths on body",
      "Discoloured patches on skin",
      "Clamped fins",
      "Rubbing against surfaces",
    ],
    treatment: [
      "Apply anti-fungal medication (malachite green)",
      "Improve water quality",
      "Raise temperature slightly to boost immune response",
      "Salt baths (1% solution for 30 min)",
    ],
    severity: "medium",
  },
  healthy: {
    name: "Healthy Tissue",
    description:
      "No signs of disease detected in this region. Tissue appears normal.",
    symptoms: [],
    treatment: [
      "Continue regular water quality monitoring",
      "Maintain optimal feeding schedule",
    ],
    severity: "healthy",
  },
  parasite: {
    name: "Parasitic Infection",
    description:
      "Parasitic infections can be caused by protozoa, worms, or crustaceans that attach to the fish body or gills.",
    symptoms: [
      "Visible spots or cysts on body",
      "Flashing or rubbing against surfaces",
      "Rapid gill movement",
      "Weight loss despite normal feeding",
    ],
    treatment: [
      "Apply anti-parasitic medication",
      "Raise water temperature to 30\u00B0C for 3 days",
      "Quarantine affected fish",
      "Full tank treatment required",
    ],
    severity: "high",
  },
  white_tail: {
    name: "White Tail Disease",
    description:
      "A condition where the tail and fin edges become white and progressively deteriorate, often caused by bacterial or environmental stress.",
    symptoms: [
      "White discolouration at tail edges",
      "Progressive fin erosion",
      "Frail or splitting tail fin",
      "Reduced swimming ability",
    ],
    treatment: [
      "Improve water quality immediately",
      "Antibiotics (tetracycline or erythromycin)",
      "Reduce stress factors (overcrowding, poor nutrition)",
      "Maintain stable water parameters",
    ],
    severity: "low",
  },
}

export function getDiseaseInfo(className: string): DiseaseInfo {
  return (
    DISEASE_DB[className] ?? {
      name: className.replace(/_/g, " "),
      description: "Detected anomaly requiring further assessment.",
      symptoms: [],
      treatment: ["Consult a fish health specialist"],
      severity: "medium" as const,
    }
  )
}

export function getSeverityColor(severity: Severity) {
  switch (severity) {
    case "healthy":
      return {
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        dot: "bg-green-500",
      }
    case "low":
      return {
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        dot: "bg-yellow-500",
      }
    case "medium":
      return {
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        dot: "bg-orange-500",
      }
    case "high":
      return {
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        dot: "bg-red-500",
      }
  }
}
