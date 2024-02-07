<template>
  <div
    class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom"
  >
    <h5 class="my-0 me-md-auto fw-normal">
      <a href="/" class="text-dark">
        <img src="../../public/sc_logo.svg" alt="Sitecore" />
      </a>
    </h5>
    <!-- note: `$t` is a computed property on the Vue instance, defined by the vue-i18n plugin -->
    <nav class="my-2 my-md-0 me-md-3">
      <a
        class="p-2 text-dark"
        href="https://jss.sitecore.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t('Documentation') }}
      </a>
      <a href="/styleguide" class="p-2 text-dark">
        {{ $t('Styleguide') }}
      </a>
    </nav>
  </div>
</template>

<script>
import { useTranslations } from '@astro-sitecore-jss/astro-sitecore-jss';

export default {
  name: 'Navigation',
  data() {
    return {
      contextButtonText: '',
    };
  },
  created() {
    // $t is a computed property, so it's not defined when initializing the `data` object.
    // Therefore, use the `created` hook to set the data.
    this.contextButtonText = this.$t('show-context-data');
  },
  methods: {
    $t(message) {
      const t = useTranslations();
      return t(message);
    },
  },
};
</script>
