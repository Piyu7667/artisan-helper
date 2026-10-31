import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flower2, LogIn, Menu, ShoppingCart, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

type NavTo =
  | "/"
  | "/browse"
  | "/exhibition"
  | "/add-product"
  | "/artisan-dashboard"
  | "/buyer-dashboard";

const baseLink =
  "rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";
const activeLink = "rounded-lg px-3 py-2 bg-secondary text-foreground";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const isBuyer = profile?.role === "buyer";

  const navItems: { to: NavTo; label: string; exact: boolean }[] = [
    { to: "/", label: t("nav.home"), exact: true },
    { to: "/browse", label: t("nav.browse"), exact: false },
    { to: "/exhibition", label: t("nav.exhibition"), exact: false },
    ...(isBuyer ? [] : [{ to: "/add-product" as NavTo, label: t("nav.sell"), exact: false }]),
    ...(user
      ? [
          {
            to: (isBuyer ? "/buyer-dashboard" : "/artisan-dashboard") as NavTo,
            label: isBuyer ? t("nav.myHome") : t("nav.myShop"),
            exact: false,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flower2 className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">ArtisanLink</span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <nav className="flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={baseLink}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: activeLink }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <ShoppingCart className="size-5" />
            Cart
            {count > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {!loading &&
            (user ? (
              <SignOutButton className="h-10 px-3" />
            ) : (
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LogIn className="size-4" /> Sign in
              </Link>
            ))}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-11 items-center justify-center rounded-xl border border-border text-foreground sm:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-2 text-base font-medium sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "block rounded-lg px-3 py-3 bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{
              className: "flex items-center gap-2 rounded-lg px-3 py-3 bg-secondary text-foreground",
            }}
          >
            <ShoppingCart className="size-5" /> Cart{count > 0 ? ` (${count})` : ""}
          </Link>
          {!loading &&
            (user ? (
              <div className="px-3 py-3">
                <SignOutButton className="w-full" />
              </div>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "login" }}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 font-semibold text-primary"
              >
                Sign in / Sign up
              </Link>
            ))}
        </nav>
      )}
    </header>
  );
}
