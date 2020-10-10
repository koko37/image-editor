<template>
  <div class="tool">
    <label for="chooseImage" class="tool-upload__label">
      <i :class="iconClass"></i>
      <div class="tool__description"><slot></slot></div>
    </label>
    <input
      id="chooseImage"
      style="visibility: hidden; width:0;"
      type="file"
      @change="event"
      accept="image/*"
    />
  </div>
</template>

<script>
export default {
  name: 'tool',
  props: ['event', 'iconClass'],
};
</script>
