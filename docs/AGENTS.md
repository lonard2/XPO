# Documentation & Guides Subdirectory Guidelines (`docs/`)

This directory houses all formal architectural specifications, technical design documents, and phase-by-phase educational learning guides.

---

## 1. Directory Structure

```
docs/
├── AGENTS.md             # This guide
├── superpowers/specs/    # Formal design specifications (e.g. 2026-08-20-xpo-mice-platform-design.md)
├── guides/               # Educational walkthroughs for each phase (phase-01-*.md to phase-12-*.md)
└── architecture/         # System diagrams, data flow charts, and domain models
```

---

## 2. Standards for Educational Phase Guides (`docs/guides/phase-XX-*.md`)

For every completed phase, create a dedicated guide following this standard structure:
1. **Phase Overview & Objectives**: What was built and why.
2. **Key Concepts & Technical Rationale**: Explaining the design patterns, algorithms, and architectural decisions.
3. **Core Code Walkthrough & Snippets**: In-depth explanations of critical TypeScript interfaces, React components, and server actions.
4. **Testing & Verification**: How the phase was tested and validated.
5. **Key Takeaways & Educational Insights**: Lessons learned and production best practices.
