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
            :visible="visiblePosition"
            @ok="clickPosition"
            @cancel="visiblePosition = false"
        >
            <p>经度：<a-input placeholder="请输入经度" v-model="positionFrom.lon"/></p>
            <p>纬度：<a-input placeholder="请输入纬度" v-model="positionFrom.lat"/></p>
            <p>级别：<a-input placeholder="请输入级别" v-model="positionFrom.zoom"/></p>
        </a-modal>
        <!-- 提示框 -->
        <a-modal
            title="Title"
            :visible="visibleCoordinate"
            @ok="visibleCoordinate = false"
            @cancel="visibleCoordinate = false"
        >
            <p>坐标类型: 
                <a-select default-value="EPSG:4326" style="width: 120px" v-model="currentCoordinate">
                    <a-select-option :value="i.id" v-for="i in coordinateData" :key="i.id">
                        {{i.name}}
                    </a-select-option>
                </a-select>
            </p>
            <p>当前分辨率: {{MapRegionData.currentResolution}}</p>
            <p>当前地图范围: {{MapRegionData.mapRange}}</p>
            <p>当前视口范围: {{MapRegionData.viewportExtents}}</p>
        </a-modal>
        <!-- 下载地图png -->
        <a id="image-download" download="map.png"></a>
        <!--  -->
        <!--鼠标点击事件-->
        <div class="resultDiv" id="resultDiv1"> </div>
    </div>
</template>
<script>
import ol from "@/plugins/ol"
import { jsPDF } from "jspdf";
import {renderSync} from 'ol/render';

