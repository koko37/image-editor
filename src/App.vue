<template>
  <div id="app">
    <ImageEditor />
  </div>
</template>

<script>
import './assets/styles/index.scss';
import ImageEditor from './components/ImageEditor.vue';

export default {
  name: 'App',
  components: {
    ImageEditor,
  },
};
</script>

<style lang="scss">
body {
  @apply bg-gray-800;
}

#app {
  @apply flex flex-col my-auto min-h-screen justify-center items-center;
}
</style>
