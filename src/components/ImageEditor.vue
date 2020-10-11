<template>
  <div class="main">
    <div class="container">
      <canvas id="editor"></canvas>
    </div>

    <div class="editor-tool">
      <div class="main-tool flex-grow">
        <Tool :event="() => onClickZoom()" :iconClass="'fas fa-search fa-lg'" :active="currentTool==='zoom'">Zoom</Tool>
        <div v-show="currentTool==='zoom'" class="subtool">
          <input type="range" name="zoom" id="zoom" min="0" max="100" class="w-full" />
        </div>

        <Tool
          :event="() => onClickApplyCrop()"
          :iconClass="'far fa-check-circle fa-lg'"
          v-show="croppedImage"
          :class="{ 'active-tool': currentActiveMethod === 'crop' }"
           :active="currentTool==='crop'"
        >
        Apply
        </Tool>

        <Tool
          :event="() => onClickCrop()"
          :iconClass="'fas fa-crop-alt fa-lg'"
          v-show="!croppedImage"
          :active="false"
        >
          Crop
        </Tool>
        
        <Tool :event="() => onClickMask()" :iconClass="'fas fa-mask fa-lg'" :active="currentTool==='mask'">Mask</Tool>
        <div v-show="currentTool==='mask'" class="subtool">
          Mask Tool
        </div>
        <Tool :event="() => onClickBlur()" :iconClass="'fas fa-stroopwafel fa-lg'" :active="currentTool==='blur'">Blur</Tool>
        <div v-show="currentTool==='blur'" class="subtool">
          <input type="range" name="blur" id="blur" min="0" max="100" class="w-full" />
        </div>
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
      currentTool: '',
    };
  },
  props: {
    canvasWidth: {
      default: 300,
    },
    canvasHeight: {
      default: 300,
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
    onClickZoom() {
      this.currentTool="zoom"
    },
    onClickCrop() {
      this.cropImage();
      this.currentTool="crop"
    },
    onClickApplyCrop() {
      this.applyCropping();
      this.currentTool=""
    },
    onClickMask() {
      this.currentTool="mask"
    },
    onClickBlur() {
      this.currentTool="blur"
    },
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
