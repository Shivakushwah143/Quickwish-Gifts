# QuickWish

QuickWish is a premium gifting storefront focused on curated categories, same-day delivery messaging, and a polished product experience. It includes an admin dashboard for managing products and a lightweight ordering flow.

## Features
- Modern Next.js storefront with App Router and responsive UI
- Hero carousel and curated category sections (occasion, relationship, same-day, cakes, plants, etc.)
- Product listing with category/tag filters and price/discount display
- Product detail page with image gallery, rating, and quantity selector
- Quick "Buy Now" flow via order modal
- User authentication modal (JWT-based)
- Admin dashboard with protected access and "Add Product" modal
- Product image upload support (multi-image)
- Order creation API and admin order confirmation
- Direct UPI payment (₹0 gateway cost) with order-specific QR and admin verification
- AI gifting assistant drawer with chat history and rate limiting
- Newsletter, services, and testimonials sections
- Themed luxury styling (custom fonts/colors)

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose

## Getting Started
### Frontend
```bash
cd quick-wish
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Environment Variables
### Frontend (`quick-wish/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=your_mongodb_connection
SECRET=your_jwt_secret
QUICKWISH_UPI_ID=9009917146@ptyes
QUICKWISH_UPI_NAME=QuickWish
BREVO_API_KEY=optional
BREVO_SENDER_EMAIL=optional
BREVO_SENDER_NAME=optional
```

The backend refuses to start without `QUICKWISH_UPI_ID` — it is the account that
receives every direct UPI payment and must never be mistyped.

## Scripts
### Frontend
```bash
npm run dev
npm run build
npm run lint
```

### Backend
```bash
npm run dev
npm run build
```
