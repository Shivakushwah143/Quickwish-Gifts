
QuickWish Gifts — Full-Stack E-Commerce Gift Platform

# QuickWish 
# A gifting brand

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

## Direct UPI Payments (required backend config)

Orders are paid via **direct UPI** to the store's account — no payment gateway, ₹0 gateway cost. The backend builds a canonical `upi://pay` URI (server-authoritative amount + order reference) and the frontend renders the QR locally.

Required backend environment variables:

| Variable | Example | Notes |
| --- | --- | --- |
| `QUICKWISH_UPI_ID` | `9009917146@ptyes` | The UPI ID customers pay to. The backend **refuses to start** without it. |
| `QUICKWISH_UPI_NAME` | `QuickWish` | Payee name shown in the UPI app and QR. |

If these are missing from a deployed backend, orders still create but the QR cannot be generated and the payment screen shows a fallback error — the frontend never builds the UPI URI itself.

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose

<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/4a56bd52-7408-486b-9e1e-937745317277" />

<img width="1727" height="842" alt="image" src="https://github.com/user-attachments/assets/be9e0a29-00f3-4e7f-9977-e373564bd889" />

