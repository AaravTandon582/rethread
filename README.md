# ReThread

**Make the tear the detail.** A visible-mending studio that connects generative image repair concepts with measured stitch templates.

## Run

Requires Node 22.13 or later.

```sh
npm ci
npm run dev
```

Open the printed loopback URL. Visitors can generate directly without supplying a key. The Site owner configures `GEMINI_API_KEY` as a secret in the hosting runtime; the key never appears in the browser, API request body, or repository. Google receives the photograph when the visitor clicks Reimagine.

The public demo permits 25 generation attempts per UTC day and 3 per minute, shared across visitors. D1 atomically reserves each attempt before Google is called, including attempts that later fail. Missing secret or database configuration fails closed. Local development needs the same server bindings and migration; no production key is committed.

Live demo: https://rethread-mending-studio.noblellama8.chatgpt.site


## Architecture

- `app/page.tsx`: active studio, photo upload, editable region, comparison, controls and exports.
- `app/api/repair/route.ts`: Zod validation, same-origin enforcement, constrained Gemini 3.1 Flash Image call, bounded inputs and timeout, sanitized errors.
- `lib/image.ts`: image normalization and localized pixel compositing. The five-pixel feather is entirely inside the selected rectangle. Outside pixels remain unchanged relative to the normalized source.
- `lib/repair-engine.ts`: dimensions, stitch coordinates, constrained prompt and actual-size SVG.
- `lib/generation-budget.ts`: shared atomic D1 usage limits. The old `/api/generate` endpoint returns 410.

No account records or upload persistence. D1 stores only aggregate usage counters. Reloading discards the current photograph and result. The server secret is managed separately by the Site owner. The provided denim comparison is a prepared example, not a live API call. Image generation is a visual concept; the printable template is calculated independently and is not traced from the model output.

## Validation

```sh
node --experimental-strip-types --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

The project includes geometry tests. Browser QA also exercises uploads, exports, settings, failure states, and localized compositing using explicitly mocked provider output. Live model inference is checked separately from mocked provider tests.

## Demo and submission

See `docs/SUBMISSION.md` for an editable Devpost draft and `docs/DEMO-SCRIPT.md` for a 2:45 demo outline. Fill in real team members, accessible GitHub source, and the public YouTube link. Preserve actual build dates and the organizer's extension confirmation. Do not cross-submit this project under the supplied event rules.

## Limitations

- Manual region selection, not an automatic damage detector.
- Physical scale comes from ruler measurements; use an overhead photo.
- Boundary color difference is a simple pixel statistic, not a model confidence or durability score.
- No measured sustainability impact or tested repair strength is claimed.
- Print the SVG at 100% and verify the 50 mm calibration ruler.
- The initial assets are inherited prepared concepts; confirm provenance before attributing them to a specific generator.

Image model documentation: https://ai.google.dev/gemini-api/docs/image-generation
