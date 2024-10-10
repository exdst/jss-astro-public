<template>
    <div className="flex">
      <div>
        Count: {{ counter }}
      </div>
      <button v-on:click="counter += 1" class="btn btn-primary m-2">
        Increment
      </button>
      <button v-on:click="counter -= 1" class="btn btn-primary m-2">
        Decrement
      </button>
    </div>
</template>

<script>

import { ref } from 'vue'
export default {
  name: 'Counter',
  props: {
    count: {
      type: Number,
      default: 0,
    }
  },
  data(props) {
    return {
      counter: ref(props.count)
    }
  },
};
</script>