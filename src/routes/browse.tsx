import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, MapPin, Search } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatPrice, productImage, type Product } from "@/lib/products";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Handmade Products — ArtisanLink" },
      {
        name: "description",
        content:
          "Discover authentic handmade crafts directly from rural Indian artisans — pottery, textiles, woodcraft, jewellery and more.",
      },
      { property: "og:title", content: "Browse Handmade Products — ArtisanLink" },
      {
        property: "og:description",
        content: "Buy directly from the makers. Search by craft, category and price.",
      },
    ],
  }),
  component: Browse,
});

type SortKey = "newest" | "price-low" | "price-high";

function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const products = useMemo(() => {
    let list = data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.description_english, p.artisan_name, p.artisan_location, p.category]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      );
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    const sorted = [...list];
    if (sort === "price-low")
      sorted.sort((a, b) => (a.suggested_price ?? Infinity) - (b.suggested_price ?? Infinity));
    if (sort === "price-high")
      sorted.sort((a, b) => (b.suggested_price ?? -1) - (a.suggested_price ?? -1));
    return sorted;
  }, [data, search, category, sort]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Handmade, straight from the maker</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or artisans"
              aria-label="Search products"
              className="h-14 pl-12 text-base"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-14 text-base sm:w-52" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base">
                All categories
              </SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-base">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-14 text-base sm:w-48" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="text-base">
                Newest first
              </SelectItem>
              <SelectItem value="price-low" className="text-base">
                Price: low to high
              </SelectItem>
              <SelectItem value="price-high" className="text-base">
                Price: high to low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="font-display text-xl font-semibold">No products found yet</p>
            <p className="mt-2 text-muted-foreground">
              Try a different search, or{" "}
              <Link to="/add-product" className="text-primary underline">
                list your own craft
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image = productImage(product);
              return (
                <Link
                  key={product.id}
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="surface-card group overflow-hidden transition-shadow hover:shadow-lift"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      loading="lazy"
                      className="h-52 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-secondary text-muted-foreground">
                      No photo
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <h2 className="font-display text-lg font-semibold leading-snug">
                      {product.title}
                    </h2>
                    <p className="text-lg font-semibold text-primary">
                      {formatPrice(product.suggested_price)}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      {product.artisan_name}
                      {product.artisan_location ? ` · ${product.artisan_location}` : ""}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
