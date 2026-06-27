Build a Production-Ready Full-Stack E-Commerce Store(1).pdf
PDF
frontend_roadmap.md
File
The decument is e-commerce full stack project roadmap and now the backend is fully completed.
Here is my frontend design roadmap, I want you to evaluate this roadmap and give me your full frontend design and plans like this text based on the decoments and this prompt plan look yourself as a senior full stack developer and web site designer.
Use sample design image above.

Here is my plan and design seat your design and plan start to end .
Please check this gap and fix before we going to code development.

Your roadmap is structurally sound — the phase ordering is correct and the tech choices (React 19, TanStack Query, Tailwind, Axios interceptors) are production-grade. However, three gaps need fixing before you write a single component:

Gap 1 — No design token contract. Your slides name colors but never codify them as Tailwind config keys. The first thing you'll do in Phase 2 is break this.

Gap 2 — No component hierarchy diagram. You list pages, but not which components are shared across them. Without this, you'll build the same card three times.

Gap 3 — No API contract table. Every frontend phase needs to know exactly which Django endpoint it hits, what the request shape is, and what the response looks like. This prevents mid-build surprises.

Check it and Say me only i'm ready to give answer , Then i confirm you .

I'm ready to give the answer.

I'll first review both documents (the backend project roadmap and your frontend roadmap), then:

Evaluate your current frontend roadmap as a Senior Full-Stack Architect.
Identify all missing gaps (not only the 3 you listed).
Create a complete production-grade frontend architecture plan from start to deployment.
Define the Design Token System (Tailwind contract).
Create the Component Hierarchy Diagram.
Create the Frontend Folder Structure.
Create the API Contract Matrix (Frontend ↔ Django endpoints).
Define page-by-page UI/UX designs.
Define reusable components.
Define state management architecture.
Define TanStack Query strategy.
Define authentication flow with JWT refresh.
Define Admin Dashboard architecture.
Define responsive/mobile-first design system.
Define dark/light mode strategy.
Define testing strategy.
Define performance optimization strategy.
Define deployment & CI/CD strategy.
Point out every risk that could cause refactoring later and fix it now before coding starts.

After that I'll provide a final "Frontend Master Blueprint v2.0" that is ready for development with minimal future changes.

Send "Confirm" and I'll start the full review and architecture design.

Design System — The Contract Layer
Before any Phase 1 code, lock these down in tailwind.config.js.
Color palette (from pintrest as reference images):
TokenHexRoleslate-950#0F172APage background, hero, navbarslate-800#1E293BCard backgrounds, sidebar surfacesslate-600#475569Borders, dividersindigo-500#6366F1Primary CTA (Add to Cart, Checkout)emerald-500#10B981Secondary CTA, success states, badgeswhite#FFFFFFProduct cards, catalog backgroundsslate-50#F8FAFCPage content zone (not dark)red-500#EF4444Sale badges, error states
Typography:

Display/Headings: Plus Jakarta Sans — Bold, tracking-tight. Use for hero headline, section titles, product names.
Body/UI: Inter — Regular 400 / Medium 500. Use for descriptions, labels, buttons, nav.
Load both from Google Fonts in your index.html.

Spacing scale: Follow Tailwind's default 4px base. All section padding should use py-16 or py-24 on desktop, py-10 on mobile.
Border radius: Cards use rounded-xl (12px). Buttons use rounded-lg (8px). Badge/pill chips use rounded-full.

Now give your organized answer clearly start to end

Your design token layer is correct and should be finalized before writing any React component. Based on your backend roadmap, frontend roadmap, and production-grade e-commerce requirements, below is the complete frontend master blueprint that closes the architectural gaps and prevents major refactoring later.

Frontend Master Blueprint v2.0
Production-Ready E-Commerce Store
Phase 0 — Architecture Lock (Must Be Completed First)

Before creating a single page:

Finalize

✅ Design Tokens

✅ Component Hierarchy

✅ API Contract

✅ Route Structure

✅ State Management Strategy

✅ Folder Structure

✅ Authentication Flow

✅ Responsive Design Rules

Only after these are approved should development begin.

