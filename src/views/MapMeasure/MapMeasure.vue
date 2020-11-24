<!-- 测距侧面 -->
<template>
  <div class="MapMeasure">
    <div id="MapMeasure"></div>
  </div>
</template>
<script>
import ol from '@/plugins/ol'

export default {
  name: 'MapMeasure',
  data() {
    return {
      MapMeasure: null,
      Vectorsource: null,
      Vectorlayer: null,
      draw: null,
      sketch: null, //当前绘制的要素ol.Feature
      helpTooltipElement: null, //帮助提示框对象 element
      helpTooltip: null, //帮助提示框显示的信息ol.Overlay
      measureTooltipElement: null, //测量工具提示框 element
      measureTooltipElement2: null,
      measureTooltip: null, //测量工具中显示的测量值ol.Overlay
      measureTooltip2: null,
      formatArea: null,
      formatLength: null,
      typeSelect: null,
      dbclickFlag: true,
      geojsonStr: null,
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
    initMap() {
      //加载ArcgisMap
      this.arcgisLayer = new ol.Layer.Tile({
        source: new ol.Source.TileArcGISRest({
          url:
            'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
        }),
      })

      // 地图初始化图层加载
      this.MapMeasure = new ol.Map({
        renderer: ['canvas', 'webgl'],
        target: 'MapMeasure', //关联到div容器
        controls: new ol.Control.defaults({
          attribution: false,
          zoom: false,
          rotate: false,
        }),
        layers: [this.arcgisLayer],
        view: new ol.View({
          // 地图视图
          projection: 'EPSG:4326', // 坐标系
          center: [116.3047, 39.9865],
          zoom: 15,
          minZoom: 3,
          maxZoom: 20,
        }),
      })

      // 缩放层级 zoomSlider 控件加载到地图
      let zoomsliderControl = new ol.Control.ZoomSlider()
      this.MapMeasure.addControl(zoomsliderControl)

      // 全屏 fullScreen 控件加载到地图
      let fullScreenControl = new ol.Control.FullScreen()
      this.MapMeasure.addControl(fullScreenControl)

      //添加比例尺控件
      let scaleLineControl = new ol.Control.ScaleLine({
        units: 'metric', // 单位：米制
        target: 'scalebar', // 目标：比例尺
        className: 'ol-scale-line',
      })
      this.MapMeasure.addControl(scaleLineControl)

      // 鼠标位置 MousePosition 控件加载到地图
      let mousePostionControl = new ol.Control.MousePosition({
        coordinateFormat: ol.Coordinate.createStringXY(4), // 坐标格式
        projection: 'EPSG:4326', // 地图投影坐标系（未设置输出默认投影坐标系下的坐标）
        className: 'custom-mouse-position', // 坐标信息显示样式类名 默认是：ol-mouse-position
        target: document.querySelector('#mouse-position'), // 显示鼠标位置信息的目标容器
        undefinedHTML: '&nbsp;', // 未定义坐标的标记(离开地图)
      })
      this.MapMeasure.addControl(mousePostionControl)

      // 添加矢量图层
      this.initVectorlayer()

      // 添加交互绘制控件
      this.addInteraction()

      // 添加测量提示框
      this.createMesureTooltip()
      this.createMesureTooltip2()

      // 格式化测量面积与长度
      this.addFormat()

      // 添加绘制
      this.addDraw()

      // 双击缩放功能
      this.cancelDbClick()
    },
    initVectorlayer() {
      // 定义一个矢量数据源
      this.Vectorsource = new ol.Source.Vector({
        wrapX: false,
      })

      // 定义矢量图层
      this.Vectorlayer = new ol.Layer.Vector({
        source: this.Vectorsource,
        style: new ol.Style.Style({
          fill: new ol.Style.Fill({
            color: 'rgba(255,255,255,0.2)', // 填充颜色
          }),
          stroke: new ol.Style.Stroke({
            color: '#1890ff', // 线颜色
            width: 2,
          }),
          image: new ol.Style.Circle({
            radius: 5,
            fill: new ol.Style.Fill({
              color: '#ffcc33',
            }),
          }),
        }),
      })
      this.MapMeasure.addLayer(this.Vectorlayer)
    },
    // 去除双击缩放功能
    cancelDbClick() {
      const dblClickInteraction = this.MapMeasure.getInteractions()
        .getArray()
        .find((interaction) => {
          return interaction instanceof ol.Interaction.DoubleClickZoom
        })
      this.MapMeasure.removeInteraction(dblClickInteraction)
    },
    createMesureTooltip() {
      // 创建元素节点
      this.measureTooltipElement = document.createElement('div')
      this.measureTooltip = new ol.Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      })
      this.MapMeasure.addOverlay(this.measureTooltip)
    },
    createMesureTooltip2() {
      // 创建元素节点
      this.measureTooltipElement2 = document.createElement('div')
      this.measureTooltip2 = new ol.Overlay({
        element: this.measureTooltipElement2,
        offset: [0, -15],
        positioning: 'bottom-center',
      })
      this.MapMeasure.addOverlay(this.measureTooltip2)
    },
    addInteraction() {
      // 测类型对象
      let type = 'Polygon'

      this.draw = new ol.Interaction.Draw({
        source: this.Vectorsource,
        type: type, // 绘制几何图形类型
        style: new ol.Style.Style({
          // 绘制几何图形的样式
          fill: new ol.Style.Fill({
            color: 'rgba(255,255,255,0.2)',
          }),
          stroke: new ol.Style.Stroke({
            // 绘制过程中的线条颜色
            color: 'rgba(0,0,0,0.5)',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new ol.Style.Circle({
            radius: 5,
            stroke: new ol.Style.Stroke({
              color: 'rgba(0,0,0,0.7)',
            }),
            fill: new ol.Style.Fill({
              color: 'rgba(255,255,255,0.2)',
            }),
          }),
        }),
      })
      this.MapMeasure.addInteraction(this.draw)

      // 创建测量工具提示框
      this.createMesureTooltip()
      this.createMesureTooltip2()

      this.addDraw()
    },
    addDraw() {
      // 定义一个事件监听
      let listener

      // 控制鼠标点击次数的变量
      let changeCount = 0

      //绑定交互绘制工具开始绘制的事件
      this.draw.on('drawstart', (evt) => {
        if (!this.geojsonStr) {
          // 绘制的要素
          this.sketch = evt.feature

          // 绘制的坐标
          let tooltipCoord = evt.coordinate

          listener = this.sketch.getGeometry().on('change', (evt) => {
            // 绘制几何要素
            let geom = evt.target

            // 定义一个输出对象，用于记录面积(output)和长度(output2)
            let output
            let output2

            if (geom instanceof ol.Geom.Polygon) {
              // 输出多边形面积
              output = this.formatArea(geom)

              // 输出长度值
              output2 = this.formatLength(geom)

              // 坐标
              tooltipCoord = geom.getInteriorPoint().getCoordinates()
            } else if (geom instanceof ol.Geom.LineString) {
              // 输出长度值
              output = this.formatLength(geom)

              // 坐标
              tooltipCoord = geom.getLastCoordinate()
            }
            // 将测量值设置到工具提示框
            this.measureTooltipElement.innerHTML = output
            this.measureTooltipElement2.innerHTML = output2

            // 设置测量工具提示框的显示位置
            this.measureTooltip.setPosition(tooltipCoord)
          })
        }
      })
      //地图单击事件
      this.MapMeasure.on('singleclick', (evt) => {
        if (!this.geojsonStr) {
          //设置测量提示信息的位置坐标，用来确定鼠标点击后测量提示框的位置
          this.measureTooltip2.setPosition(evt.coordinate)

          //如果是第一次点击，则设置测量提示框的文本内容为起点
          if (changeCount == 0) {
            this.measureTooltipElement2.innerHTML = '起点'
          }

          //点击次数增加
          changeCount++

          // 根据鼠标点击位置生成一个点
          let point = new ol.Geom.Point(evt.coordinate)

          // 将该点要素添加到矢量数据源中
          this.Vectorsource.addFeature(new ol.Feature(point))

          // 更改测量提示框的样式，使测量提示框可见
          this.measureTooltipElement2.className = 'tooltip tooltip-static'

          // 创建测量提示框
          this.createMesureTooltip2()
        }
      })
      // 地图双击事件
      this.MapMeasure.on('dblclick', (evt) => {
        if (this.dbclickFlag) {
          // 设置测量提示信息的位置坐标，用来确定鼠标点击后测量提示框的位置
          this.measureTooltip2.setPosition(evt.coordinate)

          //点击次数增加
          changeCount++

          // 根据鼠标点击位置生成一个点
          let point = new ol.Geom.Point(evt.coordinate)

          // 将该点要素添加到矢量数据源中
          this.Vectorsource.addFeature(new ol.Feature(point))

          // 更改测量提示框的样式，使测量提示框可见
          this.measureTooltipElement2.className = 'tooltip tooltip-static'

          // 创建测量提示框
          this.createMesureTooltip2() // 创建测量工具提示框

          // 清除点击次数
          changeCount = 0

          // 控制双击回调执行
          this.dbclickFlag = false
        }
      })
      //绑定交互绘制工具结束绘制的事件
      this.draw.on('drawend', (evt) => {
        // 设置测量提示框的样式
        this.measureTooltipElement.className = 'tooltip tooltip-static'

        // 置空当前绘制的要素对象
        this.sketch = null

        // 置空测量工具提示框对象
        this.measureTooltipElement = null

        // 重新创建一个测试工具提示框显示结果
        this.createMesureTooltip()

        // 获取多边形 geojson 数据
        let writer = new ol.Format.GeoJSON()
        this.geojsonStr = writer.writeGeometry(evt.feature.getGeometry())

        // 移除事件监听
        ol.Observable.unByKey(listener)

        // 移除地图单击事件
        this.MapMeasure.removeEventListener('singleclick')
        this.MapMeasure.removeEventListener('dblclick')

        this.draw.setActive(false)
      })
    },
    addFormat() {
      // 格式化测量长度
      this.formatLength = (line) => {
        // 获取投影坐标系
        let sourceProj = this.MapMeasure.getView().getProjection()

        // 定义长度变量
        let length = ol.Sphere.getLength(line, { projection: sourceProj })

        // 定义输出变量
        let output

        // 如果长度大于100，则使用km单位，否则使用m单位
        if (length > 100) {
          // 换算成 KM 单位
          output = Math.round((length / 1000) * 100) / 100 + '' + 'km'
        } else {
          // M 为单位
          output = Math.round(length * 100) / 100 + '' + 'm'
        }
        return output
      }

      // 格式化测量面积
      this.formatArea = (polygon) => {
        // 获取投影坐标系
        let sourceProj = this.MapMeasure.getView().getProjection()

        // 定义面积变量
        let area = ol.Sphere.getArea(polygon, { projection: sourceProj })

        // 定义输出变量
        let output

        // 当面积大于10000时，转换为平方千米，否则为平方米
        if (area > 10000) {
          output =
            Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
        }
        return output
      }
    },
  },
}
</script>
<style lang="scss">
.MapMeasure {
  width: 100%;
  height: 100%;

  #MapMeasure {
    width: 100%;
    height: 100%;

    /* 提示框的样式信息 */
    .ol-selectable {
      color: #000;

      .tooltip {
        position: relative;
        background: rgb(0, 0, 0);
        border-radius: 4px;
        color: rgb(0, 0, 0);
        padding: 4px 8px;
        opacity: 0.7;
        white-space: nowrap;
      }

      .tooltip-measure {
        opacity: 1;
        font-weight: bold;
      }

      .tooltip-static {
        background-color: #ffffff;
        color: rgb(0, 0, 0);
        border: 1px solid white;
      }

      .tooltip-measure:before,
      .tooltip-static:before {
        border-top: 6px solid rgba(0, 0, 0, 0.5);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        content: '';
        position: absolute;
        bottom: -6px;
        margin-left: -7px;
        left: 50%;
        color: rgb(0, 0, 0);
      }
    }
  }
}
</style>
