"use client";

// src/components/Header/SearchBar.tsx
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();

    if (!term) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative mb-4"
      aria-label="Search products"
    >
      <Search className="absolute left-3 top-3 h-5 w-5 text-[color:var(--muted)]" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search gifts, florals, cakes, and keepsakes..."
        className="w-full pl-10 pr-12 py-3 bg-[color:var(--ivory)]/80 border border-[color:var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
        aria-label="Search gifts"
      />
      <button
        type="submit"
        className="absolute right-2 top-2 rounded-lg bg-[color:var(--wine)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ivory)] hover:bg-[#3b182f] transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