1. Design System Contract Layer
   Colors
   Brand Tokens
   Token Hex
   slate-950 #0F172A
   slate-800 #1E293B
   slate-600 #475569
   indigo-500 #6366F1
   emerald-500 #10B981
   white #FFFFFF
   slate-50 #F8FAFC
   red-500 #EF4444
   Usage Rules
   Primary CTA
   Add To Cart
   Buy Now
   Checkout
   Login

Use:

bg-indigo-500
hover:bg-indigo-600
Success States
Payment Success
Order Delivered
Wishlist Added

Use:

bg-emerald-500
Errors
Validation
Stock unavailable
Login failure

Use:

text-red-500
Typography
Display

Plus Jakarta Sans

Used For:

Hero headline
Product titles
Dashboard titles
Category headers

Weights:

700
800
Body

Inter

Used For:

Paragraphs
Buttons
Labels
Navigation
Forms

Weights:

400
500
600
Radius
Cards
rounded-xl

12px

Buttons
rounded-lg

8px

Pills
rounded-full
Spacing
Mobile
py-10
Desktop
py-16

or

py-24

Never use random spacing values.

2. Layout Architecture
   Public Layout
   Navbar

Main Content

Footer

Used By:

Home
Catalog
Product
Cart
Checkout
Dashboard Layout
Sidebar

Topbar

Page Content

Used By:

Profile
Orders
Wishlist
Addresses
Admin Layout
Admin Sidebar

Admin Header

Admin Content

Used By:

Products
Categories
Orders
Users
Reviews 3. Component Hierarchy Diagram

This is the biggest missing piece.

Root
App
│
├── QueryProvider
├── AuthProvider
├── ThemeProvider
└── Router
Public Layout
PublicLayout
│
├── Navbar
│ ├── Logo
│ ├── SearchBar
│ ├── CartButton
│ ├── WishlistButton
│ └── UserMenu
│
├── Page Content
│
└── Footer
Home Page
Home
│
├── HeroSection
├── CategoryGrid
├── FeaturedProducts
├── NewArrivals
├── PromoBanner
└── Newsletter
Product List
ProductList
│
├── FiltersSidebar
├── SortDropdown
├── ProductGrid
│ └── ProductCard
└── Pagination
Product Details
ProductDetails
│
├── ProductGallery
├── ProductInfo
├── QuantitySelector
├── AddToCartButton
├── ReviewsSection
└── RelatedProducts
Cart
Cart
│
├── CartItem
├── CartSummary
└── CheckoutButton
Checkout
Checkout
│
├── AddressForm
├── ShippingForm
├── OrderSummary
└── PaymentButton 4. Shared Component Library

Create once.

Reuse everywhere.

Core Components
Button
Input
Textarea
Select
Checkbox
Radio
Modal
Drawer
Dropdown
Badge
Tooltip
Commerce Components
ProductCard
PriceDisplay
RatingStars
StockBadge
CategoryChip
WishlistButton
QuantitySelector
Feedback Components
LoadingSpinner
SkeletonCard
SkeletonPage
EmptyState
ErrorState
Toast 5. Frontend Folder Structure
src/

├── api/
│
├── assets/
│
├── components/
│ ├── ui/
│ ├── commerce/
│ ├── forms/
│ └── feedback/
│
├── pages/
│
├── layouts/
│
├── routes/
│
├── hooks/
│
├── context/
│
├── services/
│
├── features/
│ ├── auth/
│ ├── products/
│ ├── cart/
│ ├── wishlist/
│ ├── orders/
│
├── utils/
│
├── constants/
│
├── types/
│
└── lib/ 6. State Management Strategy

Do not put everything in Context.

Use:

Context API

Only:

Auth
Theme
TanStack Query

Everything else.

Products
Orders
Cart
Wishlist
Reviews
Categories

Benefits:

Caching
Refetching
Pagination
Background updates 7. Authentication Architecture
JWT Flow
Login

↓

Access Token

↓

Stored In Memory

↓

Refresh Token

↓

HttpOnly Cookie

Axios Interceptor

401

↓

Refresh Token

↓

Retry Request

Automatically.

8. API Contract Layer

