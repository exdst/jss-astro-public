/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';
import { mockSitecoreContext, renderAstroComponent } from '../../tests/astro-helpers';

import {
  ComponentRendering,
  LayoutServicePageState,
  RouteData,
} from '@sitecore-content-sdk/content/layout';
import {
  // byocWrapperData,
  // feaasWrapperData,
  convertedDevData as normalModeDevData,
  convertedLayoutServiceData as normalModeLsData,
  sxaRenderingColumnSplitterVariant,
  sxaRenderingVariantDataWithCommonContainerName as sxaRenderingCommonContainerName,
  sxaRenderingVariantData,
  sxaRenderingVariantDoubleDigitDynamicPlaceholder as sxaRenderingDoubleDigitContainerName,
  sxaRenderingVariantDataWithoutCommonContainerName as sxaRenderingWithoutContainerName,
} from '../../tests/test-data/normal-mode-data';
import * as metadataData from '../../tests/test-data/metadata-data';
import SxaRichText from '../../tests/test-components/SxaRichText.astro';
// import * as BYOCComponent from './BYOCComponent';
// import * as BYOCWrapper from './BYOCWrapper';
// import * as FEAASComponent from './FEaaSComponent';
// import * as FEAASWrapper from './FEaaSWrapper';
import Placeholder from './Placeholder.astro';
import { Page, PageMode } from '@sitecore-content-sdk/content/client';
import { AstroContentSdkComponent } from '../../sharedTypes/component-props';
import Home from '../../tests/test-components/Home.astro';
import DownloadCallout from '../../tests/test-components/DownloadCallout.astro';
import TestWrapperComponent from '../../tests/test-components/TestWrapperComponent.astro';
import TestComponentWithError from '../../tests/test-components/TestComponentWithError.astro';
import CustomErrorComponent from '../../tests/test-components/CustomErrorComponent.astro';
import CustomMissingComponent from '../../tests/test-components/CustomMissingComponent.astro';
import CustomHiddenRendering from '../../tests/test-components/CustomHiddenRendering.astro';
import TestLogo from '../../tests/test-components/TestLogo.astro';
import TestHeader from '../../tests/test-components/TestHeader.astro';
import TestParentWrapperComponent from '../../tests/test-components/TestParentWrapperComponent.astro';

vi.spyOn(console, 'log').mockImplementation(() => undefined);
vi.spyOn(console, 'warn').mockImplementation(() => undefined);
vi.spyOn(console, 'error').mockImplementation(() => undefined);

const componentMap = new Map<string, AstroContentSdkComponent>();

const getPage = (): Page => ({
  locale: 'en',
  layout: {
    sitecore: {
      context: {},
      route: null,
    },
  },
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
    designLibrary: {
      isVariantGeneration: false,
    },
  },
});

componentMap.set('Home', Home);
componentMap.set('DownloadCallout', DownloadCallout);
componentMap.set('Jumbotron', () => '<div className="jumbotron-mock" />');
// componentMap.set('DynamicComponent', dynamicComponent);

