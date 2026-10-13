# ReThread — Make the tear the detail

## Links

- Demo: https://rethread-mending-studio.noblellama8.chatgpt.site
- Source: https://github.com/AaravTandon582/rethread

## Team

Solo builder: AaravTandon582 (GitHub username). No additional team members.

## Submission status

The owner confirmed on October 12, 2026 that they have an extension / can still submit. Preserve that confirmation with the event organizers. Do not backdate commits or imply work was completed earlier. This project must not be cross-submitted to another hackathon under the supplied Banana Hacks rules.

Before submission, verify your Devpost profile name and fill in the GitHub URL, hosted demo URL, and public YouTube URL. Record a real live image-generation run using the server-configured Gemini key. The prepared denim comparison must be identified as an example.

## Short pitch

Your favorite clothes are not finished. ReThread uses generative image AI to visualize visible mending, preserves the original photo outside the chosen repair area, and turns your measurements into a printable stitch guide.

## Inspiration and brainstorming

A tear can make a garment feel unusable even when most of it is still good. We explored a practical question: could seeing an appealing repair make the next step easier? We chose visible mending because image generation can help people imagine the outcome, while an actual-size template helps them begin making it.

This is the design rationale. Add your own real personal experience or user interview here; do not claim interviews or repair outcomes that have not happened.

## What it does

1. Accepts a photograph of a worn garment, resized in the browser with embedded metadata removed by canvas re-encoding.
2. Lets the user mark a rectangular repair region using pointer input or numeric controls.
3. Takes measured tear width, height, and a sound-fabric margin.
4. Offers three stitch motifs and three patch colors.
5. Builds a measured plan and draws its stitches directly over the user's photo locally. This free preview needs no API key or billing.
6. Offers optional Gemini 3.1 Flash Image generation separately; when selected, it sends the photo and rendered stitch reference through the server secret.
7. For live AI results, composites only the selected region into the normalized image and shows a boundary color-difference diagnostic.
8. Exports that same deterministic physical stitch layout as a downloadable A4 SVG with a 50 mm calibration ruler, plus a JSON repair plan.

## How we built it

React and TypeScript on Vinext, deployed as a Cloudflare Worker through Sites. A validated server route mediates the image model. Browser canvas handles normalization and localized compositing. A separate geometry engine constructs stitch coordinates in millimeters.

The free path renders the measured concept locally. Optional generative AI produces a separate visual repair concept; it does not generate the dimensionally precise SVG.

## Engineering challenges

- A generative model can change lighting, framing, or fabric outside the target. For live AI results, ReThread copies only the selected rectangle and leaves the other source pixels untouched.
- A visual model can still vary even with a stitch reference image. The deterministic printable guide remains the source of physical measurements and coordinates; the preview is an idea to inspect rather than a promise of exact stitch placement.
- Screen pixels do not establish physical scale. Users enter ruler measurements; the guide is emitted in millimeters and includes a print calibration line.
- Provider failures must not destroy the original photo. The app keeps the source and displays actionable errors.

## Validation and honest limits

Automated checks cover dimensions, region bounds, stitch positions, SVG units, browser interaction, and exact pixel preservation outside a repair rectangle using a fixture response. Provider failure behavior is also exercised. A successful live Gemini request still needs to be recorded before claiming live generation; fixtures do not prove live model access or output quality.

No claims of repair durability, validated sewing instruction, measured waste reduction, trained custom models, or user adoption. Photographs should be taken straight overhead; measurements must be checked by the maker. Repair suitability depends on the fabric and damage.

## Rubric evidence

| Criterion | Evidence to show judges |
| --- | --- |
| Technical execution | Validated optional generation endpoint, local stitch renderer, pixel-preserving AI compositor, boundary metric, geometry engine, tests |
| Innovation | A workflow connecting repair visualization to physical stitch planning |
| Image AI theme | A prepared visual concept introduces image AI; optional live Gemini uses the user's photo and stitch reference |
| Impact | A defined user: someone deciding how to repair an everyday garment; demonstrate one real repair if possible |
| Presentation | An honest, silent prepared example, free stitch preview, and guide in under three minutes; label live output accurately |

## Resources and attribution

- Image model: https://ai.google.dev/gemini-api/docs/image-generation
- React, TypeScript, Vinext, Cloudflare Workers, Zod, Lucide React.
- The two bundled denim images are prepared concept assets inherited from the initial project. Their generation provenance should be confirmed before describing their model or prompt.
- AI coding assistance was used. Disclose it if the organizer requires this.
- Event: https://banana-hacks-1111.devpost.com/ and https://www.bananahacks.tech/
