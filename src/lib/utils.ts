import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProofType = "before" | "during" | "after";

export const proofTypeColor: Record<ProofType, string> = {
  before: "text-amber",
  during: "text-accent",
  after: "text-green",
};

export const proofTypeBg: Record<ProofType, string> = {
  before: "bg-amber/15 text-amber",
  during: "bg-accent/15 text-accent",
  after: "bg-green/15 text-green",
};

export function formatProofDate(d: Date) {
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day}, ${date} · ${time}`;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "AA";
}
