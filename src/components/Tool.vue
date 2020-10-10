<template>
  <div @click="event" class="tool" :class="{'active': active}" ref="holder">
    <i :class="iconClass"></i>
    <div class="tool__description"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: 'tool',
  props: ['event', 'iconClass', 'active'],
};
</script>