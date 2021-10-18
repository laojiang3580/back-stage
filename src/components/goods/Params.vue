<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
    import {ref, reactive, onBeforeMount, nextTick} from 'vue'
    import {instance} from '../../service/request'
    import { ElMessage,ElMessageBox } from 'element-plus'
      const addFormRef = ref(null)
      const editFormRef = ref(null)
      const saveTagInput =ref(null)
      const catelist = ref([])
      const cateProps = reactive({
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      })
      const selectedCateKeys = ref([])
      const activeName = ref('many')
      const manyTableData = ref([])
      const onlyTableData = ref([])
      const addDialogVisible = ref(false)
      const addForm = reactive({
        attr_name: ''
      })
      const addFormRules = reactive({
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      })
      const editDialogVisible = ref(false)
      const editForm = ref({})
      const editFormRules = reative({
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      })

      const isBtnDisabled = computed(()=>{
        if (selectedCateKeys.value.length !== 3) {
          return true
        }
        return false
      })
      const cateId = computed(() => {
        if (selectedCateKeys.value.length === 3) {
          return selectedCateKeys.value[2]
        }
        return null
      })
      const titleText = computed(() => {
        if (activeName.value === 'many') {
          return '动态参数'
        }
        return '静态属性'
      })
      onBeforeMount(() => {
        getCateList()
      })
      const getCateList = async () => {
      const { data: res } = await instance.get('categories')
        if (res.meta.status !== 200) {
          return ElMessage.error('获取商品分类失败！')
        }
        catelist.value = res.data
      }
      const handleChange = () => {
        getParamsData()
      }
      const handleTabClick = () => {
        getParamsData()
      }
      const getParamsData = async () => {
        if (selectedCateKeys.value.length !== 3) {
          selectedCateKeys.value = []
          manyTableData.value = []
          onlyTableData.value = []
          return
        }

        const { data: res } = await instance.get(
          `categories/${cateId}/attributes`,
          {
            params: { sel: activeName }
          }
        )

        if (res.meta.status !== 200) {
          return ElMessage.error('获取参数列表失败！')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          item.inputValue = ''
        })

        if (activeName.value === 'many') {
          manyTableData.value = res.data
        } else {
          onlyTableData.value = res.data
        }
      }
      const addDialogClosed = () => {
        addFormRef.value.resetFields()
      }
      // 点击按钮，添加参数
      const addParams = () => {
        addFormRef.value.validate(async valid => {
          if (!valid) return
          const { data: res } = await instance.post(
            `categories/${cateId}/attributes`,
            {
              attr_name: addForm.attr_name,
              attr_sel: activeName
            }
          )

          if (res.meta.status !== 201) {
            return ElMessage.error('添加参数失败！')
          }
          ElMessage.success('添加参数成功！')
          addDialogVisible.value = false
          getParamsData()
        })
      }
      const  showEditDialog = async (attrId) => {
        const { data: res } = await instance.get(
          `categories/${cateId}/attributes/${attrId}`,
          {
            params: { attr_sel: activeName.value }
          }
        )

        if (res.meta.status !== 200) {
          return ElMessage.error('获取参数信息失败！')
        }

        editForm.value = res.data
        editDialogVisible = true
      }
      const editDialogClosed = () => {
        editFormRef.value.resetFields()
      }
      const editParams = () => {
        editFormRef.value.validate(async valid => {
          if (!valid) return
          const { data: res } = await instance.put(
            `categories/${cateId}/attributes/${editForm.value.attr_id}`,
            { attr_name: editForm.value.attr_name, attr_sel: activeName.value }
          )

          if (res.meta.status !== 200) {
            return ElMessage.error('修改参数失败！')
          }

          ElMessage.success('修改参数成功！')
          getParamsData()
          editDialogVisible.value = false
        })
      }
      const removeParams = async (attrId) => {
        const confirmResult = await ElMessageBox.confirm(
          '此操作将永久删除该参数, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        if (confirmResult !== 'confirm') {
          return ElMessage.info('已取消删除！')
        }

        const { data: res } = await instance.delete(
          `categories/${cateId}/attributes/${attrId}`
        )

        if (res.meta.status !== 200) {
          return ElMessage.error('删除参数失败！')
        }

        ElMessage.success('删除参数成功！')
        getParamsData()
      }
      const handleInputConfirm = async (row) => {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        saveAttrVals(row)
      }
      const saveAttrVals = async (row) => {
        // 需要发起请求，保存这次操作
        const { data: res } = await instance.put(
          `categories/${cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          }
        )

        if (res.meta.status !== 200) {
          return ElMessage.error('修改参数项失败！')
        }

        ElMessage.success('修改参数项成功！')
      }
      const showInput = (row) => {
        row.inputVisible = true
        nextTick(_ => {
          saveTagInput.value.focus()
        })
      }
      const handleClose = (i, row) => {
        row.attr_vals.splice(i, 1)
        saveAttrVals(row)
      }
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
