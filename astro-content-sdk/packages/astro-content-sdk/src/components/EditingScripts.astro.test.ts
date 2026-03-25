/* eslint-disable no-unused-expressions */
import { describe, test, expect } from 'vitest';
import { mockSitecoreContext, renderAstroComponent } from '../tests/astro-helpers';
import {
  LayoutServiceData,
  LayoutServicePageState,
  RenderingType,
} from '@sitecore-content-sdk/content/layout';
import EditingScripts from './EditingScripts.astro';
import {
  getContentSdkPagesClientData,
  getDesignLibraryScriptLink,
  DesignLibraryMode,
} from '@sitecore-content-sdk/content/editing';
import { PageMode } from '@sitecore-content-sdk/content/client';
import sinon from 'sinon';

describe('<EditingScripts />', () => {
  // @ts-ignore
  const mode: PageMode = {
    name: LayoutServicePageState.Edit,
    isEditing: true,
  };

  const getLayoutData = ({
    pageState,
    pageEditing,
    clientData,
    clientScripts,
    renderingType,
  }: {
    pageEditing: boolean;
    pageState?: LayoutServicePageState;
    clientData?: Record<string, Record<string, unknown>>;
    clientScripts?: string[];
    renderingType?: RenderingType;
  }): LayoutServiceData => ({
    sitecore: {
      context: {
        pageState,
        pageEditing,
        renderingType,
        site: {
          name: 'ContentSdkTestWeb',
        },
        language: 'en',
        clientData: clientData || {
          foo: {
            x: 1,
            y: '1',
            z: true,
          },
          bar: {
            a: 2,
            b: '2',
            c: false,
          },
        },
        clientScripts: clientScripts || [
          'http://test.foo/script1.js',
          'http://test.foo/script2.js',
        ],
      },
      route: null,
    },
  });

  test('should render nothing when not in editing', async () => {
    const mode: PageMode = {
      name: LayoutServicePageState.Normal,
      isNormal: true,
      isPreview: false,
      isEditing: false,
      isDesignLibrary: false,
      designLibrary: {
        isVariantGeneration: false,
      },
    };

    const page = {
      locale: 'en',
      layout: {
        sitecore: {
          context: {},
          route: null,
        },
      },
      mode,
    };

    mockSitecoreContext(page);

    const component = await renderAstroComponent(EditingScripts);

    expect(component.innerHTML).to.be.empty;
    expect(component.querySelectorAll('script')).to.have.length(0);
  });

  describe('should render Pages scripts when in Edit mode', () => {
    test('should render scripts', async () => {
      const layoutData = getLayoutData({
        pageState: LayoutServicePageState.Edit,
        pageEditing: true,
      });

      const page = {
        locale: 'en',
        layout: layoutData,
        mode,
      };

      mockSitecoreContext(page);

      const component = await renderAstroComponent(EditingScripts);

      const scripts = component;
      const contentSdkScriptsLength = Object.keys(getContentSdkPagesClientData()).length;

      expect(scripts?.querySelectorAll('script')).to.have.length(4 + contentSdkScriptsLength);

      const script1 = scripts?.querySelectorAll('script')[0];
      expect(script1?.getAttribute('src')).to.equal('http://test.foo/script1.js');

      const script2 = scripts?.querySelectorAll('script')[1];
      expect(script2?.getAttribute('src')).to.equal('http://test.foo/script2.js');

      const script3 = scripts?.querySelectorAll('script')[2];
      expect(script3?.getAttribute('id')).to.equal('foo');
      expect(script3?.getAttribute('type')).to.equal('application/json');
      expect(script3?.outerHTML).to.equal(
        '<script id="foo" type="application/json">{"x":1,"y":"1","z":true}</script>'
      );

      const script4 = scripts?.querySelectorAll('script')[3];
      expect(script4?.getAttribute('id')).to.equal('bar');
      expect(script4?.getAttribute('type')).to.equal('application/json');
      expect(script4?.outerHTML).to.equal(
        '<script id="bar" type="application/json">{"a":2,"b":"2","c":false}</script>'
      );
    });

    test('should render content sdk pages script elements when data is not provided', async () => {
      const layoutData = getLayoutData({
        pageState: LayoutServicePageState.Edit,
        pageEditing: true,
        clientData: {},
        clientScripts: [],
      });

      const page = {
        locale: 'en',
        layout: layoutData,
        mode,
      };

      mockSitecoreContext(page);

      const component = await renderAstroComponent(EditingScripts);

      const scripts = component;
      const ids = Object.keys(getContentSdkPagesClientData());
      ids.forEach((id) => {
        expect(component.querySelector(`#${id}`)).to.not.be.null;
      });
      expect(scripts.querySelectorAll('script')).to.have.length(ids.length);
    });
  });

  describe('Design Library scripts', () => {
    // @ts-ignore
    const mode: PageMode = {
      name: DesignLibraryMode.Normal,
      isDesignLibrary: true,
    };

    test('should render Design Library script when rendering type is component', async () => {
      const layoutData = getLayoutData({
        pageEditing: false,
        pageState: LayoutServicePageState.Normal,
        renderingType: RenderingType.Component,
        clientData: {},
        clientScripts: [],
      });

      const page = {
        locale: 'en',
        layout: layoutData,
        mode,
      };

      mockSitecoreContext(page);

      const component = await renderAstroComponent(EditingScripts);

      const scripts = component;
      expect(scripts.querySelectorAll('script')).to.have.length(1);
      const script1 = scripts?.querySelectorAll('script')[0];
      expect(script1.getAttribute('src')).to.contain(`${getDesignLibraryScriptLink()}?cb=`);
    });

    test('should render Design Library script with custom design library url when rendering type is component', async () => {
      const layoutData = getLayoutData({
        pageEditing: false,
        pageState: LayoutServicePageState.Normal,
        renderingType: RenderingType.Component,
        clientData: {},
        clientScripts: [],
      });

      const page = {
        locale: 'en',
        layout: layoutData,
        mode,
      };

      const stagingEdgeUrl = 'http://edge-staging';
      mockSitecoreContext(page, undefined, { edge: { edgeUrl: stagingEdgeUrl, contextId: 'id' } });

      const component = await renderAstroComponent(EditingScripts);

      const scripts = component;
      expect(scripts.querySelectorAll('script')).to.have.length(1);
      const script1 = scripts?.querySelectorAll('script')[0];
      expect(script1.getAttribute('src')).to.contain(
        `${getDesignLibraryScriptLink(stagingEdgeUrl)}?cb=`
      );
    });

    test('should append UTC cache-buster in HH-DD-MM-YYYY format (zero-padded) across edge cases', async () => {
      // Use sinon fake timers instead of overriding Date directly

      const cases = [
        { date: '2024-01-02T03:04:05.000Z', expected: '03-02-01-2024' }, // single-digit month/day/hour
        { date: '2024-11-12T13:00:00.000Z', expected: '13-12-11-2024' }, // double-digit month/day/hour
        { date: '2024-12-31T23:59:59.000Z', expected: '23-31-12-2024' }, // end of year
        { date: '2025-01-01T00:00:00.000Z', expected: '00-01-01-2025' }, // start of year, hour 00
        { date: '2024-03-09T09:00:00.000Z', expected: '09-09-03-2024' }, // leading zero hour/day/month
      ];

      for (const { date, expected } of cases) {
        const clock = sinon.useFakeTimers(new Date(date).getTime());
        try {
          const layoutData = getLayoutData({
            pageEditing: false,
            pageState: LayoutServicePageState.Normal,
            renderingType: RenderingType.Component,
            clientData: {},
            clientScripts: [],
          });

          const page = { locale: 'en', layout: layoutData, mode };

          mockSitecoreContext(page);

          const component = await renderAstroComponent(EditingScripts);

          const script1 = component.querySelectorAll('script')[0];
          const src = script1?.getAttribute('src') || '';
          const cbValue = new URL(src).searchParams.get('cb');
          expect(cbValue).to.equal(expected);
        } finally {
          clock.restore();
        }
      }
    });
  });
});
