# Project Rules and Guidelines

This file defines the rules and guidelines for AI agents working on this workspace (`FrontendNextHouse`).

## Technical Stack
- **Framework**: React 19.x (Vite-based)
- **Styling**: Vanilla CSS. Avoid Tailwind CSS unless explicitly requested. Custom styles should align with the design system in `src/index.css` and standard CSS variables.
- **State & Utilities**: Context providers in `src/context/`, custom hooks in `src/hooks/`, helper functions in `src/utils/`.

## General Guidelines
- **Component Placement**: All UI components belong in [src/components/](file:///c:/_dev/FrontendNextHouse/src/components/).
- **Internationalization**: Localized content and translations are centralized in [src/translations.jsx](file:///c:/_dev/FrontendNextHouse/src/translations.jsx). Always use translations for UI strings where appropriate rather than hardcoding.
- **Aesthetics & Design**: Align any new UI features with the established modern dark theme styling defined in [src/index.css](file:///c:/_dev/FrontendNextHouse/src/index.css).
- **Clean Code**: Keep functions modular and components small and focused. Maintain proper JSDoc comments or basic documentation for complex logic.
