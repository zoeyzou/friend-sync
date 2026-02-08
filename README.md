# FriendSync 🚀

**Keep meaningful friendships alive with smart reminders.** Track friends, log meetings, get notified when it's time to reconnect. But why? Maybe because you have too many friends and you don't know who to reach out to first. Let's hope that is the case :D

## ✨ Features

| Status | Feature |
| :-- | :-- |
| ✅ | Friend CRUD + reminder intervals |
| ✅ | Meeting logging + history |
| 🔄 | Smart reminders (overdue detection) |
| ✅ | Discord OAuth + protected routes |
| ✅ | Responsive UI (Tailwind + shadcn) |
| 🔄 | **Email notifications (Resend)** |
| ⏳ | Calendar sync (Google) |
| ⏳ | **Mobile PWA** |

## 🛠 Tech Stack

```
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + tRPC + shadcn/ui
Backend: Prisma PostgreSQL (Neon 0.5GB free)
Auth: NextAuth v5 (Discord)
Deploy: Render (Free) + GitHub Actions CI/CD
Monitoring: Sentry + Vercel Analytics
DB: Neon Postgres + Prisma Studio
Lint/Test: Biome + Vitest (soon)
```


## 🚀 Quick Start

```bash
git clone https://github.com/YOURUSERNAME/friend-tracker
cd friend-tracker
npm install

# Postgres: neon.tech (free)
# Discord: developers.discord.com

cp .env.example .env
npm run db:full  # Schema + seed data
npm run dev
```


## 🛤️ Production Setup

### **Deploy (5min)**

```
1. Render.com → New Web Service → GitHub repo
2. Neon.tech → DATABASE_URL (free 0.5GB)
3. Discord OAuth2 redirect
4. Git push → Auto deploys!
```


### **CI/CD Pipeline**

```
GitHub Actions → .github/workflows/deploy.yml
- Lint → Test → Build → Prisma migrate → Deploy Render
- Secrets: DATABASE_URL, DISCORD_*, NEXTAUTH_SECRET
```


## 📈 Maturity Roadmap

| Phase | Status | Features | Est. Time |
| :-- | :-- | :-- | :-- |
| **1** | 🔄 | **Core**: Friends/Reminders API + UI | 2h |
| **2** | ✅ | **Auth**: Discord + Middleware | 1h |
| **3** | ✅ | **Deploy**: Render + Neon Postgres | 30min |
| **4** | 🔄 | **Notifications**: Resend emails + Cron | 20min |
| **5** | ⏳ | **CI/CD**: GitHub Actions full pipeline | 30min |
| **6** | ⏳ | **Monitoring**: Sentry errors + UpTime | 20min |
| **7** | ⏳ | **Testing**: Vitest unit + E2E | 2h |
| **8** | ⏳ | **Meetings**: CRUD + Google Calendar | 3h |
| **9** | ⏳ | **PWA**: Offline + Push notifications | 2h |
| **10** | ⏳ | **Analytics**: PostHog user tracking | 1h |

## 🔧 GitHub Actions CI/CD

**`.github/workflows/ci-cd.yml`:**

```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run db:generate
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Deploy Preview
        if: github.ref == 'refs/heads/main'
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```


## 📊 Monitoring \& Logging

| Tool | Purpose | Setup |
| :-- | :-- | :-- |
| **Sentry** | Error tracking | `npm i @sentry/nextjs` |
| **Render Logs** | Build + Runtime | Dashboard |
| **UpTimeRobot** | 5min uptime checks | Free monitor |
| **PostHog** | User analytics | Self-host free |
| **Prisma Studio** | DB inspection | `npm run db:studio` |

## 🧪 Local Development

```bash
# Full reset
npm run db:full

# Scripts
npm run db:push      # Schema changes
npm run db:studio    # Visual DB
npm run db:seed      # Test data
npm run lint         # Biome
npm run test:watch   # Vitest
npm run preview      # Production preview
```


## 📱 Screenshots

## 🌍 Live Demo

**[friend-tracker.onrender.com](https://friend-tracker.onrender.com)**


## 🤝 Contributing

```bash
1. Fork → Clone → Install
2. `npm run db:full`
3. Branch: `feat/add-emails`
4. PR → CI runs → Auto-merge
```

**Good first issues:** PRs welcome! Focus: Email reminders, mobile PWA.

## 📄 License

MIT - Use for good ❤️

Made with ❤️ for meaningful friendships
Zoey Zou - Feb 2026

Deploy your fork → Live in 5min! 🎉

***

