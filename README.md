# AURA Horizon Pro - Flagship E-Commerce Product Experience

A modern, high-converting, fully responsive E-Commerce Product Showcase & Details Web Application built with semantic HTML5, Obsidian Luxe Vanilla CSS, and modular Vanilla JavaScript.

Designed for full-stack and modern frontend engineering learning, demonstrating state management, dynamic pricing engines, multi-currency conversion, cart drawers, bundle builders, and checkout workflows.

---

## 🌟 Key Features

### 1. Interactive Flagship Product Showcase
- **Real Studio Product Imagery**: Authentic AI studio packshots for Cosmic Black, Platinum Silver, and Midnight Navy with copper accents.
- **Micro-Interaction Zoom**: Hover magnification lens allowing customers to inspect acoustic textures and finishes.
- **Dynamic Color Finishes**: Clicking swatches instantly updates the hero image, badge counters, inventory scarcity alerts, and active labels.
- **Hardware Edition Selector**: Choose between *Horizon Pro Wireless* ($299) and *Horizon Studio Master* ($349) with real-time recalculation of unit prices, installments, and button totals.
- **AURA Care+ Protection Add-on**: Optional 2-year warranty checkbox (+$39) with instant real-time price updates.
- **Stock Scarcity Urgency**: Dynamic low-inventory indicators (`Only 6 units left in Cosmic Black`) to drive customer conversion.

### 2. Frequently Bought Together Bundle Engine
- Curated companion items: Flagship Headphones + Precision Aluminum Stand ($49) + Carbon Fiber Hard Case ($39).
- Checkboxes with instant recalculation of bundle total and savings.
- Automatically applies an **extra 15% bundle discount** when 2 or more items are selected.
- **"Add All Selected To Cart"** adds the entire bundle into the bag with a single click.

### 3. Full-Featured Slide-Out Cart Drawer
- **Dynamic Price Calculation Engine**:
  - Subtotal calculation across items and quantities.
  - **Dynamic Free Shipping Progress Bar**: Visual progress toward the $150 free express shipping threshold.
  - **Tiered Shipping Logic**: Free if over $150 or with promo code; otherwise $15 flat express shipping.
  - **Estimated Sales Tax**: Automatically calculated at 8.5%.
  - **Grand Total Calculation**: Dynamically computed and formatted.
- **Promo / Coupon Code Engine**:
  - `AURA20`: 20% off orders over $250.
  - `WELCOME10`: 10% off any order.
  - `FREESHIP`: 100% free shipping.
  - `SAVE50`: $50 flat discount on orders over $300.
  - Validation feedback with instant visual discount breakdown line.
- **Cart Management**: Increment (`+`), decrement (`−`), item removal, and full bag clearing.
- **Local Storage Persistence**: Cart items and quantities persist across browser refreshes.

### 4. Multi-Currency Engine
- Switch seamlessly between:
  - **USD ($)**
  - **EUR (€)**
  - **GBP (£)**
  - **INR (₹)**
- Re-evaluates every price tag, installment estimate, bundle total, cart subtotal, tax, and checkout total instantaneously.

### 5. Instant Checkout Simulation & Receipt Modal
- Accessible modal dialog for checkout flow.
- Simulated customer contact and shipping details.
- Real-time order summary.
- **Order Confirmation Celebration**: Confetti animation, generated `#AUR-XXXXXX` order ID, and detailed itemized receipt.

### 6. Interactive Customer Reviews & Rating Engine
- Big rating overview (4.9 / 5 with 1,248 reviews).
- Rating distribution bars (5-star, 4-star, 3-star, etc.).
- Review filters (All, 5 Stars, 4 Stars, Verified Buyers).
- **"Write a Review" Modal**: Interactive 5-star picker, author details, headline, and real-time feed insertion.

### 7. Interactive Wishlist Manager & Toast Notifications
- Floating wishlist heart on the flagship hero and navbar indicator with persistent counter and bounce animation.
- **Dedicated Wishlist Modal**: View all saved dream items, inspect pricing, and tap "Move to Bag" to instantly transfer items to your shopping cart.
- Non-intrusive toast notification alerts for cart updates, promo codes, and errors.

### 8. Mobile-First Responsive Architecture
- **Mobile Navigation Drawer**: Smooth slide-out menu with animated hamburger toggle, section jump links, mobile currency selector, and trust perks.
- **Sticky Mobile Bottom Quick-Buy Bar**: High-converting floating bar that slides up as customers scroll down, featuring thumbnail, current configuration, dynamic price, and instant "Add to Bag" button.
- **Touch-Friendly Acoustic Studio Lightbox**: Tap to inspect high-resolution beryllium driver details with interactive finish swatches.
- **Real-Time Countdown Timer**: Live ticking countdown for same-day express shipping dispatch.
- **Private Browsing Safe Storage**: Robust in-memory fallback protecting against mobile private mode and cookie restriction crashes.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<aside>`), SEO meta tags, OpenGraph tags, and Schema.org JSON-LD microdata.
- **CSS3 (Vanilla)**:
  - Obsidian Luxe Dark Theme with glassmorphism (`backdrop-filter: blur`).
  - CSS Custom Properties (Design Tokens) for colors, typography, elevations, and transitions.
  - Fluid CSS Grid and Flexbox for responsive desktop, tablet, and mobile layouts.
  - CSS Keyframe animations (pulse urgency, cart bump, toast slide, modal zoom).
- **JavaScript (Vanilla ES6+)**:
  - Zero external dependencies.
  - Clean state management architecture.
  - Decoupled calculations, event handlers, and UI renderers.

---

## 🚀 How to Run Locally

You can run the project using any local web server:

```bash
# Using Python
python3 -m http.server 5050

# Using Node.js npx
npx serve .
```

Then open your browser and navigate to:
```
http://localhost:5050
```

---

## 📁 Project Structure

```
E-commerce Product page/
├── assets/
│   └── images/
│       ├── headphones-black.jpg     # Cosmic Black flagship studio packshot
│       ├── headphones-silver.jpg    # Platinum Silver edition packshot
│       ├── headphones-navy.jpg      # Midnight Navy edition packshot
│       ├── accessory-stand.jpg      # Aluminum headphone stand packshot
│       ├── accessory-case.jpg       # Carbon fiber travel case packshot
│       └── product-earbuds.jpg      # Companion true wireless earbuds
├── index.html                       # Semantic HTML5 page structure & SEO
├── styles.css                       # Modern Obsidian Luxe Vanilla CSS
├── app.js                           # Cart logic & dynamic pricing engine
└── README.md                        # Documentation & Architecture overview
```
