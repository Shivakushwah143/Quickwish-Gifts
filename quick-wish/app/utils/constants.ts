
import { Category, HeroSlide } from "../types";

// Hero Carousel Data with Unsplash images
export const heroSlides: HeroSlide[] = [
  {
    title: "Moments, wrapped in quiet elegance.",
    subtitle: "Premium gifting crafted for Indore, delivered with a gentle hand.",
    image: "https://www.fnp.com/assets/images/custom/new-home-2025/hero-banners/Flowers_Banner_Desk_9.jpg",
    cta: "Explore the Collection"
  },
  {
    title: "Birthdays, in their finest light.",
    subtitle: "A thoughtful curation of florals, cakes, and keepsakes that linger.",
    image: "https://www.fnp.com/assets/images/custom/new-home-2025/hero-banners/Birthday_banner_Desk-16-06-2025.jpg",
    cta: "Shop Birthday"
  },
  {
    title: "Same day, still exquisite.",
    subtitle: "Indore delivery within hours, beautifully finished and on time.",
    image: "https://www.fnp.com/assets/images/custom/new-home-2025/hero-banners/Photography_Day_Desk-16-08-2025.jpg",
    cta: "View Same-Day"
  },
  {
    title: "Handcrafted hampers, softly luxurious.",
    subtitle: "Artisan-made pieces curated for gratitude, love, and celebration.",
    image: "https://media.istockphoto.com/id/1077280228/photo/advent-calendar-waiting-for-christmas.jpg?s=1024x1024&w=is&k=20&c=9aY5b6e8r0mOuP8JvRqJHk3rBqbzGMwp--7JirRg3wQ=",
    cta: "Discover Hampers"
  },
  {
    title: "Gifts that feel personal.",
    subtitle: "From refined baskets to custom details, made for lasting impressions.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQLPItVzswkJGwy8iZrysldzLvPMzyEILNcgq9X0umOQ4_2u2hvejSXJr9GwLbyOF8JCU&usqp=CAU",
    cta: "Shop Artisanal"
  },
  {
  title: "Small surprises, deeply remembered.",
  subtitle: "Elegant gifting moments designed to make everyday celebrations unforgettable.",
  image: "https://images.pexels.com/photos/19027765/pexels-photo-19027765.jpeg",
  cta: "Explore Gifts"
},
{
  title: "Curated with warmth and detail.",
  subtitle: "Luxury hampers layered with handcrafted touches, ribbons, florals, and care.",
  image: "https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg",
  cta: "View Hampers"
},
{
  title: "For every occasion worth holding onto.",
  subtitle: "Birthday boxes, anniversary keepsakes, and heartfelt surprises delivered beautifully.",
  image: "https://images.pexels.com/photos/30770345/pexels-photo-30770345.jpeg",
  cta: "Shop Occasions"
},
{
  title: "Wrapped beautifully. Delivered thoughtfully.",
  subtitle: "Premium packaging and same-day delivery across Indore for meaningful moments.",
  image: "https://images.pexels.com/photos/30632274/pexels-photo-30632274.png",
  cta: "Order Today"
},
{
  title: "Celebrate softly, gift beautifully.",
  subtitle: "Minimal luxury gifting crafted for friendships, love, gratitude, and joy.",
  image: "https://images.pexels.com/photos/35055477/pexels-photo-35055477.jpeg",
  cta: "Start Exploring"
}
];

// Main Categories matching FNP
export const mainCategories: Category[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    image: 'https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg',
    count: '2000+'
  },
  {
    id: 'flowers',
    name: 'Flowers',
    image: 'https://plus.unsplash.com/premium_photo-1661609624774-764931dee3af?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zmxvd2VyJTIwZ2lmdHN8ZW58MHx8MHx8fDA%3D',
    count: '1500+'
  },
  {
    id: 'photography',
    name: 'Photography',
    image: 'https://plus.unsplash.com/premium_photo-1698117059857-afdb96271acc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGhvdG9ncmFwaHklMjBmcmFtc3xlbnwwfHwwfHx8MA%3D%3D',
    count: '500+'
  },
  {
    id: 'same-day',
    name: 'Same Day',
    image: 'https://cdn.pixabay.com/photo/2020/04/22/17/12/handmade-soap-5079183_1280.jpg',
    count: '800+'
  },
  {
    id: 'plants',
    name: 'Plants',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=150&h=150&fit=crop',
    count: '600+'
  }
];

