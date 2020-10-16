<template>
    <div class="MapControl">
        <!-- 地图控件 -->
        <div id="MapControl"></div>
    </div>
</template>
<script>
import ol from "@/plugins/ol"

export default {
    name: 'MapControl',
    data () {
        return {
            MapControl: null,

        }
    },
    mounted () {
        console.log(ol);
        this.initMap()
    },
    methods : {
        initMap () {
            //创建天地矢量图层
            let TileLayers = ol.Layer.Tile({
                title:'天地矢量图层',
                source: new ol.Source.XYZ({
                    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibTAxaTBuZyIsImEiOiJjazN3ZHE1NTQwcmFkM290Nmk2MDh1ZWN6In0.BNAU4GtzUgqsu527akTwrg',
                }),
                wrapX: false,
            })
            //实例化Map对象，加载地图
            this.MapControl = new ol.Map({
                target: 'MapControl', // 地图容器
                controls: ol.Control.defaults({
                    attributionOptions: ({
                        collapsible: true
                    })
                }).extend([
                    new ol.Control.ZoomToExtent({
                        extent: [
                            813079.7791264898, 5929220.284081122,
                            848966.9639063801, 5936863.986909639
                        ]
                    })
                ])
            })
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