import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, GalleryVerticalEnd, MapPin, MessageCircle, Phone, Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCart, whatsappLink } from "@/lib/cart";
import { CATEGORIES, formatPrice, productImage, type Product } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/buyer-dashboard")({
  head: () => ({
    meta: [
      { title: "My Buyer Home — ArtisanLink" },
      {
        name: "description",
        content:
          "Your ArtisanLink buyer home: shop handmade crafts, keep a cart, and reach rural artisans directly.",
      },
      { property: "og:title", content: "My Buyer Home — ArtisanLink" },
      {
        property: "og:description",
        content: "Shop handmade crafts, save items to your cart and contact makers directly.",
      },
    ],
  }),
  component: BuyerDashboard,
});

type SortKey = "newest" | "price-low" | "price-high";

function BuyerDashboard() {
  const { user, profile } = useAuth();
  const { add, count, total } = useCart();
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Buyer home</h1>
            <p className="mt-1 text-muted-foreground">
              {profile?.name ? `Welcome, ${profile.name}` : user?.email}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-lg font-semibold">Your cart</p>
            <p className="text-muted-foreground">
              {count === 0
                ? "Nothing added yet"
                : `${count} item${count > 1 ? "s" : ""} · ${formatPrice(total)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="touch">
              <Link to="/cart">
                <ShoppingCart className="size-5" /> View cart
              </Link>
            </Button>
            <Button asChild variant="outline" size="touch">
              <Link to="/exhibition">
                <GalleryVerticalEnd className="size-5" /> Exhibition
              </Link>
            </Button>
          </div>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold">Shop handmade crafts</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
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
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="font-display text-xl font-semibold">No products match your search</p>
            <p className="mt-2 text-muted-foreground">Try a different word or category.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image = productImage(product);
              const chat = whatsappLink(
                product.contact_number,
                `Namaste! I am interested in "${product.title}" on ArtisanLink.`,
              );
              return (
                <article key={product.id} className="surface-card flex flex-col overflow-hidden">
                  <Link
                    to="/product/$id"
                    params={{ id: product.id }}
                    className="block aspect-[4/3] bg-secondary"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        No photo
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <Link to="/product/$id" params={{ id: product.id }}>
                      <h3 className="font-display text-lg font-semibold leading-snug">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xl font-semibold text-primary">
                      {formatPrice(product.suggested_price)}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      {product.artisan_name}
                      {product.artisan_location ? ` · ${product.artisan_location}` : ""}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye className="size-4" /> {product.views} views
                    </p>

                    <div className="mt-4 grid gap-2">
                      <Button
                        variant="hero"
                        size="touch"
                        onClick={() => {
                          add({
                            id: product.id,
                            title: product.title,
                            price: product.suggested_price,
                            image,
                            artisanName: product.artisan_name,
                            artisanLocation: product.artisan_location,
                            contactNumber: product.contact_number,
                          });
                          toast.success("Added to your cart");
                        }}
                      >
                        <Plus className="size-5" /> Add to cart
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" size="touch" disabled={!product.contact_number}>
                          <a href={product.contact_number ? `tel:${product.contact_number}` : "#"}>
                            <Phone className="size-4" /> Call
                          </a>
                        </Button>
                        <Button asChild variant="forest" size="touch" disabled={!chat}>
                          <a href={chat ?? "#"} target="_blank" rel="noreferrer">
                            <MessageCircle className="size-4" /> Message
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
