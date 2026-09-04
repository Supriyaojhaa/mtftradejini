# MTF Analytics Dashboard

A React/Vite recreation of the supplied MTF Analytics overview screenshot, using the public MTF Analytics data endpoints.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Data
The app consumes:
- `/api/v1/summary`
- `/mtf_daily_totals.json`
- `/mtf_flow.json`
- `/mtf_aum_by_class.json`
- `/date/<asOf>.json`

If a public dataset is temporarily unavailable, the UI falls back to a small realistic demo dataset so the page remains usable.

## Main features
- Responsive dark/light dashboard
- KPI cards
- Historical MTF book chart
- 1M / 3M / 6M / 1Y / ALL filters
- ALL / NSE / BSE filter
- Daily leverage flow
- F&O / non-F&O / ETF composition
- Searchable/sortable/paginated stock table
- Indian rupee formatting
- Mobile layout
