export const NOCTURNE_VARIANTS = ["nocturne", "solitude", "aurora", "abyss"] as const;
export type NocturneVariant = (typeof NOCTURNE_VARIANTS)[number];
export const NOCTURNE_TITLES: Record<NocturneVariant, string> = {
  nocturne: "Nocturne",
  solitude: "Solitude",
  aurora: "Aurora",
  abyss: "Abyss",
};
export function buildNocturneDocument(variant: NocturneVariant) { return ""; }
