<!--
  This is a single tab within the tabs sample component. These are added to the tabs placeholder.
  This component demonstrates conditionally altering rendering when in the Sitecore Experience Editor to improve
  author experience.
-->
<template>
  <div data-e2e-class="styleguide-layout-tabs-tab">
    <sc-text v-if="isEditing" tag="h5" :field="fields.title" />
    <sc-rich-text :field="fields.content" />
  </div>
</template>

<script>
import { RichText, Text } from '@sitecore-jss/sitecore-jss-vue';
import { SitecoreContextMap } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Styleguide-Layout-Tabs-Tab',
  props: {
    fields: {
      type: Object,
    },
    rendering: {
      type: Object,
    },
    params: {
      type: Object,
    },
  },
  components: {
    ScText: Text,
    ScRichText: RichText,
  },
  computed: {
    isEditing() {
      return SitecoreContextMap.get()["scContext"]?.pageEditing;
    },
  },
};
</script>
