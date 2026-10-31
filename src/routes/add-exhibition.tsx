import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { enhancePhoto } from "@/lib/artisan-ai";
import { fetchMyExhibitionPiece } from "@/lib/exhibition";
import { loadArtisan, saveArtisan, uploadToBucket } from "@/lib/products";

export const Route = createFileRoute("/add-exhibition")({
  head: () => ({
    meta: [
      { title: "Add Your Signature Piece — ArtisanLink Exhibition" },
      {
        name: "description",
        content:
          "Show one signature craft in the ArtisanLink Exhibition and share the tradition behind it.",
      },
      { property: "og:title", content: "Add Your Signature Piece — ArtisanLink Exhibition" },
      {
        property: "og:description",
        content: "Upload a photo, add a short story, and join the artisan gallery.",
      },
    ],
  }),
  component: AddExhibition,
});

function AddExhibition() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadArtisan();
    if (saved?.name) setName(saved.name);
    if (saved?.location) setLocation(saved.location);
  }, []);

  const busy = step !== null;

  async function handleSubmit() {
    if (!file) {
      toast.error("Please add a photo of your piece.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please give your piece a title.");
      return;
    }

    try {
      setStep("Checking your exhibition spot...");
      const existing = await fetchMyExhibitionPiece(name);
      if (existing) {
        setStep(null);
        toast.error("You already have a piece in the Exhibition — only one per artisan.");
        return;
      }

      setStep("Uploading your photo...");
      const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
      const originalUrl = await uploadToBucket("product-photos", file, extension);

      setStep("Enhancing photo...");
      const photoUrl = await enhancePhoto(originalUrl);

      setStep("Placing your piece in the gallery...");
      const { error } = await supabase.from("exhibition_pieces").insert({
        artisan_name: name.trim(),
        artisan_location: location.trim() || null,
        photo_url: photoUrl,
        title: title.trim(),
        description: description.trim() || null,
        craft_story: story.trim() || null,
      });
      if (error) throw error;

      const saved = loadArtisan();
      saveArtisan({
        name: name.trim(),
        location: location.trim(),
        contact: saved?.contact ?? "",
      });

      toast.success("Your signature piece is now in the Exhibition.");
      navigate({ to: "/exhibition" });
    } catch (error) {
      console.error("add exhibition piece failed", error);
      setStep(null);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Add to Exhibition</h1>
        <p className="mt-2 text-muted-foreground">
          Show one piece you are proudest of, and the story behind it.
        </p>

        <div className="surface-card mt-6 space-y-6 p-5">
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-base">
              Photo of your piece
            </Label>
            {preview ? (
              <img
                src={preview}
                alt="Your selected piece"
                className="aspect-4/3 w-full rounded-2xl object-cover"
              />
            ) : null}
            <label
              htmlFor="photo"
              className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-base font-medium text-muted-foreground"
            >
              <Camera className="size-5" />
              {file ? "Change photo" : "Take or choose a photo"}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setPreview(selected ? URL.createObjectURL(selected) : null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Handwoven bridal shawl"
              className="h-14 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this piece, and what is it made of?"
              className="min-h-24 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story" className="text-base">
              Craft story
            </Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="This weaving technique has been passed down in my family for three generations."
              className="min-h-28 text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Your name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base">
                Village / town
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 text-base"
              />
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={busy}
            onClick={() => void handleSubmit()}
          >
            {busy ? (
              <>
                <Loader2 className="size-5 animate-spin" /> {step}
              </>
            ) : (
              <>
                <Sparkles className="size-5" /> Add my piece
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/exhibition" className="text-primary underline">
              See the Exhibition
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
