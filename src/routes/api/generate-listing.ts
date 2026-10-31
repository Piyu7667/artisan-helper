import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-listing")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { text } = (await request.json()) as { text?: string };
        const description = (text ?? "").trim();
        if (!description) return new Response("Missing text", { status: 400 });

        const prompt = `You are helping a rural artisan create a professional product listing. Based on this description: ${description}, generate: 1) a short SEO-friendly product title, 2) a 2-3 sentence professional description in English, 3) the same description translated naturally into Hindi, 4) one category from: Textiles, Pottery, Jewelry, Woodwork, Bamboo/Cane, Home Decor, Other. Respond only in JSON: {"title":"","description_english":"","description_hindi":"","category":""}`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });
        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }

        const json = (await upstream.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const raw = json.choices?.[0]?.message?.content ?? "";
        const cleaned = raw
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/, "")
          .trim();

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(cleaned) as Record<string, unknown>;
        } catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (!match) return new Response("The AI reply was not valid JSON", { status: 502 });
          parsed = JSON.parse(match[0]) as Record<string, unknown>;
        }

        return new Response(
          JSON.stringify({
            title: String(parsed["title"] ?? ""),
            description_english: String(parsed["description_english"] ?? ""),
            description_hindi: String(parsed["description_hindi"] ?? ""),
            category: String(parsed["category"] ?? ""),
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
