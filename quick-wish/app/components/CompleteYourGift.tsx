"use client";

import { useMemo } from "react";
import { Check, Gift, MessageSquareText, Sparkles } from "lucide-react";

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
  imageOverrides?: Partial<Record<"wrapping" | "messageCard" | "ferrero", string>>;
};

const MESSAGE_LIMIT = 250;

const upgradeCards = [
  {
    id: "giftWrap",
    title: "Premium Gift Wrapping",
    description: "Ribbon wrapping and a gift-ready presentation.",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&auto=format&fit=crop&q=80",
    badge: "Most Popular",
    icon: Gift,
    points: ["Premium wrapping", "Decorative ribbon", "Gift-ready presentation"],
  },
  {
    id: "personalisedCard",
    title: "Personalised Message Card",
    description: "We print your message on a card inside the gift.",
    price: 49,
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&auto=format&fit=crop&q=80",
    badge: "",
    icon: MessageSquareText,
    points: [],
  },
  {
    id: "chocolatePack",
    title: "Ferrero Rocher Gift Pack",
    description: "A sweet addition to make the surprise even better.",
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
  if (value.giftWrap) lines.push({ label: "Gift wrapping", amount: 99 });
  if (value.personalisedCard.enabled) lines.push({ label: "Message card", amount: 49 });
  if (value.chocolatePack.enabled) lines.push({ label: "Ferrero Rocher", amount: 149 });
  return lines;
};

export default function CompleteYourGift({ value, onChange, imageOverrides }: CompleteYourGiftProps) {
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

  const selectedLines = useMemo(() => getGiftUpgradeLines(value), [value]);
  const selectedTotal = useMemo(() => getGiftUpgradeTotal(value), [value]);

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="lux-serif text-lg font-semibold text-[color:var(--plum)] sm:text-xl">
              🎁 Complete Your Gift
            </h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
              Make the surprise feel more personal, thoughtful, and gift-ready.
            </p>
          </div>
          {selectedLines.length > 0 && (
            <p className="rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-3 py-1 text-xs font-bold text-[color:var(--wine)]">
              {selectedLines.length} {selectedLines.length === 1 ? "upgrade" : "upgrades"} added · +
              ₹{selectedTotal}
            </p>
          )}
        </div>

        {selectedLines.length > 0 && (
          <div className="mt-3 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 p-3 text-sm">
            <p className="mb-1 font-bold text-[color:var(--plum)]">Added to your gift</p>
            <ul className="space-y-1">
              {selectedLines.map((line) => (
                <li key={line.label} className="flex items-center justify-between gap-3 text-[color:var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[color:var(--wine)]" />
                    {line.label}
                  </span>
                  <span className="font-semibold text-[color:var(--plum)]">+₹{line.amount}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-2 font-bold text-[color:var(--plum)]">
              <span>Upgrade total</span>
              <span>+₹{selectedTotal}</span>
            </p>
          </div>
        )}

        <p className="mt-3 text-xs font-medium text-[color:var(--muted)]">
          Upgrades are optional. Tap a card (or the “Add” button) to include it.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {upgradeCards.map((upgrade) => {
          const selected = isSelected(upgrade.id);
          const Icon = upgrade.icon;
          const imageKey =
            upgrade.id === "giftWrap"
              ? "wrapping"
              : upgrade.id === "personalisedCard"
                ? "messageCard"
                : "ferrero";
          const image = imageOverrides?.[imageKey] || upgrade.image;

          return (
            <div
              key={upgrade.id}
              className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                selected
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)]/5 shadow-[0_14px_30px_rgba(43,29,37,0.10)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--gold)]/60"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleUpgrade(upgrade.id)}
                aria-pressed={selected}
                className="flex w-full items-stretch gap-3 p-3 text-left sm:gap-4 sm:p-4"
              >
                <div className="relative w-24 shrink-0 overflow-hidden rounded-xl bg-[color:var(--ivory)] sm:w-36">
                  <img
                    src={image}
                    alt={upgrade.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  {upgrade.badge && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[color:var(--surface)]/95 px-2 py-0.5 text-[10px] font-bold text-[color:var(--wine)] shadow-sm">
                      {upgrade.badge}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${
                        selected
                          ? "bg-[color:var(--gold)]/20 text-[color:var(--wine)]"
                          : "bg-[color:var(--ivory)] text-[color:var(--muted)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[color:var(--plum)] sm:text-base">
                        {upgrade.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--muted)] sm:text-sm">
                        {upgrade.description}
                      </p>
                    </div>
                  </div>

                  {upgrade.points.length > 0 && (
                    <ul className="mt-2 hidden flex-wrap gap-x-3 gap-y-1 sm:flex">
                      {upgrade.points.map((point) => (
                        <li key={point} className="text-xs font-medium text-[color:var(--muted)]">
                          ✓ {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-2 sm:pt-3">
                    <p className="text-base font-bold text-[color:var(--wine)] sm:text-lg">
                      +₹{upgrade.price}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                        selected
                          ? "bg-[color:var(--gold)] text-[color:var(--plum)]"
                          : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--wine)]"
                      }`}
                    >
                      {selected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Added
                        </>
                      ) : (
                        <>+ Add</>
                      )}
                    </span>
                  </div>
                </div>
              </button>

              {upgrade.id === "personalisedCard" && selected && (
                <div className="border-t border-[color:var(--border)] bg-[color:var(--gold)]/5 p-4">
                  <label
                    htmlFor="gift-message"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-[color:var(--wine)]"
                  >
                    Write your message
                  </label>
                  <textarea
                    id="gift-message"
                    value={value.personalisedCard.message}
                    onChange={(event) => updateMessage(event.target.value)}
                    rows={4}
                    maxLength={MESSAGE_LIMIT}
                    className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3 text-sm text-[color:var(--plum)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[color:var(--gold)]/25"
                    placeholder="No matter where life takes us, my heart will always be there for you. Happy Birthday Rishu ❤️"
                  />
                  <p className="mt-1 text-right text-xs font-semibold text-[color:var(--muted)]">
                    {value.personalisedCard.message.length}/{MESSAGE_LIMIT}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
