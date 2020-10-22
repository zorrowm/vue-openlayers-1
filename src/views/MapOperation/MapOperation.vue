<template>
    <div class="MapOperation">
        <!-- 地图操作 -->
        <div id="MapOperation" :style="{ background: background }">
            <!-- 鼠标坐标显示 -->
            <div id="mouse-position"></div>
            <!-- 操作界面 -->
            <div id="layerControl" class="layerControl" :style="{ minWidth: layerControlWidth }">
                <div class="title">
                    <a-icon type="double-left"  v-show="!colled" @click="collected"/>
                    <a-icon type="double-right" v-show="colled" @click="collected"/>
                    <label v-show="colled"> 操作界面 </label>
                </div>
                <ul id="layerTree" class="layerTree"  v-show="colled">
                    <li v-for="i in operation" :key="i.name" @click="liClickOperation(i.id)">
                        <a-col :span="22" :offset="2"> 
                            {{i.name}}
                        </a-col>
                    </li>
                </ul>
            </div>
        </div>
        <!-- 提示框 -->
        <a-modal
            title="Title"
            :visible="visible"
            @ok="clickPosition"
            @cancel="visible = false"
        >
            <p>经度：<a-input placeholder="请输入经度" v-model="positionFrom.lon"/></p>
            <p>纬度：<a-input placeholder="请输入纬度" v-model="positionFrom.lat"/></p>
        </a-modal>
    </div>
