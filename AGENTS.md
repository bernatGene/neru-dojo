# AGENTS.md

- do not expand scope casually.
- Keep the app desktop-only, fast, static, deterministic.
- Prefer simple Svelte 5 components, Tailwind token colors, and code-only config.
- locality of behaviour. components.
- Do not pollute route files with feature-specific helper logic. Route files should show the general page flow; move deep formatting, storage, parsing, manipulation, and similar implementation details into focused lib helpers.
- performance is important; what can be calculated at load to speed up interaction, it
should
- less code is always better. YAGNI all the way.
- Avoid landing-page copy, decorative UI, animations, glow, gradients, and tiny text.
