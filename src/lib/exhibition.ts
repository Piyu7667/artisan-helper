import { supabase } from "@/integrations/supabase/client";

export type ExhibitionPiece = {
  id: string;
  artisan_name: string;
  artisan_location: string | null;
  photo_url: string | null;
  title: string;
  description: string | null;
  craft_story: string | null;
  created_at: string;
};

/** Returns the artisan's single exhibition piece, or null if they have none yet. */
export async function fetchMyExhibitionPiece(artisanName: string) {
  const name = artisanName.trim();
  if (!name) return null;
  const { data, error } = await supabase
    .from("exhibition_pieces")
    .select("*")
    .ilike("artisan_name", name)
    .maybeSingle();
  if (error) throw error;
  return (data as ExhibitionPiece | null) ?? null;
}

export async function fetchExhibitionPieces() {
  const { data, error } = await supabase
    .from("exhibition_pieces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExhibitionPiece[];
}
