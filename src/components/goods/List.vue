<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
      import {instance} from '../../service/request'
      import { ElMessage, ElMessageBox } from 'element-plus'
      import {ref, reactive, onBeforeMount} from 'vue'
      import { useRouter } from 'vue-router'
      const router = useRouter()
      const queryInfo = reactive({
        query: '',
        pagenum: 1,
        pagesize: 10
      })
      // 商品列表
      const goodslist = ref([])
      // 总数据条数
      const total = ref(0)
      onBeforeMount(()=>{
        getGoodsList()
      })

      const getGoodsList = async () => {
        const { data: res } = await instance.get('goods', {
          params: queryInfo
        })

        if (res.meta.status !== 200) {
          return ElMessage.error('获取商品列表失败！')
        }

        ElMessage.success('获取商品列表成功！')
        console.log(res.data)
        goodslist.value = res.data.goods
        total.value = res.data.total
      }
      const handleSizeChange = (newSize) => {
        queryInfo.pagesize = newSize
        getGoodsList()
      }
      const handleCurrentChange = (newPage) => {
        queryInfo.pagenum = newPage
        getGoodsList()
      }
      const removeById = async (id) => {
        const confirmResult = await ElMessageBox.confirm(
          '此操作将永久删除该商品, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        if (confirmResult !== 'confirm') {
          return ElMessage.info('已经取消删除！')
        }

        const { data: res } = await instance.delete(`goods/${id}`)

        if (res.meta.status !== 200) {
          return ElMessage.error('删除失败！')
        }

        ElMessage.success('删除成功！')
        getGoodsList()
      },
      const goAddpage = () => {
        router.push('/goods/add')
      }
</script>

<style lang="less" scoped>
</style>
