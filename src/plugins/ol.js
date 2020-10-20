import Map from "ol/Map"   // Map地图层
import View from "ol/View" // Map可视视图层
import * as Layer from "ol/layer" // 虚基类图层，可视化表达（矢量地图数据、栅格地图数据）
import * as Source from "ol/source" // 
import * as Control from "ol/control" // 地图控件基类
import * as Coordinate from 'ol/coordinate' // 
import * as Tilegrid from "ol/tilegrid" // 
import * as Proj from "ol/proj" // 

// 地图Css样式加载
import "ol/ol.css";

let ol = {
  Map: Map,
  View: View,
  Layer: Layer,
  Source: Source,
  Control: Control,
  Coordinate: Coordinate,
  Tilegrid: Tilegrid,
  Proj: Proj,
}

export default ol



