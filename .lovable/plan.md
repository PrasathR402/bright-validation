# Online Crackers Store — Build Plan

A festive, mobile-first shop for fireworks with a customer storefront, an owner admin panel, and delivery rules. Built in phases so you can see and test something working early.

## Phase 1 — Storefront foundation (first thing you'll see)
- Festive home page: rotating banner, festival offer strip, best sellers, new arrivals, category tiles.
- Categories: Gift Boxes, Sparklers, Flower Pots, Ground Chakkars, Rockets, Bombs, Fancy Items, Kids Collection, Combo Packs.
- Category listing with search by name, category filter, and price sort (low→high / high→low).
- Product page: image, name, description, MRP with strike-through, offer price, stock status, quantity picker, add to cart.
- Cart drawer/page: update quantity, remove, coupon field, order summary with totals.
- Sample products and offers loaded so every page looks real from day one.

## Phase 2 — Accounts and checkout
- Login with mobile number + OTP, optional Google sign-in.
- Profile page and multiple saved delivery addresses.
- Checkout: pick address, pincode serviceability check, delivery charge, estimated delivery date, coupon applied, order placed.
- Order confirmation page.

## Phase 3 — Orders and notifications
- Order tracking timeline: Placed → Packed → Shipped → Delivered.
- Order history with details and downloadable invoice.
- In-app notification centre for order updates, festival offers, discount alerts.

## Phase 4 — Admin panel (owner only)
- Products: add / edit / delete, image upload, stock updates, discounts.
- Orders: list, filter, change status, view customer details, generate invoice PDF.
- Customers: list with purchase history.
- Offers: festival offers, coupon codes, combo deals.
- Reports: daily and monthly sales, top-selling products, revenue.
- Delivery settings: serviceable pincodes, charge slabs, delivery time estimates.

## Phase 5 — Payments
- UPI, cards, net banking through a payment provider, plus Cash on Delivery toggle controlled from admin.

## Technical notes
- Lovable Cloud provides the database, logins, file storage for product images, and server code.
- Tables: profiles, addresses, categories, products, product_images, offers, coupons, carts, cart_items, orders, order_items, order_status_history, notifications, pincodes, user_roles.
- Roles live in a separate `user_roles` table with a `has_role` check; admin screens are gated server-side, never by anything stored in the browser.
- Row-level security everywhere: customers only read their own orders, addresses, and notifications; products/categories/offers are publicly readable.
- Invoices generated as PDF on the server; sales reports computed by SQL aggregates.
- OTP login uses phone sign-in; Google sign-in via the managed provider.
- Payments need a provider account (Razorpay/Stripe-style) — I'll ask for the keys when we reach Phase 5.

## Things I need from you
- Shop name, logo, contact number, and delivery area (state/pincodes).
- Real product list with prices, or I use realistic placeholders for now.
- Legal note: fireworks sales are regulated and most payment/courier partners restrict them — you'll need a seller account that permits this category.

## Suggested start
Approve and I'll build Phase 1 end to end so you can browse the shop, then continue phase by phase.
