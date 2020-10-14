<template>
  <div class="MapHeat">
    <div id="map"></div>
  </div>
</template>
<script>
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import { Heatmap as HeatmapLayer } from 'ol/layer.js'
import VectorSource from 'ol/source/Vector.js'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { transform } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import "ol/ol.css"

export default {
  name: 'MapHeat',
  data () {
    return {
      map:null,
      center: [121.05, 30.60],
      heatData: { // 热力图假数据
        type: 'FeatureCollection',
        features: [
          { type: 'Point', 'coordinates': [ 104.40, 31.19 ], count: 100 },
          { type: 'Point', 'coordinates': [ 113.30, 30.60 ], count: 19 },
          { type: 'Point', 'coordinates': [ 123.30, 30.60 ], count: 419 },
          { type: 'Point', 'coordinates': [ 105.30, 30.60 ], count: 319 },
          { type: 'Point', 'coordinates': [ 106.30, 30.60 ], count: 719 },
          { type: 'Point', 'coordinates': [ 109.30, 31.60 ], count: 519 },
          { type: 'Point', 'coordinates': [ 109.30, 30.60 ], count: 319 },
          { type: 'Point', 'coordinates': [ 108.30, 32.60 ], count: 139 },
          { type: 'Point', 'coordinates': [ 118.30, 31.60 ], count: 129 },
          { type: 'Point', 'coordinates': [ 108.30, 33.60 ], count: 190 },
          { type: 'Point', 'coordinates': [ 108.30, 32.60 ], count: 189 },
          { type: 'Point', 'coordinates': [ 100.30, 30.60 ], count: 1 },
          { type: 'Point', 'coordinates': [ 109.30, 30.60 ], count: 119 },
          { type: 'Point', 'coordinates': [ 108.30, 31.60 ], count: 200 },
          { type: 'Point', 'coordinates': [ 118.30, 30.60 ], count: 300 }
        ]
      }
    }
  },
  mounted () {
      this.initMap()
  },
  methods: {
    initMap () {
      let tileLayer = new TileLayer({
        source: new OSM(),
      })

      // 创建一个热力图层
      let vector = new HeatmapLayer({
      // 矢量数据源
        source: new VectorSource({
          features: (new GeoJSON()).readFeatures(this.heatData, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
      }),
        }),
        blur: 20, // 模糊尺寸
        radius: 20 // 热点半径
      })

      this.map = new Map({
        target: 'map', //选择挂载的Dom原素（唯一id）
        layers: [tileLayer,vector], //添加的图层
        view: new View({
          center: transform(this.center, 'EPSG:4326', 'EPSG:3857'), // 地图初始中心位置
          zoom: 5 //地图层级
        })
      })
    }
  },
  
}
</script>
<style lang="scss">
.MapHeat{
  width: 100%;
  height: 100%;

  #map{
    width: 100%;
    height: 100%;
  }
}
</style>
