# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

- Bookmarks are persisted in the browser with `localStorage`, so bookmark data survives reloads and navigation without involving the server.
- Browser-only code, including any access to `localStorage`, is allowed to run only behind a `client:load` boundary so the static SSR build never touches browser APIs.
