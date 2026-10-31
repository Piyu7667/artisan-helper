import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/suggest-price")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { imageUrl, description } = (await request.json()) as {
          imageUrl?: string;
          description?: string;
        };
        const text = (description ?? "").trim();
        if (!text && !imageUrl) return new Response("Missing input", { status: 400 });

        const prompt = `Based on this handmade product's image and description: ${text || "(no description provided)"}, suggest a competitive price RANGE in INR typical for similar handmade Indian craft products currently sold online, considering category and apparent material/craftsmanship quality. Respond only in JSON: {"price_range":"", "reasoning":""}`;

        const content: unknown[] = [{ type: "text", text: prompt }];
        if (imageUrl) content.push({ type: "image_url", image_url: { url: imageUrl } });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            messages: [{ role: "user", content }],
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

        const priceRange = String(parsed["price_range"] ?? "").trim();
        const reasoning = String(parsed["reasoning"] ?? "").trim();

        // Midpoint of the first two numbers found in the range (e.g. "₹800 - ₹1,200").
        const numbers = (priceRange.match(/\d[\d,]*(?:\.\d+)?/g) ?? [])
          .map((n) => Number(n.replace(/,/g, "")))
          .filter((n) => Number.isFinite(n) && n > 0);
        const midpoint =
          numbers.length >= 2
            ? Math.round((numbers[0]! + numbers[1]!) / 2)
            : numbers.length === 1
              ? Math.round(numbers[0]!)
              : null;

        return new Response(JSON.stringify({ price_range: priceRange, reasoning, midpoint }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