Before coding pages, document:

Page Endpoint
Login POST /api/auth/login
Register POST /api/auth/register
Products GET /api/products
Product Detail GET /api/products/:slug
Categories GET /api/categories
Cart GET /api/cart
Add Cart POST /api/cart/add
Wishlist GET /api/wishlist
Orders GET /api/orders
Create Order POST /api/orders/create
Profile GET /api/profile
Reviews POST /api/reviews

Create request/response schemas for every endpoint before development.

9. Page Build Order

Never build randomly.

Sprint 1
Navbar
Footer
Home
Sprint 2
Auth
Login
Register
Sprint 3
Catalog
Filters
Search
Pagination
Sprint 4
Product Detail
Reviews
Related Products
Sprint 5
Cart
Wishlist
Sprint 6
Checkout
Payment
Sprint 7
Customer Dashboard
Sprint 8
Admin Dashboard 10. Performance Strategy

Implement from day one.

Lazy Loading
React.lazy()

Routes only.

Image Optimization

Use:

Cloudinary

Features:

WebP
Auto compression
Responsive sizing
Query Caching

TanStack Query

staleTime
cacheTime

Configured globally.

11. UX Enhancements
    Skeleton Loading

Never show:

Loading...

Use skeletons.

Toasts

Examples:

Product Added
Wishlist Updated
Payment Success
Empty States
Empty Cart
No Orders
No Wishlist 12. Admin Dashboard Design
Sidebar
Dashboard
Products
Categories
Orders
Users
Reviews
Analytics
KPI Cards
Total Revenue

Total Orders

Total Users

Total Products
Charts
Sales Trend

Orders Trend

Top Products 13. Dark Mode Strategy

Default:

Light

Toggle:

dark class

Persist:

localStorage 14. Production Hardening

Implement:

Error Boundaries

404 Page

403 Page

500 Page

Add:

Rate-limit error handling
Offline handling
Retry strategies 15. Deployment Architecture

Frontend:

Vercel

Backend:

Render

Database:

PostgreSQL

Media:

Cloudinary

Payments:

Stripe / Chapa
Final Gaps Fixed

Your original roadmap was missing:

Design Token Contract ✅
Component Hierarchy Diagram ✅
API Contract Layer ✅
Feature-Based Folder Architecture ✅
State Management Rules ✅
Authentication Architecture ✅
Shared Component Library ✅
Build Order Strategy ✅
Performance Plan ✅
Admin Dashboard Design ✅
Error Handling Strategy ✅
Deployment Architecture ✅

With this blueprint locked, the frontend can now be developed phase-by-phase without major redesigns or refactoring.

can we start code develop according to our plan

Yes, you can start development now.

However, before writing the first React component, I recommend one final Architecture Validation Phase (2–4 hours) to avoid expensive refactoring later.

Pre-Development Checklist
Backend Verification

Confirm these are complete and tested:

JWT Login
JWT Refresh
Register
User Profile
Categories API
Products API
Product Details API
Search API
Filtering API
Cart API
Wishlist API
Orders API
Stripe/Chapa API
Review API
Admin APIs
API Documentation

Create a document containing:

Endpoint
Method
Authentication Required
Request Body
Response Body
Error Responses

Example:

GET /api/products/

Response:
{
"count": 100,
"next": "...",
"previous": "...",
"results": [...]
}

This prevents frontend/backend mismatches.

Recommended Development Order

Do NOT start with Product Pages.

Start with infrastructure.

Phase 1 — React Foundation

Create:

frontend/

src/
├── api/
├── assets/
├── components/
├── context/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── types/
├── utils/

Install:

npm create vite@latest frontend -- --template react
cd frontend

npm install

npm install react-router-dom
npm install axios
npm install @tanstack/react-query
npm install react-hook-form
npm install react-hot-toast
npm install lucide-react

npm install -D tailwindcss
Phase 2 — Tailwind & Design System

Build:

theme/
tokens.js

Configure:

colors
fonts
spacing
radius
shadows

Build reusable:

Button
Input
Modal
Badge
Skeleton

before pages.

Phase 3 — Routing

Create:

