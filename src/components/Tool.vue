<template>
  <div @click="event" class="tool" ref="holder">
    <i :class="iconClass"></i>
    <div class="tool__description"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: 'tool',
  props: ['event', 'iconClass'],
};
</script>