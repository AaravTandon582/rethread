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
5. Sends the photograph and constrained repair prompt to Gemini 2.5 Flash Image.
6. Composites only the selected region into the original normalized image, blending five pixels inward at the edge.
7. Shows a before/after comparison and a boundary color-difference diagnostic.
8. Creates a deterministic physical stitch layout and downloadable A4 SVG with a 50 mm calibration ruler, plus a JSON repair plan.

## How we built it

React and TypeScript on Vinext, deployed as a Cloudflare Worker through Sites. A validated server route mediates the image model. Browser canvas handles normalization and localized compositing. A separate geometry engine constructs stitch coordinates in millimeters.

Generative AI produces the visual repair concept. It does not generate the dimensionally precise SVG. Separating these responsibilities lets the application constrain pixel changes and export a measured layout without pretending the model understands exact sewing dimensions.

## Engineering challenges

- A generative model can change lighting, framing, or fabric outside the target. ReThread copies only the selected rectangle and leaves the other source pixels untouched.
- Generated imagery can look feasible without matching the pattern. The printable guide is explicitly a motif template rather than a trace of generated embroidery.
- Screen pixels do not establish physical scale. Users enter ruler measurements; the guide is emitted in millimeters and includes a print calibration line.
- Provider failures must not destroy the original photo. The app keeps the source and displays actionable errors.

## Validation and honest limits

Automated checks cover dimensions, region bounds, stitch positions, SVG units, browser interaction, and exact pixel preservation outside a repair rectangle using a fixture response. Provider failure behavior is also exercised. A live paid Gemini request still needs to be recorded with the server secret; fixtures do not prove live model access or output quality.

No claims of repair durability, validated sewing instruction, measured waste reduction, trained custom models, or user adoption. Photographs should be taken straight overhead; measurements must be checked by the maker. Repair suitability depends on the fabric and damage.

## Rubric evidence

| Criterion | Evidence to show judges |
| --- | --- |
| Technical execution | Validated generation endpoint, pixel-preserving compositor, boundary metric, geometry engine, tests |
| Innovation | A workflow connecting repair visualization to physical stitch planning |
| Image AI theme | The user's photograph and image-to-image generation are central to the live repair concept |
| Impact | A defined user: someone deciding how to repair an everyday garment; demonstrate one real repair if possible |
| Presentation | A clear before/after, a visible live call, and a printed guide in under three minutes |

## Resources and attribution

- Image model: https://ai.google.dev/gemini-api/docs/image-generation
- React, TypeScript, Vinext, Cloudflare Workers, Zod, Lucide React.
- The two bundled denim images are prepared concept assets inherited from the initial project. Their generation provenance should be confirmed before describing their model or prompt.
- AI coding assistance was used. Disclose it if the organizer requires this.
- Event: https://banana-hacks-1111.devpost.com/ and https://www.bananahacks.tech/
