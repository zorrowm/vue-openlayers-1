<template>
    <div class="layout">
        <a-layout class="layout">
            <a-layout-header>Openlayers实例学习</a-layout-header>
            <a-layout>
                <a-layout-sider>
                    <a-menu
                        :default-selected-keys="[1]"
                        mode="inline"
                        theme="dark"
                    >
                        <a-menu-item v-for="i in menuData" :key="i.id">
                            <router-link :to="{path:i.component}">
                                <div class="menuName">
                                    <a-icon type="code-sandbox" />
                                    <span>{{i.name}}</span>
                                </div>
                            </router-link>
                        </a-menu-item>
                    </a-menu>
                </a-layout-sider>
                <a-layout-content>
                    <router-view></router-view>
                </a-layout-content>
            </a-layout>
        </a-layout>
    </div>
</template>
<script>
export default {
    name:"Layout",
    data() {
        return {
            collapsed: false,
            menuData: [
                {id: 1, component: 'MapDraw', name: '画图'},
                {id: 2, component: 'MapHeat', name: '热力图'}, 
            ],
        }
    },
    mounted() {
        console.log("132423");
    }
}
</script>
<style lang="scss" scoped>
.layout{
    width: 100%;
    height: 100%;
    color: #ffffff;
    
    .ant-layout-header {
        text-align: center;
        font-size: 24px;
    }

    .menuName{
        color: #ffffff;
    }

}
</style>