// For Every Relationship Categories
export const relationshipCategories: Category[] = [
  {
    name: 'coustomize',
    image: 'https://media.istockphoto.com/id/1077280228/photo/advent-calendar-waiting-for-christmas.jpg?s=1024x1024&w=is&k=20&c=9aY5b6e8r0mOuP8JvRqJHk3rBqbzGMwp--7JirRg3wQ='
  },
  {
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&crop=face'
  },
  {
    name: 'Kids',
    image: 'https://media.istockphoto.com/id/1066672498/photo/kids-wrapping-christmas-gifts.webp?a=1&b=1&s=612x612&w=0&k=20&c=Cwlc_RZW1vtLVBdMGwGQ-S0rsvdvklKQQuWJxn3MTpU='
  },
  {
    name: 'GirlFriend',
    image: 'https://media.istockphoto.com/id/925492142/photo/unexpected-moment-in-routine-everyday-life-cropped-photo-of-mans-hands-hiding-holding-chic.webp?a=1&b=1&s=612x612&w=0&k=20&c=OZmXr-rIeHXMmfLKCUKPS7l0F-IO3PqONyGTo-5qGmw='
  },
  {
    name: 'Friends',
    image: 'https://images.unsplash.com/photo-1621112904887-419379ce6824?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZnJpZW5kc3xlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    name: 'Girl',
    image: 'https://images.unsplash.com/photo-1586351012965-861624544334?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdpcmx8ZW58MHx8MHx8fDA%3D'
  },
  {
    name: 'Boy',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face'
  },
  {
    name: 'Wife',
    image: 'https://plus.unsplash.com/premium_photo-1661590923305-990dc3f8e415?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2lmZSUyMGdpZnRzfGVufDB8fDB8fHww'
  },
  {
    name: 'Husband',
    image: 'https://images.unsplash.com/photo-1675704632448-cf726a8e1fd8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGh1c2JhbmR8ZW58MHx8MHx8fDA%3D'
  }
];

// Bakery-Fresh Cakes
export const cakeCategories: Category[] = [
  {
    name: 'Chocolate Cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop'
  },
  {
    name: 'Chocolate Bouquets',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=150&h=150&fit=crop'
  },
  {
    name: 'Luxe Cakes',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=150&h=150&fit=crop'
  },
  {
    name: 'Fresh Cream',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=150&h=150&fit=crop'
  },
  {
    name: 'Designer Cakes',
    image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=150&h=150&fit=crop'
  }
];

// Personalise Your Moments
export const personalizedGifts: Category[] = [
  {
    name: 'Jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop'
  },
  {
    name: 'Name Signs',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop'
  },
  {
    name: 'Mugs',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&h=150&fit=crop'
  },
  {
    name: 'Cushions',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop'
  },
  {
    name: 'Flower Vases',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop'
  },
  {
    name: 'Sippers',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop'
  }
];

// Plants For Every Vibe
export const plantCategories: Category[] = [
  {
    name: 'New Plants',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=150&h=150&fit=crop'
  },
  {
    name: 'Indoor Plants',
    image: 'https://images.pexels.com/photos/33608059/pexels-photo-33608059.jpeg'
  },
  {
    name: 'Money Plants',
    image: 'https://images.pexels.com/photos/33637813/pexels-photo-33637813.jpeg'
  },
  {
    name: 'Flowering Plants',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop'
  },
  {
    name: 'Peace Lily',
    image: 'https://images.unsplash.com/photo-1565011523534-747a8601f10a?w=150&h=150&fit=crop'
  }
];

// Same Day Surprises
export const sameDayGifts: Category[] = [
  {
    name: 'Flowers',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=150&h=150&fit=crop'
  },
  {
    name: 'Chocolate Bouquets',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=150&h=150&fit=crop'
  },
  {
    name: 'Plants',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=150&h=150&fit=crop'
  },
  {
    name: 'Chocolates',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=150&h=150&fit=crop'
  },
  {
    name: 'Personalized',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop'
  }
];

