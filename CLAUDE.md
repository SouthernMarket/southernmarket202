# Southern Market 202 — Claude Code Project Memory

This file gives Claude Code the context it needs to work on the Southern Market 202 website.
Read this before making any changes to the project.

---

## WHAT THIS PROJECT IS

Southern Market 202 is a family antique and vintage goods e-commerce website.
Based in Williamston, South Carolina.
Owner: Kelton Cox — handles all tech himself, learning as he goes.
The business restores pieces before selling (sanding, staining, refinishing).

**Live website:** https://southernmarket202.com
**GitHub repo:** github.com/southernmarket/southernmarket202

---

## COMMUNICATION RULES (IMPORTANT)

- Explain everything in plain English before doing it
- One step at a time — never skip ahead
- Kelton is new to tech — no assumed knowledge
- Always warn before anything that could cost money
- Never do anything irreversible without confirming first

---

## TECH STACK

### Hosting
- **Vercel** — auto-deploys from GitHub on every push
- Team ID: `team_RFrH0e1yD8i0tFM8nllMAq1I`
- Project ID: `prj_BTWP5p0RUVA8P4LabPAbMSSi7Z8z`

### Database & Backend
- **Supabase** — database, file storage, edge functions
- Project ID: `cljkimiocyodlyrlxkjl`
- URL: `https://cljkimiocyodlyrlxkjl.supabase.co`
- ⚠️ If Supabase errors occur, it may be inactive — tell Kelton to restore it at supabase.com

### Payments
- **Stripe** — live account, fully set up, bank connected

### Email
- **Resend** — transactional email
- Sends FROM: `orders@southernmarket202.com`
- Owner notifications TO: `southernmarket202@gmail.com`

### Domain
- **Namecheap** — southernmarket202.com (live, SSL active)

---

## DATABASE TABLES (Supabase)

**products**
- id, created_at, name, description, price, category, image_url, available

**contacts**
- id, created_at, name, email, message

**Storage bucket:** `product-images` (public)

---

## EDGE FUNCTIONS (deployed on Supabase)

- `create-checkout` — creates Stripe checkout session
- `send-order-email` — sends order confirmation to customer + notification to owner

---

## WEBSITE PAGES

All 4 pages are live and deployed:
- `index.html` — Homepage (hero, features grid, about quote strip)
- `shop.html` — Product grid, cart drawer, Stripe checkout
- `about.html` — Brand story, values, quote block
- `contact.html` — Contact form → saves to Supabase contacts table

---

## DESIGN SYSTEM

**Style:** Bold Modern with Southern Character

| Element | Value |
|---|---|
| Primary color | Deep navy `#1a2744` |
| Accent color | Periwinkle blue `#a8c0d6` |
| Background | White `#ffffff` |
| Font | Helvetica Neue / Arial — bold for headings |
| Logo | "SOUTHERN" stacked above "MARKET 202", white on navy rectangle |

- Hero: deep navy background, large bold white headline, white outlined button
- About strip: dark background, white text
- Footer: dark/black background, white text
- NO serif fonts anywhere

---

## WORKING FEATURES

- Mobile hamburger menu on all 4 pages ✓
- Cart drawer with quantity tracking ✓
- Stripe checkout flow ✓
- Contact form saving to Supabase ✓
- Product images via Supabase Storage ✓
- Coming soon popup on homepage ✓
- Products served dynamically from Supabase ✓

---

## CURRENT STATUS

- Shop is empty — all products have `available=false` in Supabase
- No live products showing yet
- Social media icons need real Instagram/Facebook URLs added

---

## NEXT PRIORITIES

1. Test full order flow (cart → Stripe → email confirmation)
2. Add real product photos and listings to Supabase
3. Add real social media URLs to all 4 HTML files
4. Set up Meta Pixel (Facebook/Instagram ads tracking)
5. Set up Google Analytics

---

## FREE TIER LIMITS (don't exceed)

- Vercel: free tier ✓
- Supabase: free tier ✓
- Resend: 3,000 emails/month (well within limits)
- Stripe: small % per transaction only, no monthly fee
- Claude Code: free with Kelton's Claude Pro subscription

---

## HOW TO DEPLOY CHANGES

1. Make edits to files in this project folder
2. Git commit and push to GitHub
3. Vercel auto-deploys in ~30 seconds
4. Check https://southernmarket202.com to confirm

---

*Last updated: June 4, 2026*
