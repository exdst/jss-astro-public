import path from 'path';
import fs from 'fs-extra';
const distFolder = path.resolve(__dirname, '../dist/templates/astro');

// Create dist folder
//fs.mkdir(distFolder, { recursive: true });
// Copy sample app to dist
const sampleAppFolder = path.resolve(__dirname, '../../../packages/astro-sitecore-jss-sample');
console.log(sampleAppFolder);


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