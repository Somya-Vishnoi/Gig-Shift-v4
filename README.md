# GigShift

Real-time gig economy intelligence dashboard — simulation-based prototype.

## Stack
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** (charts)
- **Lucide React** (icons)

## Structure

```
lib/
  data/
    types.ts        # All shared interfaces
    dataset.ts      # 10,000-row seeded synthetic dataset
  simulation/
    engine.ts       # useSimulation() hook — streams dataset on interval

components/
  auth/
    LoginScreen.tsx       # Role-based login gate
  shared/
    Header.tsx            # Sticky header w/ theme toggle + logout
    MetricCard.tsx        # Reusable metric display card
  worker/
    WorkerDashboard.tsx   # Worker view (best platform hero + live cards)
    PlatformCard.tsx      # Individual platform card w/ surge/supply
    WeeklyTable.tsx       # 7-day PPD forecast table
  platform/
    PlatformDashboard.tsx # Platform ops view (sim controls + competitor intel)
```

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or connect repo to Vercel dashboard — zero config needed.

## Demo roles

- **Worker**: See live rates, surge alerts, best platform to join right now
- **Platform**: Simulate supply response to pricing, competitor intelligence

## Data

- 10,000 rows generated deterministically (seeded PRNG — same data every run)
- Realistic patterns: lunch/dinner peaks, weekend surges, weather effects, event boosts
- Simulation streams dataset in batches every 4s — looks live, uses real patterns
