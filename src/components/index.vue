<template>
  <div id="map" ref="rootmap">
    <div id="menu">
      <label>测量工具 &nbsp;</label>
      <select id="type">
        <option value="length">测距</option>
        <option value="area">测面</option>
      </select>
    </div>
  </div>
</template>
<script>
import ol from '@/plugins/ol'
import { defaults } from 'ol/control'

export default {
  name: 'index',
  data() {
    return {
      map: null,
      Vectorsource: null,
      Vectorlayer: null,
      draw: null,
      sketch: null, //当前绘制的要素ol.Feature
      helpTooltipElement: null, //帮助提示框对象 element
      helpTooltip: null, //帮助提示框显示的信息ol.Overlay
      measureTooltipElement: null, //测量工具提示框 element
      measureTooltip: null, //测量工具中显示的测量值ol.Overlay
      formatArea: null,
      formatLength: null,
      typeSelect: null,
    }
  },
  methods: {
    init() {
      const mapContainer = this.$refs.rootmap
      //加载waterMap
      this.waterLayer = new ol.Layer.Tile({
        source: new ol.Source.Stamen({
          layer: 'watercolor',
        }),
      })
      this.waterLayer.setVisible(false)
      //加载osmMap
      this.osmLayer = new ol.Layer.Tile({
        source: new ol.Source.OSM(),
      })
      this.osmLayer.setVisible(false)
      //加载ArcgisMap
      this.arcgisLayer = new ol.Layer.Tile({
        source: new ol.Source.TileArcGISRest({
          url:
            'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
        }),
      })
      // 地图初始化图层加载
      this.map = new ol.Map({
        renderer: ['canvas', 'webgl'],
        target: mapContainer, //关联到div容器
        controls: new ol.Control.defaults({
          attribution: false,
          zoom: false,
          rotate: false,
        }),
        layers: [this.waterLayer, this.osmLayer, this.arcgisLayer],
        view: new ol.View({
          //地图视图
          projection: 'EPSG:4326', // 使用这个坐标系
          center: [119, 40], 
          zoom: 5,
          minZoom: 3,
          maxZoom: 20,
        }),
      })
      //添加矢量图层
      this.initVectorlayer()
      //添加比例尺控件
      this.initScaleLineControl()
      //添加交互绘制控件
      this.addInteraction()
      //添加测量提示框
      this.createMesureTooltip()
      //添加改变测量方式
      this.addTypeselect()
      //格式化测量面积与长度
      this.addFormat()
      //添加绘制
      this.addDraw()
    },
    initVectorlayer() {
      //定义一个矢量数据源
      this.Vectorsource = new ol.Source.Vector({
        wrapX: false,
      })
      //定义矢量图层
      this.Vectorlayer = new ol.Layer.Vector({
        source: this.Vectorsource,
        style: new ol.Style.Style({
          fill: new ol.Style.Fill({
            color: 'rgba(255,255,255,0.2)',
          }),
          stroke: new ol.Style.Stroke({
            color: '#e21e0a',
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
      this.map.addLayer(this.Vectorlayer)
    },
    initScaleLineControl() {
      this.scaleLineControl = new ol.Control.ScaleLine({
        //单位：米制
        units: 'metric',
        //目标：比例尺
        target: 'scalebar',
        className: 'ol-scale-line',
      })
      this.map.addControl(this.scaleLineControl)
    },
    createMesureTooltip() {
      this.measureTooltipElement = document.createElement('div') //创建元素节点
      this.measureTooltip = new ol.Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      })
      this.map.addOverlay(this.measureTooltip)
    },
    addInteraction() {
      //测类型对象
      this.typeSelect = document.getElementById('type')
      let type = this.typeSelect.value == 'area' ? 'Polygon' : 'LineString'
      this.draw = new ol.Interaction.Draw({
        source: this.Vectorsource,
        type: type, //绘制几何图形类型
        style: new ol.Style.Style({
          //绘制几何图形的样式
          fill: new ol.Style.Fill({
            color: 'rgba(255,255,255,0.2)',
          }),
          stroke: new ol.Style.Stroke({
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
      this.map.addInteraction(this.draw)
      this.createMesureTooltip() //创建测量工具提示框
      this.addDraw()
    },
    addDraw() {
      //定义一个事件监听
      let listener
      //绑定交互绘制工具开始绘制的事件
      this.draw.on('drawstart', (evt) => {
        this.sketch = evt.feature //绘制的要素
        let tooltipCoord = evt.coordinate //绘制的坐标
        listener = this.sketch.getGeometry().on('change', (evt) => {
          let geom = evt.target //绘制几何要素
          console.log(evt);
          let output //定义一个输出对象，用于记录面积和长度
          if (geom instanceof ol.Geom.LineString) {
            output = this.formatLength(geom) //输出长度值
            tooltipCoord = geom.getLastCoordinate() //坐标
          } else if (geom instanceof ol.Geom.Polygon) {
            output = this.formatArea(geom) //输出多边形面积
            tooltipCoord = geom.getInteriorPoint().getCoordinates() //坐标
          }
          this.measureTooltipElement.innerHTML = output //将测量值设置到工具提示框
          this.measureTooltip.setPosition(tooltipCoord) //设置测量工具提示框的显示位置
        })
      })
      //绑定交互绘制工具结束绘制的事件
      this.draw.on('drawend', () => {
        this.sketch = null //置空当前绘制的要素对象
        this.measureTooltipElement = null //置空测量工具提示框对象
        this.createMesureTooltip() //重新创建一个测试工具提示框显示结果
        new ol.Observable.unByKey(listener) //移除事件监听
      })
    },
    addFormat() {
      //格式化测量长度
      this.formatLength = (line) => {
        //获取投影坐标系
        let sourceProj = this.map.getView().getProjection()
        //定义长度变量
        let length = ol.Sphere.getLength(line, { projection: sourceProj })
        //定义输出变量
        let output
        //如果长度大于100，则使用km单位，否则使用m单位
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + '' + 'km' //换算成KM单位
        } else {
          output = Math.round(length * 100) / 100 + '' + 'm' //m为单位
        }
        return output
      }
      //格式化测量面积
      this.formatArea = (polygon) => {
        //获取投影坐标系
        let sourceProj = this.map.getView().getProjection()
        //定义面积变量
        let area = ol.Sphere.getArea(polygon, { projection: sourceProj })
        //定义输出变量
        let output
        //当面积大于10000时，转换为平方千米，否则为平方米
        if (area > 10000) {
          output =
            Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
        }
        return output
      }
    },
    addTypeselect() {
      this.typeSelect.onchange = () => {
        this.map.removeInteraction(this.draw) //移除绘制图形
        this.addInteraction()
      } //添加绘图进行测量
    },
  },
  mounted() {
    this.init()
  },
}
</script>
<style>
#map {
  height: 700px;
  width: 100%;
}
#menu {
  float: left;
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 2000;
}

.checkbox {
  left: 20px;
}
/**
提示框的样式信息
**/
.tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
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
  color: black;
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
}
#scalebar {
  float: left;
  margin-bottom: 10px;
}
</style>
