import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Pottery",
  "Textiles & Weaving",
  "Jewellery",
  "Woodcraft",
  "Metalwork",
  "Bamboo & Cane",
  "Painting & Art",
  "Leather",
  "Home Decor",
  "Other",
] as const;

export type Product = {
  id: string;
  photo_url: string | null;
  enhanced_photo_url: string | null;
  title: string;
  description_english: string | null;
  description_hindi: string | null;
  category: string | null;
  suggested_price: number | null;
  artisan_name: string;
  artisan_location: string | null;
  contact_number: string | null;
  views: number;
  created_at: string;
};

export type ListingDraft = {
  photoUrl: string;
  enhancedPhotoUrl: string;
  voiceNoteUrl: string;
  transcript: string;
  title: string;
  descriptionEnglish: string;
  descriptionHindi: string;
  category: string;
  suggestedPrice: string;
  priceRange?: string;
  priceReasoning?: string;
  artisanName: string;
  artisanLocation: string;
  contactNumber: string;
};

const DRAFT_KEY = "artisanlink:draft";
const ARTISAN_KEY = "artisanlink:artisan";

export function saveDraft(draft: ListingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): ListingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ListingDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

export type ArtisanIdentity = { name: string; location: string; contact: string };

export function saveArtisan(identity: ArtisanIdentity) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ARTISAN_KEY, JSON.stringify(identity));
}

export function loadArtisan(): ArtisanIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ARTISAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ArtisanIdentity;
  } catch {
    return null;
  }
}

/** Uploads a file to a private bucket and returns a long-lived signed URL. */
export async function uploadToBucket(bucket: string, file: Blob, extension: string) {
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signError || !data) throw signError ?? new Error("Could not create file URL");
  return data.signedUrl;
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "Price on request";
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function productImage(product: Pick<Product, "photo_url" | "enhanced_photo_url">) {
  return product.enhanced_photo_url ?? product.photo_url ?? null;
}
