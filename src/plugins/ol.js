import Map from "ol/Map"   // Map地图层
import View from "ol/View" // Map可视视图层
import Features from "ol/Feature" // 
import Overlay from "ol/Overlay" //
import * as Observable from "ol/Observable" // 
import * as Layer from "ol/layer" // 虚基类图层，可视化表达（矢量地图数据、栅格地图数据）
import * as Source from "ol/source" // (Tile:切片，Image:整张地图，Vector:矢量地图源)
import * as Control from "ol/control" // 地图控件基类
import * as Coordinate from 'ol/coordinate' // 
import * as Tilegrid from "ol/tilegrid" // 
import * as Proj from "ol/proj" // 坐标系统定义和转换类
import * as Style from "ol/style" //  
import * as Interaction from "ol/interaction" // 
import * as Format from "ol/format" // 
import * as Geom from "ol/geom" // 
import * as Feature from "ol/Feature" // 
import * as Render from "ol/render" // 
import * as Sphere from 'ol/sphere';


// 地图Css样式加载
import "ol/ol.css";

let ol = {
  Map: Map,
  View: View,
  Features: Features,
  Overlay: Overlay,
  Observable: Observable,
  Layer: Layer,
  Source: Source,
  Control: Control,
  Coordinate: Coordinate,
  Tilegrid: Tilegrid,
  Proj: Proj,
  Style: Style,
  Interaction: Interaction,
  Format: Format,
  Geom: Geom,
  Feature: Feature,
  Render: Render,
  Sphere: Sphere,
}

export default ol



