# WrenchStack

**The independent vendor directory for trades and construction businesses.** Live at [wrenchstack.com](https://wrenchstack.com).

WrenchStack reviews 125 field-service software platforms, 153 adjacent US vendors (insurance, payroll, lead generation, payments, financing, banking, accounting, marketing agencies, AI tools), and 448 listings across 17 international markets. Every price is checked by a human against the vendor's own pricing page and carries a per-vendor verification date. Vendors with documented problems get a public [reputation flag](https://wrenchstack.com/reputation-flags/), and no vendor can pay for placement, scores, or flag removal.

- **Market report:** [wrenchstack.com/trends-2026](https://wrenchstack.com/trends-2026/) (36% of trades software publishes no price at all)
- **Open dataset:** [CSV](https://wrenchstack.com/data/trades-software-pricing-2026.csv) / [JSON](https://wrenchstack.com/data/trades-software-pricing-2026.json), CC BY 4.0, regenerated on every build
- **Methodology:** [wrenchstack.com/methodology](https://wrenchstack.com/methodology/)
- **Verification log:** [wrenchstack.com/verification-log](https://wrenchstack.com/verification-log/)

## Stack

Astro static build (~6,500 pages), Tailwind, deployed on Cloudflare Workers. All headline statistics are computed at build time from the data files in `src/data/`; nothing is hardcoded, so the site cannot disagree with its own data.

```sh
npm install
npm run dev      # local dev server
npm run build    # full static build (authoritative check)
```

## Licensing

- The **dataset** published at `/data/` is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): free for any use with attribution to WrenchStack.
- The **site content** (reviews, editorial) is copyright WrenchStack; cite freely with attribution, do not republish wholesale.
- Contact: press@wrenchstack.com

## Vendor corrections

Factually wrong data is fixed the same day when accompanied by a primary source: [wrenchstack.com/for-vendors](https://wrenchstack.com/for-vendors/).
