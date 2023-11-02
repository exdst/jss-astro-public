<template>
    <div className="flex">
      <div>
        Count: {{ count }}
      </div>
      <button v-on:click="count += 1" class="btn btn-primary m-2">
        Increment
      </button>
      <button v-on:click="count -= 1" class="btn btn-primary m-2">
        Decrement
      </button>
    </div>
</template>

<script>
export default {
  name: 'Counter',
  props: {
    count: {
      type: Number,
      default: 0,
    }
  }
};
</script>