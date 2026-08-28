# Clinic Manager — clinic operations platform

Staff web portal, NestJS microservices, and a patient mobile app for clinic / surgical operations: procedure-phase tasks, dual approvals, messaging, CMS content, and notification rules.

This snapshot is **source only**. Environment files with credentials are not included. Copy each `.env.example` before running locally.

## Apps

| Folder | Stack | Default URL / ports |
| --- | --- | --- |
| `clinic-manager-web-portal` | Vite, React 19, MUI 7, Redux | http://localhost:3000 |
| `clinic-manager-core-services` | NestJS 10, Turborepo, Postgres, Kafka | 3001–3005 |
| `clinic-manager-mobile-app` | React Native 0.78 | device / emulator |

## Quick start (web + APIs)

**Backend** (needs Node 18+, pnpm, Postgres, Kafka — Docker Compose is in `clinic-manager-core-services`):

```bash
cd clinic-manager-core-services
cp .env.example .env
pnpm install
pnpm dev
```

**Staff portal:**

```bash
cd clinic-manager-web-portal
cp .env.example .env.stage
npm install
npm run dev
```

See each folder’s README for more detail.

## Note

This is a full-stack clinic-ops codebase shared for review. It is not a learning-management system. Do not put production secrets in this repository.
