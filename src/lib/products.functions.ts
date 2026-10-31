import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Records a product view. Runs server-side with the privileged client so the
 * SECURITY DEFINER view-counter function is never exposed for direct public
 * execution from the browser.
 */
export const trackProductView = createServerFn({ method: "POST" })
  .inputValidator((data: { productId: string }) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("increment_product_views", {
      product_id: data.productId,
    });
    if (error) throw error;
    return { ok: true };
  });
