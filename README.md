# Property Rental & Booking Platform (Client Side)

## Project Name

A10_CAT-008 - Property Rental & Booking Platform

## Purpose

This is a full-stack web application that connects property owners with tenants. Property owners can list their rental properties, manage bookings, and track earnings. Tenants can browse properties, book them, make payments, and leave reviews. The platform features role-based access control for Tenant, Owner, and Admin users.

## Live URL

[https://obstakl-client.vercel.app]

## Key Features

- **Authentication**: User registration, login with JWT, and Google social login (defaults to Tenant role).
- **Role-Based Access**: Tenant, Owner, and Admin dashboards with protected routes.
- **Property Management**: Browse, search, filter, and view detailed property information.
- **Booking System**: Complete booking workflow with Stripe payment integration.
- **Favorites**: Tenants can save properties to favorites.
- **Reviews**: Tenants can rate and review properties.
- **Admin Moderation**: Approve/reject properties and manage users/bookings.
- **Responsive Design**: Mobile-friendly UI with Framer Motion animations.
- **Real-time Feedback**: Dynamic updates for bookings, properties, and analytics.

## Tech Stack (Client Side)

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + HeroUI
- **Authentication**: Better Auth (with MongoDB adapter)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Payments**: Stripe (React Stripe JS)
- **HTTP Client**: Axios
- **UI Components**: HeroUI
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## NPM Packages Used

- next
- react
- react-dom
- @heroui/react, @heroui/styles, @heroui/theme
- better-auth, @better-auth/mongo-adapter
- @stripe/react-stripe-js, @stripe/stripe-js
- axios
- framer-motion
- recharts
- react-hot-toast
- react-icons
- clsx
- tailwindcss
- mongodb (for any client-side needs)

## Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
# Add any other public variables needed by Better Auth or Stripe
```

## Installation & Setup (Client)

1. Clone the repository
2. `cd client` (or root if monorepo)
3. `npm install`
4. Create `.env.local` with required variables
5. `npm run dev`

## Deployment

- Deployed on Vercel / Netlify
- Ensure environment variables are configured in the hosting platform.

## Screenshots / Demo

[Add screenshots or video demo link]

## Repository Structure

```
obstakl-client/
├── app/                  # App Router
├── components/
├── lib/                  # Utils, auth config
├── public/
├── styles/
├── .env.local
├── next.config.js
└── package.json
```

## Important Notes

- Uses **Better Auth** for authentication (including Google login).
- Private routes protected with server-side and client-side checks.
- Environment variables prefixed with `NEXT_PUBLIC_` for client exposure.
- Unique, modern design optimized for recruiters.

---
