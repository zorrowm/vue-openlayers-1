<template>
    <div class="MapDraw">
        <div id="menu">
          <label>几何图形类型：&nbsp;</label>
          <a-select default-value="Point" style="width: 200px" @change="handleChange">
            <a-select-option v-for="i in shape" :key="i">
              {{ i }}
            </a-select-option>
          </a-select>
      </div>
      <div id="map"></div>
    </div>
</template>
<script>
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { transform } from 'ol/proj'
import { Vector as VectorLayer } from 'ol/layer.js'
import VectorSource from 'ol/source/Vector.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
// import LineString from 'ol/geom/LineString'
// import Circle from 'ol/geom/Circle'
// import Polygon from 'ol/geom/Polygon'
import "ol/ol.css"

export default {
    name:'MapDraw',
    data() {
      return {
        valueType:'Point',
        shape:['Point','LineString','Circle','Polygon'],
        mapPoint:[116.311088, 39.992523],
        map:'',
        vector:'',
        center: [121.05212688446045, 30.600614547729492],

      }
    },
    created(){

    },
    mounted(){

      this.initMap()

      if (this.valueType === 'Point') {
        this.point(this.mapPoint)
      } else if (this.valueType === 'LineString') {
        this.lines()
      } else if (this.valueType === 'Circle') {
        this.circle()
      } else if (this.valueType === 'Polygon') {
        this.Polygon()
      }
    },
    methods:{
      handleChange(val){
        this.valueType = val
      },
      initMap(){
        //创建地图背景
        let tileLayer = new TileLayer({
          source: new OSM(),
        })
        //创建画图图层
        let source = new VectorSource()
        let vector = new VectorLayer({
          source:source
        })

        this.map = new Map({
          target:'map',
          layers:[tileLayer,vector],
          view: new View({
            center:transform(this.center, 'EPSG:4326', 'EPSG:3857'),
            zoom:5,
          })
        })
      },
      point(val){
        //创建一个点
        var point = new Feature({
            geometry: new Point(transform(val, 'EPSG:4326', 'EPSG:3857')),
            weight: 5,
        });
        //设置点1的样式信息
        point.setStyle(new Style({
            //填充色
            fill: new Fill({
                color: 'red'
            }),
            //边线颜色
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2
            }),
            //形状
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({
                    color: 'red'
                })
            })
        }));
        //实例化一个矢量图层Vector作为绘制层
        var source = new VectorSource({
            features: [point]
        });
        //创建一个图层
        this.vector = new VectorLayer({
            source: source
        });
        //将绘制层添加到地图容器中
        this.map.addLayer(this.vector);
      },
      delDraw(res){
        this.map.removeLayer(res);//删除图层 你addLayer啥 就removeLayer啥
      }
    }
}
</script>
<style lang="scss">
.MapDraw{
    width: 100%;
    height: 100%;

    #map{
        width: 95%;
        height: 95%;
    }
}
</style>
