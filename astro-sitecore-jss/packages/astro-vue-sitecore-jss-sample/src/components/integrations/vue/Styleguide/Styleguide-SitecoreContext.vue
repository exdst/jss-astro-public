<!--
  Demonstrates gaining access to the route-level Sitecore Context from
  within other components.
-->
<template>
  <styleguide-specimen v-bind="$props" data-e2e-id="styleguide-sitecore-context">
    <p>The current Sitecore Context is...</p>
    <pre :style="{ maxHeight: '400px', overflow: 'scroll' }">
  {{ JSON.stringify(sitecoreContext, null, 2) }}
    </pre>
  </styleguide-specimen>
</template>

<script>
import StyleguideSpecimen from './Styleguide-Specimen.vue';
import { SitecoreContextMap } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Styleguide-SitecoreContext',
  props: {
    fields: {
      type: Object,
    },
    rendering: {
      type: Object,
    },
  },
  computed: {
    sitecoreContext() {
      return SitecoreContextMap.get()["scContext"];
    },
  },
  components: {
    StyleguideSpecimen,
  },
};
</script>
