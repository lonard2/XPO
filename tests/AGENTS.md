# Automated Testing Subdirectory Guidelines (`tests/`)

This directory contains automated test suites ensuring correctness, security, regression resistance, and accessibility.

---

## 1. Directory Structure

```
tests/
├── AGENTS.md        # This guide
├── unit/            # Unit tests for domain functions, theming, i18n, and ticket hashes
├── integration/     # Integration tests for API routes, database queries, and AI streaming
└── e2e/             # Playwright browser end-to-end tests for key user journeys
```

---

## 2. Testing Guidelines

1. **Test Runner**: Vitest for unit & integration tests, Playwright for E2E tests.
2. **Coverage Priority**:
   * **Ticket Generation & Verification**: Verify QR hash computation and anti-tamper validation.
   * **Archetype Theming**: Verify that all 9 MICE archetype components render without errors under various event configurations.
   * **Settings Persistence**: Verify font switching, animation toggles, and AI concierge toggling.
   * **Multilingual i18n**: Verify that all locales resolve keys accurately without missing key fallbacks.
3. **Mocks**: Use clean mocks for network and OpenRouter API calls in CI environments.
