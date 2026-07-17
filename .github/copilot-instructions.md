# Copilot Instructions for rkeytech.io

## Repository purpose
- This repository powers [rkeytech.io](https://rkeytech.io), a personal technical blog and profile site.
- The author is a Software Architect, Developer, and Consultant with Azure and DevSecOps expertise.
- Primary goals:
  - Share practical learnings, architecture patterns, and implementation guidance.
  - Publish public speaking sessions and profile-related content.
  - Keep content clear, actionable, and technically trustworthy.

## Platform and architecture
- Static site generator: Jekyll.
- Hosting: GitHub Pages.
- Theme: Minimal Mistakes.
- Key structure to preserve:
  - `_posts/` for dated blog posts.
  - `_pages/` for static pages (about, sessions, archives, etc.).
  - `_layouts/`, `_includes/`, `_sass/`, and `assets/` for theme and UI customizations.
  - `_config.yml` as the central site configuration.

## Content and writing guidelines
- Keep tone professional, practical, and experience-driven.
- Prefer real-world Azure and DevSecOps examples over generic theory.
- Use concise, skimmable structure:
  - Problem context.
  - Approach and architecture decisions.
  - Step-by-step implementation.
  - Security/reliability/cost considerations.
  - Common pitfalls and troubleshooting.
- Avoid hype language and unverifiable claims.
- For technical posts, include accurate code snippets and commands that can be tested.

## Front matter and permalink conventions
- For posts in `_posts/`, use standard Jekyll front matter with:
  - `title`
  - `date`
  - `categories`
  - `tags`
  - `toc` and `toc_sticky` when appropriate
  - `header` image/teaser fields when relevant
- Keep filenames in `_posts/` as `YYYY-MM-DD-kebab-case-title.md`.
- Preserve existing permalink behavior configured in `_config.yml`.

## Minimal Mistakes alignment
- Reuse existing theme patterns and includes before introducing custom markup.
- Prefer existing utility classes and layout conventions already used in the repository.
- Do not introduce heavy JavaScript frameworks or build systems.
- Keep pages fast and GitHub Pages-compatible.

## Link and profile content rules
- Profile and social links are part of site identity. Keep them accurate and consistent across:
  - `index.html`
  - `_config.yml`
  - relevant profile pages in `_pages/`
- External links must use safe attributes where applicable:
  - `target="_blank"`
  - `rel="nofollow noopener noreferrer"`

## Quality and safety checks
- Ensure markdown renders correctly in Jekyll.
- Avoid breaking Liquid templates, includes, and front matter.
- Preserve backward compatibility for existing URLs where possible.
- Prefer small, focused edits; do not refactor unrelated files.

## What Copilot should optimize for
- Technical accuracy in Azure and DevSecOps topics.
- Clear architecture communication for intermediate and advanced practitioners.
- Discoverability through meaningful titles, headings, tags, and summaries.
- Consistent branding of rkeytech.io as both a learning hub and speaker profile.
