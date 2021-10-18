<template>
    <el-container class="home_container">
      <el-header>
        <div class="title">
            <img src="../assets/logo.png" alt="">
            <span>System</span>  
        </div>
        <el-button type='info' @click="exit">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'" ref="refAside">
            <div class="toggleAside" @click="toggle">|||</div>
            <el-menu  unique-opened :collapse=isCollapse :collapse-transition=false router :default-active="activePath">
            <el-sub-menu v-for="menuItem in menu" :key=menuItem.id :index="'/'+menuItem.path">
            <template #title>
                <i class="el-icon-location"></i>
                <span>{{menuItem.authName}}</span>
            </template>

            <el-menu-item  v-for="child in menuItem.children" :key="child.id" :index="'/'+child.path" 
            @click="saveActivePath('/'+child.path)">{{child.authName}}</el-menu-item>
            </el-sub-menu>
            </el-menu>
        </el-aside>
        <el-main><router-view/></el-main>
      </el-container>
    </el-container>
</template>
<script setup>
    import { onBeforeMount, reactive, ref, toRefs} from 'vue'
    import { useRouter } from 'vue-router'
    import instance from '../service/request'
    const router = useRouter()
    const menu = ref(null)
    const activePath = ref(null)
    const isCollapse = ref(false)
    const refAside = ref(null)
    const exit = () => {
        window.sessionStorage.removeItem('token')
        router.push('/login')
    }
    const getList = async () => {
        const {data: res} = await instance.get('menus')
        menu.value = res.data
    }
    const toggle = () => {
        isCollapse.value = !isCollapse.value
    }
    const saveActivePath = (newActivePath) => {
        window.sessionStorage.setItem("activePath", newActivePath)
        activePath.value = newActivePath
    }
    onBeforeMount(() => {
        getList()
        activePath.value = window.sessionStorage.getItem("activePath")
    })
</script>
<style lang='less' scoped>
.el-header {
    background-color: #373D41;
    padding: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 20px;
    .title{
        display: flex;
        align-items: center;
        img{
            height: 50px;
            width: 50px;
        }
        span{
            margin-left: 15px;
        }
    }
}
.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #eaedf1;
}
.home_container{
    height: 100%;
}
.toggleAside{
    text-align: center;
    background-color: gray;
    line-height: 24px;
    font-size: 10px;
    letter-spacing: 0.2em;
}
</style>