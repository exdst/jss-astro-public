/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions, @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SitecoreAstroClient } from './sitecore-astro-client';
import { DefaultRetryStrategy } from '@sitecore-content-sdk/core';
import { SITE_PREFIX } from '@sitecore-content-sdk/core/site';
import {
  layoutData,
  componentsWithExperiencesArray,
} from '../test-data/personalizeData';
import { VARIANT_PREFIX } from '@sitecore-content-sdk/core/personalize';

chai.use(sinonChai);

describe('SitecoreClient', () => {
  const sandbox = sinon.createSandbox();
  const defaultInitOptions = {
    api: {
      edge: {
        contextId: 'test-context-id',
        clientContextId: 'client-context-id',
        edgeUrl: 'https://edge.example.com',
      },
      local: {
        apiHost: 'http://local.example.com',
        apiKey: 'test-api-key',
        path: '/api/graph/test',
      },
    },
    editingSecret: '********-****',
    retries: {
      count: 3,
      retryStrategy: sinon.createStubInstance(DefaultRetryStrategy),
    },
    defaultSite: 'default-site',
    defaultLanguage: 'en',
    layout: { formatLayoutQuery: sandbox.stub() },
    dictionary: { caching: { enabled: true, timeout: 60000 } },
    disableCodeGeneration: false,
  };

  let sitecoreClient = new SitecoreAstroClient(defaultInitOptions);

  let layoutServiceStub = {
    fetchLayoutData: sandbox.stub(),
  };
  let dictionaryServiceStub = {
    fetchDictionaryData: sandbox.stub(),
  };
  let errorPagesServiceStub = {
    fetchErrorPages: sandbox.stub(),
  };
  let editingServiceStub = {
    fetchEditingData: sandbox.stub(),
    fetchDictionaryData: sandbox.stub(),
  };
  let restComponentServiceStub = {
    fetchComponentData: sandbox.stub(),
  };
  let sitePathServiceStub = {
    fetchSiteRoutes: sandbox.stub(),
  };

  beforeEach(() => {
    layoutServiceStub = {
      fetchLayoutData: sandbox.stub(),
    };
    dictionaryServiceStub = {
      fetchDictionaryData: sandbox.stub(),
    };
    errorPagesServiceStub = {
      fetchErrorPages: sandbox.stub(),
    };
    editingServiceStub = {
      fetchEditingData: sandbox.stub(),
      fetchDictionaryData: sandbox.stub(),
    };
    restComponentServiceStub = {
      fetchComponentData: sandbox.stub(),
    };
    sitePathServiceStub = {
      fetchSiteRoutes: sandbox.stub(),
    };

    sitecoreClient = new SitecoreAstroClient(defaultInitOptions);

    (sitecoreClient as any).layoutService = layoutServiceStub;
    (sitecoreClient as any).dictionaryService = dictionaryServiceStub;
    (sitecoreClient as any).errorPagesService = errorPagesServiceStub;
    (sitecoreClient as any).editingService = editingServiceStub;
    (sitecoreClient as any).componentService = restComponentServiceStub;
    (sitecoreClient as any).sitePathService = sitePathServiceStub;
  });

  describe('getPage', () => {
    it('should personalize page layout when variants present in path', async () => {
      const path = `${VARIANT_PREFIX}variant1/${VARIANT_PREFIX}mountain_bike_audience/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      const siteInfo = {
        name: 'default-site',
        hostName: 'example.com',
        language: 'en',
      };
      layoutServiceStub.fetchLayoutData.returns(testLayoutData);
      sandbox.stub(sitecoreClient, 'getHeadLinks').returns([]);

      const result = await sitecoreClient.getPage(path, { locale });

      expect(result?.layout.sitecore.route?.placeholders).to.deep.equal({
        'content-sdk-main': [...componentsWithExperiencesArray],
      });
    });

    it('should use personalize details passed in page options over variants present in path', async () => {
      const path = `${VARIANT_PREFIX}variant1/${VARIANT_PREFIX}sand_bike_audience/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      const siteInfo = {
        name: 'default-site',
        hostName: 'example.com',
        language: 'en',
      };
      layoutServiceStub.fetchLayoutData.returns(testLayoutData);
      sandbox.stub(sitecoreClient, 'getHeadLinks').returns([]);

      const result = await sitecoreClient.getPage(path, {
        locale,
        personalize: {
          variantId: 'variant2',
          componentVariantIds: ['mountain_bike_audience'],
        },
      });

      expect(result?.layout.sitecore.route?.placeholders).to.deep.equal({
        'content-sdk-main': [...componentsWithExperiencesArray],
      });
    });

    it('should pass site from path to base getPage method', async () => {
      const path = `${SITE_PREFIX}mysite/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      sandbox.stub(sitecoreClient, 'parsePath').returns('/test/path');
      layoutServiceStub.fetchLayoutData.returns(testLayoutData);

      await sitecoreClient.getPage(path, {
        locale,
      });

      expect(layoutServiceStub.fetchLayoutData).to.be.calledWithMatch(
        '/test/path',
        {
          locale,
          site: 'mysite',
        }
      );
    });

    it('should use site passed in page options over site parsed from path', async () => {
      const path = `${SITE_PREFIX}mysite/test/path`;
      const locale = 'en-US';
      const testLayoutData = structuredClone(layoutData);

      sandbox.stub(sitecoreClient, 'parsePath').returns('/test/path');

      layoutServiceStub.fetchLayoutData.returns(testLayoutData);

      await sitecoreClient.getPage(path, {
        locale,
        site: 'other-site',
      });

      expect(layoutServiceStub.fetchLayoutData).to.be.calledWithMatch(
        '/test/path',
        {
          locale,
          site: 'other-site',
        }
      );
    });
  });

  describe('getSiteNameFromPath', () => {
    it('should get site name correctly with string path', () => {
      const path = '/some/path';
      const siteInfo = { name: 'default-site', hostName: '*', language: 'en' };

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal(siteInfo.name);
    });

    it('should get site name correctly with array path', () => {
      const path = [`${SITE_PREFIX}other-site`, '/some', 'path'];
      const siteInfo = { name: 'other-site', hostName: '*', language: 'en' };

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal(siteInfo.name);
    });

    it('should get default site name when site not found', () => {
      const path = ['wrong-path-yet-anoother-site', '/some', 'path'];

      const result = sitecoreClient.getSiteNameFromPath(path);

      expect(result).to.equal('default-site');
    });
  });

  describe('parsePath', () => {
    it('should return string path when accepting string[] path', () => {
      const path = ['/some', 'path'];
      const expectedPath = '/some/path';

      const result = sitecoreClient.parsePath(path);

      expect(result).to.equal(expectedPath);
    });

    it('should strip site and variant prefixes from path', () => {
      const path = `/${SITE_PREFIX}site1/${VARIANT_PREFIX}variant1/some/path`;
      const expectedPath = '/some/path';

      const result = sitecoreClient.parsePath(path);

      expect(result).to.equal(expectedPath);
    });
  });

  describe('getPagePaths', () => {
    it('should return static paths without site prefixes', async () => {
      const paths = [
        { params: { path: ['_site_site-one', 'home'] }, locale: 'en' },
        { params: { path: ['_site_site-one', 'about'] }, locale: 'en' },
        { params: { path: ['_site_site-two', 'home'] }, locale: 'de-DE' },
      ];

      const expectedPaths = [
        { params: { path: ['home'] }, locale: 'en' },
        { params: { path: ['about'] }, locale: 'en' },
        { params: { path: ['home'] }, locale: 'de-DE' },
      ];

      sitePathServiceStub.fetchSiteRoutes.resolves(structuredClone(paths));

      const result = await sitecoreClient.getPagePaths(['site-one'], ['en'], undefined);

      expect(result).to.deep.equal(expectedPaths);
    });
  });

  /*
  describe('getComponentData', () => {
    it('should return componentData when component has getComponentsProps method', async () => {
      const context = {
        params: { path: ['test', 'path'] },
        query: {},
        req: {},
        res: {},
        resolvedUrl: '/test/path',
      } as unknown as GetServerSidePropsContext;
      const layoutData = {
        sitecore: {
          context,
          route: {
            name: 'test',
            placeholders: {
              main: [
                {
                  componentName: 'TestComponent',
                  uid: 'test-uid',
                },
              ],
            },
          },
        },
      };

      const mockComponent = {
        getComponentServerProps: sandbox.stub().resolves({ props: { data: 'test-data' } }),
      };

      const componentMap = new Map([['TestComponent', mockComponent]]);

      const result = await sitecoreClient.getComponentData(layoutData, context, componentMap);

      expect(result).to.deep.equal({
        'test-uid': { props: { data: 'test-data' } },
      });
      expect(mockComponent.getComponentServerProps.calledOnce).to.be.true;
    });
  });*/
});
