import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Quote } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchExhibitionPieces } from "@/lib/exhibition";

export const Route = createFileRoute("/exhibition")({
  head: () => ({
    meta: [
      { title: "The Exhibition — Signature Crafts on ArtisanLink" },
      {
        name: "description",
        content:
          "A gallery of signature pieces from rural Indian artisans, each with the story and tradition behind the craft.",
      },
      { property: "og:title", content: "The Exhibition — Signature Crafts on ArtisanLink" },
      {
        property: "og:description",
        content: "One signature piece per artisan, shown gallery-style with the story behind it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Exhibition,
});

function Exhibition() {
  const { data, isLoading } = useQuery({
    queryKey: ["exhibition-pieces"],
    queryFn: fetchExhibitionPieces,
  });

  const pieces = data ?? [];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            The Exhibition
          </p>
          <h1 className="text-balance-tight mt-3 font-display text-4xl font-semibold sm:text-5xl">
            One signature piece, one living tradition
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every artisan shows a single work they are proudest of — and the story that made it.
          </p>
        </header>

        {isLoading ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-[32rem] rounded-3xl" />
            ))}
          </div>
        ) : pieces.length === 0 ? (
          <div className="surface-card mx-auto mt-12 max-w-xl p-10 text-center">
            <p className="font-display text-xl font-semibold">The gallery is still empty</p>
            <p className="mt-2 text-muted-foreground">
              Be the first artisan to show a signature piece.
            </p>
            <Button asChild variant="hero" size="touch" className="mt-6">
              <Link to="/add-exhibition">Add to Exhibition</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {pieces.map((piece) => (
              <article
                key={piece.id}
                className="surface-card overflow-hidden transition-shadow hover:shadow-lift"
              >
                {piece.photo_url ? (
                  <img
                    src={piece.photo_url}
                    alt={piece.title || `Signature craft by ${piece.artisan_name}`}
                    loading="lazy"
                    className="aspect-4/3 w-full bg-secondary object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 w-full items-center justify-center bg-secondary text-muted-foreground">
                    No photo
                  </div>
                )}
                <div className="space-y-4 p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                    {piece.title}
                  </h2>
                  <p className="flex items-center gap-2 text-base font-medium">
                    <MapPin className="size-5 shrink-0 text-primary" />
                    {piece.artisan_name}
                    {piece.artisan_location ? ` · ${piece.artisan_location}` : ""}
                  </p>
                  {piece.description ? (
                    <p className="text-base text-muted-foreground">{piece.description}</p>
                  ) : null}
                  {piece.craft_story ? (
                    <blockquote className="rounded-2xl bg-secondary p-5">
                      <Quote className="size-5 text-primary" aria-hidden />
                      <p className="mt-2 font-display text-lg leading-relaxed">
                        {piece.craft_story}
                      </p>
                    </blockquote>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
