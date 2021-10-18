<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
    import {ref, reactive, onBeforeMount} from 'vue'
    import {instance} from '../../service/request'
    import { ElMessage } from 'element-plus'
      const addCateFormRef = ref(null)
      const querInfo = reactive({
        type: 3,
        pagenum: 1,
        pagesize: 5
      })
      const catelist = ref([])
      const total = ref(0)
      const columns = reactive([
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ])
      const addCateDialogVisible = ref(false)
      const addCateForm = reactive({
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      })
      const addCateFormRules = reactive({
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      })
      const parentCateList = ref([])
      const cascaderProps = reactive({
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      })
      const selectedKeys = ref([])
      onBeforeMount(() => {
        getCateList()
      })
      const getCateList = async () => {
      const { data: res } = await instance.get('categories', {
        params: querInfo
      })

      if (res.meta.status !== 200) {
        return ElMessage.error('获取商品分类失败！')
      }
      console.log(res.data)
      catelist.value = res.data.result
      total = res.data.total
    }
    const handleSizeChange = (newSize) => {
      querInfo.pagesize = newSize
      getCateList()
    }
    // 监听 pagenum 改变
    const handleCurrentChange = (newPage) => {
      querInfo.pagenum = newPage
      getCateList()
    }
    const showAddCateDialog = () => {
      getParentCateList()
      addCateDialogVisible = true
    }
    // 获取父级分类的数据列表
    const getParentCateList = async () => {
      const { data: res } = await instance.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return ElMessage.error('获取父级分类数据失败！')
      }
      console.log(res.data)
      parentCateList.value = res.data
    }
    const parentCateChanged = () => {
      console.log(selectedKeys.value)
      if (selectedKeys.value.length > 0) { 
        addCateForm.cat_pid = selectedKeys.value[selectedKeys.value.length - 1]
        addCateForm.cat_level = selectedKeys.value.length
      } else {
        addCateForm.cat_pid = 0
        addCateForm.cat_level = 0
      }
    }
    // 点击按钮，添加新的分类
    const addCate = () => {
        addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await instance.post('categories', addCateForm)

        if (res.meta.status !== 201) {
          return ElMessage.error('添加分类失败！')
        }

        ElMessage.success('添加分类成功！')
        getCateList()
        addCateDialogVisible = false
      })
    }
    const addCateDialogClosed = () => {
      addCateFormRef.resetFields()
      selectedKeys.value = []
      addCateForm.cat_level = 0
      addCateForm.cat_pid = 0
    }

</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
