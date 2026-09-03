# RoyalMed Pharmaceuticals Quotation Website

A premium React/Vite medicine catalogue + quotation prototype built from the uploaded `Demo data.xlsx`.

## Included
- Royal green / royal blue / white / charcoal visual system
- Responsive catalogue
- Search across product, generic, manufacturer, strength, category and dosage form
- Category/form filtering and sorting
- Medicine detail pages
- Persistent quotation cart using browser localStorage
- Quantity controls, discount and GST
- Print quotation
- Professional PDF quotation generation
- Demo admin login
- Product editing
- Excel/CSV import
- Product image URL support with graceful fallback
- Demo data imported from the uploaded workbook without inventing missing fields

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Demo admin
Password: `admin123`

This prototype stores demo catalogue/admin changes in localStorage. For production, replace this with Supabase/PostgreSQL, real authentication, server-side validation, protected image storage, and a server/API for quotation generation.

## Important
The workbook's `Price` field is used as both MRP and quotation price because the uploaded demo sheet contains only one price field. Change these values in the admin panel or database when real commercial pricing is available.
