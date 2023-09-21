import { SitecoreContextMap } from '../context';

export function useTranslations() {
  return function t(key: string) {
    const dictionary = SitecoreContextMap.get()['dictionary'];    
    if(!dictionary) {
      return key;
    }
    return dictionary[key]; 
  }
}