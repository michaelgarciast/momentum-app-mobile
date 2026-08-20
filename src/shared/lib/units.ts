export type WeightUnit = "kg" | "lb";

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === "kg" ? kgToLb(value) : lbToKg(value);
}

export function formatWeight(value: number, from: WeightUnit, to: WeightUnit = from): string {
  const converted = convertWeight(value, from, to);
  const rounded = Math.round(converted * 10) / 10;
  return `${rounded} ${to}`;
}
