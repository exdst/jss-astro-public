# Sitecore JavaScript Rendering Astro Initializer

`@astro-sitecore-jss/create-astro-sitecore-jss` scaffolds an [Astro](https://astro.build/) + [Sitecore JSS](https://github.com/Sitecore/jss) sample application built on [`@astro-sitecore-jss/astro-sitecore-jss`](../astro-sitecore-jss/).

It is based on the official [Sitecore JSS initializers](https://github.com/Sitecore/jss/blob/dev/packages/create-sitecore-jss). We used the official JSS initializer as a base so the Astro template can be merged into the official JSS repository.

## How to use it

1. Open a command line.
2. Run `npx @astro-sitecore-jss/create-astro-sitecore-jss@latest`.

## Why Astro

Astro renders to HTML by default and only hydrates the islands that need JavaScript, delivering **+30 Lighthouse points (mobile)**, **3.2s faster LCP**, and **858 ms less main-thread blocking** versus Next.js. See the [case study](https://exdst.com/case-studies/sitecore-astro-sdk).

## Learn more

* SDK package: [`@astro-sitecore-jss/astro-sitecore-jss`](../astro-sitecore-jss/)
* Repository root: [jss-astro-public](../../../README.md)

## To Sitecore

If someone from Sitecore is reading this, please make the official JSS initializer able to accept custom templates from GitHub-based URLs, and require fewer parameters to be passed to the initializer. For example, you may want to implement a new template but not have the time or desire to implement the code-first part.

Sponsored by [EXDST](https://exdst.com/)
