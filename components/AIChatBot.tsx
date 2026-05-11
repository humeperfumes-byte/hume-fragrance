"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { stripRegionPrefix } from "@/lib/region-routing";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  links?: Array<{ href: string; label: string }>;
};

const quickActions = [
  { label: "Find perfume", value: "find perfume" },
  { label: "Masculine boozy", value: "masculine boozy men perfume" },
  { label: "Gift for girlfriend", value: "perfume gift for my girlfriend" },
  { label: "Office fresh", value: "fresh office perfume for men" },
  { label: "Shipping info", value: "shipping" },
  { label: "Refill program", value: "refill" },
  { label: "Build your kit", value: "kit" },
  { label: "Current offers", value: "offers" },
  { label: "Contact support", value: "support" },
];

type Recommendation = {
  name: string;
  why: string;
};

function formatRecommendations(title: string, picks: Recommendation[]) {
  return `${title}\n\n${picks
    .map((pick, index) => `${index + 1}. ${pick.name} — ${pick.why}`)
    .join("\n")}`;
}

function getRecommendationReply(
  value: string,
): Omit<ChatMessage, "id" | "role"> | null {
  const isForWomen =
    value.includes("girlfriend") ||
    value.includes("gf") ||
    value.includes("wife") ||
    value.includes("for her") ||
    value.includes("women") ||
    value.includes("woman") ||
    value.includes("female");

  const isForMen =
    value.includes("for him") ||
    value.includes("men") ||
    value.includes("man") ||
    value.includes("male") ||
    value.includes("boyfriend") ||
    value.includes("husband");

  const boozy =
    value.includes("boozy") ||
    value.includes("rum") ||
    value.includes("whiskey") ||
    value.includes("smoky") ||
    value.includes("tobacco") ||
    value.includes("manly");

  const sweet =
    value.includes("sweet") ||
    value.includes("vanilla") ||
    value.includes("gourmand") ||
    value.includes("dessert");

  const fresh =
    value.includes("fresh") ||
    value.includes("clean") ||
    value.includes("aquatic") ||
    value.includes("marine") ||
    value.includes("summer");

  const office =
    value.includes("office") ||
    value.includes("work") ||
    value.includes("professional");
  const dateNight =
    value.includes("date") ||
    value.includes("romantic") ||
    value.includes("night");
  const oud =
    value.includes("oud") ||
    value.includes("arabic") ||
    value.includes("intense");

  if (isForMen && boozy) {
    return {
      text: formatRecommendations(
        "Great match for a masculine boozy profile:",
        [
          {
            name: "Replica Jazz Club (Maison Martin Margiela inspired profile)",
            why: "boozy-rum tobacco vibe, warm and classy for evening wear",
          },
          {
            name: "Spicebomb style profile",
            why: "spicy tobacco warmth with strong masculine character",
          },
          {
            name: "Ombre Leather style profile",
            why: "dark, bold and rugged; excellent for night outings",
          },
        ],
      ),
      links: [{ href: "/shop", label: "See Matches in Shop" }],
    };
  }

  if (isForWomen || value.includes("billie") || value.includes("eilish")) {
    return {
      text: formatRecommendations("For gifting your girlfriend, start with:", [
        {
          name: "Billie Eilish EDP inspired profile",
          why: "sweet vanilla-amber signature, cozy and feminine",
        },
        {
          name: "Cosmic Kylie Jenner inspired profile",
          why: "modern floral-amber style for daily wear",
        },
        {
          name: "YSL Myself-inspired fresh floral-woody picks (unisex leaning)",
          why: "clean, compliment-friendly and versatile",
        },
      ]),
      links: [{ href: "/shop", label: "Browse Gift-Friendly Perfumes" }],
    };
  }

  if (office && fresh) {
    return {
      text: formatRecommendations(
        "Best office-friendly fresh recommendations:",
        [
          {
            name: "Aqua Marine",
            why: "clean marine freshness, safe for work settings",
          },
          {
            name: "LV Imagination style profile",
            why: "elegant citrus-tea freshness",
          },
          {
            name: "YSL Myself style profile",
            why: "fresh-modern signature for daily office use",
          },
        ],
      ),
      links: [{ href: "/shop", label: "Shop Office Perfumes" }],
    };
  }

  if (dateNight && (sweet || boozy || oud)) {
    return {
      text: formatRecommendations("Strong date-night picks:", [
        {
          name: "Replica Jazz Club style profile",
          why: "boozy tobacco warmth, intimate and classy",
        },
        {
          name: "Ombre Nomade style profile",
          why: "rich oud-rose-smoky trail, luxurious presence",
        },
        {
          name: "Khamrah Qahwa style profile",
          why: "sweet spicy coffee gourmand for colder evenings",
        },
      ]),
      links: [{ href: "/shop", label: "Explore Date Night Perfumes" }],
    };
  }

  if (oud) {
    return {
      text: formatRecommendations("If you want oud-heavy fragrances:", [
        {
          name: "Ombre Nomade style profile",
          why: "deep smoky oud with strong projection",
        },
        {
          name: "Oud Wood style profile",
          why: "smoother woody-spicy oud direction",
        },
      ]),
      links: [{ href: "/shop", label: "View Oud Profiles" }],
    };
  }

  if (fresh) {
    return {
      text: formatRecommendations("Fresh profile recommendations:", [
        {
          name: "Aqua Marine",
          why: "marine-citrus clean profile, summer-ready",
        },
        {
          name: "Sauvage style profile",
          why: "fresh spicy ambroxan, crowd-pleasing",
        },
        { name: "Bleu style profile", why: "woody aromatic versatility" },
      ]),
      links: [{ href: "/shop", label: "Shop Fresh Perfumes" }],
    };
  }

  return null;
}

