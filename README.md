# Sitecore JavaScript Software Development Kit for Astro

This project is an implementation of Sitecore JavaScript Services Software Development Kit(SDK) for Astro. It contains Astro components and integration for JSS.
It is fully featured SDK. You can use it to build your website with Astro and Sitecore.

## Build status
![Library](https://github.com/exdst/jss-astro-public/actions/workflows/publish-astro-sitecore-jss.yml/badge.svg)
![Astro projct initializer](https://github.com/exdst/jss-astro-public/actions/workflows/publish-astro-sitecore-jss.yml/badge.svg)

## NPM packages
[Library](https://www.npmjs.com/package/@astro-sitecore-jss/astro-sitecore-jss)
[Astro project initializer](https://www.npmjs.com/package/@astro-sitecore-jss/create-astro-sitecore-jss)

## Project structure

* [Astro JSS SDK](./astro-sitecore-jss/packages/astro-sitecore-jss/)
* [Astro sample project](./astro-sitecore-jss/packages/astro-sitecore-jss-sample/)
* [Astro project initializer](./astro-sitecore-jss/packages/create-astro-sitecore-jss/)
* [Sitecore](./sitecore/)

## Development usage

1. Initialize and start Sitecore instance. Please, follow instruction under [Sitecore](./sitecore/README.md) folder to setup Sitecore instance.
2. Open Sitecore Content Editor and check that there is a new SXA managed headless website under path `/sitecore/content/Headless/Astro`
3. Change directory to the [Astro SDK project](./astro-sitecore-jss/packages/astro-sitecore-jss/) `cd ./astro-sitecore-jss/packages/astro-sitecore-jss/`
4. Install npm packages with `npm install`
5. Change directory to the [Astro sample project](./astro-sitecore-jss/packages/astro-sitecore-jss-sample/) `cd ./astro-sitecore-jss/packages/astro-sitecore-jss-sample/`
6. Install npm packages with `npm install`
7. Start the project with `npm run dev` command
8. Open [http://localhost:3000](http://localhost:3000) in your browser (If port 3000 is busy, different port will be used)
9. Open Sitecore Experience Editor for item `/sitecore/content/Headless/Astro/home/styleguide`

## Production usage

### Installation for production usage

1. Create Sitecore Headless website. You can use any approach:
   * [SXA managed approach](https://doc.sitecore.com/xp/en/developers/sxa/102/sitecore-experience-accelerator/create-a-headless-tenant-and-site.html)
   * Config manages site
1. Open command line
1. Run `npx @astro-sitecore-jss/create-astro-sitecore-jss@latest`
1. Follow instructions
1. Change directory to the created project
1. Start website with `npm run dev`

### Production build

1. Run `npm run build` command to build the project
1. Copy `./dist` folder to your web server

Astro support deployment to many platforms. Please, follow [Astro documentation](https://docs.astro.build/en/guides/deploy/) to deploy your website.
Some examples:

1. [Netlify](https://docs.astro.build/en/guides/deploy/netlify)
1. [Vercel](https://docs.astro.build/en/guides/deploy/vercel)
1. [AWS](https://docs.astro.build/en/guides/deploy/aws/)
1. [Azure](https://docs.astro.build/en/guides/deploy/microsoft-azure/)

## Installation for development and contribution

### Sitecore

Currently, project supports only Sitecore first approach. You are not able to push items to Sitecore from code.
Please, follow instruction under [Sitecore](./sitecore/README.md) folder to setup Sitecore instance.
It is Docker based, so you can easily run it locally with a few commands.

## Contacts

If you would like to see demo, please, contact  

* [Email](mailto:at@exdst.com)
* [LindedIn](https://www.linkedin.com/in/anton-tishchenko-b45b2923/)

## Contributors

* Anton Tishchenko, [GitHub](https://github.com/antonytm), [LinkedIn](https://www.linkedin.com/in/anton-tishchenko-b45b2923/)
* Bogdan Druziuk, [GitHub](https://github.com/bdruziuk), [LinkedIn](https://www.linkedin.com/in/bogdan-druziuk-50069763/)
* Oleksandr Melnyk, [GitHub](https://github.com/OlekMel)
* Stanislav Chernetsky, [GitHub](https://github.com/stanislavSV)

Sponsored by [EXDST](https://exdst.com/)