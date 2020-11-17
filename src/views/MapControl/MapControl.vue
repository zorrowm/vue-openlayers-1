<template>
  <div class="MapControl">
    <!-- 地图控件 -->
    <div id="MapControl" ref="MapControl">
      <!-- 鼠标坐标显示 -->
      <div id="mouse-position"></div>
      <!-- 图层列表显示 -->
      <div
        id="layerControl"
        class="layerControl"
        :style="{ minWidth: layerControlWidth }"
      >
        <div class="title">
          <a-icon type="double-left" v-show="!colled" @click="collected" />
          <a-icon type="double-right" v-show="colled" @click="collected" />
          <label v-show="colled"> 图层列表 </label>
        </div>
        <ul id="layerTree" class="layerTree" v-show="colled">
          <li v-for="i in layers" :key="i.name">
            <a-col :span="22" :offset="2">
              <input
                type="checkbox"
                :id="i.name"
                v-model="i.checked"
                @click="liClickMap($event)"
              />
              {{ i.name }}
            </a-col>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import ol from '@/plugins/ol'

export default {
  name: 'MapControl',
  data() {
    return {
      MapControl: null,
      layers: [
        { name: 'OSM', checked: true },
        { name: '高德地图', checked: false },
      ],
      colled: true,
      layerControlWidth: '310px',
    }
  },
  mounted() {
    const initMap = setTimeout(() => {
      this.initMap()
    }, 1000)

    this.$once('hook:beforeDestroy', () => {
      clearTimeout(initMap)
    })
  },
  methods: {
    // 初始化创建地图
    initMap() {
      // 创建 OpenStreetMap 图层
      let osmLayer = new ol.Layer.Tile({
        target: 'OSM',
        source: new ol.Source.OSM(),
        visible: true, // 先显示该图层
      })

      // 创建高德矢量图层
      let gaodeLayer = new ol.Layer.Tile({
        title: '高德地图',
        source: new ol.Source.XYZ({
          url:
            'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          wrapX: false,
        }),
        visible: false, // 先隐藏该图层
      })

      // 实例化Map对象，加载地图
      this.MapControl = new ol.Map({
        target: 'MapControl', // 地图容器
        layers: [osmLayer, gaodeLayer], // 地图容器中加载的图层（注意顺序）
        view: new ol.View({
          // 地图视图设置
          center: [12958752, 4848452], // 地图初始中心位置
          projection: 'EPSG:3857', // 地图投影
          zoom: 4, // 初始显示级别
          minZoom: 3, //最小级别
          maxZoom: 20, //最大级别
          // rotation: Math.PI / 6, // 设置旋转角度
        }),
      })

      // 缩放层级 zoomSlider 控件加载到地图
      let zoomsliderControl = new ol.Control.ZoomSlider()
      this.MapControl.addControl(zoomsliderControl)

      // 全屏 fullScreen 控件加载到地图
      let fullScreenControl = new ol.Control.FullScreen()
      this.MapControl.addControl(fullScreenControl)

      // 比例尺 scaleLine 控价加载到地图
      let scaleLineControl = new ol.Control.ScaleLine({
        units: 'metric', // 设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
      })
      this.MapControl.addControl(scaleLineControl)

      // 鼠标位置 MousePosition 控件加载到地图
      let mousePostionControl = new ol.Control.MousePosition({
        coordinateFormat: ol.Coordinate.createStringXY(4), // 坐标格式
        projection: 'EPSG:4326', // 地图投影坐标系（未设置输出默认投影坐标系下的坐标）
        className: 'custom-mouse-position', // 坐标信息显示样式类名 默认是：ol-mouse-position
        target: document.querySelector('#mouse-position'), // 显示鼠标位置信息的目标容器
        undefinedHTML: '&nbsp;', // 未定义坐标的标记(离开地图)
      })
      this.MapControl.addControl(mousePostionControl)

      // 鹰眼图 OverviewMap 控件加载到地图
      // 创建鹰眼的矢量图层 -》 加载到地图
      let OverviewMap = new ol.Layer.Tile({
        source: new ol.Source.OSM(),
      })
      let OverviewMapControl = new ol.Control.OverviewMap({
        className: 'ol-overviewmap ol-custom-overviewmap', // 鹰眼图信息显示样式类名
        layers: [OverviewMap], // 鹰眼中加载同坐标系下不同数据源的图层
        collapseLabel: '\u00BB', // 鹰眼控件展开时功能按钮上的标识（网页的JS的字符编码）
        label: '\u00AB', // 鹰眼控件折叠时功能按钮上的标识（网页的JS的字符编码）
        collapsed: false, // 初始为展开显示方式
      })
      this.MapControl.addControl(OverviewMapControl)
    },
    //选择地图图层
    liClickMap(e) {
      if (e.target.checked) {
        switch (e.target.id) {
          case 'OSM':
            this.MapControl.getLayers()
              .item(0)
              .setVisible(true)
            break
          case '高德地图':
            this.MapControl.getLayers()
              .item(1)
              .setVisible(true)
            break
          default:
            break
        }
      } else {
        switch (e.target.id) {
          case 'OSM':
            this.MapControl.getLayers()
              .item(0)
              .setVisible(false)
            break
          case '高德地图':
            this.MapControl.getLayers()
              .item(1)
              .setVisible(false)
            break
          default:
            break
        }
      }
    },
    // 收起图层列表,动态设置最小宽度
    collected() {
      if (this.colled) {
        this.colled = false
        this.layerControlWidth = '20px'
      } else {
        this.colled = true
        this.layerControlWidth = '310px'
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.MapControl {
  width: 100%;
  height: 100%;

  #MapControl {
    width: 100%;
    height: 100%;

    /* 鼠标位置控件层样式设置 */
    #mouse-position {
      float: right;
      position: absolute;
      right: 10px;
      bottom: 10px;
      width: 300px;
      height: 20px;
      z-index: 999; /*在地图容器中的层，要设置z-index的值让其显示在地图上层*/
    }
    /* 鼠标位置信息自定义样式设置 */
    ::v-deep.custom-mouse-position {
      color: #000;
      font-size: 16px;
      font-family: '微软雅黑';
      float: right;
    }

    /* 自定义鹰眼样式 */
    ::v-deep.ol-overviewmap {
      position: absolute;
      color: red;
      top: 40px;
      right: 0px;
      bottom: auto;
      left: auto;
    }
    /* 鹰眼控件展开时其控件按钮图标的样式 */
    ::v-deep.ol-custom-overviewmap:not(.ol-collapsed) button {
      bottom: auto;
      left: auto;
      right: 1px;
      top: 1px;
    }
    /* 鹰眼控件展开时控件外框的样式 */
    ::v-deep.ol-custom-overviewmap:not(.ol-collapsed) {
      border: 1px solid black;
    }
    /* 鹰眼控件中地图容器样式 */
    ::v-deep.ol-custom-overviewmap .ol-overviewmap-map {
      border: none;
      width: 300px;
    }
    /* 鹰眼控件中显示当前窗口中主图区域的边框 */
    ::v-deep.ol-custom-overviewmap .ol-overviewmap-box {
      border: 2px solid red;
    }

    /* 图层控件层样式设置 */
    .layerControl {
      min-width: 310px;
      max-height: 200px;
      position: absolute;
      bottom: auto;
      right: 0px;
      top: 280px;
      z-index: 2001; /* 在地图容器中的层，要设置z-index的值让其显示在地图上层 */
      color: #ffffff;
      background-color: #4c4e5a;
      border-width: 10px; /*边缘的宽度*/
      border-radius: 5px; /*圆角的大小 */
      border-color: #000 #000 #000 #000; /*边框颜色*/
      cursor: pointer;

      .title {
        font-weight: bold;
        font-size: 15px;
        margin: 10px;

        label {
          margin-left: 10px;
        }
      }
    }
    .layerTree {
      padding: 0px 5px 5px 5px;

      li {
        height: 20px;
        list-style: none;
        margin: 5px 10px;
        font-size: 16px;
      }
    }
  }
}
</style>
