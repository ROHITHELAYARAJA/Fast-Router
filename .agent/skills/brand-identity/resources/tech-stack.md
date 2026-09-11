# Preferred Tech Stack & Implementation Rules

When generating code or UI components for Fast-Router, you **MUST** strictly adhere to the following technology choices.

## Core Stack
* **Framework:** React / Next.js 16 (App Router)
* **Styling Engine:** Tailwind CSS (Mandatory. Do not use plain CSS or styled-components unless explicitly asked.)
* **Component Library:** Custom Accessible Components with Tailwind primitives
* **Icons:** Material Symbols & Lucide React

## Implementation Guidelines

### 1. Tailwind Usage
* Use utility classes directly in JSX.
* Utilize the color tokens defined in `design-tokens.json`.
* **Dark Mode:** Support dark mode by default with rich obsidian background (`#090D16`), deep navy surfaces (`#0F172A`), and electric blue accents (`#2563EB` / `#3B82F6`).

### 2. Component Patterns
* **Buttons:** Primary actions must use the solid Primary color (`bg-blue-600 hover:bg-blue-500 text-white`). Secondary actions should use Outline or Ghost variants (`border border-slate-700 hover:bg-slate-800`).
* **Forms:** Labels must always be placed *above* input fields. Use standard Tailwind spacing (`gap-4` between form items).
* **Cards:** Glassmorphic card styling (`bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl`).
* **Layout:** Use Flexbox and CSS Grid via Tailwind utilities for all layout structures.

### 3. Forbidden Patterns
* Do NOT use jQuery.
* Do NOT use Bootstrap classes.
* Do NOT create new arbitrary CSS files; keep styles located within component files via Tailwind.
