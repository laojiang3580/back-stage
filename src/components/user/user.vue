<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">     
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input v-model="queryInfo.query" placeholder="Please input" class="input-with-select"
                clearable @clear="getUsers">
                    <template #append>
                        <el-button icon="el-icon-search" @click="getUsers()"></el-button>
                    </template> 
                </el-input>
            </el-col>
            <el-col :span="2"><el-button type="primary" @click="dialogVisible=true">添加用户</el-button></el-col>
        </el-row>
        <el-table :data="users" border stripe>
            <el-table-column type="index" label="#" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="mobile" label="电话" />
            <el-table-column prop="role_name" label="角色" />
            <el-table-column prop="mg_state" label="状态">
                <template v-slot="scope">
                    <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"/>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200px">
                <template v-slot="scope">
                    <el-tooltip
                        effect="dark"
                        content="修改角色"
                        placement="top"
                        :enterable="false"
                    >
                    <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                    </el-tooltip>
                    <el-tooltip
                        effect="dark"
                        content="分配角色"
                        placement="top"
                        :enterable="false"
                    >
                    <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                    </el-tooltip>
                    <el-tooltip
                        effect="dark"
                        content="删除角色"
                        placement="top"
                        :enterable="false"
                    >
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
        v-model:currentPage="queryInfo.pagenum"
        :page-sizes="[1, 2, 4]"
        v-model:page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next"
        :total="totalSize"
        @size-change="getUsers()"
        @current-change="getUsers()"
        >
        </el-pagination>
    </el-card>
    <el-dialog
    v-model="dialogVisible"
    title="Tips"
    width="50%"
    @close="closeDialog"
    >
    <span>添加新用户</span>
    <el-form ref="addUserForm" :rules="userRules" :model="userForm" label-width="120px" class="userForm">
            <el-form-item label="用户名" prop="username">
                <el-input prefix-icon="el-icon-avatar" v-model="userForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input prefix-icon="el-icon-key" type="password" autocomplete="off" v-model="userForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input prefix-icon="el-icon-avatar" v-model="userForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话号码" prop="mobile">
                <el-input prefix-icon="el-icon-avatar" v-model="userForm.mobile"></el-input>
            </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button type="primary" @click="addUser">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
    import { onBeforeMount, ref, reactive } from 'vue';
    import { ElMessage } from 'element-plus';
    import instance from '../../service/request';
    const users = ref(null) 
    const totalSize = ref(null)
    const addUserForm = ref(null)
    const dialogVisible = ref(false)
    const queryInfo = reactive({
        query:'',
        pagenum : 1,
        pagesize : 2
    })
    const searchContent = ref('')
    const userForm = reactive({
        username:'',
        password:'',
        email:'',
        mobile:''
    })
    const mobilePass = (rule, value, callback) => {
        const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (reg.test(value)) {
          callback()
        }
        else{callback(new Error('Please input the correct mobile'))}
    }
    const emailPass = (rule, value, callback) => {
        const reg =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (reg.test(value)) {
            callback()
        }
        else{
            callback(new Error('Please input the correct email'))
        }
    }
    const userRules = reactive({
        username: [
            {
                required: true,
                message: 'Please input Username',
                trigger: 'blur',
            },
            {
                min: 3,
                max: 10,
                message: 'Length should be 3 to 5',
                trigger: 'blur',
            }
        ],
        password: [
            {
                required: true,
                message: 'Please input Password',
                trigger: 'blur',
            },
            {
                min: 6,
                max: 15,
                message: 'Length should be 3 to 5',
                trigger: 'blur',
            }
        ],
        email: [{required: true,message: 'Please input email',trigger: 'blur',},{ validator: emailPass, trigger: 'blur' }],
        mobile: [{required: true,message: 'Please input mobile',trigger: 'blur',},{ validator: mobilePass, trigger: 'blur' }]
    })
    const getUsers = async () => {
        const {data: res} = await instance.get("users",{params:queryInfo})
        if(res.meta.status !== 200)
            return ElMessage({message: '获取用户数据失败',type: 'error'})
        users.value = res.data.users
        totalSize.value =res.data.total
    }
    const changeState = async (user) => {
        const {data: res} = await instance.put(`users/${user.id}/state/${user.mg_state}`)
        if(res.meta.status === 200)
            ElMessage({message: '修改成功',type: 'success'})
        else{
            ElMessage({message: '修改失败',type: 'error'})
            user.mg_state = !user.mg_state
        }
    }
    const cancel = () => {
        dialogVisible.value = false
    }
    const addUser = () => {
        addUserForm.value.validate(async valid => {
            if(!valid){return}
            const {data: res} = await instance.post('users', userForm)
            console.log(res);
            if(res.meta.status!==201){
                ElMessage({
                message: '添加失败',
                type: 'error'
                })
                return
            }else{
                ElMessage({
                message: '添加成功',
                type: 'success'
                })
                dialogVisible.value = false
                getUsers()
            }
        })
        
    }
    const deleteUser = async (user) => {
        const {data: res} = await instance.delete(`users/${user.id}`)
        if(res.meta.status!==200){
                ElMessage({
                message: '删除失败',
                type: 'error'
                })
                return
            }else{
                ElMessage({
                message: '删除成功',
                type: 'success'
                })
                getUsers()
        }
    }
    const closeDialog = () => {
        addUserForm.value.resetFields()
    }
    onBeforeMount(()=>{
        getUsers()
    })
</script>

<style lang="less" scoped>
.box-card{
    margin-top: 15px;
}
.el-table{
    margin-top: 15px;
}
.el-pagination{
    margin-top: 15px;
}
</style>