</template>
<script>
import ol from "@/plugins/ol"
export default {
    name: 'MapOperation',
    data() {
        return {
            MapOperation: null,
            operation: [
                {name: "放大", id: 1},
                {name: "缩小", id: 2},
                {name: "平移[中国]", id: 3},
                {name: "复位", id: 4},
                {name: "设置背景", id: 5},
                {name: "地图定位", id:6},
                {name: "层级", id: 7},
                {name: "视窗逻辑坐标", id: 8},
                {name: "地图域信息", id: 9},
                {name: "下载PNG", id: 10},
                {name: "下载PDF", id: 11},
                {name: "地图事件", id: 12},
                {name: "图层探查", id: 13},
                {name: "图层层级控制", id: 14},
                {name: "图层组控制", id: 15},
            ],
            colled: true,
            layerControlWidth: "310px",
            background:'none',
            visible: false,
            positionFrom: {
                lon: null,
                lat: null,
            }
        }
    },
    mounted() {
        const initMap = setTimeout( () => {
            this.initMap()
        },1000)
        
        this.$once('hook:beforeDestroy', () => {
            clearTimeout(initMap)
        })
    }, 
    methods: {
        initMap() {
            // 创建高德矢量图层
            let gaodeLayer =  new ol.Layer.Tile({
                title: "高德地图",
                source: new ol.Source.XYZ({
                    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    wrapX: false,
                }),
                visible: true, // 显示该图层
            });

            // 实例化Map对象，加载地图
            this.MapOperation = new ol.Map({
                target: 'MapOperation', // 地图容器
                layers: [ gaodeLayer ], // 地图容器中加载的图层（注意顺序）
                view: new ol.View({ // 地图视图设置
                    center:  [119,40], // 地图初始中心位置
                    projection: 'EPSG:4326', // 地图投影
                    zoom: 5, // 初始显示级别
                    // minZoom:1, //最小级别
                    maxZoom: 20, //最大级别
                    // rotation: Math.PI / 6, // 设置旋转角度
                }),
            });

            // 缩放层级 zoomSlider 控件加载到地图
            let zoomsliderControl = new ol.Control.ZoomSlider()
            this.MapOperation.addControl(zoomsliderControl)

            // 全屏 fullScreen 控件加载到地图
            let fullScreenControl = new ol.Control.FullScreen()
            this.MapOperation.addControl(fullScreenControl)

            // 比例尺 scaleLine 控价加载到地图
            let scaleLineControl = new ol.Control.ScaleLine({
                units: "metric", // 设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
            })
            this.MapOperation.addControl(scaleLineControl)

            // 鼠标位置 MousePosition 控件加载到地图
            let mousePostionControl = new ol.Control.MousePosition({
                coordinateFormat: ol.Coordinate.createStringXY(4), // 坐标格式
                projection: 'EPSG:4326', // 地图投影坐标系（未设置输出默认投影坐标系下的坐标）
                className: 'custom-mouse-position', // 坐标信息显示样式类名 默认是：ol-mouse-position
                target: document.querySelector('#mouse-position'), // 显示鼠标位置信息的目标容器
                undefinedHTML: '&nbsp;', // 未定义坐标的标记(离开地图)
            })
            this.MapOperation.addControl(mousePostionControl)
        },
        // 收起操作列表,动态设置最小宽度
        collected() {
            if(this.colled) {
                this.colled = false;
                this.layerControlWidth = "20px";
            } else {
                this.colled = true;
                this.layerControlWidth = "310px";
            }
        },
        //li操作方法
        liClickOperation(msg) {
            switch (msg) {
                case 1:
                    this.MapEnlarge();
                    break;
                case 2:
                    this.MapNarrow();
                    break;
                case 3:
                    this.MapTranslation();
                    break;
                case 4:
                    this.MapReset();
                    break;
                case 5:
                    this.MapBackground();
                    break;
                case 6:
                    this.MapPosition();
                    break;
                case 7:
                    this.MapHierarchy();
                    break;
                case 8:
                    this.MapCoordinate();
                    break;
                case 9:
                    this.MapRegionInformation();
                    break;
                case 10:
                    this.MapDownloadPNG();
                    break;
                case 11:
                    this.MapDownloadPDF();
                    break;
                case 12:
                    this.MapEvent();
                    break;
                case 13:
                    this.MapLayerExploration();
                    break;
                case 14:
                    this.MapLayerLevel();
                    break;
                case 15:
                    this.MapLayerGroup();
                    break;

                default:
                    break;
            }
        },
        // 地图放大
        MapEnlarge() {
            let view = this.MapOperation.getView(); // 获取地图视图
            let zoom = view.getZoom(); // 获得当前缩放级数
            let center = view.getCenter(); // 获得当前中心点
            let rotation = view.getRotation(); // 获得当前旋转度数
            
            view.setZoom(zoom + 1); // 地图放大一级
        },
        // 地图缩小
        MapNarrow() {
            let view = this.MapOperation.getView(); // 获取地图视图
            let zoom = view.getZoom(); // 获得当前缩放级数
            let center = view.getCenter(); // 获得当前中心点
            let rotation = view.getRotation(); // 获得当前旋转度数
            
            view.setZoom(zoom - 1); // 地图缩小一级
        },
        // 地图平移[中国]
        MapTranslation() {
            let view = this.MapOperation.getView(); // 获取地图视图

            let wh = ol.Proj.fromLonLat([119, 40],'EPSG:4326'); //坐标系统定义和转换类 fromLonLat(coordinate 地理坐标, opt_projection 坐标系)
            // ol.proj.get(projectionLike)  获取坐标系信息。projectionLike：(ol.ProjectionLike)必选项，坐标系
            
            view.setCenter(wh); // 设置地图视图的中心坐标。
            view.setZoom(5); // 设置地图视图的缩放级别。
            // view.setRotation(90); // 设置当前地图视图的旋转弧度。返回值为{number}类型
        },
        // 地图复位
        MapReset() {
            let view = this.MapOperation.getView(); // 获取地图视图
            view.setCenter([119,40]); // 初始中心点
            view.setZoom(5); // 初始缩放级数
            // view.setRotation(90); // 初始旋转角度
        },
        // 地图背景
        MapBackground() {
            let MapOperation = document.querySelector("#MapOperation");
            this.background = "url("+ require('../../assets/background.jpg') + ") 100% 100% no-repeat ";
        },
        // 地图定位
        MapPosition() {
            this.visible = true
        },
        // 地图层级
        MapHierarchy() {
            
        },
        // 地图视窗逻辑坐标
        MapCoordinate() {

        },
        // 地图域信息
        MapRegionInformation() {

        },
        // 地图下载PNG
        MapDownloadPNG() {

        },
        // 地图下载PDF
        MapDownloadPDF() {

        },
        // 地图事件触发
        MapEvent() {

        },
        // 地图图层探查
        MapLayerExploration() {

        },
        // 地图图层层级控制
        MapLayerLevel() {

        },
        // 地图图层组控制
        MapLayerGroup() {
            
        },
        // 确定地图定位
        clickPosition() {
            let view = this.MapOperation.getView();
            let py = ol.Proj.fromLonLat([this.positionFrom.lon, this.positionFrom.lat],'EPSG:4326');
            //平移地图设置中心点和级别
            view.setCenter(py);
            view.setZoom(8);
            this.visible = false;
        },

    }
}
</script>
<style lang="scss" scoped>
.MapOperation {
    width: 100%;
    height: 100%;

    #MapOperation {
        width: 100%;
        height: 100%;
        // background: url(~@/assets/background.jpg);

        /* 鼠标位置控件层样式设置 */
        #mouse-position {
            float: left;
            position: absolute;
            right: 10px;
            bottom: 10px;
            width: 150px;
            height: 20px;
            z-index: 999; /*在地图容器中的层，要设置z-index的值让其显示在地图上层*/
        }
        /* 鼠标位置信息自定义样式设置 */
        ::v-deep.custom-mouse-position {
            color: #000;
            font-size: 16px;
            font-family: "微软雅黑";
        }

        /* 图层控件层样式设置 */
        .layerControl {
            min-width: 310px;
            min-width: 200px;
            position: absolute;
            bottom: auto;
            right: 0px;
            top: 110px;
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
        .layerTree{
            padding: 10px;

            li {
                list-style: none;
                height: 40px;
                font-size: 16px;
                padding: 10px 10px;

                &:hover {
                    background: #40a9ffde;
                }
            }
        } 
    }
}
</style>