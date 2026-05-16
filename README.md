# AI Client Enquiry Assistant

AI-powered staff-assist dashboard for Strata Management Consultants.  
It classifies client enquiries, scores confidence, sets urgency, recommends next action, and drafts a suggested staff response using OpenRouter models.

## Features

- Supabase Auth (email/password) for staff-only access
- Main landing page for enquiry input and AI analysis
- Separate enquiry history dashboard with classification color tags
- Clicking a history card opens the landing page with the saved result (`/?enquiryId=...`)
- OpenRouter model customization:
  - user default model in Settings
  - per-enquiry model override in the form
- Confidence-based manual-review flag
- Structured prompt + strict JSON parsing + fallback handling for invalid AI output

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- OpenRouter API
- Vitest + Testing Library
- Vercel deployment target

## Classification Categories

- New Client
- Support Request
- Complaint
- Maintenance Issue
- Billing / Invoice Question
- General Question
- Urgent / Emergency
- Other

## API Surface

- `POST /api/enquiries/analyze`
  - Request: `{ clientName?, clientEmail?, enquiryText, modelOverride? }`
  - Response: saved enquiry analysis object
- `GET /api/enquiries`
  - Returns authenticated user enquiry cards (newest first)
- `GET /api/enquiries/:id`
  - Returns one enquiry detail for preloading landing page
- `GET /api/settings/model`
  - Returns user model defaults
- `PATCH /api/settings/model`
  - Updates `{ defaultModel, temperature, maxTokens }`

## Prompt Design

The system prompt enforces:

- fixed classification enum
- fixed urgency enum
- confidence from `0..1`
- JSON-only output
- fallback behavior for vague/nonsensical inputs (`Other`, low confidence, clarification action)

This keeps output stable for UI rendering and future automation.

## Error Handling

- Empty/short input: request validation returns clear error
- Malformed AI JSON: safe fallback analysis (`Other`, low confidence)
- OpenRouter request failure: fallback analysis is still persisted for manual review
- Auth/RLS violations: unauthorized users are blocked

## Project Structure

```txt
src/
  app/
    api/
      enquiries/
      settings/model/
    auth/login/
    auth/signup/
    dashboard/
    settings/
    page.tsx
  components/
  lib/
supabase/
  migrations/20260516_init.sql
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Fill all required `.env.local` values:

- `OPENROUTER_API_KEY`
- `OPENROUTER_DEFAULT_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME`

4. Run the SQL migration in Supabase SQL editor:

- `supabase/migrations/20260516_init.sql`

5. Start dev server:

```bash
npm run dev
```

6. Open:

- [http://localhost:3000](http://localhost:3000)

## Testing

Run all tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

## Deploy on Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example` in Vercel project settings
4. Deploy
5. Ensure Supabase Auth redirect URLs include your Vercel domain

## Practical Workflow Fit

This is intentionally a staff-assist tool, not a fully autonomous responder.
Staff can review, edit, and route suggested outputs before client communication.

## Automation Potential

Natural next integrations:

- inbound email/webform ingestion
- CRM task creation
- Slack/Teams notifications
- queue-based routing for onboarding/support teams