function getBotReply(input: string): Omit<ChatMessage, "id" | "role"> {
  const value = input.toLowerCase();
  const recommendationReply = getRecommendationReply(value);

  if (recommendationReply) return recommendationReply;

  if (value.includes("refill")) {
    return {
      text: "You can refill used HUME bottles through our Refill Program for ₹800.",
      links: [{ href: "/refill-subscription", label: "Open Refill Program" }],
    };
  }

  if (value.includes("kit") || value.includes("build")) {
    return {
      text: "You can build a custom kit from our fragrance lineup.",
      links: [{ href: "/kit-pack", label: "Build Your Kit" }],
    };
  }

  if (value.includes("special") || value.includes("hume special")) {
    return {
      text: "Here are our curated HUME Special perfumes.",
      links: [{ href: "/hume-special", label: "Explore HUME Special" }],
    };
  }

  if (value.includes("best") || value.includes("seller")) {
    return {
      text: "These are our top-performing best sellers.",
      links: [{ href: "/bestseller", label: "View Best Sellers" }],
    };
  }

  if (value.includes("ship") || value.includes("delivery")) {
    return {
      text: "We offer fast delivery across India. Free shipping is available above ₹500.",
      links: [{ href: "/shop", label: "Start Shopping" }],
    };
  }

  if (
    value.includes("offer") ||
    value.includes("coupon") ||
    value.includes("discount")
  ) {
    return {
      text: "Available offers can be applied from the cart. You can also view all active offers there.",
      links: [{ href: "/shop", label: "Shop & Apply Offers" }],
    };
  }

  if (
    value.includes("office") ||
    value.includes("date") ||
    value.includes("summer") ||
    value.includes("winter")
  ) {
    return {
      text: "For recommendations by occasion and season, start from Shop filters or Celebrities’ Favorites.",
      links: [
        { href: "/shop", label: "Shop by Filters" },
        { href: "/celebrities-favorites", label: "Celebrities’ Favorites" },
      ],
    };
  }

  if (
    value.includes("support") ||
    value.includes("help") ||
    value.includes("contact")
  ) {
    return {
      text: "I can guide your shopping instantly. For direct help, you can also use our product page support links.",
      links: [{ href: "/shop", label: "Go to Shop" }],
    };
  }

  return {
    text: "Tell me your vibe and use-case. Example: 'masculine boozy for night', 'gift for girlfriend', 'fresh office perfume', 'long lasting oud under budget'.",
    links: [
      { href: "/shop", label: "Shop All" },
      { href: "/hume-special", label: "HUME Special" },
      { href: "/bestseller", label: "Best Sellers" },
    ],
  };
}

export default function AIChatBot() {
  const pathname = usePathname();
  const { isCartOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messageSeqRef = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hi, I’m HUME AI Assistant. Ask me anything about perfumes, offers, refill, or recommendations.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);
  const normalizedPath = useMemo(
    () => stripRegionPrefix(pathname || "/").pathWithoutPrefix,
    [pathname],
  );
  const shouldRender =
    (normalizedPath === "/" || normalizedPath.startsWith("/shop")) &&
    !isCartOpen;

  if (!shouldRender) return null;

  const pushUserAndReply = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextId = () => {
      const id = messageSeqRef.current;
      messageSeqRef.current += 1;
      return `${id}`;
    };

    const userMsg: ChatMessage = {
      id: `u-${nextId()}`,
      role: "user",
      text: trimmed,
    };
    const reply = getBotReply(trimmed);
    const botMsg: ChatMessage = {
      id: `b-${nextId()}`,
      role: "assistant",
      text: reply.text,
      links: reply.links,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="fixed bottom-5 left-5 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-black/90"
      >
        {open ? <X size={18} /> : <Bot size={18} />}
      </button>

      {open ? (
        <div className="fixed bottom-20 left-4 z-[70] w-[min(92vw,360px)] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <p className="text-sm font-medium">HUME AI Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[340px] space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.links?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.links.map((link) => (
                      <Link
                        key={`${msg.id}-${link.href}`}
                        href={link.href}
                        className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-3 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickActions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => pushUserAndReply(item.value)}
                  className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                pushUserAndReply(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about scents, offers, refill..."
                className="h-9 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-black/40"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-9 w-9 items-center justify-center rounded bg-black text-white disabled:opacity-40"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
