/**
 * ArtisanLink AI placeholders.
 *
 * These are intentionally stubbed — wire them up to real AI calls next.
 * Each one keeps its signature so the Add Product flow does not need to change.
 */

import { toast } from "sonner";

import { CATEGORIES, uploadToBucket } from "@/lib/products";


export type GeneratedListing = {
  title: string;
  descriptionEnglish: string;
  descriptionHindi: string;
  category: string;
};

/**
 * Removes the cluttered background, drops in a clean neutral studio backdrop and
 * balances brightness/contrast. Uploads the result and returns its URL.
 * Falls back to the original photo if enhancement is unavailable.
 */
export async function enhancePhoto(photoUrl: string): Promise<string> {
  try {
    const res = await fetch("/api/enhance-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No enhanced image returned");

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "image/png" });
    return await uploadToBucket("product-photos", blob, "png");
  } catch (error) {
    console.error("enhancePhoto failed", error);
    toast.info("We could not improve the photo this time — using your original photo.");
    return photoUrl;
  }
}

/** Transcribe the artisan's voice note and translate it to English text. */
export async function transcribeAndTranslate(audioUrl: string): Promise<string> {
  if (!audioUrl) return "";
  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
    const json = (await res.json()) as { transcript?: string; english?: string };
    return (json.english || json.transcript || "").trim();
  } catch (error) {
    console.error("transcribeAndTranslate failed", error);
    toast.info("We could not understand the voice note — you can type the details yourself.");
    return "";
  }
}

/** Maps the AI's fixed category list onto the app's own category names. */
const CATEGORY_MAP: Record<string, string> = {
  textiles: "Textiles & Weaving",
  pottery: "Pottery",
  jewelry: "Jewellery",
  jewellery: "Jewellery",
  woodwork: "Woodcraft",
  "bamboo/cane": "Bamboo & Cane",
  bamboo: "Bamboo & Cane",
  cane: "Bamboo & Cane",
  "home decor": "Home Decor",
  other: "Other",
};

function normalizeCategory(value: string): string {
  const key = value.trim().toLowerCase();
  if (!key) return "";
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key]!;
  const match = CATEGORIES.find((c) => c.toLowerCase() === key);
  return match ?? "Other";
}

/** Turn free-form text into a marketplace-ready listing (EN + HI). */
export async function generateListing(text: string): Promise<GeneratedListing> {
  const description = (text ?? "").trim();
  const fallback: GeneratedListing = {
    title: "",
    descriptionEnglish: description,
    descriptionHindi: "",
    category: "",
  };
  if (!description) return fallback;

  try {
    const res = await fetch("/api/generate-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
    const json = (await res.json()) as {
      title?: string;
      description_english?: string;
      description_hindi?: string;
      category?: string;
    };
    return {
      title: (json.title ?? "").trim(),
      descriptionEnglish: (json.description_english ?? "").trim() || description,
      descriptionHindi: (json.description_hindi ?? "").trim(),
      category: normalizeCategory(json.category ?? ""),
    };
  } catch (error) {
    console.error("generateListing failed", error);
    toast.info("We could not write the listing this time — please fill in the details yourself.");
    return fallback;
  }
}

export type PriceSuggestion = {
  /** Human-readable range, e.g. "₹800 – ₹1,200" */
  priceRange: string;
  /** Why the AI suggested this range */
  reasoning: string;
  /** Midpoint of the range, used to pre-fill the artisan's own price */
  midpoint: number | null;
};

/** Suggest a competitive price range in INR from the photo and description. */
export async function suggestPrice(
  imageUrl: string,
  description: string,
): Promise<PriceSuggestion> {
  const text = (description ?? "").trim();
  const empty: PriceSuggestion = { priceRange: "", reasoning: "", midpoint: null };
  if (!imageUrl && !text) return empty;

  try {
    const res = await fetch("/api/suggest-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, description: text }),
    });
    if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
    const json = (await res.json()) as {
      price_range?: string;
      reasoning?: string;
      midpoint?: number | null;
    };
    const midpoint = Number(json.midpoint ?? 0);
    return {
      priceRange: (json.price_range ?? "").trim(),
      reasoning: (json.reasoning ?? "").trim(),
      midpoint: Number.isFinite(midpoint) && midpoint > 0 ? Math.round(midpoint) : null,
    };
  } catch (error) {
    console.error("suggestPrice failed", error);
    toast.info("We could not suggest a price this time — please set your own price.");
    return empty;
  }
}


