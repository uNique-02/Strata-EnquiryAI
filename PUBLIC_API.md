# Public API Documentation

This project exposes a public endpoint for external systems (web forms, CRM, ticketing tools) to get AI enquiry analysis without Supabase login.

## Base URL

- Production: `https://<your-vercel-domain>`
- Local: `http://localhost:3000`

## Authentication

Generate a key inside the web app:

- Go to `Settings` → `Developer Settings`
- Click `Generate API Key` (or `Rotate API Key`)
- Copy the key and store it securely

Then send that key on each request:

- `x-api-key: <PUBLIC_API_KEY>` (recommended)
- or `Authorization: Bearer <PUBLIC_API_KEY>`

If the key is missing or invalid, the API returns `401 Unauthorized`.

Optional:
- You may also configure a global fallback key with `PUBLIC_API_KEY` in environment variables.

## Endpoint

### `POST /api/public/analyze`

Analyze one enquiry and return structured AI output.

#### Request Body

```json
{
  "clientName": "Jane Smith",
  "clientEmail": "jane@example.com",
  "enquiryText": "Hi, we need strata management pricing for a new development.",
  "modelOverride": "openai/gpt-4o-mini",
  "temperature": 0.2,
  "maxTokens": 650
}
```

#### Field Rules

- `enquiryText` (required): 8 to 4000 characters
- `clientName` (optional): max 120 chars
- `clientEmail` (optional): valid email, max 200 chars
- `modelOverride` (optional): OpenRouter model id string
- `temperature` (optional): `0` to `1.5`
- `maxTokens` (optional): integer `100` to `2000`

#### Success Response (`200`)

```json
{
  "classification": "New Client",
  "confidence": 0.92,
  "urgency": "Medium",
  "summary": "The sender is requesting strata pricing and onboarding details.",
  "recommended_action": "Forward to sales/onboarding team for follow-up.",
  "suggested_response": "Thank you for reaching out. Our onboarding team will contact you shortly.",
  "manual_review": false,
  "model_used": "openai/gpt-4o-mini",
  "prompt_version": "v1.0.0",
  "raw_ai_json": {
    "id": "..."
  },
  "source": "public_api"
}
```

#### Error Responses

- `400 Bad Request`: invalid payload (validation error)
- `401 Unauthorized`: invalid or missing API key
- `503 Service Unavailable`: `PUBLIC_API_KEY` not configured on server

## Classification Values

- `New Client`
- `Support Request`
- `Complaint`
- `Maintenance Issue`
- `Billing / Invoice Question`
- `General Question`
- `Urgent / Emergency`
- `Other`

## cURL Example

```bash
curl -X POST "https://<your-vercel-domain>/api/public/analyze" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <PUBLIC_API_KEY>" \
  -d '{
    "clientName": "Jane Smith",
    "clientEmail": "jane@example.com",
    "enquiryText": "We need strata support for a new property and want pricing info."
  }'
```

## Security Notes

- Never expose `PUBLIC_API_KEY` in frontend code.
- Send requests from your backend or secured integration service.
- Rotate the key if you suspect leakage.
