<template>
  <li class="el-timeline-item">
    <div class="el-timeline-item__tail"></div>

    <div v-if="!$slots.dot"
      class="el-timeline-item__node"
      :class="[
        `el-timeline-item__node--${props.size || ''}`,
        `el-timeline-item__node--${props.type || ''}`
      ]"
      :style="{
        backgroundColor: props.color
      }"
    >
      <i v-if="icon"
        class="el-timeline-item__icon"
        :class="icon"
      ></i>
    </div>

    <div class="el-timeline-item__wrapper">
      <div v-if="!props.hideTimestamp && props.placement === 'top'"
        class="el-timeline-item__timestamp is-top">
        {{props.timestamp}}
      </div>

      <div class="el-timeline-item__content">
        <slot></slot>
      </div>

      <div v-if="!hideTimestamp && placement === 'bottom'"
        class="el-timeline-item__timestamp is-bottom">
        {{props.timestamp}}
      </div>
    </div>
  </li>
</template>

<script setup>

  const props = defineProps({
    timestamp: String,

    hideTimestamp: {
      type: Boolean,
      default: false
    },

    placement: {
      type: String,
      default: 'bottom'
    },

    type: String,

    color: String,

    size: {
      type: String,
      default: 'normal'
    },

    icon: String
  })

</script>
