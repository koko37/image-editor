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
        <div v-show="currentTool==='mask'" class="subtool flex flex-row justify-between">
          <div id="mask1" class="mask-select" :class="{'active': currentSubTool==='mask_1'}" @click="onClickMaskType('mask_1')">
            <img src="../assets/images/mask_1.png" ref="mask1"/>
          </div>
          <div id="mask2" class="mask-select" :class="{'active': currentSubTool==='mask_2'}" @click="onClickMaskType('mask_2')">
            <img src="../assets/images/mask_2.png" ref="mask2"/>
          </div>
          <div id="mask3" class="mask-select" :class="{'active': currentSubTool==='mask_3'}" @click="onClickMaskType('mask_3')">
            <img src="../assets/images/mask_3.png" ref="mask3"/>
          </div>
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
      imgUrl: null,
      scaleX: null,
      scaleY: null,

      currentTool: '',
      currentSubTool: '',
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
      // clear previous state
      this.deactiveCrop();
      this.currentSubTool = "";

      this.currentTool="zoom"
    },
    onClickCrop() {
      // clear previous state
      this.currentSubTool = "";

      this.currentTool="crop"

      const cropperWidth = this.canvas.width * 0.5;
      const cropperHeight = this.canvas.height * 0.5;
      const cornerSize = 10;
      const hasControls = true;
      const borderColor = '#000';
      const cornerColor = '#000';
      const cornerStyle = 'rect';
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
      console.log("start crop apply ...", JSON.stringify(this.imgUrl));

      let image;
      let inst = this;
      let backgroundImage = new Promise((resolve => {
        fabric.util.loadImage(inst.imgUrl, function (img) {

          image = new fabric.Image(img);
          image.set({
            top: (inst.rectRed.height / 2 - inst.rectRed.top + inst.clip.top),
            left: (inst.rectRed.width / 2 - inst.rectRed.left + inst.clip.left),
            originX: 'center',
            originY: 'center',
          })
          inst.canvas.setBackgroundImage(image, inst.canvas.renderAll.bind(inst.canvas));
          inst.canvas.setHeight(inst.rectRed.height * inst.rectRed.scaleY)
          inst.canvas.setWidth(inst.rectRed.width * inst.rectRed.scaleX)
          inst.canvas.calcOffset();
          inst.imgUrl = inst.canvas.toDataURL("image/jpeg", 1);
          resolve()
        })
      }));

      backgroundImage.then(() => {
        inst.canvas.setBackgroundImage(inst.imgUrl, inst.canvas.renderAll.bind(inst.canvas));
        inst.canvas.renderAll();
      });

      this.deactiveCrop();
      this.currentTool="";
    },
    onClickMask() {
      this.deactiveCrop();
      this.currentTool="mask";
      this.currentSubTool = "";
    },
    onClickMaskType(maskType) {
      console.log("sub type:", maskType);
      this.currentSubTool = maskType;
      let inst = this;
      let imgSrc = '';
      switch(maskType) {
        case 'mask_1':
          imgSrc = this.$refs.mask1.src;
          break;
        case 'mask_2':
          imgSrc = this.$refs.mask2.src;
          break;
        case 'mask_3':
          imgSrc = this.$refs.mask3.src;
          break;
      }
      fabric.Image.fromURL(imgSrc, function(maskImg){
        let newMaskImage = maskImg.set({left: 10, top: 10, width: maskImg.width, height: maskImg.height});
        inst.canvas.add(newMaskImage);
      })
    },
    onClickBlur() {
      // clear previous state
      this.deactiveCrop();
      this.currentSubTool = "";

      this.currentTool="blur";
    },
    deactiveCrop() {
      this.canvas.remove(this.clipOverlay);
      this.canvas.remove(this.rectRed);
    },
    saveImage() {
      const link = document.createElement('a');
      link.setAttribute('href', this.canvas.toDataURL("image/jpeg", 1));
      link.setAttribute('download', 'edit-result');
      link.click();
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
      let inst = this;

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

        inst.scaleX = inst.scaleY = imgDrawHeight / imgObj.height;

        console.log("img size:", imgObj.width, imgObj.height);
        console.log("canvas size:", imgDrawWidth, imgDrawHeight);
        console.log("scale:", inst.scaleX, inst.scaleY);

        this.canvas.setDimensions({
          width: imgDrawWidth,
          height: imgDrawHeight,
        });

        this.canvas.setBackgroundImage(this.imgUrl,
          this.canvas.renderAll.bind(this.canvas),
          {
            left: 0,
            top: 0,
            scaleX: inst.scaleX,
            scaleY: inst.scaleY,
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
