import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GalleryVerticalEnd,
  Mic,
  ShoppingBag,
  Sparkles,
  Store,
  Languages,
  IndianRupee,
} from "lucide-react";

import heroImage from "@/assets/hero-handicrafts.jpg";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ArtisanLink — Your Virtual Business Manager for Handmade Success" },
      {
        name: "description",
        content:
          "ArtisanLink helps rural artisans photograph, describe by voice, price and sell handmade products online in English and Hindi.",
      },
      {
        property: "og:title",
        content: "ArtisanLink — Your Virtual Business Manager for Handmade Success",
      },
      {
        property: "og:description",
        content:
          "Speak about your craft, and ArtisanLink writes the listing, suggests a price and puts you online.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  {
    icon: Mic,
    title: "Speak, don't type",
    text: "Take one photo and say a few words about your product in your own language.",
  },
  {
    icon: Sparkles,
    title: "We write the listing",
    text: "Your photo is cleaned up and a clear title and description are written for you.",
  },
  {
    icon: IndianRupee,
    title: "Get a fair price",
    text: "A suggested price helps you sell without underselling your work.",
  },
];

function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Indian handicrafts: blue pottery, cane baskets, brass lamps and block-printed textiles"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/65" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-1.5 text-sm font-medium text-foreground">
            <Sparkles className="size-4" /> AI business manager for artisans
          </span>
          <h1 className="text-balance-tight mt-6 font-display text-4xl font-semibold leading-tight text-primary-foreground sm:text-6xl">
            Your Virtual Business Manager for Handmade Success
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/90">
            Photo. Voice note. Done. ArtisanLink turns your craft into an online listing in English
            and Hindi.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="hero" size="xl" className="w-full sm:w-auto">
              <Link to="/add-product">
                <Store /> I&apos;m an Artisan
              </Link>
            </Button>
            <Button asChild variant="cream" size="xl" className="w-full sm:w-auto">
              <Link to="/browse">
                <ShoppingBag /> Browse Products
              </Link>
            </Button>
          </div>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="forest" size="xl" className="w-full sm:w-auto">
              <Link to="/exhibition">
                <GalleryVerticalEnd /> View Exhibition
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-center font-display text-3xl font-semibold">Three simple steps</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="surface-card p-6">
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-muted-foreground">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-accent px-5 py-14 text-accent-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Languages className="size-10" />
          <h2 className="font-display text-3xl font-semibold">Sell in English and Hindi</h2>
          <p className="max-w-xl text-accent-foreground/90">
            Buyers across India and abroad can read your story. Bulk buyers can request a B2B quote
            straight from your product page.
          </p>
          <Button asChild variant="cream" size="touch">
            <Link to="/add-product">Start my first listing</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        ArtisanLink — built for rural artisans and micro-entrepreneurs.
      </footer>
    </div>
  );
}
