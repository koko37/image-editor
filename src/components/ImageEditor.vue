<template>
  <div class="main">
    <div class="editor-container">
      <Editor
        :canvasWidth="canvasWidth"
        :canvasHeight="canvasHeight"
        ref="editor"
      />
    </div>

    <div class="editor-tool">
      <div class="main-tool flex-grow">
        <Tool :event="() => saveImage()" :iconClass="'fas fa-search fa-lg'">Zoom</Tool>

        <Tool
          :event="() => applyCropping()"
          :iconClass="'far fa-check-circle fa-lg'"
          v-show="croppedImage"
          :class="{ 'active-tool': currentActiveMethod === 'crop' }"
        >
        Apply
        </Tool>

        <Tool
          :event="() => cropImage()"
          :iconClass="'fas fa-crop-alt fa-lg'"
          v-show="!croppedImage"
        >
          Crop
        </Tool>
        
        <Tool :event="() => saveImage()" :iconClass="'fas fa-mask fa-lg'">Mask</Tool>
        <Tool :event="() => saveImage()" :iconClass="'fas fa-stroopwafel fa-lg'">Blur</Tool>
      </div>
      <div class="load-tool flex-grow-0">
        <ToolUpload
          :event="(e) => uploadImage(e)"
          :iconClass="'fas fa-file-upload fa-lg'"
        >
          Upload
        </ToolUpload>

        <Tool :event="() => saveImage()" :iconClass="'fas fa-save fa-lg'">Save</Tool>
      </div>
    </div>
  </div>
</template>

<script>
import Editor from './Editor.vue';
import Tool from './Tool.vue';
import ToolUpload from './ToolUpload.vue';
import ColorPicker from './ColorPicker.vue';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  name: 'ImageEditor',
  components: {
    ColorPicker,
    Tool,
    ToolUpload,
    Editor,
  },
  data() {
    return {
      currentActiveMethod: null,
      params: {},
      imageUrl: null,
      croppedImage: false,
    };
  },
  props: {
    canvasWidth: {
      default: 200,
    },
    canvasHeight: {
      default: 200,
    },
    event: {
      type: Function,
    },
    labelForUploadImage: {
      type: Boolean,
      default: false,
    },
    iconClass: {
      type: String,
    },
  },
  mounted() {
    if (this.imageUrl) {
      this.$refs.editor.setBackgroundImage(this.imageUrl);
      this.croppedImage = this.$refs.editor.croppedImage;
    }
    this.$watch(
      () => {
        return this.$refs.editor.croppedImage;
      },
      (val) => {
        this.croppedImage = val;
      }
    );
  },
  methods: {
    cropImage() {
      this.currentActiveMethod = 'crop';
      this.setTool('crop');
    },
    applyCropping() {
      this.currentActiveMethod = '';
      this.$refs.editor.applyCropping();
    },
    saveImage() {
      const image = this.$refs.editor.saveImage();
      this.saveImageAsFile(image);
    },
    saveImageAsFile(base64) {
      const link = document.createElement('a');
      link.setAttribute('href', base64);
      link.setAttribute('download', 'image-markup');
      link.click();
    },
    setTool(type, params) {
      this.currentActiveMethod = type;
      this.$refs.editor.set(type, params);
    },
    uploadImage(e) {
      this.$refs.editor.uploadImage(e);
    },
    clear() {
      this.currentActiveMethod = this.clear;
      this.$refs.editor.clear();
    },
  },
};
</script>

<style lang="scss">
$toolbar-height--mobile: 80px;
$toolbar-width--md: 240px;

.editor-tool {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: $toolbar-height--mobile;

  @apply flex flex-row w-full justify-around bg-gray-600 text-white;

  @screen md{
    position: fixed;
    left: auto;
    top: 0;
    bottom: 0;
    right: 0;
    width: $toolbar-width--md;

    @apply flex-col justify-between h-full;
  }

  & > div {
    @apply flex flex-row;

    @screen md{
      @apply flex-col;
    }
  }
}

.editor-container {
  margin-bottom: $toolbar-height--mobile;
  @apply mx-auto;

  @screen md {
    margin-right: $toolbar-width--md;
  }
}
canvas {
  border: 1px solid #00000021;
}
</style>
