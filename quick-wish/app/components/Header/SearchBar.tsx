// src/components/Header/SearchBar.tsx
import { Search, Heart } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-5 w-5 text-[color:var(--muted)]" />
      <input
        type="text"
        placeholder="Search gifts, florals, cakes, and keepsakes..."
        className="w-full pl-10 pr-12 py-3 bg-[color:var(--ivory)]/80 border border-[color:var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
      />
      <Heart className="absolute right-3 top-3 h-5 w-5 text-[color:var(--muted)]" />
    </div>
  );
};

export default SearchBar;
