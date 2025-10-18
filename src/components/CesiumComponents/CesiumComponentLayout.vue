<template>
    <div class="cesium-container" ref="cesiumElement"></div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { Viewer, Ion, WebMercatorProjection } from 'cesium'
// 组件的基本参数
const props = defineProps({
    token: {
        type: String,
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmY2QwZTgyYS0yOWFkLTQwM2QtYWYyOS0wYjY2YmQ5MDVhMTYiLCJpZCI6MjMyMTc3LCJpYXQiOjE3NDk3ODMzMzB9.N8GyH36fMLhOGsyzB8ez7UJicKgOxmDOMSBiSQO1zb0'
    }
})
const cesiumElement = ref(null)
let viewer = null

const initCesium = () => {
    if (!cesiumElement.value) {
        console.error('未能找到初始化时所需要的元素标签!')
        return;
    }
    // 配置Token
    if (!props.token) {
        console.error('请输入正确的Token!');
    } else {
        Ion.defaultAccessToken = props.token
    }
    viewer = new Viewer(cesiumElement.value, {
         mapProjection: new WebMercatorProjection(), // 确保 mapProjection 被正确配置
        /**
         * 是否开启地图底图选择器开关。
         */
        baseLayerPicker: false,
        /**
         * 前基础影像图层的视图模型（如果未提供）将使用第一个可用的基础图层。
         * 仅当options.baseLayerPicker设置为true时，此值才有效。
         */
        // // imageryProviderViewModels: custom,
        // ArcGisMapServerImageryProvider: custom,
        // /**
        //  * 要使用的地形提供商
        //  */
        // terrainProvider: terrainProvider,
        // terrainProvider: await CesiumTerrainProvider.fromIonAssetId(1),

        infoBox: false,
        geocoder: true, // 隐藏查找控件。
        homeButton: false, // 隐藏视角返回初始位置按钮
        sceneModePicker: false, // 隐藏视角模式3D, 2D, CV,
        // baseLayerPicker: false, // 隐藏图层选择
        navigationHelpButton: false, // 隐藏帮助按钮
        animation: false, // 隐藏动画控件
        timeline: false, // 隐藏时间轴
    });
    // viewer.scene.debugShowFramesPerSecond = true;
    viewer.scene.skyAtmosphere.show = true
}
onMounted(() => {
    initCesium();
})
</script>
<style lang="less" scoped>
.cesium-container {
    width: 100%;
    height: 100%;
    background: #6cf;
}
</style>