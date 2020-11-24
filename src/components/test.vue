<template>
  <div class="test">
    <div id="MapTest"></div>
  </div>
</template>
<script>
import ol from '@/plugins/ol'

export default {
  name: 'test',
  data() {
    return {
      MapTest: null,
      source: null,
      Line: null,
      data:[
        [116.30,39.98],
        [116.31,40]
      ],
      abc: null,
    }
  },
  mounted() {
    const initMap = setTimeout(() => {
      this.initMap()
    }, 500)

    this.$once('hook:beforeDestroy', () => {
      clearTimeout(initMap)
    })
    
    setInterval(() => {
      this.abc.setCoordinates(this.data)
      this.MapTest.getView().setCenter([116.30,39.98])
    },5000)
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

      this.MapTest = new ol.Map({
        layers: [ this.arcgisLayer ],
        //地图容器div的ID
        target: 'MapTest',
        view: new ol.View({
          //地图初始中心点
          center: [116.3047, 39.9865],
          minZoom: 2,
          zoom: 15,
          projection: 'EPSG:4326',
        }),
        controls: [
          new ol.Control.MousePosition({
            target: document.getElementById('mouse-position'),
          }),
        ],
      })
      this.abc = new ol.Geom.LineString(this.data);
      //创建一个线
      this.Line = new ol.Feature({
        geometry: this.abc,//new ol.Geom.LineString(this.data),
      })

      //设置线的样式
      this.Line.setStyle(
        new ol.Style.Style({
          //填充色
          fill: new ol.Style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          //边线颜色
          stroke: new ol.Style.Stroke({
            color: '#ffcc33',
            width: 5,
          }),
          //形状
          image: new ol.Style.Circle({
            radius: 7,
            fill: new ol.Style.Fill({
              color: '#ffcc33',
            }),
          }),
        })
      )

      //实例化一个矢量图层Vector作为绘制层
      this.source = new ol.Source.Vector({
        features: [this.Line],
      })

      //创建一个图层
      let vector = new ol.Layer.Vector({
        source: this.source,
      })

      //将绘制层添加到地图容器中
      this.MapTest.addLayer(vector)
    },
  },
}
</script>
<style lang="scss" scoped>
.test {
  width: 100%;
  height: 100%;

  #MapTest {
    width: 100%;
    height: 100%;
  }
}
</style>
