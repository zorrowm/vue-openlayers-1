<template>
    <div class="layout">
        <a-layout class="layout">
            <a-layout-header>Openlayers实例学习</a-layout-header>
            <a-layout>
                <a-layout-sider>
                    <a-menu
                        mode="inline"
                        theme="dark"
                        :default-selected-keys="menuCurrent"
                        v-model="menuCurrent"
                        @click="menuSwitch"
                    >
                        <a-menu-item v-for="i in menuData" :key="i.component">
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
import { mapState, mapMutations } from 'vuex'

export default {
    name:"Layout",
    data() {
        return {
            menuData: [
                {component: '/MapControl', name: '地图控件'},
                {component: '/MapDraw', name: '画图'},
                {component: '/MapHeat', name: '热力图'}, 
            ],
            menuCurrent: ['/MapControl'],
        }
    },
    computed: {
        ...mapState({
            current: state => state.current,
        })
    },
    created() {
        this.menuCurrent = this.current
    },
    methods: {
        ...mapMutations([ 'setState' ]),
        menuSwitch(res) {
            this.setState({
                current: res.keyPath
            })
        }
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