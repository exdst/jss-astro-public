import { isEditorActive } from '@sitecore-jss/sitecore-jss-vue';

const refreshPlaceholdersState = ():void => {
  
  if (isEditorActive()) {
    // Sitecore renders placeholders with attribute `phkey` instead of `key`
    // due to backward compatibility with the old versions.
    // This attribute name is changed on client side by Sitecore scripts in EE.
    // We render placeholders on the client side by React in case of any overlay.
    // It make required to set the `key` attribute name by ourselves
    // because otherwise placehlders will not work properly.
    
    const chromeTags = document.getElementsByTagName('code');
    for (let i = 0; i < chromeTags.length; i++) {
      const element = chromeTags[i];
      if (element.attributes.getNamedItem('phkey') !== undefined) {
        const phKey = element.attributes.getNamedItem('phkey')?.value ?? '';
        if(element.attributes.getNamedItem('key')?.value === undefined) {
          element.setAttribute('key', phKey);
        }
      }
    }

    // Sitecore ChromeManager gets wrong state of "chromes" when it is not mounted on server side.
    // So we need to reset up the state when the component is mounted/unmounted
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    window.top.Sitecore.PageModes.ChromeManager.resetChromes();
  }
};

export default refreshPlaceholdersState;