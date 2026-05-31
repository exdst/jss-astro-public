# Sitecore Content SDK for Astro

Build [SitecoreAI(XM Cloud)](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html) websites with the [Astro](https://astro.build/) web framework on top of the [Sitecore Content SDK](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html) — no Sitecore JSS dependency.

This is a Yarn workspaces + Lerna monorepo containing:

* [`packages/astro-content-sdk`](./packages/astro-content-sdk/) — `@exdst-sitecore-content-sdk/astro`, the core SDK with Astro components and Sitecore Content SDK integration.
* [`packages/create-astro-content-sdk-app`](./packages/create-astro-content-sdk-app/) — `@exdst-sitecore-content-sdk/create-astro`, the project initializer and sample templates.

## Quick start

```bash
npx @exdst-sitecore-content-sdk/create-astro@latest
```

## Why Astro

Astro renders to HTML by default and only hydrates the islands that actually need JavaScript — a much better fit for content-driven Sitecore sites than shipping React to every page. Against the same demo on Next.js with the Content SDK, the Astro build delivers **+30 Lighthouse points (mobile)**, **3.2s faster LCP**, and **858 ms less main-thread blocking**. See the [case study](https://exdst.com/case-studies/sitecore-astro-sdk) and [Astro services](https://exdst.com/services/astro).

## Learn more

* Release notes: [Sitecore Astro Content SDK release](https://exdst.com/posts/20260531-astro-content-sdk-release)
* Repository root: [jss-astro-public](../README.md)

Sponsored by [EXDST](https://exdst.com/)
