import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "artisanlink:lang";

const en = {
  "language.label": "Language",
  "nav.home": "Home",
  "nav.browse": "Browse",
  "nav.exhibition": "Exhibition",
  "nav.sell": "Sell",
  "nav.myShop": "My Shop",
  "nav.myHome": "My Home",
  "nav.cart": "Cart",
  "nav.signIn": "Sign in",
  "nav.signInUp": "Sign in / Sign up",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",

  "home.badge": "AI business manager for artisans",
  "home.title": "Your Virtual Business Manager for Handmade Success",
  "home.subtitle":
    "Photo. Voice note. Done. ArtisanLink turns your craft into an online listing in English and Hindi.",
  "home.ctaArtisan": "I'm an Artisan",
  "home.ctaBrowse": "Browse Products",
  "home.ctaExhibition": "View Exhibition",
  "home.stepsTitle": "Three simple steps",
  "home.step": "Step",
  "home.step1Title": "Speak, don't type",
  "home.step1Text": "Take one photo and say a few words about your product in your own language.",
  "home.step2Title": "We write the listing",
  "home.step2Text": "Your photo is cleaned up and a clear title and description are written for you.",
  "home.step3Title": "Get a fair price",
  "home.step3Text": "A suggested price helps you sell without underselling your work.",
  "home.langTitle": "Sell in English and Hindi",
  "home.langText":
    "Buyers across India and abroad can read your story. Bulk buyers can request a B2B quote straight from your product page.",
  "home.langCta": "Start my first listing",
  "home.footer": "ArtisanLink — built for rural artisans and micro-entrepreneurs.",

  "browse.title": "Handmade, straight from the maker",
  "browse.searchPlaceholder": "Search products or artisans",
  "browse.allCategories": "All categories",
  "browse.newest": "Newest first",
  "browse.priceLow": "Price: low to high",
  "browse.priceHigh": "Price: high to low",
  "browse.empty": "No products found yet",
  "browse.emptyHintBefore": "Try a different search, or ",
  "browse.emptyHintLink": "list your own craft",
  "browse.noPhoto": "No photo",
  "browse.views": "views",
};

export type TranslationKey = keyof typeof en;

const hi: Record<TranslationKey, string> = {
  "language.label": "भाषा",
  "nav.home": "होम",
  "nav.browse": "खोजें",
  "nav.exhibition": "प्रदर्शनी",
  "nav.sell": "बेचें",
  "nav.myShop": "मेरी दुकान",
  "nav.myHome": "मेरा पेज",
  "nav.cart": "कार्ट",
  "nav.signIn": "साइन इन",
  "nav.signInUp": "साइन इन / साइन अप",
  "nav.openMenu": "मेनू खोलें",
  "nav.closeMenu": "मेनू बंद करें",

  "home.badge": "कारीगरों के लिए एआई बिज़नेस मैनेजर",
  "home.title": "हस्तनिर्मित सफलता के लिए आपका वर्चुअल बिज़नेस मैनेजर",
  "home.subtitle":
    "फोटो लें, बोलें, हो गया। ArtisanLink आपके हुनर को अंग्रेज़ी और हिंदी में ऑनलाइन लिस्टिंग बना देता है।",
  "home.ctaArtisan": "मैं कारीगर हूँ",
  "home.ctaBrowse": "उत्पाद देखें",
  "home.ctaExhibition": "प्रदर्शनी देखें",
  "home.stepsTitle": "तीन आसान कदम",
  "home.step": "कदम",
  "home.step1Title": "लिखें नहीं, बोलें",
  "home.step1Text": "एक फोटो लें और अपनी भाषा में उत्पाद के बारे में कुछ शब्द बोलें।",
  "home.step2Title": "लिस्टिंग हम लिखेंगे",
  "home.step2Text": "आपकी फोटो साफ़ की जाती है और साफ़ शीर्षक व विवरण लिख दिया जाता है।",
  "home.step3Title": "उचित दाम पाएं",
  "home.step3Text": "सुझाया गया दाम आपको अपने काम को कम कीमत में बेचने से बचाता है।",
  "home.langTitle": "अंग्रेज़ी और हिंदी में बेचें",
  "home.langText":
    "भारत और विदेश के खरीदार आपकी कहानी पढ़ सकते हैं। थोक खरीदार सीधे आपके पेज से B2B कोटेशन मांग सकते हैं।",
  "home.langCta": "मेरी पहली लिस्टिंग शुरू करें",
  "home.footer": "ArtisanLink — ग्रामीण कारीगरों और छोटे उद्यमियों के लिए।",

  "browse.title": "हस्तनिर्मित, सीधे कारीगर से",
  "browse.searchPlaceholder": "उत्पाद या कारीगर खोजें",
  "browse.allCategories": "सभी श्रेणियाँ",
  "browse.newest": "नए पहले",
  "browse.priceLow": "दाम: कम से ज़्यादा",
  "browse.priceHigh": "दाम: ज़्यादा से कम",
  "browse.empty": "अभी कोई उत्पाद नहीं मिला",
  "browse.emptyHintBefore": "दूसरी खोज आज़माएँ, या ",
  "browse.emptyHintLink": "अपना सामान लिस्ट करें",
  "browse.noPhoto": "फोटो नहीं",
  "browse.views": "बार देखा गया",
};

