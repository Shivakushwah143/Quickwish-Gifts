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

  if (gridLayout) {
    return (
      <section className="bg-white py-6 px-4 mt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="relative cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-end">
                <span className="text-white text-xs font-medium p-2">{category.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-6 px-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {showArrows && (
          <div className="flex space-x-2">
            <button onClick={scrollLeft} className="p-1 rounded-full bg-gray-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={scrollRight} className="p-1 rounded-full bg-gray-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div id={containerId} className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 text-center w-24 cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className={`${isRounded ? 'rounded-full' : 'rounded-lg'} w-20 h-20 overflow-hidden mb-2 mx-auto ${isRounded ? 'border-2 border-pink-200' : ''}`}>
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-700 leading-tight">{category.name}</span>
            {category.count && <span className="text-xs text-gray-500 block">{category.count}</span>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;