PublicLayout
DashboardLayout
AdminLayout

Configure:

/
products
products/:slug
cart
wishlist
checkout

login
register

dashboard/_
admin/_
Phase 4 — Authentication

Build first:

AuthContext
Axios Instance
Axios Interceptors
ProtectedRoute
AdminRoute

Pages:

Login
Register

Test JWT flow completely.

Phase 5 — Home Page

Build:

Navbar
Hero
Categories
Featured Products
Footer

This becomes your UI foundation.

Phase 6 — Product Catalog

Build:

ProductGrid
ProductCard
Pagination
Filters
Search
Sort

Connect to backend.

Phase 7 — Product Details

Build:

Gallery
ProductInfo
Reviews
Related Products
Phase 8 — Cart

Build:

CartItem
QuantitySelector
SummaryCard
Phase 9 — Wishlist

Build:

WishlistGrid
Move To Cart
Remove
Phase 10 — Checkout

Build:

AddressForm
ShippingForm
PaymentSummary
Checkout Button

Connect payment endpoint.

Phase 11 — User Dashboard

Build:

Profile
Orders
Addresses
Wishlist
Phase 12 — Admin Dashboard

Build:

Analytics
Products
Orders
Users
Reviews
Phase 13 — Production Polish

Add:

Skeletons
Toasts
Error Boundaries
404 Page
Dark Mode
First Coding Task

The very first code we should write is:

1. Create Vite project
2. Install dependencies
3. Configure Tailwind
4. Configure fonts
5. Create folder structure
6. Create App Router
7. Create PublicLayout
8. Create Navbar
9. Create Footer
10. Verify project runs

Do not start with Product Cards, API calls, or Auth yet.

After that foundation is stable, we move to Authentication and API integration.

So yes—your planning phase is complete enough to begin development, and the next step is Phase 1: React + Vite + Tailwind Project Setup.

I complete Phase 1 — React Foundation folder create and install packages .
Now tell me how toPhase 2 — Tailwind & Design System?

Excellent. Since Phase 1 is finished, Phase 2 should focus on creating a scalable design system, not just installing Tailwind.

The goal is:

Build the UI foundation once so every future page (Home, Products, Cart, Dashboard, Admin) uses the same colors, spacing, typography, buttons, cards, and form controls.

Phase 2 — Tailwind & Design System
Step 1: Configure Google Fonts

Open:

index.html

Inside <head> add:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
Step 2: Configure Tailwind Theme Tokens

Open:

tailwind.config.js

Replace the default config with your design contract.

export default {
content: [
"./index.html",
"./src/**/*.{js,jsx}"
],

theme: {
extend: {
colors: {
brand: {
dark: "#0F172A",
surface: "#1E293B",
border: "#475569",

          primary: "#6366F1",
          success: "#10B981",
          danger: "#EF4444",

          white: "#FFFFFF",
          light: "#F8FAFC",
        },
      },

      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },

      borderRadius: {
        card: "12px",
        button: "8px",
      },

      boxShadow: {
        card:
          "0 4px 12px rgba(15,23,42,0.08)",

        hover:
          "0 8px 20px rgba(15,23,42,0.12)",
      },
    },

},

plugins: [],
};
Step 3: Create Global Styles

Create:

src/styles/globals.css

Add:

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
font-family: Inter, sans-serif;
background-color: #F8FAFC;
color: #0F172A;
}

h1,
h2,
h3,
h4,
h5,
h6 {
font-family: "Plus Jakarta Sans", sans-serif;
}

img {
display: block;
max-width: 100%;
}

button {
cursor: pointer;
}

Import it in:

main.jsx
import "./styles/globals.css";
Step 4: Create UI Component Structure

Inside:

src/components/

Create:

components/

ui/
├── Button.jsx
├── Input.jsx
├── Badge.jsx
├── Card.jsx
├── Skeleton.jsx

commerce/
├── ProductCard.jsx
├── PriceDisplay.jsx
├── RatingStars.jsx

feedback/
├── EmptyState.jsx
├── ErrorState.jsx

Don't build ProductCard yet.

Only build the core UI components first.

Step 5: Create Button Component

