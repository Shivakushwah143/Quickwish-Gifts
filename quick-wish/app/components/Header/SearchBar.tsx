// src/components/Header/SearchBar.tsx
import { Search, Heart } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search for gifts, cakes, flowers..."
        className="w-full pl-10 pr-12 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
      />
      <Heart className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
    </div>
  );
};

export default SearchBar;