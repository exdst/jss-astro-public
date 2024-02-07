import type { LayoutService, LayoutServiceData } from "@sitecore-jss/sitecore-jss/layout";
import { layoutServiceFactory } from "../layout-service-factory";
import { dictionaryServiceFactory } from "../dictionary-service-factory";
import { DictionaryService, DictionaryPhrases } from '@sitecore-jss/sitecore-jss/i18n';
import config from "../../temp/config";

export class SitecorePagePropsFactory {

  private layoutService: LayoutService;
  private dictionaryService: DictionaryService;

  constructor() {
    this.dictionaryService = dictionaryServiceFactory.create();
    this.layoutService = layoutServiceFactory.create();
  }
  
  /**
   * Create SitecorePageProps for given context (SSR / GetServerSidePropsContext or SSG / GetStaticPropsContext)
   * @param {GetServerSidePropsContext | GetStaticPropsContext} context
   * @see SitecorePageProps
   */
  public async create(
    path: string,
    language?: string
  ): Promise<any> {

    let layout: LayoutServiceData = await this.layoutService.fetchLayoutData(path, language || config.defaultLanguage);   
    let dictionary: DictionaryPhrases = await this.dictionaryService.fetchDictionaryData(language || config.defaultLanguage);

    let props = {
      layoutData: layout,
      dictionary: dictionary, 
    };
    
    return props;
  }
}

export const sitecorePagePropsFactory = new SitecorePagePropsFactory();