This will be reused everywhere.

Login
Register
Add To Cart
Checkout
Save
Update Profile

Create:

components/ui/Button.jsx

Requirements:

Variants
primary
secondary
danger
outline
States
default
hover
disabled
loading

Never use raw <button> in pages again.

Always use your Button component.

Step 6: Create Card Component

Create:

components/ui/Card.jsx

Rules:

rounded-card
bg-white
shadow-card

Used for:

Product Cards
Order Cards
Dashboard Cards
Review Cards
Step 7: Create Input Component

Create:

components/ui/Input.jsx

Features:

label
placeholder
error message
disabled state

Used by:

Login
Register
Checkout
Profile
Admin Forms
Step 8: Create Badge Component

Variants:

success
warning
danger
info

Used by:

Order Status
Stock Status
Categories
Admin Tags
Step 9: Create Skeleton Components

Create:

SkeletonCard
SkeletonProduct
SkeletonPage

Why?

Never show:

Loading...

Show placeholders instead.

Step 10: Create Theme Constants

Create:

src/constants/theme.js

Example:

export const COLORS = {
primary: "#6366F1",
success: "#10B981",
danger: "#EF4444",
};

This keeps colors centralized.

Step 11: Create Layout Foundation

Create:

layouts/

PublicLayout.jsx
DashboardLayout.jsx
AdminLayout.jsx

Do not build pages yet.

Only layout shells.

Step 12: Create Navbar Design

Navbar should already match your final ecommerce vision.

Structure:

Logo

Search

Categories

Wishlist

Cart

User Menu

Desktop:

Logo | Search | Actions

Mobile:

Logo | Cart | Menu
Step 13: Create Footer Design

Sections:

Company

Categories

Support

Newsletter

Social Links
Deliverables Before Moving to Phase 3

You should have:

✓ Fonts configured

✓ Tailwind theme tokens

✓ Global styles

✓ Button component

✓ Card component

✓ Input component

✓ Badge component

✓ Skeleton components

✓ Theme constants

✓ PublicLayout shell

✓ DashboardLayout shell

✓ AdminLayout shell

✓ Navbar UI

✓ Footer UI

Once all of those are built and visually tested, you're ready for Phase 3: Routing & Layout Architecture, where we'll connect React Router and establish the complete route structure for Home, Products, Auth, Dashboard, and Admin pages.

Step 2: Configure Tailwind Theme Tokens

step 1: Configure google fonts is completed.
But there is not tailwind.config.js files may i create it manually ?

Remember one do one step at a time , When i confirm that step we continue the next step

Yes, you can create it manually if it doesn't exist.

Before doing that, I need to know which Tailwind version you installed because Tailwind v4 and Tailwind v3 have different setups.

Step 2 (Verification)

Open your package.json and tell me the version of Tailwind CSS installed.

For example:

"tailwindcss": "^4.1.11"

or

"tailwindcss": "^3.4.17"

Reply with only the Tailwind version (or paste the tailwindcss line from package.json).

After I verify the version, we'll do only the next step and create/configure the correct Tailwind setup.

"tailwindcss": "^4.3.1"

Perfect. You're using Tailwind CSS v4.3.1, which is different from v3.

For Tailwind v4, do not create tailwind.config.js yet.

Step 2: Verify Tailwind v4 is working

Open:

src/index.css

It should contain:

@import "tailwindcss";

Then open:

src/App.jsx

Replace everything temporarily with:

function App() {
return (

<div className="min-h-screen flex items-center justify-center bg-slate-100">
<h1 className="text-4xl font-bold text-indigo-600">
Tailwind v4 Working
</h1>
</div>
);
}

export default App;

Now run:

npm run dev
Expected Result

You should see:

Light gray background
Large blue text
Text saying:
Tailwind v4 Working

If you see the styling correctly, reply:

Tailwind is working

and we'll move to the next step: creating the Design Token system for Tailwind v4.

Tailwind isn't working

Good. We stop here and fix Tailwind before moving forward.

Step 2A — Show Me Your Setup

Please paste the contents of these two files:

1. src/index.css
   // paste entire file