const bn: Record<TranslationKey, string> = {
  "language.label": "ভাষা",
  "nav.home": "হোম",
  "nav.browse": "দেখুন",
  "nav.exhibition": "প্রদর্শনী",
  "nav.sell": "বিক্রি",
  "nav.myShop": "আমার দোকান",
  "nav.myHome": "আমার পাতা",
  "nav.cart": "কার্ট",
  "nav.signIn": "সাইন ইন",
  "nav.signInUp": "সাইন ইন / সাইন আপ",
  "nav.openMenu": "মেনু খুলুন",
  "nav.closeMenu": "মেনু বন্ধ করুন",

  "home.badge": "কারিগরদের জন্য এআই ব্যবসা ম্যানেজার",
  "home.title": "হাতে তৈরি সফলতার জন্য আপনার ভার্চুয়াল ব্যবসা ম্যানেজার",
  "home.subtitle":
    "ছবি তুলুন, বলুন, হয়ে গেল। ArtisanLink আপনার কাজকে ইংরেজি ও হিন্দিতে অনলাইন তালিকায় পরিণত করে।",
  "home.ctaArtisan": "আমি একজন কারিগর",
  "home.ctaBrowse": "পণ্য দেখুন",
  "home.ctaExhibition": "প্রদর্শনী দেখুন",
  "home.stepsTitle": "তিনটি সহজ ধাপ",
  "home.step": "ধাপ",
  "home.step1Title": "লিখবেন না, বলুন",
  "home.step1Text": "একটি ছবি তুলুন আর নিজের ভাষায় পণ্য নিয়ে কয়েকটি কথা বলুন।",
  "home.step2Title": "তালিকা আমরা লিখব",
  "home.step2Text": "আপনার ছবি পরিষ্কার করা হয় এবং স্পষ্ট নাম ও বিবরণ লিখে দেওয়া হয়।",
  "home.step3Title": "ন্যায্য দাম পান",
  "home.step3Text": "প্রস্তাবিত দাম আপনাকে কম দামে বিক্রি করা থেকে বাঁচায়।",
  "home.langTitle": "ইংরেজি ও হিন্দিতে বিক্রি করুন",
  "home.langText":
    "ভারত ও বিদেশের ক্রেতারা আপনার গল্প পড়তে পারেন। বড় ক্রেতারা সরাসরি আপনার পাতা থেকে B2B কোট চাইতে পারেন।",
  "home.langCta": "আমার প্রথম তালিকা শুরু করুন",
  "home.footer": "ArtisanLink — গ্রামীণ কারিগর ও ক্ষুদ্র উদ্যোগীদের জন্য।",

  "browse.title": "হাতে তৈরি, সরাসরি কারিগরের কাছ থেকে",
  "browse.searchPlaceholder": "পণ্য বা কারিগর খুঁজুন",
  "browse.allCategories": "সব বিভাগ",
  "browse.newest": "নতুন আগে",
  "browse.priceLow": "দাম: কম থেকে বেশি",
  "browse.priceHigh": "দাম: বেশি থেকে কম",
  "browse.empty": "এখনও কোনো পণ্য নেই",
  "browse.emptyHintBefore": "অন্য কিছু খুঁজে দেখুন, বা ",
  "browse.emptyHintLink": "নিজের কাজ তালিকাভুক্ত করুন",
  "browse.noPhoto": "ছবি নেই",
  "browse.views": "বার দেখা হয়েছে",
};

