# Sitecore JavaScript Rendering SDK for Astro

`@astro-sitecore-jss/astro-sitecore-jss` provides Astro components and integration for [Sitecore JSS](https://github.com/Sitecore/jss), letting you build Sitecore XM / XP websites with [Astro](https://astro.build/) — including Experience Editor support and interactive React / Vue / Angular islands.

## Installation

```bash
npm install @astro-sitecore-jss/astro-sitecore-jss
```

The fastest way to start a new project is the initializer:

```bash
npx @astro-sitecore-jss/create-astro-sitecore-jss@latest
```

See the [repository root](../../../README.md) for full development and production usage instructions.

> **Sitecore JSS 22 maintenance reaches end of life in June 2026.** For new SitecoreAI(XM Cloud) projects, use the [Astro Content SDK](../../../astro-content-sdk/) instead.

## Why Astro

Astro renders to HTML by default and only hydrates the islands that actually need JavaScript. Against the same Sitecore demo on Next.js, the Astro build delivers higher Lighthouse scores on mobile, faster LCP, and less main-thread blocking — read the [case study](https://exdst.com/case-studies/sitecore-astro-sdk).

## Learn more

* Why Astro for Sitecore: [case study](https://exdst.com/case-studies/sitecore-astro-sdk) · [Astro services](https://exdst.com/services/astro)
* Repository root: [jss-astro-public](../../../README.md)
* Initializer: [`@astro-sitecore-jss/create-astro-sitecore-jss`](../create-astro-sitecore-jss/)

Made by [EXDST](https://exdst.com/)