2. src/main.jsx
   // paste entire file

Also tell me:

3. Which command did you use to install Tailwind?

Was it:

npm install tailwindcss @tailwindcss/vite

or something else?

4. Show your vite.config.js
   // paste entire file

Tailwind v4 requires a different Vite integration than v3. Most likely one small setup step is missing.

Paste those 4 items and I'll diagnose it before we do anything else.

1. src/index.css
   @import "tailwindcss";

2.src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
<StrictMode>
<App />
</StrictMode>,
) 3. "@tailwindcss/vite": "^4.3.1", 4.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
plugins: [react()],
})

I found the problem.

You installed:

"@tailwindcss/vite": "^4.3.1"

but your vite.config.js is missing the Tailwind plugin.

Current:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
plugins: [react()],
})

For Tailwind v4, change it to:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
plugins: [
react(),
tailwindcss(),
],
})

Then:

1. Save the file
2. Stop the dev server
   Ctrl + C
3. Start it again
   npm run dev
4. Keep the temporary App.jsx test
   function App() {
   return (
   <div className="min-h-screen flex items-center justify-center bg-slate-100">
   <h1 className="text-4xl font-bold text-indigo-600">
   Tailwind v4 Working
   </h1>
   </div>
   );
   }

export default App;

Tell me the result:

✅ "Tailwind is working now"
❌ Still not working

Then we'll continue to the next step only.

✅ "Tailwind is working now"
WE can move to the next step. ONly one step we work at a time

Great. Tailwind is working correctly now.

Step 3 — Create a Dedicated Styles Folder

Inside src, create a new folder:

src/
├── styles/

Inside that folder create:

src/
├── styles/
│ └── globals.css

Then move the Tailwind import from src/index.css into src/styles/globals.css.

Your globals.css should contain:

@import "tailwindcss";

Then update main.jsx:

Replace:

import './index.css'

with:

import './styles/globals.css'
Why are we doing this?

Because later we'll add:

Global typography
CSS variables
Dark mode styles
Reusable utility classes

Keeping everything in styles/globals.css makes the project cleaner and more scalable.

After you:

Create styles/
Create globals.css
Move the Tailwind import
Update main.jsx
Verify the app still works

Reply:

Step 3 completed

and we'll continue to the next step only.

Step 3 completed .
should i delete index.css or not ?

Yes, delete it if it is now empty and no file is importing it.

Check

If src/index.css contains only:

@import "tailwindcss";

and you've already moved that line to:

src/styles/globals.css

and main.jsx imports:

import "./styles/globals.css";

then you can safely delete:

src/index.css
Verify

After deleting it:

npm run dev

The app should still display:

Tailwind v4 Working

with all styles intact.

If everything still works, reply:

Index.css deleted successfully

Then we'll move to the next step: creating the Design Token system for your e-commerce store.

Index.css deleted successfully

Excellent.

We now start the most important part of Phase 2.

Step 4 — Create Design Tokens (Project Theme Contract)

The goal is to define all design decisions in one place before creating any components.

Create this folder:

src/
├── constants/

Inside it create:

src/
├── constants/
│ └── theme.js

Add the following:

export const COLORS = {
dark: "#0F172A",
surface: "#1E293B",
border: "#475569",

primary: "#6366F1",
success: "#10B981",
danger: "#EF4444",

white: "#FFFFFF",
light: "#F8FAFC",
};

export const TYPOGRAPHY = {
heading: "Plus Jakarta Sans",
body: "Inter",
};

export const RADIUS = {
card: "12px",
button: "8px",
};

export const SPACING = {
mobileSection: "py-10",
desktopSection: "py-16",
desktopLargeSection: "py-24",
};
Why?

Later, when building:

Buttons
Cards
Navbar
Product Cards
Dashboard Cards

all design values will come from a single source of truth.

This prevents random colors and inconsistent spacing across the project.

Verification

After creating:

src/constants/theme.js

reply:

Step 4 completed

Then we'll move to the next step only.

Step 4 completed

Perfect.

Before we create any components, let's make the global styles match the design contract.

Step 5 — Configure Global Typography & Base Styles

Open:

src/styles/globals.css