const mr: Record<TranslationKey, string> = {
  "language.label": "भाषा",
  "nav.home": "मुख्यपृष्ठ",
  "nav.browse": "पहा",
  "nav.exhibition": "प्रदर्शन",
  "nav.sell": "विका",
  "nav.myShop": "माझे दुकान",
  "nav.myHome": "माझे पान",
  "nav.cart": "कार्ट",
  "nav.signIn": "साइन इन",
  "nav.signInUp": "साइन इन / साइन अप",
  "nav.openMenu": "मेनू उघडा",
  "nav.closeMenu": "मेनू बंद करा",

  "home.badge": "कारागिरांसाठी एआय व्यवसाय व्यवस्थापक",
  "home.title": "हस्तनिर्मित यशासाठी तुमचा व्हर्च्युअल व्यवसाय व्यवस्थापक",
  "home.subtitle":
    "फोटो काढा, बोला, झाले. ArtisanLink तुमच्या कलेची इंग्रजी आणि हिंदीत ऑनलाइन नोंद तयार करते.",
  "home.ctaArtisan": "मी कारागीर आहे",
  "home.ctaBrowse": "उत्पादने पहा",
  "home.ctaExhibition": "प्रदर्शन पहा",
  "home.stepsTitle": "तीन सोपे टप्पे",
  "home.step": "टप्पा",
  "home.step1Title": "लिहू नका, बोला",
  "home.step1Text": "एक फोटो काढा आणि तुमच्या भाषेत उत्पादनाबद्दल थोडे बोला.",
  "home.step2Title": "नोंद आम्ही लिहितो",
  "home.step2Text": "तुमचा फोटो स्वच्छ केला जातो आणि स्पष्ट शीर्षक व वर्णन लिहून दिले जाते.",
  "home.step3Title": "योग्य किंमत मिळवा",
  "home.step3Text": "सुचवलेली किंमत तुमचे काम कमी दरात विकले जाण्यापासून वाचवते.",
  "home.langTitle": "इंग्रजी आणि हिंदीत विका",
  "home.langText":
    "भारतातील आणि परदेशातील ग्राहक तुमची कहाणी वाचू शकतात. मोठे खरेदीदार तुमच्या पानावरून B2B दरपत्रक मागू शकतात.",
  "home.langCta": "माझी पहिली नोंद सुरू करा",
  "home.footer": "ArtisanLink — ग्रामीण कारागीर आणि लघुउद्योजकांसाठी.",

  "browse.title": "हस्तनिर्मित, थेट कारागिराकडून",
  "browse.searchPlaceholder": "उत्पादने किंवा कारागीर शोधा",
  "browse.allCategories": "सर्व श्रेणी",
  "browse.newest": "नवीन आधी",
  "browse.priceLow": "किंमत: कमी ते जास्त",
  "browse.priceHigh": "किंमत: जास्त ते कमी",
  "browse.empty": "अजून उत्पादने नाहीत",
  "browse.emptyHintBefore": "वेगळा शोध घ्या, किंवा ",
  "browse.emptyHintLink": "तुमची कला नोंदवा",
  "browse.noPhoto": "फोटो नाही",
  "browse.views": "वेळा पाहिले",
};

const dictionaries: Record<LanguageCode, Record<TranslationKey, string>> = { en, hi, bn, mr };

type I18nValue = {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function isLanguage(value: string | null): value is LanguageCode {
  return !!value && LANGUAGES.some((l) => l.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) setLangState(stored);
    } catch {
      // Ignore an unreadable saved language.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key) => dictionaries[lang][key] ?? en[key],
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
