// // src/components/CategorySection/CategorySection.tsx
// import { Category } from '@/app/types';
// import { ChevronLeft, ChevronRight } from 'lucide-react';


// interface CategorySectionProps {
//   title: string;
//   categories: Category[];
//   containerId: string;
//   isRounded?: boolean;
//   showArrows?: boolean;
//   gridLayout?: boolean;
// }

// const CategorySection = ({
//   title,
//   categories,
//   containerId,
//   isRounded = false,
//   showArrows = true,
//   gridLayout = false
// }: CategorySectionProps) => {
//   const scrollLeft = () => {
//     const container = document.getElementById(containerId);
//     if (container) {
//       container.scrollBy({ left: -200, behavior: 'smooth' });
//     }
//   };

//   const scrollRight = () => {
//     const container = document.getElementById(containerId);
//     if (container) {
//       container.scrollBy({ left: 200, behavior: 'smooth' });
//     }
//   };

//   if (gridLayout) {
//     return (
//       <section className="bg-white py-6 px-4 mt-2">
//         <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
//         <div className="grid grid-cols-3 gap-3">
//           {categories.map((category, index) => (
//             <div key={index} className="relative">
//               <img 
//                 src={category.image} 
//                 alt={category.name}
//                 className="w-full h-24 object-cover rounded-lg"
//               />
//               <div className="absolute inset-0 bg-black/20 rounded-lg flex items-end">
//                 <span className="text-white text-xs font-medium p-2">{category.name}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-white py-6 px-4 mt-2">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-lg font-bold text-gray-900">{title}</h2>
//         {showArrows && (
//           <div className="flex space-x-2">
//             <button onClick={scrollLeft} className="p-1 rounded-full bg-gray-100">
//               <ChevronLeft className="h-4 w-4" />
//             </button>
//             <button onClick={scrollRight} className="p-1 rounded-full bg-gray-100">
//               <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>
      
//       <div id={containerId} className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
//         {categories.map((category, index) => (
//           <div key={index} className="flex-shrink-0 text-center w-24">
//             <div className={`${isRounded ? 'rounded-full' : 'rounded-lg'} w-20 h-20 overflow-hidden mb-2 mx-auto ${isRounded ? 'border-2 border-pink-200' : ''}`}>
//               <img 
//                 src={category.image} 
//                 alt={category.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <span className="text-xs font-medium text-gray-700 leading-tight">{category.name}</span>
//             {category.count && <span className="text-xs text-gray-500 block">{category.count}</span>}
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default CategorySection;
// src/components/CategorySection/CategorySection.tsx




'use client';

import { Category } from '@/app/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CategorySectionProps {
  title: string;
  categories: Category[];
  containerId: string;
  isRounded?: boolean;
  showArrows?: boolean;
  gridLayout?: boolean;
}

const CategorySection = ({
  title,
  categories,
  containerId,
  isRounded = false,
  showArrows = true,
  gridLayout = false
}: CategorySectionProps) => {
  const router = useRouter();

  const scrollLeft = () => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to products page with category filter
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const tagForCategory = (category: Category, index: number) => {
    if (category.count) return category.count;
    const tags = ['Under ₹499', 'Up to 60% Off', 'Trending', 'Most Loved'];
    return tags[index % tags.length];
  };

  if (gridLayout) {
    return (
      <section className="bg-[#fffaf5] py-8 px-4 mt-2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold lux-serif text-[#2b1d25] mb-4">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="relative cursor-pointer overflow-hidden rounded-lg border border-[#f1d8c8] bg-white shadow-sm transition-all group hover:-translate-y-1 hover:shadow-md"
                onClick={() => handleCategoryClick(category.name)}
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-2 text-center">
                  <p className="line-clamp-1 text-sm font-semibold text-[#2b1d25]">{category.name}</p>
                  <p className="text-xs font-semibold text-[#b54e36]">{tagForCategory(category, index)}</p>
                </div>
            </div>
          ))}
          </div>
        </div>
      </section>
    );
  }

  return (
      <section className="bg-[color:var(--ivory)] py-8 px-4 mt-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold lux-serif text-[color:var(--plum)]">{title}</h2>
          {showArrows && (
            <div className="flex space-x-2">
              <button onClick={scrollLeft} className="p-2 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm hover:shadow-md transition-all">
                <ChevronLeft className="h-4 w-4 text-[color:var(--plum)]" />
              </button>
              <button onClick={scrollRight} className="p-2 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] shadow-sm hover:shadow-md transition-all">
                <ChevronRight className="h-4 w-4 text-[color:var(--plum)]" />
              </button>
            </div>
          )}
        </div>
        
        <div id={containerId} className="flex space-x-4 overflow-x-auto pb-3 hide-scrollbar">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-36 sm:w-40 cursor-pointer overflow-hidden rounded-lg border border-[#eadfd4] bg-white shadow-sm transition-all group hover:-translate-y-1 hover:shadow-md"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className={`${isRounded ? 'rounded-t-lg' : 'rounded-t-lg'} h-40 overflow-hidden`}>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-2 py-2 text-center">
                <span className="line-clamp-1 text-sm font-semibold text-[#2b1d25]">{category.name}</span>
                <span className="block text-xs font-semibold text-[#b54e36]">{tagForCategory(category, index)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
