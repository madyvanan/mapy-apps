# Magizhthunnu - Online Food Delivery App

A PERN stack food delivery application built with Vite, Express, PostgreSQL (via Prisma), and Paytm payments

> This app lives inside the `mapy-apps` monorepo as an independent, self-contained project (see `../CLAUDE.md` and `../docs/`). Nothing below applies to sibling apps, and nothing from sibling apps applies here.

## Tech Stack

- Frontend: React 18 (Vite)

- Language: TypeScript 5.3

- Backend: Node.js 22 or above  and  Express.js

- Database: PostgreSQL 16 with the PostGIS extension, accessed via Prisma

- ORM: Prisma (schema in `backend/prisma/schema.prisma`)

- Payments: Paytm Payment Gateway

- Styling: Tailwind CSS

- Hosting (MERN):

- Frontend: Vercel / Netlify

- Backend: Render / Railway / AWS EC2

- Database: PostgreSQL 16 with PostGIS (Prisma ORM)

## Commands

Frontend (Vite)

- npm run dev – Start development server (localhost:5174)

- npm run build – Build for production

- npm run preview – Preview production build

- npm run lint – Run ESLint

- npm test – Run tests (Vitest / Jest)

- npm run test:watch – Run tests in watch mode

Backend (Express)

- npm run dev – Start backend with nodemon

- npm run start – Start production server

- npm run seed – Seed database

- npm run lint – Lint backend code

##Code Style

- Enable TypeScript strict mode

- No any types

- Use named exports

- Arrow functions for React components

- Async/await (avoid .then())

- Use const by default

- Follow REST API conventions

- Prettier + ESLint configured

- Husky pre-commit hook for formatting

## Project Structure
Frontend (frontend/)

- src/main.tsx – Entry point

- src/App.tsx – Root component

- src/pages/ – Application pages

- src/components/ – Reusable components

- src/components/ui/ – Base UI elements

- src/hooks/ – Custom hooks

- src/services/ – API calls (Axios/fetch)

- src/context/ – Global state (Auth, Cart)

- src/types/ – Shared types

- public/ – Static assets

Backend (backend/)

- src/server.ts – Express entry file

- src/config/ – DB & environment config (Prisma client singleton in `db.ts`)

- prisma/schema.prisma – Prisma schema (single source of truth for all models)

- src/routes/ – API routes

- src/controllers/ – Request handlers

- src/services/ – Business logic

- src/middleware/ – Auth, error handling

- src/utils/ – Helpers

- src/types/ – Backend types

## Important Rules

- Never commit directly to main

- Always test before pushing

- The Paytm webhook route (server/src/routes/paytmWebhook.ts) is sensitive — test carefully

- Store environment variables in:

	frontend/.env

	Backend/.env

- Never commit .env files

## Authentication

- JWT-based authentication

- HTTP-only cookies for tokens

- Role-based access control (Admin, Restaurant, Customer)

- Protect private routes using middleware

## Testing

- Write tests for all new features

Frontend:

- React Testing Library

- MSW for API mocking

Backend:

- Jest / Vitest

- Supertest for API testing

- Aim for 80%+ coverage

## Git Workflow

Branch naming:

- feature/short-description

- fix/short-description

- Clear commit messages (explain why)

- Pull requests required

- Squash merge into main


## Payment Architecture Flow:

User → Backend → Paytm Gateway
                     │
                     ▼
                Payment Page
                     │
                     ▼
               Paytm Callback
                     │
                     ▼
                 Backend Webhook
                     │
                     ▼
                 Update Order Status


## Optional Add-ons for Scale:

- Redis (for caching & sessions)

- Message Queue (RabbitMQ / Kafka) for order processing

- Nginx reverse proxy

- Docker containerization

- CI/CD pipeline (GitHub Actions)

## Security Architecture

- HTTPS everywhere

- JWT authentication

- HTTP-only cookies

- Input validation (Zod / Joi)

- Rate limiting middleware

- Helmet for security headers

- Paytm checksum verification

- PostgreSQL network/firewall rules (restrict inbound access to trusted hosts)

## Low-Level System Design (LLD)

This covers:

- PostgreSQL Tables (see `backend/prisma/schema.prisma`)

- Relational Schema Design

- Relationships (foreign keys)

- Indexing Strategy (incl. PostGIS GIST index, full-text GIN index)

- Order & Payment Flow Mapping

## Tables Overview

Main tables:

- user

- address (normalized from the old embedded `addresses[]`)

- restaurant

- menu_item

- menu_item_customization / menu_item_customization_option

- cart / cart_item

- order / order_line_item

- payment

- review

- Clear cart

## Scalability Considerations
- Sharding Key (if large scale)

	orders → shard by userId

	restaurants → shard by location

- Caching (Optional)

	Redis for:

	Restaurant list

	Menu items

	Session tokens

- Abandoned Cart Cleanup (Optional)

	No TTL index in Postgres — instead a scheduled BullMQ repeatable job deletes
	carts where `updated_at` is older than 24h (`cart.updatedAt` is indexed to keep this fast).

## Security Design

- Hash passwords (bcrypt)

- Validate ObjectIds

- MongoDB/postgresSQL role-based DB access

- Rate limiting on order API

- Idempotency key for payment retry
