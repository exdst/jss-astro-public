<!--
  Demonstrates gaining access to route-level fields.
  This technique builds on the Styleguide-SitecoreContext technique,
  to also get the route level field data and make it editable.
-->
<template>
  <styleguide-specimen v-bind="$props" data-e2e-id="styleguide-route-fields">
    <p>
      Route level <code>pageTitle</code> field:&nbsp;
      <sc-text :field="routeData.fields.pageTitle" />
    </p>
    <p>
      <a href="/styleguide/custom-route-type"
        >Sample of using a custom route type</a
      >
    </p>
  </styleguide-specimen>
</template>

<script>
import { Text } from '@sitecore-jss/sitecore-jss-vue';
import StyleguideSpecimen from './Styleguide-Specimen.vue';
import { SitecoreContextMap } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Styleguide-RouteFields',
  props: {
    fields: {
      type: Object,
    },
    rendering: {
      type: Object,
    },
  },
  components: {
    StyleguideSpecimen,
    ScText: Text,
  },
  computed: {
    routeData() {
      return SitecoreContextMap.get()["scContext"]?.route;
    },
  },
};
</script>