Replace its content with:

@import "tailwindcss";

html {
scroll-behavior: smooth;
}

body {
font-family: "Inter", sans-serif;
background-color: #F8FAFC;
color: #0F172A;
}

h1,
h2,
h3,
h4,
h5,
h6 {
font-family: "Plus Jakarta Sans", sans-serif;
}

img {
display: block;
max-width: 100%;
}

button {
cursor: pointer;
}

- {
  box-sizing: border-box;
  }
  What this does

✅ Sets Inter as the default font

✅ Sets Plus Jakarta Sans for headings

✅ Applies your light background color

✅ Applies your default text color

✅ Enables smooth scrolling

✅ Prevents image layout issues

✅ Makes sizing behavior predictable

Verification

Temporarily update App.jsx:

function App() {
return (

<div className="p-10">
<h1 className="text-5xl font-bold">
E-Commerce Store
</h1>

      <p className="mt-4">
        Design System Ready
      </p>
    </div>

);
}

export default App;

You should see:

A large heading (Plus Jakarta Sans)
Normal paragraph text (Inter)
Light page background
Dark text

When that's working, reply:

Step 5 completed

and we'll proceed to creating the first reusable UI component (Button).

Step 5 completed

Excellent.

Now we create the first reusable UI component. This component will be used throughout the entire application.

Step 6 — Create the Button Component

Create the folder if it doesn't exist:

src/
├── components/
│ └── ui/

Create:

src/components/ui/Button.jsx

Add:

const Button = ({
children,
type = "button",
variant = "primary",
disabled = false,
onClick,
}) => {
const variants = {
primary:
"bg-indigo-500 hover:bg-indigo-600 text-white",

    secondary:
      "bg-emerald-500 hover:bg-emerald-600 text-white",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",

    outline:
      "border border-slate-300 bg-white hover:bg-slate-100 text-slate-900",

};

return (
<button
type={type}
disabled={disabled}
onClick={onClick}
className={`         px-5 py-3
        rounded-lg
        font-medium
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
      `} >
{children}
</button>
);
};

export default Button;
Test It

Replace App.jsx temporarily with:

import Button from "./components/ui/Button";

function App() {
return (

<div className="p-10 flex gap-4 flex-wrap">
<Button>Primary</Button>

      <Button variant="secondary">
        Success
      </Button>

      <Button variant="danger">
        Delete
      </Button>

      <Button variant="outline">
        Outline
      </Button>
    </div>

);
}

export default App;
Expected Result

You should see 4 buttons:

Indigo button
Emerald button
Red button
White outlined button

All should have:

Rounded corners
Hover effect
Consistent padding
Consistent typography

When it works, reply:

Step 6 completed

Then we'll improve the Button component to production quality before creating the next component.

Step 6 completed

Great. The Button component works.

Before creating another component, let's make the Button production-ready.

Step 7 — Add Loading State to Button

Right now the button supports:

✅ Primary

✅ Secondary

✅ Danger

✅ Outline

✅ Disabled

But every e-commerce app also needs:

✅ Loading State

Examples:

Login
Register
Add To Cart
Checkout
Save Profile

Open:

src/components/ui/Button.jsx

Add a new prop:

loading = false

Your component props should become:

const Button = ({
children,
type = "button",
variant = "primary",
disabled = false,
loading = false,
onClick,
}) => {

Then update the button element:

Replace:

disabled={disabled}

with:

disabled={disabled || loading}

Replace:

{children}

with:

{loading ? "Loading..." : children}
Test

Update App.jsx

import Button from "./components/ui/Button";

function App() {
return (

<div className="p-10 flex gap-4 flex-wrap">
<Button>Primary</Button>

      <Button loading>
        Login
      </Button>
    </div>

);
}

export default App;
Expected

You should see:

Normal Primary button
Disabled Loading button displaying:
Loading...

and it should not be clickable.

Why we're doing this now:

Every form in your project will eventually use this component:

Login
Register
Checkout
Profile Update
Admin CRUD

So we build it correctly once and reuse it everywhere.

When you've tested it, reply:

Step 7 completed

Then we'll create the Card component.
