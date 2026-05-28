/* eslint-disable quotes */
/* eslint-disable no-unused-expressions, @typescript-eslint/no-unused-expressions */

import path from 'path';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';
import sinon from 'sinon';

chai.use(sinonChai);
import { generateMap } from './generate-map';
import fs from 'fs';
import { ComponentImport } from '@sitecore-content-sdk/content/tools';

describe('generateMap', () => {
  const sandbox = sinon.createSandbox();

  describe('generateMap', () => {
    const fakePackages: ComponentImport[] = [
      {
        importName: 'MyLib',
        importInfo: {
          importFrom: '@my/lib',
        },
      },
      {
        importName: 'OtherLib',
        importInfo: {
          importFrom: '@other/lib',
        },
      },
    ];

    beforeEach(() => {
      sandbox.stub(fs, 'writeFileSync');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should write componentMap.ts file with components from "paths" parameter', () => {
      const paths = ['src/tests/test-components/generate-map'];
      generateMap({ paths });

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [dest, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;
      expect(dest).to.equal(path.join(process.cwd(), '.sitecore', 'component-map.ts'));

      expect(content).to.include(
        "import type { AstroContentSdkComponent } from '@exdst-sitecore-content-sdk/astro';"
      );

      expect(content).to.include(
        "import Button from 'src/tests/test-components/generate-map/Button.astro';"
      );
      expect(content).to.include(
        "import Link from 'src/tests/test-components/generate-map/Link.astro';"
      );

      expect(content).to.include('new Map');
      expect(content).to.include("['Button', Button]");
      expect(content).to.include("['Link', Link]");
      expect(content).to.include('export default componentMap;');
    });

    it('should use template from custom componentMap function, when provided', () => {
      const paths = ['src/tests/test-components/generate-map'];
      const customTemplate = sinon.stub().returns('// custom template output');
      const fakePackages = [
        {
          importName: 'CustomLib',
          importInfo: {
            importFrom: '@custom/lib',
          },
        },
      ];
      generateMap({ paths, componentImports: fakePackages, mapTemplate: customTemplate });

      expect(customTemplate).to.have.been.calledOnce;
      const [componentsArg, packagesArg] = customTemplate.getCall(0).args;
      expect(packagesArg).to.deep.equal(fakePackages);
      expect(componentsArg.map((c: any) => c.componentName)).to.include.members(['Button', 'Link']);

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;
      expect(content).to.equal('// custom template output');
    });

    it('should generate an empty component map if no components are found', () => {
      const paths = ['src/tests/test-components/generate-map-empty'];
      generateMap({ paths });

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;
      expect(content).to.include(
        'export const componentMap = new Map<string, AstroContentSdkComponent>(['
      );
      expect(content).to.not.match(/\['Button'[\s\S]*Button/);
      expect(content).to.not.match(/\['Link'[\s\S]*Link/);
      expect(content).to.include('export default componentMap;');
    });

    it('should handle multiple paths and merge their components', () => {
      const paths = [
        'src/tests/test-components/generate-map',
        'src/tests/test-components/map-components',
      ];

      generateMap({ paths });

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [mainDest, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;
      expect(mainDest).to.equal(path.join(process.cwd(), '.sitecore', 'component-map.ts'));

      expect(content).to.include('new Map');

      expect(content).to.include(
        "import Button from 'src/tests/test-components/generate-map/Button.astro';"
      );
      expect(content).to.include(
        "import Link from 'src/tests/test-components/generate-map/Link.astro';"
      );
      expect(content).to.include(
        "import Bar from 'src/tests/test-components/map-components/Bar.astro';"
      );

      expect(content).to.include("['Button', Button]");
      expect(content).to.include("['Link', Link]");
      expect(content).to.include("['Bar', Bar]");
      expect(content).to.include('export default componentMap;');
    });

    it('should not fail if packages is undefined', () => {
      const paths = ['src/components'];
      expect(() => generateMap({ paths, componentImports: undefined })).to.not.throw();
      expect(fs.writeFileSync).to.have.been.calledOnce;
    });

    it('should write componentMap.ts file with components from "paths" and "packages" parameters, when provided', () => {
      const paths = ['src/components'];
      generateMap({ paths, componentImports: fakePackages });

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;
      expect(content).to.include("import MyLib from '@my/lib';");
      expect(content).to.include("import OtherLib from '@other/lib';");

      expect(content).to.include(
        'export const componentMap = new Map<string, AstroContentSdkComponent>(['
      );
      expect(content).to.include("['MyLib', MyLib],");
      expect(content).to.include("['OtherLib', OtherLib],");
    });

    it('should use custom destination when provided', () => {
      const paths = ['src/components'];
      const customDir = path.join(process.cwd(), 'custom/path');
      const mainDest = path.join(customDir, 'component-map.ts');

      generateMap({ paths, destination: 'custom/path', includeVariants: false });

      expect(fs.writeFileSync).to.have.been.calledOnce;

      const encodingArg = sinon.match.string.or(sinon.match.has('encoding'));

      expect(fs.writeFileSync).to.have.been.calledWithMatch(
        mainDest,
        sinon.match.string,
        encodingArg
      );
    });

    it('should pass exclude param into component collection call', () => {
      const paths = ['src/tests/test-components/generate-map'];
      const exclude = ['src/tests/test-components/generate-map/Button.*'];
      generateMap({ paths, exclude });

      expect(fs.writeFileSync).to.have.been.calledOnce;
      const [, content] = (fs.writeFileSync as sinon.SinonStub).getCall(0).args;

      expect(content).to.include(
        "import Link from 'src/tests/test-components/generate-map/Link.astro';"
      );
      expect(content).to.not.include('Button');
    });

    it('should throw error when destination cannot be written to', async () => {
      (fs.writeFileSync as sinon.SinonStub).throws(new Error('Disk full'));
      const paths = ['src/components'];
      let errorCaught = null;
      try {
        generateMap({ paths });
      } catch (err) {
        errorCaught = err;
      }
      expect(errorCaught).to.be.an('error');
      expect((errorCaught as Error).message).to.equal('Disk full');
    });
  });
});
