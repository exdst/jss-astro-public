import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { mockSitecoreContext, renderAstroComponent } from '../tests/astro-helpers';
import { ComponentRendering, LayoutServicePageState } from '@sitecore-content-sdk/content/layout';
import { Page } from '@sitecore-content-sdk/content/client';
import CustomErrorComponent from '../tests/test-components/CustomErrorComponent.astro';
import ErrorBoundaryWithError from '../tests/test-components/ErrorBoundaryWithError.astro';

describe('ErrorBoundary', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const testComponentProps = {
    page: {
      locale: 'en',
      layout: {
        sitecore: {
          context: {},
          route: null,
        },
      },
      mode: {
        name: LayoutServicePageState.Normal,
        isPreview: false,
        isNormal: false,
        isEditing: false,
        isDesignLibrary: false,
        designLibrary: {
          isVariantGeneration: false,
        },
      },
    },
  };

  describe('when in page editing or preview mode', () => {
    test('Should render custom error component when custom error component is provided and error is thrown', async () => {
      const previewContext = { ...testComponentProps };

      previewContext.page.mode.isPreview = true;

      mockSitecoreContext(previewContext.page);

      const testComponentName = 'Test component Name';
      const rendering: ComponentRendering = {
        componentName: testComponentName,
      };

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { rendering: rendering, errorComponent: CustomErrorComponent },
      });

      expect(rendered.querySelectorAll('div').length).to.equal(1);
      expect(rendered.querySelector('div')?.textContent).to.equal(
        'This is a custom error component!'
      );
    });

    test('Should render errors message and errored component name when error is thrown in edit mode', async () => {
      const editingContext = {
        ...testComponentProps,
      };

      editingContext.page.mode.isEditing = true;
      mockSitecoreContext(editingContext.page);

      const testComponentName = 'Test component Name';
      const rendering: ComponentRendering = {
        componentName: testComponentName,
      };

      const errorMessage = 'an error occured';

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { rendering: rendering },
      });

      const ems = rendered.querySelectorAll('em');
      expect(rendered.innerHTML).to.contain('class="sc-content-sdk-placeholder-error"');
      expect(rendered.innerHTML).to.contain('A rendering error occurred in component');
      expect(ems.length).to.equal(2);
      expect(ems[0].textContent).to.equal(testComponentName);
      expect(ems[1].textContent).to.equal(errorMessage);
    });

    test('Should render errors message and errored component name when error is thrown in preview mode', async () => {
      const previewContext = { ...testComponentProps };

      previewContext.page.mode.isPreview = true;
      mockSitecoreContext(previewContext.page);

      const testComponentName = 'Test component Name';
      const rendering: ComponentRendering = {
        componentName: testComponentName,
      };

      const errorMessage = 'an error occured';

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { rendering: rendering },
      });

      const ems = rendered.querySelectorAll('em');

      expect(rendered.innerHTML).to.contain('class="sc-content-sdk-placeholder-error"');
      expect(rendered.innerHTML).to.contain('A rendering error occurred in component');
      expect(ems.length).to.equal(2);
      expect(ems[0].textContent).to.equal(testComponentName);
      expect(ems[1].textContent).to.equal(errorMessage);
    });
  });

  describe('when in development mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    afterAll(() => {
      delete process.env.NODE_ENV;
    });

    test('Should render custom error component when custom error component is provided and error is thrown', async () => {
      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { errorComponent: CustomErrorComponent },
      });

      expect(rendered.querySelectorAll('div').length).to.equal(1);
      expect(rendered.querySelector('div')?.textContent).to.equal(
        'This is a custom error component!'
      );
    });

    test('Should render errors message and errored component name when error is thrown and is in page editing mode', async () => {
      const editingContext = {
        ...testComponentProps,
      };
      editingContext.page.mode.isEditing = true;
      mockSitecoreContext(editingContext.page);

      const testComponentName = 'Test component Name';
      const rendering: ComponentRendering = {
        componentName: testComponentName,
      };

      const errorMessage = 'an error occured';

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { rendering: rendering },
      });

      const ems = rendered.querySelectorAll('em');
      expect(rendered.innerHTML).to.contain('class="sc-content-sdk-placeholder-error"');
      expect(rendered.innerHTML).to.contain('A rendering error occurred in component');
      expect(ems.length).to.equal(2);
      expect(ems[0].textContent).to.equal(testComponentName);
      expect(ems[1].textContent).to.equal(errorMessage);
    });

    test('Should render errors message and errored component name when error is thrown and is not in page editing mode', async () => {
      const normalContext = { ...testComponentProps };

      normalContext.page.mode.isNormal = true;
      mockSitecoreContext(normalContext.page);

      const testComponentName = 'Test component Name';
      const rendering: ComponentRendering = {
        componentName: testComponentName,
      };

      const errorMessage = 'an error occured';

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { rendering: rendering },
      });

      const ems = rendered.querySelectorAll('em');

      expect(rendered.innerHTML).to.contain('class="sc-content-sdk-placeholder-error"');
      expect(rendered.innerHTML).to.contain('A rendering error occurred in component');
      expect(ems.length).to.equal(2);
      expect(ems[0].textContent).to.equal(testComponentName);
      expect(ems[1].textContent).to.equal(errorMessage);
    });
  });

  describe('when not in page editing and not in development mode', () => {
    test('Should render custom error component when custom error component is provided and error is thrown', async () => {
      const page: Page = {
        locale: 'en',
        layout: {
          sitecore: {
            context: {},
            route: null,
          },
        },
        mode: {
          name: LayoutServicePageState.Normal,
          isNormal: false,
          isPreview: false,
          isEditing: false,
          isDesignLibrary: false,
          designLibrary: {
            isVariantGeneration: false,
          },
        },
      };

      mockSitecoreContext(page);

      const rendered = await renderAstroComponent(ErrorBoundaryWithError, {
        props: { errorComponent: CustomErrorComponent },
      });

      expect(rendered.querySelectorAll('div').length).to.equal(1);
      expect(rendered.querySelector('div')?.textContent).to.equal(
        'This is a custom error component!'
      );
    });

    test('Should render default errors message when error is thrown and custom error component is not provided', async () => {
      const errorMessage = 'an error occured';

      const page: Page = {
        locale: 'en',
        layout: {
          sitecore: {
            context: {},
            route: null,
          },
        },
        mode: {
          name: LayoutServicePageState.Normal,
          isNormal: false,
          isPreview: false,
          isEditing: false,
          isDesignLibrary: false,
          designLibrary: {
            isVariantGeneration: false,
          },
        },
      };

      mockSitecoreContext(page);

      const rendered = await renderAstroComponent(ErrorBoundaryWithError);

      expect(rendered.innerHTML).to.contain('class="sc-content-sdk-placeholder-error"');
      expect(rendered.innerHTML).to.contain(
        'There was a problem loading this section.' // eslint-disable-line
      );
      expect(rendered.querySelectorAll('em').length).to.equal(0);
      expect(rendered.innerHTML).to.not.contain(errorMessage);
    });
  });
});