describe('<Placeholder />', () => {
  const testData = [
    { label: 'Dev data', data: normalModeDevData },
    { label: 'LayoutService data - Editing off', data: normalModeLsData },
  ];

  testData.forEach((dataSet) => {
    describe(`with ${dataSet.label}`, () => {
      test('should render a placeholder with given key', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = (
          dataSet.data.sitecore.route!.placeholders.main as (ComponentRendering | RouteData)[]
        ).find((c) => (c as ComponentRendering).componentName);
        const phKey = 'page-content';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: { name: phKey, rendering: component },
        });

        expect(renderedComponent.querySelectorAll('.download-callout-mock').length).to.equal(1);
      });

      test('should render nested placeholders', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: { name: phKey, rendering: component },
        });

        expect(renderedComponent.querySelectorAll('.download-callout-mock').length).to.equal(1);
      });

      test('should render components based on the renderEach HTML wrapper', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: component,
            renderEach: '<div class="wrapper">${component}</div>',
          },
        });

        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
      });

      test('should render components based on the renderEach Astro wrapper', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: component,
            renderEach: TestWrapperComponent,
          },
        });

        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
      });

      test('should use renderEach for each child in the placeholder when page editing is enabled', async () => {
        const page = getPage();

        const component = dataSet.data.sitecore.route as RouteData;

        const myComponent = {
          ...component,
          placeholders: {
            ...component.placeholders,
            main: [
              {
                componentName: 'Home',
              },
              {
                componentName: 'DownloadCallout',
              },
            ],
          },
        };

        page.mode.isEditing = true;
        mockSitecoreContext(page, componentMap);

        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: myComponent,
            render: TestParentWrapperComponent,
            renderEach: TestWrapperComponent,
          },
        });

        expect(renderedComponent.querySelectorAll('.parent-wrapper').length).to.equal(1);
        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(2);
      });

      test('should render components based on the render HTML wrapper', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: component,
            render: '<div class="wrapper">${component}</div>',
          },
        });

        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
      });

      test('should render components based on the render Astro wrapper', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: component,
            render: TestWrapperComponent,
          },
        });

        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
      });

      test('should render empty placeholder', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;
        const phKey = 'mainEmpty';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: { name: phKey, rendering: component, render: null },
        });

        expect(renderedComponent.innerHTML).to.be.equal('');
      });

      test('should render output based on the renderEmpty HTML wrapper in case of no renderings', async () => {
        const page = getPage();
        page.layout = dataSet.data;
        mockSitecoreContext(page, componentMap);

        const component = dataSet.data.sitecore.route as RouteData;

        const renderings = component.placeholders.main.filter(
          (c) => !(c as ComponentRendering).componentName
        );

        const myComponent = {
          ...component,
          placeholders: {
            ...component.placeholders,
            main: [...renderings],
          },
        };

        const phKey = 'main';

        const renderedComponent = await renderAstroComponent(Placeholder, {
          props: {
            name: phKey,
            rendering: myComponent,
            renderEmpty: '<div class="wrapper">${component}</div>',
          },
        });

        expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
        expect(renderedComponent.querySelectorAll('.download-callout-mock').length).to.equal(0);
        expect(renderedComponent.querySelectorAll('.home-mock').length).to.equal(0);
        expect(renderedComponent.querySelectorAll('.jumbotron-mock').length).to.equal(0);
      });
    });

    test('should render output based on the renderEmpty Astro wrapper in case of no renderings', async () => {
      const page = getPage();
      page.layout = dataSet.data;
      mockSitecoreContext(page, componentMap);

      const component = dataSet.data.sitecore.route as RouteData;

      const renderings = component.placeholders.main.filter(
        (c) => !(c as ComponentRendering).componentName
      );

      const myComponent = {
        ...component,
        placeholders: {
          ...component.placeholders,
          main: [...renderings],
        },
      };

      const phKey = 'main';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: myComponent,
          renderEmpty: TestWrapperComponent,
        },
      });

      expect(renderedComponent.querySelectorAll('.wrapper').length).to.equal(1);
      expect(renderedComponent.querySelectorAll('.download-callout-mock').length).to.equal(0);
      expect(renderedComponent.querySelectorAll('.home-mock').length).to.equal(0);
      expect(renderedComponent.querySelectorAll('.jumbotron-mock').length).to.equal(0);
    });

    test('should pass properties to nested components', async () => {
      const page = getPage();
      page.layout = dataSet.data;
      mockSitecoreContext(page, componentMap);

      const component = dataSet.data.sitecore.route as any;
      const phKey = 'main';
      const expectedMessage = (component.placeholders.main as any[]).find((c) => c.componentName)
        .fields.message;

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(
        renderedComponent
          .querySelector('.download-callout-mock')
          ?.innerHTML.indexOf(expectedMessage.value) !== -1
      ).to.be.true;
    });
  });

  describe('SXA rendering variants', () => {
    const componentMap = new Map();

    componentMap.set('RichText', SxaRichText);

    test('should render', async () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingVariantData.sitecore.route as RouteData;
      const phKey = 'main';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(1);
      expect(renderedComponent.querySelector('.rendering-variant')?.getAttribute('class')).to.equal(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-x'
      );
      expect(renderedComponent.querySelectorAll('.title').length).to.equal(1);
      expect(renderedComponent.querySelector('.title')?.textContent).to.equal(
        'Rich Text Rendering Variant'
      );
      expect(renderedComponent.querySelectorAll('.text').length).to.equal(1);
      expect(renderedComponent.querySelector('.text')?.textContent).to.equal('Test RichText');
    });

    test('should render with container-{*} type dynamic placeholder', async () => {
      const page = getPage();
      page.layout = sxaRenderingCommonContainerName;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingCommonContainerName.sitecore.route as RouteData;
      const phKey = 'container-1';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(1);
      expect(renderedComponent.querySelector('.rendering-variant')?.getAttribute('class')).to.equal(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-x'
      );
      expect(renderedComponent.querySelectorAll('.title').length).to.equal(1);
      expect(renderedComponent.querySelector('.title')?.textContent).to.equal(
        'Rich Text Rendering Variant'
      );
    });

    test('should not render without container-{*} type dynamic placeholder', async () => {
      const page = getPage();
      page.layout = sxaRenderingWithoutContainerName;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingWithoutContainerName.sitecore.route as RouteData;
      const phKey = 'richText';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(0);
      expect(renderedComponent.querySelectorAll('.title').length).to.equal(0);
    });

    test('should render with dynamic-1-{*} type dynamic placeholder', async () => {
      const page = getPage();
      page.layout = sxaRenderingDoubleDigitContainerName;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingDoubleDigitContainerName.sitecore.route as RouteData;
      const phKey = 'dynamic-1-{*}';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(1);
      expect(renderedComponent.querySelector('.rendering-variant')?.getAttribute('class')).to.equal(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-x'
      );
      expect(renderedComponent.querySelectorAll('.title').length).to.equal(1);
      expect(renderedComponent.querySelector('.title')?.textContent).to.equal(
        'Rich Text Rendering Variant'
      );
    });

    test('should render another rendering variant', async () => {
      const page = getPage();
      page.layout = sxaRenderingVariantData;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingVariantData.sitecore.route as RouteData;
      const phKey = 'main-second';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(1);
      expect(renderedComponent.querySelector('.rendering-variant')?.getAttribute('class')).to.equal(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-y'
      );
      expect(renderedComponent.querySelectorAll('.default').length).to.equal(1);
    });

    test('should render column splitter rendering variant', async () => {
      const page = getPage();
      page.layout = sxaRenderingColumnSplitterVariant;
      mockSitecoreContext(page, componentMap);

      const component = sxaRenderingColumnSplitterVariant.sitecore.route as RouteData;
      const phKey = 'column-1-{*}';

      const renderedComponent = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: component,
        },
      });

      expect(renderedComponent.querySelectorAll('.rendering-variant').length).to.equal(1);
      expect(renderedComponent.querySelector('.rendering-variant')?.getAttribute('class')).to.equal(
        'rendering-variant col-9|col-sm-10|col-md-12|col-lg-6|col-xl-7|col-xxl-8 test-css-class-y'
      );
      expect(renderedComponent.querySelectorAll('.default').length).to.equal(1);
    });
  });
  /*
describe('BYOC fallback', () => {
  let byocComponentStub;
  let byocWrapperStub;

  const componentMap = new Map();

  it('should render', () => {
    const page = getPage();
    page.layout = byocWrapperData;
    const component = byocWrapperData.sitecore.route as RouteData;
    const phKey = 'main';

    byocComponentStub = stub(BYOCComponent, 'BYOCComponent').callsFake(() => (
      <p className="byoc-component">Foo</p>
    ));

    byocWrapperStub = stub(BYOCWrapper, 'BYOCWrapper').callsFake(() => (
      <div className="byoc-wrapper">
        <BYOCComponent.BYOCComponent />
      </div>
    ));

    const renderedComponent = render(
      <SitecoreProvider componentMap={componentMap} page={page}>
        <Placeholder name={phKey} rendering={component} />
      </SitecoreProvider>
    );

    expect(renderedComponent.container.querySelectorAll('.byoc-component').length).to.equal(2);
    expect(renderedComponent.container.querySelectorAll('.byoc-wrapper').length).to.equal(1);

    byocComponentStub.restore();
    byocWrapperStub.restore();
  });

  it('should render ErrorBoundary without Suspense for byoc wrapper', () => {
    const page = getPage();
    page.layout = byocWrapperData;
    const component = byocWrapperData.sitecore.route as RouteData;
    const phKey = 'main';

    byocComponentStub = stub(BYOCComponent, 'BYOCComponent').callsFake(() => (
      <p className="byoc-component">Foo</p>
    ));

    byocWrapperStub = stub(BYOCWrapper, 'BYOCWrapper').callsFake(() => (
      <div className="byoc-wrapper">
        <BYOCComponent.BYOCComponent />
      </div>
    ));

    const errorBoundarySpy = spy(ErrorBoundary, 'default');

    const renderedComponent = render(
      <SitecoreProvider componentMap={componentMap} page={page}>
        <Placeholder name={phKey} rendering={component} />
      </SitecoreProvider>
    );

    expect(errorBoundarySpy.calledWithMatch({ isDynamic: true })).to.be.true;
    expect(renderedComponent.container.innerHTML).to.not.contain('Loading component...');

    expect(renderedComponent.container.querySelectorAll('.byoc-wrapper').length).to.equal(1);

    const components = renderedComponent.container.querySelectorAll('.byoc-component');

    expect(components.length).to.equal(2);

    expect(components[0].textContent).to.equal('Foo');
    expect(components[1].textContent).to.equal('Foo');

    byocComponentStub.restore();
    byocWrapperStub.restore();
  });
});

describe('FEaaS fallback', () => {
  let feaasComponentStub;
  let feaasWrapperStub;

  const componentMap = new Map();

  it('should render', () => {
    const page = getPage();
    page.layout = feaasWrapperData;
    const component = feaasWrapperData.sitecore.route as RouteData;
    const phKey = 'main';

    feaasComponentStub = stub(FEAASComponent, 'FEaaSComponent').callsFake(() => (
      <p className="feaas-component">Foo</p>
    ));

    feaasWrapperStub = stub(FEAASWrapper, 'FEaaSWrapper').callsFake(() => (
      <div className="feaas-wrapper">
        <FEAASComponent.FEaaSComponent />
      </div>
    ));

    const renderedComponent = render(
      <SitecoreProvider componentMap={componentMap} page={page}>
        <Placeholder name={phKey} rendering={component} />
      </SitecoreProvider>
    );

    expect(renderedComponent.container.querySelectorAll('.feaas-component').length).to.equal(2);
    expect(renderedComponent.container.querySelectorAll('.feaas-wrapper').length).to.equal(1);

    feaasComponentStub.restore();
    feaasWrapperStub.restore();
  });
});

it('should render Suspense when disableSuspense is false', async () => {
  const page = getPage();
  page.layout = normalModeDevData;
  const component = normalModeDevData.sitecore.route as RouteData;
  const phKey = 'main';

  const renderedComponent = render(
    <SitecoreProvider componentMap={componentMap} page={page}>
      <Placeholder name={phKey} disableSuspense={false} rendering={component} />
    </SitecoreProvider>
  );

  expect(renderedComponent.container.innerHTML).to.contain('Loading component...');

  await findByText(renderedComponent.container, 'No error');
});

it('should not render Suspense when disableSuspense is true', async () => {
  const page = getPage();
  page.layout = normalModeDevData;
  const component = normalModeDevData.sitecore.route as RouteData;
  const phKey = 'main';

  const renderedComponent = render(
    <SitecoreProvider componentMap={componentMap} page={page}>
      <Placeholder name={phKey} disableSuspense={true} rendering={component} />
    </SitecoreProvider>
  );

  expect(renderedComponent.container.innerHTML).to.not.contain('Loading component...');

  await findByText(renderedComponent.container, 'No error');
});
*/
  test('should render null for unknown placeholder', async () => {
    const page = getPage();
    const route = {
      placeholders: {
        main: [
          {
            componentName: 'Home',
          },
        ],
      },
    } as unknown as RouteData;
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, componentMap);

    const phKey = 'unknown';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
      },
    });

    expect(renderedComponent?.innerHTML).to.be.empty;
  });

  test('should render error message on error', async () => {
    const components = new Map<string, AstroContentSdkComponent>();
    components.set('Home', Home);
    components.set('ThrowError', TestComponentWithError);

    const route = {
      placeholders: {
        main: [
          {
            componentName: 'ThrowError',
          },
        ],
      },
    } as unknown as RouteData;
    const page = getPage();
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, components);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
      },
    });

    expect(renderedComponent.querySelectorAll('.sc-content-sdk-placeholder-error').length).to.equal(
      1
    );
  });

  test('should render error message on error, only for the errored component', async () => {
    const components = new Map<string, AstroContentSdkComponent>();
    components.set('Home', Home);
    components.set('ThrowError', TestComponentWithError);

    components.set('Foo', TestWrapperComponent);

    const route = {
      placeholders: {
        main: [
          {
            componentName: 'ThrowError',
          },
          {
            componentName: 'Foo',
          },
        ],
      },
    } as unknown as RouteData;
    const page = getPage();
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, components);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
      },
    });

    expect(renderedComponent.querySelectorAll('.sc-content-sdk-placeholder-error').length).to.equal(
      1
    );
    expect(renderedComponent.querySelectorAll('div.wrapper').length).to.equal(1);
  });

  test('should render custom errorComponent on error, if provided', async () => {
    const page = getPage();
    const components = new Map<string, AstroContentSdkComponent>();

    components.set('Home', Home);
    components.set('ThrowError', TestComponentWithError);

    const route = {
      placeholders: {
        main: [
          {
            componentName: 'ThrowError',
          },
        ],
      },
    } as unknown as RouteData;
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, components);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
        errorComponent: CustomErrorComponent,
      },
    });

    expect(renderedComponent.querySelectorAll('.custom-error').length).to.equal(1);
  });

  test('should render MissingComponent for unknown rendering', async () => {
    const page = getPage();
    const route: any = {
      placeholders: {
        main: [
          {
            componentName: 'Unknown',
          },
        ],
      },
    };
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, componentMap);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
        missingComponentComponent: CustomMissingComponent,
      },
    });

    expect(renderedComponent.querySelectorAll('.missing-component').length).to.equal(1);
  });

  test('should render nothing for rendering without a name', async () => {
    const page = getPage();
    const componentMap = new Map<string, AstroContentSdkComponent>();

    componentMap.set('Test', TestWrapperComponent);

    const route: any = {
      placeholders: {
        main: [
          {
            componentName: 'Test',
          },
          {
            componentName: null,
          },
        ],
      },
    };
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, componentMap);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
      },
    });

    expect(renderedComponent.children.length).to.equal(1);
  });

  test('should render HiddenRendering when rendering is hidden', async () => {
    const page = getPage();
    const route: any = {
      placeholders: {
        main: [
          {
            componentName: 'Hidden Rendering',
          },
        ],
      },
    };
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, componentMap);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
      },
    });

    expect(renderedComponent.textContent).to.equal('The component is hidden');
  });

  test('should render custom HiddenRendering when rendering is hidden', async () => {
    const page = getPage();

    const route: any = {
      placeholders: {
        main: [
          {
            componentName: 'Hidden Rendering',
          },
        ],
      },
    };
    page.layout = {
      sitecore: {
        context: {},
        route,
      },
    };
    mockSitecoreContext(page, componentMap);

    const phKey = 'main';

    const renderedComponent = await renderAstroComponent(Placeholder, {
      props: {
        name: phKey,
        rendering: route,
        hiddenRenderingComponent: CustomHiddenRendering,
      },
    });

    expect(renderedComponent.querySelectorAll('.hidden-rendering').length).to.equal(1);
    expect(
      expect(renderedComponent.querySelector('.hidden-rendering p')?.textContent).to.equal(
        'Hidden Rendering'
      )
    );
  });

  describe('PlaceholderMetadata', () => {
    const {
      layoutData,
      layoutDataForNestedDynamicPlaceholder,
      layoutDataWithEmptyPlaceholder,
      layoutDataWithUnknownComponent,
    } = metadataData;

    const mode: PageMode = {
      name: LayoutServicePageState.Edit,
      isEditing: true,
      isNormal: false,
      isPreview: false,
      isDesignLibrary: false,
      designLibrary: {
        isVariantGeneration: false,
      },
    };

    let page: Page;

    beforeEach(() => {
      page = getPage();
      page.layout = layoutData;
      page.mode = mode;
      mockSitecoreContext(page, componentMap);
    });

    const componentMap = new Map<string, AstroContentSdkComponent>();

    componentMap.set('Header', TestHeader);
    componentMap.set('Logo', TestLogo);

    test('should render <PlaceholderMetadata> with nested placeholder components', async () => {
      const wrapper = await renderAstroComponent(Placeholder, {
        props: {
          name: 'main',
          rendering: layoutData.sitecore.route,
        },
      });

      expect(wrapper?.innerHTML).to.equal(
        [
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="nested123"></code>',
          '<div class="header-wrapper">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="logo_nested123"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="deep123"></code>',
          '<div class="Logo-mock"></div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
        ].join('')
      );

      expect(wrapper?.querySelectorAll('.scpm').length).to.equal(8);
    });

    test('should render code blocks even if placeholder is empty', async () => {
      page.layout = layoutDataWithEmptyPlaceholder;
      mockSitecoreContext(page, componentMap);

      const wrapper = await renderAstroComponent(Placeholder, {
        props: {
          name: 'main',
          rendering: layoutDataWithEmptyPlaceholder.sitecore.route,
        },
      });

      expect(wrapper.innerHTML).to.equal(
        [
          '<div class="sc-jss-empty-placeholder">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
        ].join('')
      );
    });

    test('should render missing component with code blocks if component is not registered', async () => {
      page.layout = layoutDataWithUnknownComponent;
      mockSitecoreContext(page, componentMap);

      const wrapper = await renderAstroComponent(Placeholder, {
        props: {
          name: 'main',
          rendering: layoutDataWithUnknownComponent.sitecore.route,
        },
      });

      expect(wrapper?.innerHTML).to.equal(
        [
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>',
          '<div style="background:darkorange;outline:5px solid orange;padding:10px;color:white;max-width:500px"><h2>Unknown</h2><p>Content SDK component is missing Astro implementation. See the developer console for more information.</p></div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render dynamic placeholder', async () => {
      const phKey = 'container-1';
      const layoutData = layoutDataForNestedDynamicPlaceholder('container-{*}');
      page.layout = layoutData;
      mockSitecoreContext(page, componentMap);

      const wrapper = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: layoutData.sitecore.route,
        },
      });

      expect(wrapper?.innerHTML).to.equal(
        [
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="container-{*}_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="nested123"></code>',
          '<div class="header-wrapper">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="logo_nested123"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="deep123"></code>',
          '<div class="Logo-mock"></div><code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
        ].join('')
      );

      expect(wrapper?.querySelectorAll('.scpm')?.length).to.equal(8);
    });

    test('should render double digit dynamic placeholder', async () => {
      const phKey = 'container-1-2';
      const layoutData = layoutDataForNestedDynamicPlaceholder('container-1-{*}');
      page.layout = layoutData;
      mockSitecoreContext(page, componentMap);

      const wrapper = await renderAstroComponent(Placeholder, {
        props: {
          name: phKey,
          rendering: layoutData.sitecore.route,
        },
      });

      expect(wrapper?.innerHTML).to.equal(
        [
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="container-1-{*}_00000000-0000-0000-0000-000000000000"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="nested123"></code>',
          '<div class="header-wrapper">',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="logo_nested123"></code>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="deep123"></code>',
          '<div class="Logo-mock"></div><code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
          '</div>',
          '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
          '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
        ].join('')
      );

      // 4 placeholders in total, 8 code blocks
      expect(wrapper?.querySelectorAll('.scpm').length).to.equal(8);
    });
  });
});

afterAll(() => {
  (global as any).window.close();
});
