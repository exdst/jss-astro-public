<!--
  Demonstrates gaining access to root route-level data from within components.
-->
<template>
  <div data-e2e-id="styleguide-customroutetype">
    <sc-text tag="h3" :field="routeData.fields.headline" />

    <p>
      <em> By <sc-text :field="routeData.fields.author" /> </em>
    </p>

    <sc-rich-text :field="routeData.fields.content" />

    <a href="/styleguide">Return to the Styleguide</a>
  </div>
</template>

<script>
import { Text, RichText } from '@sitecore-jss/sitecore-jss-vue';
import { SitecoreContextMap } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Styleguide-CustomRouteType',
  props: {
    fields: {
      type: Object,
    },
    rendering: {
      type: Object,
    },
  },
  components: {
    ScText: Text,
    ScRichText: RichText,
  },
  computed: {
    routeData() {
      return SitecoreContextMap.get()["scContext"]?.route;
    },
  },
};
</script>