// Home & Living Gifts
export const homeGifts: Category[] = [
  {
    name: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop',
    isLarge: true
  },
  {
    name: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=150&fit=crop',
    isLarge: true
  },
  {
    name: 'Kitchen & Dining',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop',
    isLarge: true
  },
  {
    name: 'Neon Light Gifts',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=150&fit=crop',
    isLarge: true
  },
  {
    name: 'Home Essentials',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop',
    isLarge: true
  },
  {
    name: 'Forever Flowers',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop',
    isLarge: true
  }
];

// Birthday Gifts That Wow
export const birthdayGifts: Category[] = [
  {
    name: 'Cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop'
  },
  {
    name: 'Flowers',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop'
  },
  {
    name: 'Personalised',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop'
  },
  {
    name: 'Experiences',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=200&fit=crop'
  }
];

// Popular in Gifting
export const popularGifting: Category[] = [
  {
    name: 'Get Well Soon',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop'
  },
  {
    name: 'Midnight Delivery',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=200&h=200&fit=crop'
  },
  {
    name: 'Just Because',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop'
  },
  {
    name: 'Send Wishes',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop'
  },
  {
    name: 'Send Love',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop'
  }
];

// Occasions
export const occasions: Category[] = [
  {
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop'
  },
  {
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=200&h=200&fit=crop'
  },
  {
    name: 'Love N Romance',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop'
  },
  {
    name: 'Congratulations',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop'
  }
];

// Girls Fashion
export const girlsFashion: Category[] = [
  {
    name: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Tops & Tees',
    image: 'https://images.unsplash.com/photo-1589810635657-232948472d98?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Skirts',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Activewear',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Swimwear',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6e0?w=200&h=200&fit=crop&crop=center'
  },
  {
    name: 'Shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop&crop=center'
  }
];

// Additional categories from your enum
export const freshFlowers: Category[] = [
  {
    name: 'Roses',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop'
  },
  {
    name: 'Lilies',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop'
  },
  {
    name: 'Orchids',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop'
  }
];

export const flowerBouquets: Category[] = [
  {
    name: 'Mixed Bouquets',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
  },
  {
    name: 'Rose Bouquets',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
  },
  {
    name: 'Lily Bouquets',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
  }
];

export const dryFruits: Category[] = [
  {
    name: 'Assorted Dry Fruits',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop'
  },
  {
    name: 'Almonds',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop'
  },
  {
    name: 'Cashews',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop'
  }
];

export const watches: Category[] = [
  {
    name: 'Luxury Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  },
  {
    name: 'Casual Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  },
  {
    name: 'Sports Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
  }
];

export const perfumes: Category[] = [
  {
    name: 'Men\'s Perfume',
    image: 'https://images.unsplash.com/photo-1592945403407-9de659572daa?w=200&h=200&fit=crop'
  },
  {
    name: 'Women\'s Perfume',
    image: 'https://images.unsplash.com/photo-1592945403407-9de659572daa?w=200&h=200&fit=crop'
  },
  {
    name: 'Unisex Fragrances',
    image: 'https://images.unsplash.com/photo-1592945403407-9de659572daa?w=200&h=200&fit=crop'
  }
];

export const teddyBears: Category[] = [
  {
    name: 'Classic Teddy Bears',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop'
  },
  {
    name: 'Personalized Teddy',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop'
  },
  {
    name: 'Giant Teddy Bears',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop'
  }
];

export const valentinesDay: Category[] = [
  {
    name: 'Romantic Gifts',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop'
  },
  {
    name: 'Heart-shaped Gifts',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop'
  },
  {
    name: 'Valentine Specials',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop'
  }
];

export const besti: Category[] = [
  {
    name: 'Best Friend Gifts',
    image: 'https://images.unsplash.com/photo-1529066516367-36973222c957?w=200&h=200&fit=crop'
  },
  {
    name: 'Friendship Day Special',
    image: 'https://media.istockphoto.com/id/2233779247/photo/group-of-young-indian-friends-holding-shopping-bags-isolated-on-white-background-discount-and.jpg?b=1&s=612x612&w=0&k=20&c=Emy0zVT1Ymk9YhizNVjBa7qXel5fVNzShHD7plnaLZ4='
  },
  {
    name: 'BFF Collections',
    image: 'https://media.istockphoto.com/id/2233779247/photo/group-of-young-indian-friends-holding-shopping-bags-isolated-on-white-background-discount-and.jpg?b=1&s=612x612&w=0&k=20&c=Emy0zVT1Ymk9YhizNVjBa7qXel5fVNzShHD7plnaLZ4='
  }
];
