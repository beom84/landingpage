## Trace Landing on Next.js

This app recreates the Trace landing page from the Stitch export in a standalone Next.js app that is ready for Vercel and Google Analytics 4.

### Environment

Add the GA4 measurement ID locally or in Vercel:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-FG5T2B8DPX
```

### Development

```bash
npm install
npm run dev
```

### Deploy on Vercel

1. Import `/Users/beom/Documents/SWM-LandingPage/myroutinelanding` as a new Vercel project.
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Project Settings.
3. Deploy with the default Next.js preset.

### Tracked GA events

- `landing_page_viewed`
- `cta_clicked`
- `nav_clicked`
- `section_view`

### Funnel events

- `goal_input_focused`
- `goal_input_started`
- `goal_submit_validation_failed`
- `goal_submitted`
- `recommendation_viewed`
- `beta_form_started`
- `beta_application_submitted`
- `feedback_option_selected`
- `feedback_submitted`
- `recommendation_reset`

### How to read the funnel

- Visits are high but `cta_clicked` is low: the hero copy or CTA clarity is weak.
- CTA clicks are high but `goal_submitted` is low: the input step feels burdensome.
- Goal submissions are high but `beta_application_submitted` is low: the recommendation output is not convincing enough.
- Feedback submissions continue to happen after recommendations: this is an early repeat-usage signal.
