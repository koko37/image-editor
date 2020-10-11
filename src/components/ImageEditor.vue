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
          v-show="currentTool==='crop'"
          :class="{ 'active-tool': currentTool === 'crop' }"
           :active="currentTool==='crop'"
        >
        Apply
        </Tool>

        <Tool
          :event="() => onClickCrop()"
          :iconClass="'fas fa-crop-alt fa-lg'"
          v-show="currentTool!=='crop'"
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
import { fabric } from 'fabric';
import Tool from './Tool.vue';
import ToolUpload from './ToolUpload.vue';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  name: 'ImageEditor',
  components: {
    Tool,
    ToolUpload,
  },
  data() {
    return {
      imageUrl: null,
      currentTool: '',
      canvas: null,

      clipOverlay: null,
      clip: null,
      cropRegionMoving: false,
      rectRed: null,
    };
  },
  mounted() {
    this.canvas = new fabric.Canvas('editor');
    // let rect = new fabric.Rect({
    //   left: 10,
    //   top: 10,
    //   width: 20,
    //   height: 20,
    //   fill: 'red'
    // });
    // this.canvas.add(rect);

    // if (this.imageUrl) {
    //   this.$refs.editor.setBackgroundImage(this.imageUrl);
    //   this.croppedImage = this.$refs.editor.croppedImage;
    // }
    // this.$watch(
    //   () => {
    //     return this.$refs.editor.croppedImage;
    //   },
    //   (val) => {
    //     this.croppedImage = val;
    //   }
    // );
  },
  methods: {
    onClickZoom() {
      this.currentTool="zoom"
    },
    onClickCrop() {
      this.currentTool="crop"

      const cropperWidth = this.canvas.width * 0.5;
      const cropperHeight = this.canvas.height * 0.5;
      const cornerSize = 10;
      const hasControls = true;
      const borderColor = '#000';
      const cornerColor = '#000';
      const cornerStyle = 'circle';
      const transparentCorners = false;
      const hasRotatingPoint = false;
      const lockUniScaling = true;
      const noScaleCache = false;
      const strokeUniform = true;

      this.bindCropEvents();
      this.canvas.selectable = false;
      this.canvas.uniScaleTransform = true;
      this.canvas.renderAll();

      let inst = this;
      let src = this.canvas.toDataURL('image/jpeg', 1);
      new fabric.Image.fromURL(src, function (oImg) {
        inst.rectRed = new fabric.Rect({
          left: (oImg.width - cropperWidth) / 2,
          top: (oImg.height - cropperHeight) / 2,
          width: cropperWidth,
          height: cropperHeight,
          fill: '',
          imageWidth: oImg.width,
          imageHeight: oImg.height,
          cornerSize,
          hasControls,
          borderColor,
          cornerColor,
          cornerStyle,
          transparentCorners,
          hasRotatingPoint,
          lockUniScaling,
          noScaleCache,
          strokeUniform,

          clipTo: function (context) {
            context.translate(-this.width / 2, -this.height / 2);
            for (let x = 0; x <= this.width; x += this.width / 3) {
              context.moveTo(x, 0);
              context.lineTo(x, this.height);
            }
            for (let y = 0; y <= this.height; y += this.height / 3) {
              context.moveTo(0, y);
              context.lineTo(this.width, y);
            }
            context.strokeStyle = '#000';
            context.stroke();
          }
        });

        inst.rectRed.setControlsVisibility({
          tl: true,
          mt: true,
          tr: true,
          ml: true,
          mr: true,
          bl: true,
          mb: true,
          br: true,
          mtr: false,
        }),
        inst.canvas.add(inst.rectRed);
        inst.canvas.bringToFront(inst.rectRed);
        inst.canvas.setActiveObject(inst.rectRed)

        inst.clip = {
          left: inst.rectRed.left,
          top: inst.rectRed.top,
          right: inst.rectRed.width + inst.rectRed.left,
          bottom: inst.rectRed.height + inst.rectRed.top
        }
        inst.clipOverlay = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + inst.clip.top + ' H ' + inst.clip.left + ' V '
          + inst.clip.bottom + ' H ' + inst.clip.right + ' V ' + inst.clip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z', {
          left: 0,
          top: 0,
          fill: '#fff',
          opacity: 0.7,
          selectable: false
        });
        inst.canvas.add(inst.clipOverlay);
      });
      this.canvas.renderAll();
    },
    onClickApplyCrop() {
      this.currentTool=""
    },
    onClickMask() {
      this.currentTool="mask"
    },
    onClickBlur() {
      this.currentTool="blur"
    },
    cropImage() {
      // this.setTool('crop');
    },
    applyCropping() {
      // this.$refs.editor.applyCropping();
    },
    saveImage() {
      // const image = this.$refs.editor.saveImage();
      // this.saveImageAsFile(image);
    },
    saveImageAsFile(base64) {
      // const link = document.createElement('a');
      // link.setAttribute('href', base64);
      // link.setAttribute('download', 'image-markup');
      // link.click();
    },
    setTool(type, params) {
      // this.currentActiveMethod = type;
      // this.$refs.editor.set(type, params);
    },
    bindCropEvents() {
      let inst = this;
      inst.canvas.on("mouse:down", function (o) {
        console.log("down ...");
        inst.cropRegionMoving = true;
      });
      inst.canvas.on("mouse:up", function (o) {
        console.log("up ...");
        inst.cropRegionMoving = false;
      });
      inst.canvas.on("object:scaling", function (e) {
        console.log("scaling ...");
        if (inst.cropRegionMoving === false) return;
        let target = e.target;
        let newClip = {
          left: target.left,
          top: target.top,
          right: inst.canvas.width - target.left + (target.left - inst.clip.left) * 2 + (target.width * target.scaleX) - target.width,
          bottom: inst.canvas.height - target.top + (target.top - inst.clip.top) * 2 + (target.height * target.scaleY) - target.height
        }
        let updatedPath = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + newClip.top + ' H ' + newClip.left + ' V '
          + newClip.bottom + ' H ' + newClip.right + ' V ' + newClip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z');
        inst.clipOverlay.set({
          path: updatedPath.path,
        });
        inst.clipOverlay.setCoords();

        inst.canvas.bringToFront(inst.rectRed);
        inst.canvas.setActiveObject(inst.rectRed)

        inst.canvas.renderAll()

      });
      inst.canvas.on('object:moving', function (e) {
        console.log("moving ...");
        if (inst.cropRegionMoving === false) return;

        let target = e.target;
        let newClip = {
          left: target.left,
          top: target.top,
          right: inst.canvas.width - target.left + (target.left - inst.clip.left) * 2 + (target.width * target.scaleX) - target.width,
          bottom: inst.canvas.height - target.top + (target.top - inst.clip.top) * 2 + (target.height * target.scaleY) - target.height
        }
        let updatedPath = new fabric.Path('M 0 0 H ' + inst.canvas.width + ' V ' + newClip.top + ' H ' + newClip.left + ' V '
          + newClip.bottom + ' H ' + newClip.right + ' V ' + newClip.top + ' H ' + inst.canvas.width + ' V ' + inst.canvas.height + ' H 0 Z');

        inst.clipOverlay.set({
          path: updatedPath.path,
        });
        inst.clipOverlay.setCoords();

        inst.canvas.bringToFront(inst.rectRed);
        inst.canvas.setActiveObject(inst.rectRed)
        inst.canvas.renderAll();
      });

    },
    uploadImage(e) {
      this.imgUrl = URL.createObjectURL(e.target.files[0]);
      let imgObj = new Image();
      const imgHeightLimit = Math.round(window.innerHeight * 0.8);
      const imgWidthLimit = Math.round(window.innerWidth * 0.8);
      let imgDrawWidth, imgDrawHeight;
      let scaleX, scaleY;

      imgObj.src = this.imgUrl;
      imgObj.onload = () => {
        const imgSizeAspect = imgObj.width / imgObj.height;

        // adjust image size to draw
        if (imgObj.height > imgHeightLimit) {
          imgDrawHeight = imgHeightLimit;
          imgDrawWidth = Math.round(imgHeightLimit * imgSizeAspect);
        } else {
          imgDrawWidth = imgObj.width;
          imgDrawHeight = imgObj.height;
        }
        if (imgDrawWidth > imgWidthLimit) {
          imgDrawWidth = imgWidthLimit;
          imgDrawHeight = Math.round(imgDrawWidth / imgSizeAspect);
        } 

        scaleX = scaleY = imgDrawHeight / imgObj.height;

        console.log("img size:", imgObj.width, imgObj.height);
        console.log("canvas size:", imgDrawWidth, imgDrawHeight);
        console.log("scale:", scaleX, scaleY);

        this.canvas.setDimensions({
          width: imgDrawWidth,
          height: imgDrawHeight,
        });

        this.canvas.setBackgroundImage(this.imgUrl,
          this.canvas.renderAll.bind(this.canvas),
          {
            left: 0,
            top: 0,
            scaleX: scaleX,
            scaleY: scaleY,
          }
        );
        this.canvas.renderAll();
      }
    },
    clear() {
      // this.currentActiveMethod = this.clear;
      // this.$refs.editor.clear();
    },
  },
};
</script>
