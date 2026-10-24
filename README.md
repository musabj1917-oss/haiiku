# Haiku Messenger

A project foundation for Stage 1 of Haiku Messenger: core auth, schema, app shell, and deployment groundwork.

## Repository structure

- `apps/mobile`: React Native + TypeScript app shell for Android/iOS
- `apps/api`: Vercel-compatible Node/TypeScript API
- `database`: PostgreSQL migration SQL and schema documentation
- `docs`: architecture, auth, provider-cost, and Codespaces guide
- `tests`: automated backend validation tests

## Stage 1 goals

- Register with email/password and minimum-age validation
- Google OAuth entry points and linking strategy
- Foundational PostgreSQL schema and migration path
- Protected routes and authorization checks
- Mobile navigation shell with empty states and loading states
- `.env.example` committed without secrets
- Provider-cost/limits review for zero-budget setup

## Notes

This repo intentionally contains a clean foundation for Stage 2 and avoids fake production messaging states.

## Quick start

1. Open the repository in GitHub Codespaces.
2. Copy `.env.example` to `.env` and fill in values.
3. Run:

```bash
npm install
npm run test
npm run lint
npm run typecheck
```

4. Start the API:

```bash
npm --prefix apps/api run dev
```

5. Start the mobile app in a React Native environment:

```bash
npm --prefix apps/mobile run start
```

## Environment

See `.env.example` for required env vars.

## Provider budget / compliance summary

- Neon: free plan available without a credit card; suited to prototypes and low-volume apps.
- Clerk: free Hobby plan is available for small public apps without a credit card; MFA and branded UI features are not included.
- Vercel: free hobby tier for small deployments and preview environments.

A full report is in `docs/provider-cost-limits.md`.
