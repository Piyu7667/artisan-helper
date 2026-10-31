import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Phone, Plus, MessageCircle, ShoppingCart, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useCart, whatsappLink } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ArtisanLink" },
      {
        name: "description",
        content:
          "Review the handmade crafts you saved and contact each artisan directly to confirm your order.",
      },
      { property: "og:title", content: "Your Cart — ArtisanLink" },
      {
        property: "og:description",
        content: "Handmade items you saved, with a direct line to every maker.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, count, total, setQuantity, remove, clear } = useCart();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Your cart</h1>

        {items.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <ShoppingCart className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 font-display text-xl font-semibold">Your cart is empty</p>
            <p className="mt-2 text-muted-foreground">
              Find something handmade you love and add it here.
            </p>
            <Button asChild variant="hero" size="touch" className="mt-6">
              <Link to="/browse">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-6 grid gap-4">
              {items.map((item) => {
                const chat = whatsappLink(
                  item.contactNumber,
                  `Namaste! I would like to order ${item.quantity} × "${item.title}" from ArtisanLink.`,
                );
                return (
                  <li key={item.id} className="surface-card flex flex-wrap gap-4 p-4">
                    <Link
                      to="/product/$id"
                      params={{ id: item.id }}
                      className="size-24 shrink-0 overflow-hidden rounded-xl bg-secondary"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="size-full object-cover" />
                      ) : null}
                    </Link>

                    <div className="min-w-48 flex-1">
                      <Link to="/product/$id" params={{ id: item.id }}>
                        <h2 className="font-display text-lg font-semibold">{item.title}</h2>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.artisanName}
                        {item.artisanLocation ? ` · ${item.artisanLocation}` : ""}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-primary">
                        {formatPrice(item.price)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Reduce quantity of ${item.title}`}
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="min-w-8 text-center text-base font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={`Increase quantity of ${item.title}`}
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>

                        <Button asChild variant="outline" disabled={!item.contactNumber}>
                          <a href={item.contactNumber ? `tel:${item.contactNumber}` : "#"}>
                            <Phone className="size-4" /> Call artisan
                          </a>
                        </Button>
                        <Button asChild variant="forest" disabled={!chat}>
                          <a href={chat ?? "#"} target="_blank" rel="noreferrer">
                            <MessageCircle className="size-4" /> Message artisan
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => remove(item.id)}
                        >
                          <Trash2 className="size-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-muted-foreground">
                  {count} item{count > 1 ? "s" : ""} in cart
                </p>
                <p className="font-display text-2xl font-semibold">{formatPrice(total)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Payment happens directly with each artisan when you call or message them.
                </p>
              </div>
              <Button variant="outline" size="touch" onClick={clear}>
                Empty cart
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
