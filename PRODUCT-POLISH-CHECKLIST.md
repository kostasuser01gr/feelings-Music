# Product polish checklist

## Microinteractions

- [ ] Button hover / active states (already via Tailwind)
- [ ] Tab switch transition (subtle fade)
- [ ] Command palette: result highlight on arrow keys
- [ ] Cosmos pin hover: subtle scale or glow
- [ ] Success feedback on create (confession, band, project): toast or inline message

## Motion rules

- Prefer **short** transitions (150–200 ms) for UI.
- **Reduce motion:** all motion respect `data-reduce-motion` / Settings toggle; Cosmos uses fewer particles, simpler arcs, no aura trail.
- **Cosmos:** 60fps target; LOD when zoomed out (fewer arcs/particles).
- Page transitions: optional view transitions API (avoid full reloads).

## Typography rules

- **Headings:** Cormorant Garamond (serif), amber accent for “Aurelia.”
- **Body / UI:** Geist Sans.
- **Code:** Geist Mono.
- Consistent hierarchy: `text-lg` / `text-xl` for section titles, `text-sm` for secondary.

## Empty states

- [ ] Sanctuary feed: “No confessions yet” + CTA (already present)
- [ ] Studio projects: “No projects yet” + “New project” (already present)
- [ ] Bands: “No bands yet” + “Create band” (already present)
- [ ] Cosmos list: “No songs match” when filters return nothing (already present)
- [ ] Generic empty: illustration + one-line copy + primary action

## Error states

- [ ] Form validation: inline error below field (e.g. confession, login)
- [ ] API / Firestore errors: user-facing message, optionally “Try again”
- [ ] 404: custom page linking to Home, Sanctuary, Studio
- [ ] Audio export fail: message in Code mode (already present)
- [ ] Network offline: optional banner or subtle indicator

## Accessibility

- [ ] All interactive elements keyboard-focusable
- [ ] Visible focus ring (amber) on focus-visible
- [ ] No keyboard traps; Esc closes modals
- [ ] Cosmos: list view as full alternative
- [ ] Skip link to `#main-content` where relevant
- [ ] ARIA labels on icon-only buttons (already in nav, etc.)

## Safety & privacy

- [ ] Distress content: gentle check-in + helpline nudge (already in confession flow)
- [ ] Privacy: Private / Friends / Public enforced via Firestore rules
- [ ] Moderation: report flow + admin queue (backend placeholder)

## Optional follow-ups

- [ ] PWA: `manifest.json` (present); service worker for offline
- [ ] Lighthouse budgets in CI
- [ ] Sentry for error tracking
- [ ] Strudel embed for “Experimental live coding” in Studio
