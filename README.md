## Trace Landing on Next.js

This app recreates the Trace landing page from the Stitch export in a standalone Next.js app that is ready for Vercel and Google Tag Manager.

### Environment

Add the GTM container ID locally or in Vercel:

```bash
NEXT_PUBLIC_GTM_ID=GTM-PZQ7HG3D
```

### Development

```bash
npm install
npm run dev
```

### Deploy on Vercel

1. Import `/Users/beom/Documents/SWM-LandingPage/myroutinelanding` as a new Vercel project.
2. Add `NEXT_PUBLIC_GTM_ID` in Project Settings.
3. Deploy with the default Next.js preset.

### Tracked GTM events

- `landing_page_viewed`
- `cta_clicked`
- `nav_clicked`
- `section_view`
