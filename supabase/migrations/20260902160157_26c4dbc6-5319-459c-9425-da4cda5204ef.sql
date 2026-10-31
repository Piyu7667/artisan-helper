CREATE TABLE public.exhibition_pieces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_name text NOT NULL DEFAULT '',
  artisan_location text,
  photo_url text,
  title text NOT NULL DEFAULT '',
  description text,
  craft_story text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX exhibition_pieces_artisan_name_key
  ON public.exhibition_pieces (lower(artisan_name));

GRANT SELECT, INSERT, UPDATE ON public.exhibition_pieces TO anon;
GRANT SELECT, INSERT, UPDATE ON public.exhibition_pieces TO authenticated;
GRANT ALL ON public.exhibition_pieces TO service_role;

ALTER TABLE public.exhibition_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exhibition pieces"
  ON public.exhibition_pieces FOR SELECT USING (true);
CREATE POLICY "Anyone can add an exhibition piece"
  ON public.exhibition_pieces FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update an exhibition piece"
  ON public.exhibition_pieces FOR UPDATE USING (true) WITH CHECK (true);