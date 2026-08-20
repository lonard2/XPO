# Components Subdirectory Guidelines (`src/components/`)

This directory houses all React components, categorized into modular functional domains.

---

## 1. Directory Structure

```
src/components/
├── AGENTS.md            # This guide
├── ui/                  # Headless, accessible UI primitives (Button, Card, Badge, Modal, Tabs)
├── layout/              # Topbar, Footer, LanguageSwitcher, RegionSwitcher, ThemeProvider
├── discovery/           # BannerCarousel, VenueSpotlightCard, FilterSidebar, EventCard
├── themed/              # Dynamic Archetype Engine & EventPageShell
│   └── archetypes/      # 9 Specialized MICE Archetype view components
├── tickets/             # TicketCheckoutDrawer, TierSelector, PassPreview
├── perks/               # DigitalPassQR, InteractiveGuidebook, HallFloorMap
├── ai/                  # AttendeeAIConcierge, ModelSelectorDropdown, MarkdownReportViewer
├── organizer/           # LivePreviewFrame, BrandingCustomizer, CheckInScanner, BoothTable
└── settings/            # UIPreferencesForm, TypographySelector, MotionController, AccountForm
```

---

## 2. Component Guidelines

1. **Accessibility First**: Use proper ARIA attributes, semantic HTML elements, and keyboard listeners on all interactive elements.
2. **Zero Unicode Emojis**: Strictly use `lucide-react` icons for iconography.
3. **Props Type Safety**: Always define an explicit interface for props (e.g. `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).
4. **Theme Adaptability**: Components in `src/components/themed/` must consume CSS variables `--event-primary`, `--event-accent`, etc., so organizer brand overrides work seamlessly.
