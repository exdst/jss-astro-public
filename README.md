# Sitecore Software Development Kits for Astro

![Library](https://github.com/exdst/jss-astro-public/actions/workflows/publish-astro-sitecore-jss.yml/badge.svg)
![Astro project initializer](https://github.com/exdst/jss-astro-public/actions/workflows/publish-create-astro-sitecore-jss.yml/badge.svg)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Build [Sitecore](https://www.sitecore.com/) websites with the [Astro](https://astro.build/) web framework. This repository ships two fully featured, production-ready SDKs — one for the modern **Sitecore Content SDK** (SitecoreAI / XM Cloud) and one for classic **Sitecore JSS** (XM / XP) — together with project initializers and a Docker-based local Sitecore environment.

Maintained and sponsored by [EXDST](https://exdst.com/), an [Astro Agency Partner](https://exdst.com/case-studies/sitecore-astro-sdk).

## Why Astro

Sitecore's default headless implementation runs on Next.js, which ships React to the browser whether or not a page needs it — wasted bytes on every visit. [Astro renders to HTML by default and only hydrates the islands that actually need JavaScript](https://exdst.com/services/astro), which is a much better fit for content-driven Sitecore sites.

Measured against the same Sitecore demo on Next.js with the Content SDK, the Astro build delivers ([full case study](https://exdst.com/case-studies/sitecore-astro-sdk)):

* **+30 Lighthouse Performance points** (mobile average across 17 pages)
* **3.2s faster** Largest Contentful Paint (LCP)
* **858 ms less** main-thread blocking (Total Blocking Time)

…with full feature parity: the same field types, SXA toolkit, multisite/multilingual support, and in-place editing for Pages and the Experience Editor.

Learn more: [Why Astro for Sitecore — case study](https://exdst.com/case-studies/sitecore-astro-sdk) · [Astro services](https://exdst.com/services/astro)

## Choose your SDK

| SDK | Sitecore product | npm package | Initializer |
| --- | --- | --- | --- |
| **Content SDK** _(recommended)_ | SitecoreAI / XM Cloud | [`@exdst-sitecore-content-sdk/astro`](https://www.npmjs.com/package/@exdst-sitecore-content-sdk/astro) | [`@exdst-sitecore-content-sdk/create-astro`](https://www.npmjs.com/package/@exdst-sitecore-content-sdk/create-astro) |
| **JSS SDK** | XM / XP (Experience Editor) | [`@astro-sitecore-jss/astro-sitecore-jss`](https://www.npmjs.com/package/@astro-sitecore-jss/astro-sitecore-jss) | [`@astro-sitecore-jss/create-astro-sitecore-jss`](https://www.npmjs.com/package/@astro-sitecore-jss/create-astro-sitecore-jss) |

> **Sitecore JSS 22 maintenance reaches end of life in June 2026.** For new SitecoreAI / XM Cloud projects, use the **Content SDK**. The JSS SDK remains available for existing XM / XP (Experience Editor) implementations.

## Astro Content SDK

The Astro Content SDK builds SitecoreAI / XM Cloud websites with Astro on top of the [Sitecore Content SDK](https://doc.sitecore.com/xmc/en/developers/content-sdk/index.html) — no Sitecore JSS dependency. It follows the same patterns as the official Next.js Content SDK, so developers can move between frameworks easily, and supports running Astro locally as a rendering host with metadata editing mode for the SitecoreAI Pages editor.

Quick start:

```bash
npx @exdst-sitecore-content-sdk/create-astro@latest
```

* Package source & docs: [`astro-content-sdk/`](./astro-content-sdk/)
* Release notes: [Sitecore Astro Content SDK release](https://exdst.com/posts/20260531-astro-content-sdk-release)

### Build results

Same SitecoreAI / XM Cloud site, same Content SDK — built once with Next.js and once with Astro. Lighthouse mobile performance score:

| Stack | Lighthouse mobile |
| --- | --- |
| **Astro Content SDK** | **91** |
| Next.js Content SDK | 68 |

Source: [Sitecore Astro Content SDK release](https://exdst.com/posts/20260531-astro-content-sdk-release).

## Create Astro Content SDK

The Content SDK initializer scaffolds a ready-to-run Astro + SitecoreAI sample app from a choice of starter templates (Alaris, Solterra & Co., Skate Park, and more).

```bash
npx @exdst-sitecore-content-sdk/create-astro@latest
```

See [`astro-content-sdk/packages/create-astro-content-sdk-app/`](./astro-content-sdk/packages/create-astro-content-sdk-app/).

## Astro Sitecore JSS

The JSS SDK provides Astro components and integration for [Sitecore JSS](https://github.com/Sitecore/jss) on XM / XP, including Experience Editor support and interactive React / Vue / Angular islands.

### Development usage

1. Initialize and start a Sitecore instance — follow the instructions in the [Sitecore](./sitecore/README.md) folder.
2. Open Sitecore Content Editor and confirm the SXA-managed headless website exists at `/sitecore/content/Headless/Astro`.
3. Check your Node version with `node -v`. If it is lower than 18, update it to an LTS version 18+.
4. Change directory to the [Astro JSS SDK](./astro-sitecore-jss/packages/astro-sitecore-jss/): `cd ./astro-sitecore-jss/packages/astro-sitecore-jss/`
5. Install npm packages with `npm install`.
6. Change directory to the [Astro sample project](./astro-sitecore-jss/packages/astro-sitecore-jss-sample/): `cd ./astro-sitecore-jss/packages/astro-sitecore-jss-sample/`
7. Install npm packages with `npm install`.
8. Start the project with `npm run dev`.
9. Open [http://localhost:4321](http://localhost:4321) in your browser (if port 4321 is busy, a different port is used).
10. Open Sitecore Experience Editor for the item `/sitecore/content/Headless/Astro/home/styleguide`.

### Production usage

1. Create a Sitecore Headless website using any approach:
   * [SXA-managed approach](https://doc.sitecore.com/xp/en/developers/sxa/102/sitecore-experience-accelerator/create-a-headless-tenant-and-site.html)
   * Config-managed site
2. Open a command line.
3. Run `npx @astro-sitecore-jss/create-astro-sitecore-jss@latest`.
4. Follow the instructions.
5. Change directory to the created project.
6. Start the website with `npm run dev`.

#### Production build

1. Run `npm run build` to build the project.
2. Copy the `./dist` folder to your web server.

Astro supports deployment to many platforms — follow the [Astro deployment guide](https://docs.astro.build/en/guides/deploy/). Some examples: [Netlify](https://docs.astro.build/en/guides/deploy/netlify) · [Vercel](https://docs.astro.build/en/guides/deploy/vercel) · [AWS](https://docs.astro.build/en/guides/deploy/aws/) · [Azure](https://docs.astro.build/en/guides/deploy/microsoft-azure/).

See [`astro-sitecore-jss/`](./astro-sitecore-jss/) for package source and docs.

## Create Astro Sitecore JSS

The JSS initializer scaffolds an Astro + Sitecore JSS sample app. It is based on the official [Sitecore JSS initializers](https://github.com/Sitecore/jss/blob/dev/packages/create-sitecore-jss).

```bash
npx @astro-sitecore-jss/create-astro-sitecore-jss@latest
```

See [`astro-sitecore-jss/packages/create-astro-sitecore-jss/`](./astro-sitecore-jss/packages/create-astro-sitecore-jss/).

## Repository structure

* **Content SDK** — [`astro-content-sdk/`](./astro-content-sdk/)
  * [Astro Content SDK](./astro-content-sdk/packages/astro-content-sdk/)
  * [Astro Content SDK initializer](./astro-content-sdk/packages/create-astro-content-sdk-app/)
* **JSS SDK** — [`astro-sitecore-jss/`](./astro-sitecore-jss/)
  * [Astro JSS SDK](./astro-sitecore-jss/packages/astro-sitecore-jss/)
  * [Astro JSS sample project](./astro-sitecore-jss/packages/astro-sitecore-jss-sample/)
  * [Astro JSS initializer](./astro-sitecore-jss/packages/create-astro-sitecore-jss/)
* **Sitecore** — [`sitecore/`](./sitecore/) — Docker-based local Sitecore environment (XM1, XP0, XP1, XM Cloud topologies)

## Installation for development and contribution

### Sitecore

Currently, the project supports only the Sitecore-first approach — you cannot push items to Sitecore from code. Follow the instructions in the [Sitecore](./sitecore/README.md) folder to set up the Sitecore instance. It is Docker-based, so you can run it locally with a few commands.

## NPM packages

* [`@exdst-sitecore-content-sdk/astro`](https://www.npmjs.com/package/@exdst-sitecore-content-sdk/astro) — Content SDK for Astro
* [`@exdst-sitecore-content-sdk/create-astro`](https://www.npmjs.com/package/@exdst-sitecore-content-sdk/create-astro) — Content SDK project initializer
* [`@astro-sitecore-jss/astro-sitecore-jss`](https://www.npmjs.com/package/@astro-sitecore-jss/astro-sitecore-jss) — JSS SDK for Astro
* [`@astro-sitecore-jss/create-astro-sitecore-jss`](https://www.npmjs.com/package/@astro-sitecore-jss/create-astro-sitecore-jss) — JSS project initializer

## Demo website

See Astro and Sitecore in action in the [Sitecore.Demo.XMCloud.Verticals](https://github.com/exdst/Sitecore.Demo.XMCloud.Verticals) repository — a fork of the Sitecore Next.js demo website, reimplemented on Astro, which proves Astro's capabilities and better performance compared to Next.js. Live demo: [exdst.com/astro-demo](https://exdst.com/astro-demo).

## Contacts

To see the demo or discuss a project, get in touch:

* [Email](mailto:at@exdst.com)
* [LinkedIn](https://www.linkedin.com/in/anton-tishchenko-b45b2923/)

## Articles

* Sitecore Astro Content SDK release, [EXDST blog](https://exdst.com/posts/20260531-astro-content-sdk-release)
* Sitecore JavaScript Software Development Kit for Astro, [EXDST blog](https://exdst.com/posts/20231002-sitecore-astro)
* Interactive React Islands with Sitecore and Astro, [EXDST blog](https://exdst.com/posts/20231122-sitecore-astro-react)
* Interactive Vue Islands with Sitecore and Astro, [EXDST blog](https://exdst.com/posts/20231123-sitecore-astro-vue)
* Interactive Angular Islands with Sitecore and Astro, [EXDST blog](https://exdst.com/posts/20231123-sitecore-astro-angular)
* Sitecore XM Cloud and Astro Web Framework, [EXDST blog](https://exdst.com/posts/20231206-sitecore-xm-cloud-astro)
* Starting Your First Sitecore Astro Project, [EXDST blog](https://exdst.com/posts/20240103-first-sitecore-astro-project)
* Creating Your First Sitecore Astro Rendering, [EXDST blog](https://exdst.com/posts/20240104-sitecore-astro-rendering)
* Migration of Sitecore Vue Website to Astro, [EXDST blog](https://exdst.com/posts/20240202-sitecore-jss-vue-astro-migration)
* Migration of Sitecore React Website to Astro, [EXDST blog](https://exdst.com/posts/20240403-sitecore-react-astro)
* Astro + React + Angular together, [EXDST blog](https://exdst.com/posts/20240829-astro-react-angular-together)
* Deploy Astro to XM Cloud, [EXDST blog](https://exdst.com/posts/20250127-sitecore-xm-cloud-astro)
* Sitecore + Astro, [YouTube, SUG Latam](https://www.youtube.com/watch?v=pP6pcaO_FhY)
* Sitecore Headless Software Development Kit for Astro, [YouTube, SUGCON](https://www.youtube.com/watch?v=PzOSONAdxe8)
* Astro Verticals Demo Case Study, [EXDST site](https://exdst.com/astro-demo)
* Sitecore Astro SDK — A case study by EXDST, [EXDST site](https://exdst.com/case-studies/sitecore-astro-sdk)
* Release 1.0.1, [EXDST blog](https://exdst.com/posts/20250303-sitecore-astro-jss-1-0-1-release)
* Sitecore Astro Verticals Demo Website: Feature Comparison with Next.js, [EXDST blog](https://exdst.com/posts/20250223-sitecore-astro-verticals-features-list)
* Sitecore Astro Verticals Demo Website: Next.js vs Astro Components Comparison, [EXDST blog](https://exdst.com/posts/20250221-sitecore-astro-verticals-components)
* Sitecore Astro Verticals Demo Website: Performance, [EXDST blog](https://exdst.com/posts/20250225-sitecore-astro-verticals-performance)
* Sitecore Astro Verticals Demo Website: Running Locally, [EXDST blog](https://exdst.com/posts/20250217-sitecore-astro-verticals-local)
* Sitecore Astro Verticals Demo Website: Running on Sitecore Demo Portal, [EXDST blog](https://exdst.com/posts/20250214-sitecore-astro-verticals-demo-portal)
* Sitecore Astro Verticals Demo Website: The Process, [EXDST blog](https://exdst.com/posts/20250213-sitecore-astro-verticals-demo-process)
* Sitecore Astro Verticals Demo Website, [EXDST blog](https://exdst.com/posts/20250226-sitecore-astro-verticals-announcement)

## Contributors

* Anton Tishchenko, [GitHub](https://github.com/antonytm), [LinkedIn](https://www.linkedin.com/in/anton-tishchenko-b45b2923/)
* Bogdan Druziuk, [GitHub](https://github.com/bdruziuk), [LinkedIn](https://www.linkedin.com/in/bogdan-druziuk-50069763/)
* Oleksandr Melnyk, [GitHub](https://github.com/OlekMel)
* Stanislav Chernetsky, [GitHub](https://github.com/stanislavSV)
* Vasyl Gavrylyuk, [GitHub](https://github.com/vsegrad)
* Vadym Shcherban, [GitHub](https://github.com/Lawliet1701)
* Navaneethakrishnan Sundarrajan, [GitHub](https://github.com/navancommits)

Sponsored by [EXDST](https://exdst.com/)
