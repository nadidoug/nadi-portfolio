# Nadi Portfolio

A cinematic, scroll-directed portfolio website for Nadi.

In plain language: this site is built to feel like a guided trip instead of a normal static page. As someone scrolls, the hero, project cards, services, workflow graphics, and contact/signup area move into place like scenes in a short trailer.

## Highlights

- One normalized global scroll timeline drives every animation.
- A 95-frame WebP hero sequence is scrubbed by scroll position.
- Canvas particles, DOM reveals, chapter timecode, and project cards share the same timeline.
- Selected Work cards swing into view, lock into place, and expand into detail panels.
- The signup form connects to Supabase, stores subscribers, queues welcome emails, and sends through Resend.
- One-click unsubscribe is handled through a Supabase Edge Function.
- Featured cards can load public README content from GitHub.
- Responsive layout and reduced-motion support.

## How it was made

The site uses plain HTML, CSS, and JavaScript — no front-end framework.

The main idea is a single global scroll value from `0` to `1`. Every visual moment reads from that same timeline:

- the NADI logo shrinking and moving
- the tagline sliding into place
- the hero frame sequence
- the Selected Work cards swinging onto the screen
- the Tools and Customer Automation sections fading in and out
- the final contact and signup section

The background is a fixed canvas/video-style layer. The text, cards, workflow nodes, and signup panel sit above it. That keeps the page feeling cinematic while still being simple to host on GitHub Pages.

The email signup is connected to Supabase and Resend:

1. A visitor submits the signup form.
2. A Supabase Edge Function saves the subscriber.
3. A queue record is created for the welcome email.
4. A GitHub Actions worker sends the email through Resend.
5. The email includes a working unsubscribe link.

## Run locally

Serve this directory with any static server, then open `index.html`.

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4174/`.

## Featured projects

- [GuapClock](https://github.com/nadidoug/guapclock)
- Email Campaign System with Supabase + Resend
- [Websites Like This](https://github.com/nadidoug/nadi-portfolio)
