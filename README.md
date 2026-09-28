# Nadi Douglas — Portfolio

A cinematic, scroll-directed portfolio for a developer and technology consultant focused on accessible web experiences, automation, and practical business tools.

**Live site:** [nadidoug.com](https://nadidoug.com)

## Project overview

Instead of behaving like a conventional static portfolio, the site unfolds as a guided visual sequence. A shared scroll timeline coordinates the hero, project cards, service sections, workflow graphics, and contact experience.

## Highlights

- A normalized global scroll timeline drives the page animation.
- A 95-frame WebP sequence creates the scroll-scrubbed hero.
- Canvas particles, DOM reveals, chapter timecode, and project cards share one animation system.
- Project cards animate into place and expand into detail panels.
- Supabase stores subscribers and queues welcome emails.
- A GitHub Actions worker sends email through Resend.
- A Supabase Edge Function handles one-click unsubscribe.
- Responsive layout and reduced-motion support are built in.

## Built with

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Supabase
- Resend
- GitHub Actions
- GitHub Pages

## Run locally

No front-end framework or build step is required.

```bash
python -m http.server 4174 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4174](http://127.0.0.1:4174).

## Featured work

- [GuapClock](https://github.com/nadidoug/guapclock) — a Java desktop session timer and billing record tool for recording studios.
- Email Campaign System — a Supabase and Resend workflow for signup, queued email delivery, and unsubscribe handling.
- [Retro Glow Pong](https://github.com/nadidoug/retropong) — a mobile-friendly HTML5 Canvas game.

## Repository documentation

- [Repository setup](docs/REPO-SETUP.md)
- [Engineering standards](docs/engineering/README.md)
- [Legal and compliance](docs/legal/README.md)
- [Security policy](SECURITY.md)
- [Contributing guide](CONTRIBUTING.md)
- [Support](SUPPORT.md)

This portfolio is published for review purposes. See [LICENSE](LICENSE) for usage terms.
