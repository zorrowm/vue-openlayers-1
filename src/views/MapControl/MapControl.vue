<template>
    <div class="MapControl">
        <!-- 地图控件 -->
        <div id="MapControl" ref="MapControl"></div>
    </div>
</template>
<script>
import ol from "@/plugins/ol"

export default {
    name: 'MapControl',
    data() {
        return {
            MapControl: null,
            TileLayers: null,
        }
    },
    mounted() {
        const initMap = setTimeout( () => {
            this.initMap()
            this.renderMap()
        },1000)
        
        this.$once('hook:beforeDestroy', () => {
            clearTimeout(initMap)
        })
    },
    methods: {
        // 初始化创建地图
        initMap() {
            // 创建高德矢量图层
            this.TileLayers =  new ol.Layer.Tile({
                title: "高德地图",
                source: new ol.Source.XYZ({
                    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    wrapX: false
                })
            });

            // 实例化Map对象，加载地图
            this.MapControl = new ol.Map({
                target: 'MapControl', // 地图容器
                layers: [ this.TileLayers ], // 添加的图层（注意顺序）
                view: new ol.View({
                    center:  [12958752, 4848452], // 地图初始中心位置
                    projection: 'EPSG:3857', // 地图投影
                    zoom: 5, // 层级
                    minZoom:3, //最小层级
                    maxZoom: 20, //最大层级
                }),
            });

            // 缩放层级zoomSlider控件加载到地图
            let zoomslider = new ol.Control.ZoomSlider()
            // this.MapControl.addLayer(zoomslider)
            console.log();
            console.log(this.MapControl,zoomslider);
        },
        // 渲染地图 render()
        renderMap() {
            
        },
        // 添加图层
        addLayerMap(){

        },
        // 删除图层
        removeLayerMap(){
            
        }
    }
}
</script>
<style lang="scss" scoped>
.MapControl {
    width: 100%;
    height: 100%;

    #MapControl {
        width: 100%;
        height: 100%;
    }
}
</style>