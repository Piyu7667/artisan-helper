import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, clearDraft, loadDraft, type ListingDraft } from "@/lib/products";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review & Publish — ArtisanLink" },
      {
        name: "description",
        content:
          "Check and edit your AI-generated title, descriptions, category and price before publishing your handmade product.",
      },
      { property: "og:title", content: "Review & Publish — ArtisanLink" },
      {
        property: "og:description",
        content: "Edit anything you like, then publish your listing to buyers.",
      },
    ],
  }),
  component: ReviewPublish,
});

function ReviewPublish() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setLoaded(true);
  }, []);

  function update<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function publish() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Please add a product title.");
      return;
    }
    setPublishing(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setPublishing(false);
      toast.error("Please sign in as an artisan to publish your listing.");
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: auth.user.id,
        photo_url: draft.photoUrl || null,
        enhanced_photo_url: draft.enhancedPhotoUrl || null,
        title: draft.title.trim(),
        description_english: draft.descriptionEnglish || null,
        description_hindi: draft.descriptionHindi || null,
        category: draft.category || null,
        suggested_price: draft.suggestedPrice ? Number(draft.suggestedPrice) : null,
        artisan_name: draft.artisanName,
        artisan_location: draft.artisanLocation || null,
        contact_number: draft.contactNumber || null,
      })
      .select("id")
      .single();

    setPublishing(false);
    if (error || !data) {
      console.error(error);
      toast.error("Could not publish your product. Please try again.");
      return;
    }
    clearDraft();
    toast.success("Your product is live!");
    navigate({ to: "/product/$id", params: { id: data.id } });
  }

  if (!loaded) return null;

  if (!draft) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">No listing to review</h1>
          <p className="mt-2 text-muted-foreground">Start by adding a photo and a voice note.</p>
          <Button asChild variant="hero" size="touch" className="mt-6">
            <Link to="/add-product">Add a product</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-xl px-5 py-8">
        <h1 className="font-display text-3xl font-semibold">Review &amp; publish</h1>
        <p className="mt-2 text-muted-foreground">Change anything that is not right.</p>

        <div className="surface-card mt-6 overflow-hidden p-4">
          {draft.enhancedPhotoUrl && draft.photoUrl ? (
            <>
              <BeforeAfterSlider
                before={draft.photoUrl}
                after={draft.enhancedPhotoUrl}
                alt={draft.title || "Your product"}
              />
              <p className="pt-3 text-sm text-muted-foreground">
                Drag the slider to see the enhanced photo.
              </p>
            </>
          ) : draft.photoUrl ? (
            <img
              src={draft.photoUrl}
              alt={draft.title || "Your product"}
              loading="lazy"
              className="h-72 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              No photo
            </div>
          )}
        </div>

        <div className="surface-card mt-5 space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">
              Title
            </Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Hand-painted blue pottery vase"
              className="h-14 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc-en" className="text-base">
              Description (English)
            </Label>
            <Textarea
              id="desc-en"
              rows={5}
              value={draft.descriptionEnglish}
              onChange={(e) => update("descriptionEnglish", e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc-hi" className="text-base">
              विवरण (Hindi)
            </Label>
            <Textarea
              id="desc-hi"
              rows={5}
              value={draft.descriptionHindi}
              onChange={(e) => update("descriptionHindi", e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Category</Label>
            <Select value={draft.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-base">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {draft.priceRange ? (
            <div className="rounded-xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  AI-Estimated Price Guide
                </span>
                {draft.priceReasoning ? (
                  <button
                    type="button"
                    aria-label="Why this price range?"
                    aria-expanded={showReasoning}
                    onClick={() => setShowReasoning((v) => !v)}
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-background"
                  >
                    <Info className="size-4" />
                  </button>
                ) : null}
              </div>
              <p className="font-display mt-1 text-2xl font-semibold">{draft.priceRange}</p>
              {showReasoning && draft.priceReasoning ? (
                <p className="mt-2 text-sm text-muted-foreground">{draft.priceReasoning}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="price" className="text-base">
              Your price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              inputMode="numeric"
              value={draft.suggestedPrice}
              onChange={(e) => update("suggestedPrice", e.target.value)}
              placeholder="850"
              className="h-14 text-base"
            />
            <p className="text-sm text-muted-foreground">
              {draft.priceRange
                ? "Pre-filled with the middle of the suggested range — change it to whatever you want."
                : "Set the price you want to charge."}
            </p>
          </div>
        </div>

        <Button
          variant="forest"
          size="xl"
          className="mt-7 w-full"
          onClick={publish}
          disabled={publishing}
        >
          {publishing ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          {publishing ? "Publishing..." : "Confirm & Publish"}
        </Button>
      </main>
    </div>
  );
}
