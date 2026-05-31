# Sitecore Content SDK for Astro

`@exdst-sitecore-content-sdk/astro` provides Astro components and integration for the [Sitecore Content SDK](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html), letting you build SitecoreAI(XM Cloud) websites with [Astro](https://astro.build/). It follows the same patterns as the official Next.js Content SDK and supports running Astro locally as a rendering host with metadata editing mode for the SitecoreAI Pages editor.

## Installation

```bash
npm install @exdst-sitecore-content-sdk/astro
```

The fastest way to start a new project is the initializer:

```bash
npx @exdst-sitecore-content-sdk/create-astro@latest
```

## Why Astro

Astro renders to HTML by default and only hydrates the islands that actually need JavaScript. Measured against the same demo on Next.js with the Content SDK, the Astro build delivers higher Lighthouse scores on mobile, faster LCP, and less main-thread blocking — read the [case study](https://exdst.com/case-studies/sitecore-astro-sdk).

## Learn more

* Release notes: [Sitecore Astro Content SDK release](https://exdst.com/posts/20260531-astro-content-sdk-release)
* Why Astro for Sitecore: [case study](https://exdst.com/case-studies/sitecore-astro-sdk) · [Astro services](https://exdst.com/services/astro)
* Repository root: [jss-astro-public](../../../README.md)
* Initializer: [`@exdst-sitecore-content-sdk/create-astro`](../create-astro-content-sdk-app/)

Made by [EXDST](https://exdst.com/)
