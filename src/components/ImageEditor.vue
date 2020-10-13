<template>
  <div class="main">
    <div class="container">
      <canvas id="editor"></canvas>
    </div>

    <div class="editor-tool">
      <div class="main-tool flex-grow">
        <Tool :event="() => onClickZoom()" :iconClass="'fas fa-search fa-lg'" :active="currentTool==='zoom'">Zoom</Tool>
        <div v-show="currentTool==='zoom'" class="subtool">
          <input type="range" name="zoom" id="zoomSlider" min="0" max="100" class="w-full" value="0" @change="onZoomDegreeChanged" />
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
          <input type="range" name="blur" id="blurSlider" min="0" max="100" class="w-full" value="0" @change="onBlurDegreeChanged" />
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
      originalWidth: null,
      originalHeight: null,
      currentZoom: 1,

      currentTool: '',
      currentSubTool: '',
      canvas: null,

      clipOverlay: null,
      clip: null,
      cropRegionMoving: false,
      rectRed: null,
      bgImage: null,

      blurFilter: null,
    };
  },
  mounted() {
    this.canvas = new fabric.Canvas('editor');
  },
  methods: {
    onClickZoom() {
      // clear previous state
      this.deactiveCrop();
      this.currentSubTool = "";

      this.currentTool="zoom"
    },
    onZoomDegreeChanged(e) {
      const intensity = parseFloat(e.target.value)/150 + 1;
      console.log("zoom intensity:", intensity);
      this.canvas.setDimensions({
          width: this.originalWidth * intensity,
          height: this.originalHeight * intensity,
        });
      this.canvas.setZoom(intensity);
      this.currentZoom = intensity;
      // this.canvas.getObjects().forEach((obj) => {
      //   obj.scaleX = intensity;
      //   obj.scaleY = intensity;
      //   obj.left = obj.left * intensity;
      //   obj.top = obj.top * intensity;
      //   obj.setCoords();
      // });
      this.canvas.renderAll();
      this.canvas.calcOffset();
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
        console.log("croper size:", cropperWidth, cropperHeight);
        console.log("oImage size:", oImg.width, oImg.height);
        
        inst.rectRed = new fabric.Rect({
          left: (oImg.width - cropperWidth) / 2 / inst.currentZoom,
          top: (oImg.height - cropperHeight) / 2 / inst.currentZoom,
          width: cropperWidth / inst.currentZoom,
          height: cropperHeight / inst.currentZoom,
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
      let image;
      let inst = this;
      const selectedRect = inst.rectRed;
      const clipRect = inst.clip;

      inst.canvas.remove(inst.clipOverlay);
      inst.canvas.remove(inst.rectRed);
      inst.imgUrl = inst.canvas.toDataURL("image/jpeg", 1);
      console.log("selectedRect: ", selectedRect.left, selectedRect.top, selectedRect.width, selectedRect.height);
      inst.canvas.clear();
      
      inst.canvas.setWidth(inst.rectRed.width * inst.rectRed.scaleX * inst.currentZoom);
      inst.canvas.setHeight(inst.rectRed.height * inst.rectRed.scaleY * inst.currentZoom);

      fabric.Image.fromURL(this.imgUrl, function(newImg){
        console.log("crop: ", selectedRect.width * inst.currentZoom, selectedRect.height * inst.currentZoom);
        inst.bgImage = newImg.set({
          left: (selectedRect.width / 2 - selectedRect.left + clipRect.left),
          top: (selectedRect.height / 2 - selectedRect.top + clipRect.top),
          scaleX: 1 / inst.currentZoom,
          scaleY: 1 / inst.currentZoom,
          originX: 'center',
          originY: 'center'
        });
        
        inst.bgImage.selectable = false;

        // save image size
        inst.originalWidth = inst.canvas.width;
        inst.originalHeight = inst.canvas.height;

        inst.canvas.add(inst.bgImage);
        inst.canvas.renderAll();
        inst.currentZoom = 1;
      });

      this.deactiveCrop();
      this.currentTool="";
      this.cropRegionMoving = false;
      document.getElementById('zoomSlider').value = 0;
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
        inst.canvas.setActiveObject(newMaskImage);
      });
    },
    onClickBlur() {
      // clear previous state
      this.deactiveCrop();
      this.currentSubTool = "";
      this.currentTool="blur";
    },
    onBlurDegreeChanged(e) {
      const intensity = parseFloat(e.target.value)/100;
      console.log("blur intensity:", intensity);
      this.blurFilter = new fabric.Image.filters.Blur({
        blur: intensity
      });
      let inst = this;
      inst.canvas.getObjects().forEach((obj) => {
        obj.filters.pop();
        obj.filters.push(inst.blurFilter);
        obj.applyFilters();
      });
      this.canvas.renderAll();
    },
    deactiveCrop() {
      this.canvas.remove(this.clipOverlay);
      this.canvas.remove(this.rectRed);
    },
    clearState() {
      this.deactiveCrop();
      this.canvas.clear();
      this.canvas.setZoom(1);
      this.currentZoom = 1;

      document.getElementById('zoomSlider').value = 0;
      document.getElementById('blurSlider').value = 0;

      this.currentSubTool = "";
      this.currentTool = "";
    },
    saveImage() {
      const link = document.createElement('a');
      link.setAttribute('href', this.canvas.toDataURL("image/png", 1));
      link.setAttribute('download', 'edit-result');
      link.click();
    },
    bindCropEvents() {
      let inst = this;
      inst.canvas.on("mouse:down", function (o) {
        inst.cropRegionMoving = true;
      });
      inst.canvas.on("mouse:up", function (o) {
        inst.cropRegionMoving = false;
      });
      inst.canvas.on("object:scaling", function (e) {
        if(e.target === inst.rectRed) {
          if (inst.cropRegionMoving === false) return;
          let target = e.target;
          let newClip = {
            left: target.left,
            top: target.top,
            right: target.left + target.width * target.scaleX,
            bottom: target.top + target.height * target.scaleY
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
        }
      });
      inst.canvas.on('object:moving', function (e) {
        if(e.target === inst.rectRed) {
          if (inst.cropRegionMoving === false) return;

          let target = e.target;
          let newClip = {
            left: target.left,
            top: target.top,
            right: target.left + target.width * target.scaleX,
            bottom: target.top + target.height * target.scaleY
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
        }
      });
    },
    uploadImage(e) {
      // update previous state
      this.clearState();

      this.imgUrl = URL.createObjectURL(e.target.files[0]);
      let imgObj = new Image();
      const imgHeightLimit = Math.round(window.innerHeight * 0.7);
      const imgWidthLimit = Math.round(window.innerWidth * 0.7);
      let imgDrawWidth, imgDrawHeight;
      let scaleX, scaleY;
      let inst = this;

      imgObj.src = this.imgUrl;
      imgObj.onload = () => {
        const imgSizeAspect = imgObj.width / imgObj.height;

        console.log("screen size:", window.innerWidth, window.innerHeight);
        console.log("img size:", imgObj.width, imgObj.height);

        // adjust image size to draw
        if (imgObj.height > imgHeightLimit) {
          imgDrawHeight = imgHeightLimit;
          imgDrawWidth = Math.round(imgHeightLimit * imgSizeAspect);
        } else {
          imgDrawWidth = imgObj.width;
          imgDrawHeight = imgObj.height;
        }

        console.log("canvas size1:", imgDrawWidth, imgDrawHeight);

        if (imgDrawWidth > imgWidthLimit) {
          imgDrawWidth = imgWidthLimit;
          imgDrawHeight = Math.round(imgDrawWidth / imgSizeAspect);
        } 
        
        console.log("canvas size2:", imgDrawWidth, imgDrawHeight);
        inst.scaleX = inst.scaleY = imgDrawHeight / imgObj.height;

        console.log("scale:", inst.scaleX, inst.scaleY);

        this.canvas.setDimensions({
          width: imgDrawWidth,
          height: imgDrawHeight,
        });
        // save image size
        this.originalWidth = imgDrawWidth;
        this.originalHeight = imgDrawHeight;

        fabric.Image.fromURL(this.imgUrl, function(newImg){
          inst.canvas.clear();
          inst.bgImage = newImg.set({
            left: 0, 
            top: 0, 
            scaleX: inst.scaleX,
            scaleY: inst.scaleY
            });
          inst.bgImage.selectable = false;

          inst.canvas.add(inst.bgImage);
          inst.canvas.renderAll();
        });
      }
    },
  },
};
</script>
