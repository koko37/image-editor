<template>
  <div class="main">
    <div class="editor-container">
      <div class="editor">
        <div class="current-color" :style="{ backgroundColor: color }"></div>

        <Tool :event="() => undo()" :iconClass="'fas fa-undo-alt fa-lg'" />

        <Tool :event="() => redo()" :iconClass="'fas fa-redo-alt fa-lg'" />

        <Tool :event="() => clear()" :iconClass="'fas fa-trash-alt fa-lg'" />

        <Tool
          :event="() => setTool('freeDrawing')"
          :iconClass="'fas fa-pencil-alt fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'freeDrawing' }"
        />

        <Tool
          :event="() => setTool('text')"
          :iconClass="'fas fa-font fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'text' }"
        />

        <Tool
          :event="() => setTool('circle')"
          :iconClass="'far fa-circle fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'circle' }"
        />

        <Tool
          :event="() => setTool('rect')"
          :iconClass="'far fa-square fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'rect' }"
        />

        <Tool
          :event="() => setTool('arrow')"
          :iconClass="'fas fa-long-arrow-alt-down fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'arrow' }"
        />

        <Tool
          :event="() => setTool('selectMode')"
          :iconClass="'fas fa-arrows-alt fa-lg'"
          :class="{ 'active-tool': currentActiveMethod === 'selectMode' }"
        />

        <Tool
          :event="() => applyCropping()"
          :iconClass="'far fa-check-circle fa-lg'"
          v-show="croppedImage"
          :class="{ 'active-tool': currentActiveMethod === 'crop' }"
        />

        <Tool
          :event="() => cropImage()"
          :iconClass="'fas fa-crop-alt fa-lg'"
          v-show="!croppedImage"
        />

        <Tool
          :event="(e) => uploadImage(e)"
          :iconClass="'fas fa-file-upload fa-lg'"
          :labelForUploadImage="true"
        />
        <Tool :event="() => saveImage()" :iconClass="'fas fa-save fa-lg'" />
      </div>
      <Editor
        :canvasWidth="canvasWidth"
        :canvasHeight="canvasHeight"
        ref="editor"
      />
    </div>
    <div class="colors">
      <ColorPicker :color="'#e40000'" :event="changeColor" />
      <ColorPicker :color="'#e8eb34'" :event="changeColor" />
      <ColorPicker :color="'#a834eb'" :event="changeColor" />
      <ColorPicker :color="'#65c31a'" :event="changeColor" />
      <ColorPicker :color="'#34b7eb'" :event="changeColor" />
      <ColorPicker :color="'#eb34df'" :event="changeColor" />
      <ColorPicker :color="'#1a10ad'" :event="changeColor" />
      <ColorPicker :color="'#000000'" :event="changeColor" />
    </div>
  </div>
</template>

<script>
import Editor from './Editor.vue';
import Tool from './Tool.vue';
import ColorPicker from './ColorPicker.vue';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  name: 'ImageEditor',
  components: {
    ColorPicker,
    Tool,
    Editor,
  },
  data() {
    return {
      currentActiveMethod: null,
      params: {},
      color: 'black',
      imageUrl: null,
      croppedImage: false,
    };
  },
  props: {
    canvasWidth: {
      default: 600,
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
    canvasHeight: {
      default: 600,
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
    changeColor(colorHex) {
      this.color = colorHex;
      this.$refs.editor.changeColor(colorHex);
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
    undo() {
      this.currentActiveMethod = this.undo;
      this.$refs.editor.undo();
    },
    redo() {
      this.currentActiveMethod = this.redo;
      this.$refs.editor.redo();
    },
  },
};
</script>

<style lang="scss">
.main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  .editor-container {
    display: flex;
    flex-direction: column;
    .editor {
      display: flex;
      justify-content: space-between;
      .current-color {
        border-radius: 5px;
        min-width: 28px;
        min-height: 28px;
      }
      .active-tool {
        cursor: pointer;
        color: #4287f5;
      }
    }
  }

  .colors {
    display: flex;
    flex-direction: column;
    margin: 40px 25px 0 25px;
    align-items: center;
    justify-content: center;
  }
}

.custom-editor {
  margin-top: 20px;
}

canvas {
  border: 1px solid #00000021;
}
</style>
