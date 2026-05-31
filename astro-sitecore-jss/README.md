# Astro Sitecore JSS

Build [Sitecore](https://www.sitecore.com/) XM / XP websites with the [Astro](https://astro.build/) web framework on top of [Sitecore JSS](https://github.com/Sitecore/jss), including Experience Editor support and interactive React / Vue / Angular islands.

This folder contains:

* [`packages/astro-sitecore-jss`](./packages/astro-sitecore-jss/) — `@astro-sitecore-jss/astro-sitecore-jss`, the core SDK with Astro components and Sitecore JSS integration.
* [`packages/create-astro-sitecore-jss`](./packages/create-astro-sitecore-jss/) — `@astro-sitecore-jss/create-astro-sitecore-jss`, the project initializer.
* [`packages/astro-sitecore-jss-sample`](./packages/astro-sitecore-jss-sample/) — sample Astro application.
* [`packages/astro-vue-sitecore-jss-sample`](./packages/astro-vue-sitecore-jss-sample/) — Vue-focused sample Astro application.

## Quick start

```bash
npx @astro-sitecore-jss/create-astro-sitecore-jss@latest
```

> **Sitecore JSS 22 maintenance reaches end of life in June 2026.** For new SitecoreAI(XM Cloud) projects, use the [Astro Content SDK](../astro-content-sdk/) instead. This JSS SDK remains available for existing XM / XP (Experience Editor) implementations.

## Why Astro

Astro renders to HTML by default and only hydrates the islands that actually need JavaScript — a much better fit for content-driven Sitecore sites than shipping React to every page. See the [case study](https://exdst.com/case-studies/sitecore-astro-sdk) and [Astro services](https://exdst.com/services/astro).

## Learn more

* Repository root (development & production usage): [jss-astro-public](../README.md)

Sponsored by [EXDST](https://exdst.com/)
