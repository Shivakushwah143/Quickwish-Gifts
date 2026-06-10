"use client";

import { CheckCircle2, Gift, MessageSquareText, Sparkles } from "lucide-react";

export type GiftUpgradeSelection = {
  giftWrap: boolean;
  personalisedCard: {
    enabled: boolean;
    message: string;
  };
  chocolatePack: {
    enabled: boolean;
    type: "FERRERO_ROCHER";
  };
};

type CompleteYourGiftProps = {
  value: GiftUpgradeSelection;
  onChange: (value: GiftUpgradeSelection) => void;
};

const MESSAGE_LIMIT = 250;

const upgradeCards = [
  {
    id: "giftWrap",
    title: "🎁 Premium Gift Wrapping",
    description:
      "Make your gift feel truly special with elegant wrapping, ribbon styling, and a premium unboxing experience.",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&auto=format&fit=crop&q=80",
    badge: "Most Popular",
    icon: Gift,
    points: ["Premium wrapping", "Decorative ribbon", "Gift-ready presentation"],
  },
  {
    id: "personalisedCard",
    title: "💌 Personalised Message Card",
    description:
      "Add your personal message and we'll include a beautifully printed card inside the gift.",
    price: 49,
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&auto=format&fit=crop&q=80",
    badge: "",
    icon: MessageSquareText,
    points: [],
  },
  {
    id: "chocolatePack",
    title: "🍫 Ferrero Rocher Gift Pack",
    description:
      "Add premium Ferrero Rocher chocolates to make your gift even sweeter.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=900&auto=format&fit=crop&q=80",
    badge: "Customer Favourite",
    icon: Sparkles,
    points: ["4 Ferrero Rocher chocolates", "Premium presentation", "Perfect gift add-on"],
  },
] as const;

export const getGiftUpgradeTotal = (value: GiftUpgradeSelection) => {
  return (
    (value.giftWrap ? 99 : 0) +
    (value.personalisedCard.enabled ? 49 : 0) +
    (value.chocolatePack.enabled ? 149 : 0)
  );
};

export const getGiftUpgradeLines = (value: GiftUpgradeSelection) => {
  const lines: Array<{ label: string; amount: number }> = [];
  if (value.giftWrap) lines.push({ label: "Premium Gift Wrap", amount: 99 });
  if (value.personalisedCard.enabled) lines.push({ label: "Message Card", amount: 49 });
  if (value.chocolatePack.enabled) lines.push({ label: "Ferrero Rocher", amount: 149 });
  return lines;
};

export default function CompleteYourGift({ value, onChange }: CompleteYourGiftProps) {
  const toggleUpgrade = (id: (typeof upgradeCards)[number]["id"]) => {
    if (id === "giftWrap") {
      onChange({ ...value, giftWrap: !value.giftWrap });
      return;
    }

    if (id === "personalisedCard") {
      onChange({
        ...value,
        personalisedCard: {
          ...value.personalisedCard,
          enabled: !value.personalisedCard.enabled,
        },
      });
      return;
    }

    onChange({
      ...value,
      chocolatePack: {
        enabled: !value.chocolatePack.enabled,
        type: "FERRERO_ROCHER",
      },
    });
  };

  const updateMessage = (message: string) => {
    onChange({
      ...value,
      personalisedCard: {
        enabled: true,
        message: message.slice(0, MESSAGE_LIMIT),
      },
    });
  };

  const isSelected = (id: (typeof upgradeCards)[number]["id"]) => {
    if (id === "giftWrap") return value.giftWrap;
    if (id === "personalisedCard") return value.personalisedCard.enabled;
    return value.chocolatePack.enabled;
  };

  return (
    <section className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[#2b1d25] lux-serif">🎁 Complete Your Gift</h3>
            <p className="mt-1 text-sm leading-6 text-[#6f5d66]">
              Make the surprise feel more personal, thoughtful, and gift-ready.
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-[#ead7c5] bg-[#fffaf4] px-3 py-2 text-xs font-black text-[#8b3f2f]">
          8 out of 10 customers add at least one upgrade
        </div>
      </div>

      <div className="grid gap-4">
        {upgradeCards.map((upgrade) => {
          const selected = isSelected(upgrade.id);
          const Icon = upgrade.icon;

          return (
            <div
              key={upgrade.id}
              className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                selected
                  ? "border-[#c9a36a] bg-[#fff8ed] shadow-[0_16px_34px_rgba(43,29,37,0.10)]"
                  : "border-[#ead7c5] bg-white hover:border-[#c9a36a]/70"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleUpgrade(upgrade.id)}
                className="grid w-full gap-3 text-left sm:grid-cols-[150px_1fr]"
              >
                <div className="relative h-44 overflow-hidden bg-[#f8f3ec] sm:h-full">
                  <img
                    src={upgrade.image}
                    alt={upgrade.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {upgrade.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#b54e36] shadow-sm">
                      {upgrade.badge}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex gap-2">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-base font-black text-[#2b1d25]">{upgrade.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-[#6f5d66]">{upgrade.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-[#4a1f3b]">+₹{upgrade.price}</p>
                      {selected && <CheckCircle2 className="ml-auto mt-1 h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>

                  {upgrade.points.length > 0 && (
                    <div className="mt-3 grid gap-1.5">
                      {upgrade.points.map((point) => (
                        <p key={point} className="text-xs font-semibold text-[#6f5d66]">
                          ✓ {point}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </button>

              {upgrade.id === "personalisedCard" && selected && (
                <div className="border-t border-[#ead7c5] bg-[#fffaf4] p-4">
                  <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-[#8b3f2f]">
                        Your message
                      </label>
                      <textarea
                        value={value.personalisedCard.message}
                        onChange={(event) => updateMessage(event.target.value)}
                        rows={5}
                        maxLength={MESSAGE_LIMIT}
                        className="w-full resize-none rounded-xl border border-[#ead7c5] bg-white px-3 py-3 text-sm text-[#2b1d25] outline-none transition focus:border-[#c9a36a] focus:ring-2 focus:ring-[#c9a36a]/25"
                        placeholder={"No matter where life takes us, my heart will always be there for you. Happy Birthday Rishu ❤️"}
                      />
                      <p className="mt-1 text-right text-xs font-semibold text-[#7a6570]">
                        {value.personalisedCard.message.length}/{MESSAGE_LIMIT}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#8b3f2f]">
                        Card preview
                      </p>
                      <div className="relative min-h-52 overflow-hidden rounded-xl bg-[#fffaf4] shadow-inner">
                        <img
                          src="https://i.pinimg.com/736x/85/2f/99/852f99226aea31ad5a47026be6959c98.jpg"
                          alt="Greeting card preview"
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-[#fff1e8]/20" />
                        {/* <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/70 bg-white/82 p-4 shadow-sm backdrop-blur-sm">
                        <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[#2b1d25]">
                          {value.personalisedCard.message ||
                            "Happy Birthday Priya ❤️\nWishing you endless happiness and success."}
                        </p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
