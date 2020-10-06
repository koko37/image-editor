<template>
  <div
    class="color-picker"
    :style="{ backgroundColor: color ? color : '' }"
    @click="event(color)"
  ></div>
</template>
<script>
export default {
  name: 'colorPicker',
  props: ['color', 'event'],
};
</script>

<style scoped lang="scss">
.color-picker {
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin: 5px 0;
  cursor: pointer;
}
</style>
