<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="addForm.goods_cat" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script setup>
import _ from 'lodash'
import {instance} from '../../service/request'
import { ElMessage } from 'element-plus'
import {ref, reactive, onBeforeMount, computed} from 'vue'
import {useRouter} from 'vue-router'
      const router = useRouter()
      const addFormRef = ref(null)
      const activeIndex = ref('0')
      // 添加商品的表单数据对象
      const addForm = reactive({
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      })
      const addFormRules = reactive({
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      })
      // 商品分类列表
      const catelist = ref([])
      const cateProps =  reactive({
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      })
      // 动态参数列表数据
      const manyTableData = ref([])
      // 静态属性列表数据
      const onlyTableData = ref([])
      // 上传图片的URL地址
      const uploadURL = 'http://127.0.0.1:8888/api/private/v1/upload'
      // 图片上传组件的headers请求头对象
      const headerObj = reacive({
        Authorization: window.sessionStorage.getItem('token')
      })
      const previewPath = ref('')
      const previewVisible = ref(false)
      const cateId = computed(() => {
        if (addForm.goods_cat.length === 3) {
          return addForm.goods_cat[2]
        }
        return null
      })
      onBeforeMount(()=>{getCateList()})
    // 获取所有商品分类数据
      const getCateList = async () => {
        const { data: res } = await instance.get('categories')
        if (res.meta.status !== 200) {
          return ElMessage.error('获取商品分类数据失败！')
        }
        catelist.value = res.data
      }
      const handleChange = () => {
        console.log(addForm.goods_cat)
        if (addForm.goods_cat.length !== 3) {
          addForm.goods_cat = []
        }
      }
      const beforeTabLeave = (activeName, oldActiveName) => {
        if (oldActiveName === '0' && addForm.goods_cat.length !== 3) {
          ElMessage.error('请先选择商品分类！')
          return false
        }
      }
      const tabClicked = async () => {
        // 证明访问的是动态参数面板
        if (activeIndex.value === '1') {
          const { data: res } = await instance.get(
            `categories/${cateId}/attributes`,
            {
              params: { sel: 'many' }
            }
          )

          if (res.meta.status !== 200) {
            return ElMessage.error('获取动态参数列表失败！')
          }

          console.log(res.data)
          res.data.forEach(item => {
            item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          manyTableData.value = res.data
        } else if (activeIndex.value === '2') {
          const { data: res } = await instance.get(
            `categories/${cateId}/attributes`,
            {
              params: { sel: 'only' }
            }
          )

          if (res.meta.status !== 200) {
            return ElMessage.error('获取静态属性失败！')
          }

          console.log(res.data)
          onlyTableData.value = res.data
        }
      }
      // 处理图片预览效果
      const handlePreview = (file) => {
        console.log(file)
        previewPath = file.response.data.url
        previewVisible.value = true
      }
    // 处理移除图片的操作
      const handleRemove = (file) => {
        // console.log(file)
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = addForm.pics.findIndex(x => x.pic === filePath)
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        addForm.pics.splice(i, 1)
      }
    // 监听图片上传成功的事件
      const handleSuccess = (response) => {
        console.log(response)
        // 1. 拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path }
        // 2. 将图片信息对象，push 到pics数组中
        addForm.pics.push(picInfo)
        console.log(addForm)
      }
    // 添加商品
      const add = () => {
        addFormRef.validate(async valid => {
          if (!valid) {
            return ElMessage.error('请填写必要的表单项！')
          }
          // 执行添加的业务逻辑
          // lodash   cloneDeep(obj)
          const form = _.cloneDeep(addForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          onlyTableData.forEach(item => {
            const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
            addForm.attrs.push(newInfo)
          })
          form.attrs = addForm.attrs
          console.log(form)

          // 发起请求添加商品
          // 商品的名称，必须是唯一的
          const { data: res } = await instance.post('goods', form)

          if (res.meta.status !== 201) {
            return ElMessage.error('添加商品失败！')
          }

          ElMessage.success('添加商品成功！')
          router.push('/goods')
        })
      }
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
