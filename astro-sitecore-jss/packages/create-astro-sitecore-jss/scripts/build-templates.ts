import path from 'path';
import fs from 'fs-extra';

const samples = [
  {
    dist: '../dist/templates/astro',
    sample: '../../../packages/astro-sitecore-jss-sample'
  },
  {
    dist: '../dist/templates/astro-vue',
    sample: '../../../packages/astro-vue-sitecore-jss-sample'
  }
]

for (const sample of samples) {

  const distFolder = path.resolve(__dirname, sample.dist);

  // Create dist folder
  //fs.mkdir(distFolder, { recursive: true });
  // Copy sample app to dist
  const sampleAppFolder = path.resolve(__dirname, sample.sample);

  fs.copySync(sampleAppFolder, distFolder,
    {
      filter: function (name) {
        return name.indexOf('node_modules') === -1;
      }
    });

  // Delete tsconfig.json, because it is configured for monorepo
  fs.unlinkSync(path.resolve(distFolder, 'tsconfig.json'));

  // Rename tsconfig.template.json to tsconfig.json
  fs.renameSync(path.resolve(distFolder, 'tsconfig.template.json'), path.resolve(distFolder, 'tsconfig.json'));

  // Delete astro.config.mjs, because it is configured for monorepo
  fs.unlinkSync(path.resolve(distFolder, 'astro.config.mjs'));

  // Rename astro.config.mjs to astro.config.template.mjs
  fs.renameSync(path.resolve(distFolder, 'astro.config.template.mjs'), path.resolve(distFolder, 'astro.config.mjs'));
}
