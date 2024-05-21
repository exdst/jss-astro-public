<template>
  <sc-placeholder
    name="vue"
    :rendering="rendering"
    :params="params"
    :componentFactory="componentFactory"
  />
</template>

<script>
import { Placeholder } from '@sitecore-jss/sitecore-jss-vue';

export default {
  name: 'Placeholder',
  props: {
    rendering: {
      type: Object,
    },
    params: {
      type: Object,
    },
    componentFactory: {
      type: Function,
    },
  },
  components: {
    ScPlaceholder: Placeholder,
  },
};
</script>
