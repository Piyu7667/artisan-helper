CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url text,
  enhanced_photo_url text,
  title text NOT NULL DEFAULT '',
  description_english text,
  description_hindi text,
  category text,
  suggested_price numeric(10,2),
  artisan_name text NOT NULL DEFAULT '',
  artisan_location text,
  contact_number text,
  views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can browse products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can create a listing" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a listing" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX products_category_idx ON public.products (category);

CREATE OR REPLACE FUNCTION public.increment_product_views(product_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products SET views = views + 1 WHERE id = product_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_views(uuid) TO anon, authenticated;

CREATE POLICY "Public read artisan uploads" ON storage.objects FOR SELECT USING (bucket_id IN ('product-photos', 'voice-notes'));
CREATE POLICY "Public write artisan uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-photos', 'voice-notes'));