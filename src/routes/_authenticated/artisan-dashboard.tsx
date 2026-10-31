import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, GalleryVerticalEnd, Lightbulb, PackagePlus } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyExhibitionPiece } from "@/lib/exhibition";
import { formatPrice, productImage, type Product } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/artisan-dashboard")({
  head: () => ({
    meta: [
      { title: "My Shop — ArtisanLink Artisan Dashboard" },
      {
        name: "description",
        content:
          "See your listed crafts, how many buyers viewed them, and simple tips to sell more on ArtisanLink.",
      },
      { property: "og:title", content: "My Shop — ArtisanLink Artisan Dashboard" },
      {
        property: "og:description",
        content: "Track views on your handmade products and get easy boost tips.",
      },
    ],
  }),
  component: ArtisanDashboard,
});

function ArtisanDashboard() {
  const { user, profile } = useAuth();
  const userId = user?.id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["my-products", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const products = data ?? [];
  const displayName = profile?.name || (products[0]?.artisan_name ?? "");

  const { data: exhibitionPiece, isLoading: exhibitionLoading } = useQuery({
    queryKey: ["my-exhibition-piece", displayName],
    enabled: Boolean(displayName),
    queryFn: () => fetchMyExhibitionPiece(displayName),
  });

  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const missingPrice = products.filter((p) => p.suggested_price === null).length;
  const missingHindi = products.filter((p) => !p.description_hindi).length;
  const lowViews = products.filter((p) => p.views < 5).length;

  const tips = [
    products.length === 0
      ? "List your first product — buyers can only find what you upload."
      : "Add more photos of each craft so buyers can see the details.",
    missingPrice > 0
      ? `${missingPrice} listing(s) have no price. Add a price so buyers can decide quickly.`
      : "Update your price if your material cost has changed.",
    missingHindi > 0
      ? "Add a Hindi description so more local buyers understand your craft."
      : "Share your listing link on WhatsApp groups to get more views.",
    lowViews > 0
      ? "Record a longer voice note — richer stories attract more buyers."
      : "Your listings are getting good views. Keep adding new items weekly.",
  ];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">My shop</h1>
            <p className="mt-1 text-muted-foreground">
              {profile?.name ? `Welcome back, ${profile.name}` : user?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!exhibitionLoading && !exhibitionPiece && (
              <Button asChild variant="outline" size="touch">
                <Link to="/add-exhibition">
                  <GalleryVerticalEnd className="size-5" /> Add to Exhibition
                </Link>
              </Button>
            )}
            <Button asChild variant="hero" size="touch">
              <Link to="/add-product">
                <PackagePlus className="size-5" /> Add product
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="surface-card p-5">
            <p className="text-sm text-muted-foreground">Products listed</p>
            <p className="font-display text-4xl font-semibold">{products.length}</p>
          </div>
          <div className="surface-card p-5">
            <p className="text-sm text-muted-foreground">Total views</p>
            <p className="font-display text-4xl font-semibold">{totalViews}</p>
          </div>
        </div>

        <section className="surface-card mt-6 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Lightbulb className="size-5 text-primary" /> Boost tips
          </h2>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2 text-base">
                <span aria-hidden className="text-primary">
                  •
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <h2 className="mt-8 font-display text-xl font-semibold">My products</h2>
        {isLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="surface-card mt-4 p-6 text-muted-foreground">
            No products yet. Tap “Add product” to list your first craft.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {products.map((product) => {
              const image = productImage(product);
              return (
                <Link
                  key={product.id}
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="surface-card flex gap-4 overflow-hidden p-3 transition-shadow hover:shadow-lift"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      loading="lazy"
                      className="size-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-snug">
                      {product.title}
                    </p>
                    <p className="mt-1 font-semibold text-primary">
                      {formatPrice(product.suggested_price)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye className="size-4" /> {product.views} views
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
