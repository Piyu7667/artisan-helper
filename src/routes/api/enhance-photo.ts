import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/enhance-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { photoUrl } = (await request.json()) as { photoUrl?: string };
        if (!photoUrl) return new Response("Missing photoUrl", { status: 400 });

        const src = await fetch(photoUrl);
        if (!src.ok) return new Response("Could not read the source photo", { status: 400 });
        const bytes = await src.arrayBuffer();
        const type = src.headers.get("content-type") ?? "image/jpeg";

        const form = new FormData();
        form.append("model", "openai/gpt-image-2");
        form.append(
          "prompt",
          "Product photo cleanup for an e-commerce listing. Remove the cluttered background completely and replace it with a clean, soft neutral studio background (near-white, gentle even gradient, soft natural shadow under the object). Keep the handmade product itself exactly the same — same shape, colours, patterns, textures and details, no added or removed elements. Auto-correct exposure: balanced brightness, natural contrast, neutral white balance, sharp focus, professional catalogue lighting.",
        );
        form.append("image", new Blob([bytes], { type }), "product.png");
        form.append("quality", "low");
        form.append("size", "1024x1024");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        });
        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
