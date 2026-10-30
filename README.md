# The Fashion Social (TFS) — Luxury Ticketing Marketplace

A modern, high-performance event ticketing platform and multi-tenant marketplace designed with an Obsidian & Gold luxury aesthetic.

## Features
- **Attendee Experience**: Event discovery, tier selection, 10-minute inventory locks, verified digital passes with ISO/IEC 18004 scannable vector QR codes.
- **Paystack Inline Integration**: Real-time card, USSD, and bank transfers with NUBAN automated settlement split.
- **Organizer Studio (`#/studio`)**: Event lifecycle management, sales window timing, transparent 2.5% fee toggle, and instant gate scanning terminal.
- **Platform Master Admin (`#/admin`)**: Superadmin governance, homepage curation, organizer accreditation & KYC review queue, tertiary institution directory, and immutable audit logs.
- **Supabase Backend**: 6 production migrations, row-level security (RLS), atomic RPC inventory locks (`FOR UPDATE`), and 4 Edge Functions.

## Vercel Deployment
This repository is pre-configured with `vercel.json` to serve the static frontend from the `public/` directory with client-side SPA routing.
