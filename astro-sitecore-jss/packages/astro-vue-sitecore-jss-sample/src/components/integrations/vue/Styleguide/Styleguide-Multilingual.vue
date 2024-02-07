<!--
  Demonstrates using the dictionary functionality and defining route data in
  multiple languages.
-->
<template>
  <styleguide-specimen v-bind="$props" data-e2e-id="styleguide-multilingual">
    <sc-text :field="fields.sample" :encode="false" tag="p" />

    <p>
      This is a static dictionary entry from <code>/data/dictionary</code>:&nbsp;{{
        $t('styleguide-sample')
      }}
    </p>

    <p>
      <a href="/en/styleguide">Show in English</a>
      <br />
      <a href="/da-DK/styleguide">Show in da-DK</a>
    </p>

    <!-- $i18n is attached to the App instance by the vue-i18n plugin -->
    <p>The current language is: </p>
  </styleguide-specimen>
</template>

<script>
import { Text } from '@sitecore-jss/sitecore-jss-vue';
import StyleguideSpecimen from './Styleguide-Specimen.vue';
import { useTranslations } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Styleguide-Multilingual',
  props: {
    fields: {
      type: Object,
    },
    rendering: {
      type: Object,
    },
  },
  methods: {
    $t(message) {
      const t = useTranslations();
      return t(message);
    }
  },
  components: {
    StyleguideSpecimen,
    ScText: Text,
  },
};
</script>
