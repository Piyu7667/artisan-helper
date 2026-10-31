import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, MapPin, Phone, Boxes } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { trackProductView } from "@/lib/products.functions";
import { formatPrice, productImage, type Product } from "@/lib/products";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Handmade Product Details — ArtisanLink" },
      {
        name: "description",
        content:
          "See full details of this handmade craft, read the story in English or Hindi, and contact the artisan directly.",
      },
      { property: "og:title", content: "Handmade Product Details — ArtisanLink" },
      {
        property: "og:description",
        content: "Buy direct from the maker, or request a bulk B2B quote.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const [lang, setLang] = useState<"en" | "hi">("en");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as Product | null) ?? null;
    },
  });

  useEffect(() => {
    if (!product) return;
    void trackProductView({ data: { productId: product.id } }).catch(() => {
      // View counting must never block or break the product page.
    });
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="mt-6 h-8 w-2/3" />
          <Skeleton className="mt-3 h-24 w-full" />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">This product is not available</h1>
          <p className="mt-2 text-muted-foreground">It may have been removed by the artisan.</p>
          <Button asChild variant="hero" size="touch" className="mt-6">
            <Link to="/browse">Browse other crafts</Link>
          </Button>
        </main>
      </div>
    );
  }

  const image = productImage(product);
  const description =
    lang === "en"
      ? (product.description_english ?? "No description yet.")
      : (product.description_hindi ?? product.description_english ?? "No description yet.");

  const contactHref = product.contact_number ? `tel:${product.contact_number}` : undefined;
  const bulkHref = product.contact_number
    ? `https://wa.me/${product.contact_number.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Namaste! I would like a bulk (B2B) quote for "${product.title}" on ArtisanLink.`,
      )}`
    : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to browse
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div className="surface-card overflow-hidden">
            {image ? (
              <img src={image} alt={product.title} className="w-full object-cover" />
            ) : (
              <div className="flex h-80 items-center justify-center bg-secondary text-muted-foreground">
                No photo
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight">{product.title}</h1>
            <p className="mt-3 text-3xl font-semibold text-primary">
              {formatPrice(product.suggested_price)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {product.artisan_name}
                {product.artisan_location ? ` · ${product.artisan_location}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" /> {product.views} views
              </span>
              {product.category ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-foreground">
                  {product.category}
                </span>
              ) : null}
            </div>

            <div className="mt-6" role="group" aria-label="Description language">
              <div className="inline-flex rounded-xl bg-secondary p-1">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  aria-pressed={lang === "en"}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  aria-pressed={lang === "hi"}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${lang === "hi" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  हिंदी
                </button>
              </div>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed">{description}</p>
            </div>

            <div className="mt-8 grid gap-3">
              <Button asChild variant="hero" size="xl" disabled={!contactHref}>
                <a href={contactHref ?? "#"}>
                  <Phone className="size-5" /> Contact Artisan
                </a>
              </Button>
              <Button asChild variant="forest" size="xl" disabled={!bulkHref}>
                <a href={bulkHref ?? "#"} target="_blank" rel="noreferrer">
                  <Boxes className="size-5" /> Request B2B Bulk Quote
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
