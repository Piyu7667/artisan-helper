# Artisan Connect

Build a mobile-responsive web app called "ArtisanLink" — an AI-powered virtual business manager for rural artisans and micro-entrepreneurs to digitize, catalog, and sell their handmade products online.

Set up a Supabase table called "products" with columns:

id, photo_url, enhanced_photo_url, title, description_english, description_hindi, category, suggested_price, artisan_name, artisan_location, contact_number, views, created_at

Pages:

1. "Home" — hero section with tagline "Your Virtual Business Manager for Handmade Success," background image of Indian handicrafts, two buttons: "I'm an Artisan" and "Browse Products."

2. "Add Product" — artisan uploads a product photo, records a short voice note describing it (mic button), enters name/location/contact. Has a "Generate My Listing" button. Show a multi-step loading state: "Enhancing photo..." → "Understanding your voice note..." → "Writing your listing..." → "Suggesting a price...". Leave these as placeholder functions I'll wire up next: enhancePhoto(photoUrl), transcribeAndTranslate(audioUrl), generateListing(text), suggestPrice(imageUrl, description).

3. "Review & Publish" — shows the AI-generated title, English description, Hindi description, category, and suggested price, all editable, with the enhanced photo preview. Artisan can edit before confirming and publishing.

4. "Browse Products" — grid of product cards (enhanced photo, title, price, artisan name/location), search bar, category filter, sort by newest/price.

5. "Product Detail" — full details, larger photo, both language descriptions toggle, "Contact Artisan" button, and a "Request B2B Bulk Quote" button for larger buyers.

6. "Artisan Dashboard" — list of their own products, total views, and a simple "Boost Tip" section showing basic suggestions like "Add more photos" or "Update your price."

Design: warm, earthy color palette (terracotta, cream, forest green), minimalist and highly accessible UI — large buttons, simple icons, minimal text-heavy screens, since users may have low digital literacy. Fully mobile responsive.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://digital-artisan-aid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cfe9bb28-7a10-44e9-899c-c90cf217aaaa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
