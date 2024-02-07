<template>
  <sc-placeholder
    name="jss-main"
    :rendering="rendering"
    :params="params"
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
