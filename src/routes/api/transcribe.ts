import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { audioUrl } = (await request.json()) as { audioUrl?: string };
        if (!audioUrl) return new Response("Missing audioUrl", { status: 400 });

        const src = await fetch(audioUrl);
        if (!src.ok) return new Response("Could not read the voice note", { status: 400 });
        const bytes = await src.arrayBuffer();
        if (bytes.byteLength < 1024) {
          return new Response("The voice note is empty", { status: 400 });
        }
        const type = src.headers.get("content-type")?.split(";")[0] ?? "audio/webm";
        const ext =
          ({
            "audio/webm": "webm",
            "audio/mp4": "mp4",
            "audio/mpeg": "mp3",
            "audio/wav": "wav",
            "audio/x-wav": "wav",
            "audio/ogg": "ogg",
          } as Record<string, string>)[type] ?? "webm";

        // 1. Speech-to-text in whatever language the artisan spoke.
        const form = new FormData();
        form.append("model", "openai/gpt-4o-mini-transcribe");
        form.append("file", new Blob([bytes], { type }), `voice-note.${ext}`);

        const sttRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        });
        if (!sttRes.ok) {
          return new Response(await sttRes.text(), { status: sttRes.status });
        }
        const stt = (await sttRes.json()) as { text?: string };
        const transcript = (stt.text ?? "").trim();
        if (!transcript) {
          return new Response(JSON.stringify({ transcript: "", english: "" }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        // 2. Translate the transcript into English.
        const translateRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            messages: [
              {
                role: "system",
                content:
                  "You translate speech transcripts from Indian regional languages into natural English. Reply with the English translation only, no notes, no quotes. If the text is already English, return it cleaned up.",
              },
              { role: "user", content: transcript },
            ],
          }),
        });
        if (!translateRes.ok) {
          return new Response(await translateRes.text(), { status: translateRes.status });
        }
        const translated = (await translateRes.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const english = (translated.choices?.[0]?.message?.content ?? "").trim() || transcript;

        return new Response(JSON.stringify({ transcript, english }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
