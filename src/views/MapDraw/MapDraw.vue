<template>
  <div class="MapDraw">
    <div id="MapDraw">
      <!-- 鼠标坐标显示 -->
      <div id="mouse-position"></div>
      <!-- <a-select default-value="lucy" style="width: 120px" v-model="selectValue" >
        <a-select-option value="LineString">
          LineString
        </a-select-option>
        <a-select-option value="Polygon">
          Area (Polygon)
        </a-select-option>
      </a-select> -->
      <select id="type">
        <option value="length">Length (LineString)</option>
        <option value="area">Area (Polygon)</option>
      </select>
    </div>
  </div>
</template>
<script>
import ol from '@/plugins/ol'

export default {
  name: 'MapDraw',
  data() {
    return {
      MapDraw: null,
      gaodeLayer: null,
      osmLayer: null,
      selectValue: 'LineString'
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
      // 创建高德矢量图层
      this.gaodeLayer = new ol.Layer.Tile({
        title: '高德地图',
        source: new ol.Source.XYZ({
          url:
            'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          wrapX: false,
          crossOrigin: 'Anonymous', // 截图
        }),
        visible: true, // 显示该图层
      })

      // 创建 OpenStreetMap 图层
      this.osmLayer = new ol.Layer.Tile({
        target: 'OSM',
        source: new ol.Source.OSM(),
        visible: true, // 先显示该图层
      })

      // 实例化Map对象，加载地图
      this.MapDraw = new ol.Map({
        target: 'MapDraw', // 地图容器
        layers: [this.osmLayer, this.gaodeLayer], // 地图容器中加载的图层（注意顺序）
        view: new ol.View({
          // 地图视图设置
          center: [116, 39.8], // 地图初始中心位置
          projection: 'EPSG:4326', // 地图投影
          zoom: 5, // 初始显示级别
          // minZoom:1, //最小级别
          maxZoom: 20, //最大级别
          // rotation: Math.PI / 6, // 设置旋转角度
        }),
      })

      // 缩放层级 zoomSlider 控件加载到地图
      let zoomsliderControl = new ol.Control.ZoomSlider()
      this.MapDraw.addControl(zoomsliderControl)

      // 全屏 fullScreen 控件加载到地图
      let fullScreenControl = new ol.Control.FullScreen()
      this.MapDraw.addControl(fullScreenControl)

      // 比例尺 scaleLine 控价加载到地图
      let scaleLineControl = new ol.Control.ScaleLine({
        units: 'metric', // 设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
      })
      this.MapDraw.addControl(scaleLineControl)

      // 鼠标位置 MousePosition 控件加载到地图
      this.mousePostionControl = new ol.Control.MousePosition({
        coordinateFormat: ol.Coordinate.createStringXY(4), // 坐标格式
        projection: 'EPSG:4326', // 地图投影坐标系（未设置输出默认投影坐标系下的坐标）
        className: 'custom-mouse-position', // 坐标信息显示样式类名 默认是：ol-mouse-position
        target: document.querySelector('#mouse-position'), // 显示鼠标位置信息的目标容器
        undefinedHTML: '&nbsp;', // 未定义坐标的标记(离开地图)
      })
      this.MapDraw.addControl(this.mousePostionControl)

      var source = new ol.Source.Vector();
      var vector = new ol.Layer.Tile({
        source: source,
        style: new ol.Style.Style({
          fill: new ol.Style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new ol.Style.Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          image: new ol.Style.Circle({
            radius: 7,
            fill: new ol.Style.Fill({
              color: '#ffcc33',
            }),
          }),
        }),
      });

      // 创建一个当前绘制的要素对象
      var sketch;
      // 创建一个帮助提示框对象
      var helpTooltipElement;
      // 创建一个帮助提示信息对象
      var helpTooltip;
      // 创建一个测量提示框对象
      var measureTooltipElement;
      // 创建一个测量提示信息对象
      var measureTooltip;
      // 继续绘制多边形的提示信息
      var continuePolygonMsg = '单击以继续绘制多边形';
      // 继续绘制线段的提示信息
      var continueLineMsg = '单击以继续绘制线';

      // 鼠标移动触发的函数
      var pointerMoveHandler = function (evt) {
        // 如果是平移地图则直接结束
        if (evt.dragging) {
          return;
        }

        var helpMsg = '单击开始绘制'; // 帮助提示信息

        if (sketch) {
          var geom = sketch.getGeometry(); // 获取绘图对象的几何要素
          if (geom instanceof Polygon) { // 根据当前绘制要素，提示信息设置
            helpMsg = continuePolygonMsg;
          } else if (geom instanceof LineString) {
            helpMsg = continueLineMsg;
          }
        }

        helpTooltipElement.innerHTML = helpMsg; // 设置帮助提示要素的内标签为帮助提示信息
        helpTooltip.setPosition(evt.coordinate); // 设置帮助提示信息的位置

        helpTooltipElement.classList.remove('hidden'); // 移除帮助提示要素的隐藏样式
      };
      this.MapDraw.on('pointermove', pointerMoveHandler); // 触发pointermove事件

      this.MapDraw.getViewport().addEventListener('mouseout', () => {
        // 当鼠标移除地图视图的时为帮助提示要素添加隐藏样式
        helpTooltipElement.classList.add('hidden');
      });

      var typeSelect = document.getElementById('type');
      var draw;

      var formatLength = function (line) {
        var length = ol.Sphere.getLength(line);
        var output;
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
          output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
      };

      var formatArea = function (polygon) {
        var area = ol.Sphere.getArea(polygon);
        var output;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
      };

      let addInteraction = () => {
        var type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
        draw = new ol.Interaction.Draw({
          source: source,
          type: type,
          style: new ol.Style.Style({
            fill: new ol.Style.Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new ol.Style.Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2,
            }),
            image: new ol.Style.Circle({
              radius: 5,
              stroke: new ol.Style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
              }),
              fill: new ol.Style.Fill({
                color: 'rgba(255, 255, 255, 0.2)',
              }),
            }),
          }),
        });
        this.MapDraw.addInteraction(draw);

        createMeasureTooltip();
        createHelpTooltip();

        var listener;
        draw.on('drawstart', evt => {
          // set sketch
          sketch = evt.feature;

          var tooltipCoord = evt.coordinate;

          listener = sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.Geom.Polygon) {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.Geom.LineString) {
              output = formatLength(geom);
              tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
          });
        });
        draw.on('drawend', () => {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
          measureTooltip.setOffset([0, -7]);
          
          sketch = null;
          
          measureTooltipElement = null;
          createMeasureTooltip();
          unByKey(listener);
        });
      }

      let createHelpTooltip = () => {
        if (helpTooltipElement) {
          helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'ol-tooltip hidden';
        helpTooltip = new ol.Overlay({
          element: helpTooltipElement,
          offset: [15, 0],
          positioning: 'center-left',
        });
        this.MapDraw.addOverlay(helpTooltip);
      }

      let createMeasureTooltip = () => {
        if (measureTooltipElement) {
          measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        measureTooltip = new ol.Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center',
        });
        this.MapDraw.addOverlay(measureTooltip);
      }

      typeSelect.onchange = function () {
        this.MapDraw.removeInteraction(draw);
        addInteraction();
      };

      addInteraction();
      /* -------------- */
    }
  },
}
</script>
<style lang="scss" scoped>
.MapDraw {
  width: 100%;
  height: 100%;

  #MapDraw {
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

      /* 鼠标位置信息自定义样式设置 */
      ::v-deep .custom-mouse-position {
        color: #000;
        font-size: 16px;
        font-family: '微软雅黑';
        float: right;
      }
    }

  }
}
</style>
