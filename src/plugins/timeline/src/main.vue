<template>
  <ul class="el-timeline"
    :class="{
      'is-reverse': reverse
    }">
    <slot></slot>
  </ul>
</template>

<script setup>
  import { watch } from 'vue'
  const props = defineProps({ 
      reverse: {
        type: Boolean,
        default: false
      }
  })

  watch(props.reverse, (newVal) => {
        if (newVal) {
          $slots.default = [...$slots.default].reverse()
  }}, {immediate: true})

</script>