export default {
    name: 'MapOperation',
    data() {
        return {
            MapOperation: null,
            gaodeLayer: null,
            mousePostionControl:null,
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
            visiblePosition: false,
            positionFrom: {
                lon: null,
                lat: null,
                zoom: null,
            },
            visibleCoordinate: false,
            currentCoordinate: 'EPSG:4326',
            coordinateData: [
                {id: 'EPSG:4326', name: '视窗坐标'},
                {id: 'EPSG:3857', name: '逻辑坐标'},
            ],
            MapRegionData: {
                currentResolution: null,
                mapRange: null,
                viewportExtents: null,
            }
        }
    },
    watch: {
        currentCoordinate: {
            handler(val) {
                console.log(val);
                this.mousePostionControl.setProjection(ol.Proj.get(val))
            },
            deep: true, //深度监听
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
            this.gaodeLayer =  new ol.Layer.Tile({
                title: "高德地图",
                source: new ol.Source.XYZ({
                    url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    wrapX: false,
                    crossOrigin: "Anonymous"
                }),
                visible: true, // 显示该图层
            });

            // 实例化Map对象，加载地图
            this.MapOperation = new ol.Map({
                target: 'MapOperation', // 地图容器
                layers: [ this.gaodeLayer ], // 地图容器中加载的图层（注意顺序）
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
            this.mousePostionControl = new ol.Control.MousePosition({
                coordinateFormat: ol.Coordinate.createStringXY(4), // 坐标格式
                projection: 'EPSG:4326', // 地图投影坐标系（未设置输出默认投影坐标系下的坐标）
                className: 'custom-mouse-position', // 坐标信息显示样式类名 默认是：ol-mouse-position
                target: document.querySelector('#mouse-position'), // 显示鼠标位置信息的目标容器
                undefinedHTML: '&nbsp;', // 未定义坐标的标记(离开地图)
            })
            this.MapOperation.addControl(this.mousePostionControl)
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
            this.visiblePosition = true
        },
        // 地图层级
        MapHierarchy() {
            this.visiblePosition = true
        },
        // 地图视窗逻辑坐标
        MapCoordinate() {
            this.visibleCoordinate = true;
        },
        // 地图域信息
        MapRegionInformation() {
            this.visibleCoordinate = true;
            
            let view = this.MapOperation.getView(); // 获取地图视图。返回值为{ol.View}类。
            let curResolution = view.getResolution(); // 获取最大分辨率
            this.MapRegionData.currentResolution = curResolution
            
            let ex = view.calculateExtent(this.MapOperation.getSize()) // 获取地图范围
            this.MapRegionData.mapRange =  ex

            let viewSize = this.MapOperation.getSize() // 地图容器大小
            this.MapRegionData.viewportExtents = viewSize
        },
        // 地图下载PNG
        MapDownloadPNG() {
            this.MapOperation.once('rendercomplete', function () {
                let mapCanvas = document.createElement('canvas');
                let size = this.MapOperation.getSize();
                mapCanvas.width = size[0];
                mapCanvas.height = size[1];
                let mapContext = mapCanvas.getContext('2d');
                Array.prototype.forEach.call(
                    document.querySelectorAll('.ol-layer canvas'),
                    function (canvas) {
                        if (canvas.width > 0) {
                            let opacity = canvas.parentNode.style.opacity;
                            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                            let transform = canvas.style.transform;
                            let matrix = transform
                                .match(/^matrix\(([^\(]*)\)$/)[1]
                                .split(',')
                                .map(Number);
                            CanvasRenderingContext2D.prototype.setTransform.apply(
                                mapContext,
                                matrix
                            );
                            mapContext.drawImage(canvas, 0, 0);
                        }
                    }
                );
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
                } else {
                    let link = document.getElementById('image-download');
                    link.href = mapCanvas.toDataURL();
                    link.click();
                }
            });
            this.MapOperation.renderSync();
        },
        // 地图下载PDF
        MapDownloadPDF() {
            let feature = new ol.Format.WKT().readFeature(
            'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
                '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
                '-39.1552734375, 10.689697265625 -25.0927734375))'
            );
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

            document.body.style.cursor = 'progress';
            
            let dims = {
                a0: [1189, 841],
                a1: [841, 594],
                a2: [594, 420],
                a3: [420, 297],
                a4: [297, 210],
                a5: [210, 148],
            };
            let format = "a3";
            let resolution = '72';
            let dim = dims[format];
            let width = Math.round((dim[0] * resolution) / 25.4);
            let height = Math.round((dim[1] * resolution) / 25.4);
            let size = this.MapOperation.getSize();
            let viewResolution = this.MapOperation.getView().getResolution();

            this.MapOperation.once('rendercomplete', () => {
                let mapCanvas = document.createElement('canvas');
                mapCanvas.width = width;
                mapCanvas.height = height;
                let mapContext = mapCanvas.getContext('2d');
                Array.prototype.forEach.call(
                    document.querySelectorAll('.ol-layer canvas'),
                    function (canvas) {
                        if (canvas.width > 0) {
                            let opacity = canvas.parentNode.style.opacity;
                            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                            let transform = canvas.style.transform;

                            let matrix = transform
                                .match(/^matrix\(([^\(]*)\)$/)[1]
                                .split(',')
                                .map(Number);

                            CanvasRenderingContext2D.prototype.setTransform.apply(
                                mapContext,
                                matrix
                            );
                            mapContext.drawImage(canvas, 0, 0);
                        }
                    }
                );
                
                let pdf = new jsPDF('landscape', 'pt', 'a4');
                pdf.addImage(
                    mapCanvas.toDataURL('image/jpeg'),
                    'JPEG',
                    0,
                    0,
                    dim[0],
                    dim[1]
                );
                pdf.save('map.pdf');
                
                this.MapOperation.setSize(size);
                this.MapOperation.getView().setResolution(viewResolution);
                document.body.style.cursor = 'auto';
            });

            let printSize = [width, height];
            this.MapOperation.setSize(printSize);
            let scaling = Math.min(width / size[0], height / size[1]);
            this.MapOperation.getView().setResolution(viewResolution / scaling);
        },
        // 地图事件触发
        MapEvent() {
            this.MapOperation.on('singleclick', e => {
                alert("鼠标被单击了",e);
            })
        },
        // 地图图层探查
        MapLayerExploration() {
            let radius = 75; // 探查半径
            
            document.addEventListener('keydown', function (evt) { // 添加键盘按下事件监听，用来控制探查范围的大小
                if (evt.which == 38) {
                    radius = Math.min(radius + 5, 150);
                    //this.MapOperation.renderSync();
                    evt.preventDefault();
                } else if (evt.which == 40) {
                    radius = Math.max(radius - 5, 25);
                    this.MapOperation.renderSync();
                    evt.preventDefault();
                }
            });

            // 实时得到鼠标的像素位置
            let mousePosition = null;

            //设置地图容器放置位置
            let container = document.querySelector('#MapOperation');

            container.addEventListener('mousemove', event => {
                console.log(this.MapOperation);
                mousePosition = this.MapOperation.getEventPixel(event);
                ol.renderSync(this.MapOperation);
            });

            container.addEventListener('mouseout', () => {
                mousePosition = null;
                this.MapOperation.renderSync();
            });

            // 在渲染层之前,做剪裁
            this.gaodeLayer.on('precompose', event => {
                let ctx = event.context;
                let pixelRatio = event.frameState.pixelRatio;
                ctx.save();
                ctx.beginPath();
                if (mousePosition) {
                    //只显示一个围绕着鼠标的圆圈
                    ctx.arc(mousePosition[0] * pixelRatio, mousePosition[1] * pixelRatio, radius * pixelRatio, 0, 2 * Math.PI);
                    ctx.lineWidth = 5 * pixelRatio;
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                    ctx.stroke();
                }
                ctx.clip();
            });

            // 呈现层后,恢复画布的背景
            this.gaodeLayer.on('postcompose', event => {
                let ctx = event.context;
                ctx.restore();
            });
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
            view.setZoom(this.positionFrom.zoom);
            this.visiblePosition = false;
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
            font-family: "微软雅黑";
            float: right;
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