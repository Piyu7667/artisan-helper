import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Mic, Square, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  enhancePhoto,
  generateListing,
  suggestPrice,
  transcribeAndTranslate,
} from "@/lib/artisan-ai";
import { loadArtisan, saveArtisan, saveDraft, uploadToBucket } from "@/lib/products";

export const Route = createFileRoute("/add-product")({
  head: () => ({
    meta: [
      { title: "Add a Product — ArtisanLink" },
      {
        name: "description",
        content:
          "Upload a photo, record a voice note about your craft, and ArtisanLink generates your product listing.",
      },
      { property: "og:title", content: "Add a Product — ArtisanLink" },
      {
        property: "og:description",
        content: "One photo and a voice note is all you need to create a listing.",
      },
    ],
  }),
  component: AddProduct,
});

const STEPS = [
  "Enhancing photo...",
  "Understanding your voice note...",
  "Writing your listing...",
  "Suggesting a price...",
];

function AddProduct() {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const saved = loadArtisan();
    if (saved) {
      setName(saved.name);
      setLocation(saved.location);
      setContact(saved.contact);
    }
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
    } catch {
      toast.error("We could not use your microphone. Please allow access and try again.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  async function handleGenerate() {
    if (!photoFile) {
      toast.error("Please add a photo of your product.");
      return;
    }
    if (!name.trim() || !contact.trim()) {
      toast.error("Please fill in your name and contact number.");
      return;
    }

    try {
      setActiveStep(0);
      const ext = photoFile.name.split(".").pop() || "jpg";
      const photoUrl = await uploadToBucket("product-photos", photoFile, ext);
      const enhancedPhotoUrl = (await enhancePhoto(photoUrl)) || photoUrl;

      setActiveStep(1);
      let voiceNoteUrl = "";
      if (audioBlob) voiceNoteUrl = await uploadToBucket("voice-notes", audioBlob, "webm");
      const transcript = voiceNoteUrl ? await transcribeAndTranslate(voiceNoteUrl) : "";

      setActiveStep(2);
      const listing = await generateListing(transcript);

      setActiveStep(3);
      const price = await suggestPrice(enhancedPhotoUrl, listing.descriptionEnglish);

      saveArtisan({ name: name.trim(), location: location.trim(), contact: contact.trim() });
      saveDraft({
        photoUrl,
        enhancedPhotoUrl,
        voiceNoteUrl,
        transcript,
        title: listing.title,
        descriptionEnglish: listing.descriptionEnglish,
        descriptionHindi: listing.descriptionHindi,
        category: listing.category,
        suggestedPrice: price.midpoint === null ? "" : String(price.midpoint),
        priceRange: price.priceRange,
        priceReasoning: price.reasoning,
        artisanName: name.trim(),
        artisanLocation: location.trim(),
        contactNumber: contact.trim(),
      });
      navigate({ to: "/review" });
    } catch (error) {
      console.error(error);
      setActiveStep(null);
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (activeStep !== null) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-md px-5 py-16">
          <h1 className="text-center font-display text-2xl font-semibold">
            Making your listing ready
          </h1>
          <ul className="mt-8 space-y-3">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className="surface-card flex items-center gap-3 p-4 text-base"
                aria-current={i === activeStep ? "step" : undefined}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  {i < activeStep ? (
                    <Check className="size-5" />
                  ) : i === activeStep ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  )}
                </span>
                <span className={i > activeStep ? "text-muted-foreground" : "font-medium"}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-xl px-5 py-8">
        <h1 className="font-display text-3xl font-semibold">Add your product</h1>
        <p className="mt-2 text-muted-foreground">One photo. A few spoken words. That&apos;s all.</p>

        <section className="surface-card mt-7 p-5">
          <h2 className="font-display text-xl font-semibold">1. Product photo</h2>
          <label className="mt-4 block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Your product"
                loading="lazy"
                className="h-64 w-full rounded-xl object-cover"
              />
            ) : (
              <span className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/60 text-muted-foreground">
                <Camera className="size-10" />
                <span className="text-base font-medium">Tap to take or choose a photo</span>
              </span>
            )}
          </label>
        </section>

        <section className="surface-card mt-5 p-5">
          <h2 className="font-display text-xl font-semibold">2. Tell us about it</h2>
          <p className="mt-1 text-muted-foreground">
            Press the mic and speak in your own language.
          </p>
          <div className="mt-5 flex flex-col items-center gap-4">
            <Button
              type="button"
              variant={recording ? "destructive" : "hero"}
              size="xl"
              className="size-28 rounded-full p-0"
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? "Stop recording" : "Start recording a voice note"}
            >
              {recording ? <Square className="size-9" /> : <Mic className="size-9" />}
            </Button>
            <p className="text-base font-medium" aria-live="polite">
              {recording
                ? `Recording... ${seconds}s`
                : audioPreview
                  ? "Voice note ready"
                  : "Not recorded yet"}
            </p>
            {audioPreview && !recording && (
              <div className="flex w-full flex-col items-center gap-3">
                <audio controls src={audioPreview} className="w-full" />
                <Button
                  type="button"
                  variant="ghost"
                  size="touch"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioPreview(null);
                    setSeconds(0);
                  }}
                >
                  <Trash2 /> Record again
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="surface-card mt-5 space-y-4 p-5">
          <h2 className="font-display text-xl font-semibold">3. About you</h2>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Your name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kamla Devi"
              className="h-14 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base">
              Village / City
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bhuj, Gujarat"
              className="h-14 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-base">
              Contact number
            </Label>
            <Input
              id="contact"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="98765 43210"
              className="h-14 text-base"
            />
          </div>
        </section>

        <Button variant="hero" size="xl" className="mt-7 w-full" onClick={handleGenerate}>
          <Sparkles /> Generate My Listing
        </Button>
      </main>
    </div>
  );
}
