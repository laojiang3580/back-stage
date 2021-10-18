<template>
  <div class="login_container">
      <div class="loginbox">
        <el-form ref="form" :rules="rules" :model="loginForm" label-width="120px" class="loginForm">
            <el-form-item label="用户名" prop="username">
                <el-input prefix-icon="el-icon-avatar" v-model="loginForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input prefix-icon="el-icon-key" type="password" autocomplete="off" v-model="loginForm.password"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submit">登录</el-button>
                <el-button type="info" @click="clear">重置</el-button>
            </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script setup>
    import {ref, reactive, toRefs, onMounted} from 'vue'
    import { useRouter } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import instance from "../../service/request.js"
    const router = useRouter()
    const form = ref(null)
    const loginForm = reactive({
        username:'admin',
        password:'123456'
    })
    const rules = reactive({
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
        ]
    })
    onMounted(()=>{
        
    })
    const clear = () => {
        form.value.resetFields()
    }
    const submit = () => {
        form.value.validate(async valid => {
            if(!valid){return}
            const {data: res} = await instance.post('login', loginForm)
            if(res.meta.status!==200){
                ElMessage({
                message: '登录失败',
                type: 'error'
                })
                return
            }else{
                ElMessage({
                message: '登录成功',
                type: 'success'
                })
                console.log(res);
                window.sessionStorage.setItem("token", res.data.token)
                router.push('/home')
            }
        })
    }

</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}
.loginbox{
    width: 450px;
    height: 350px;
    background-color: white;
    border-radius: 3px;
    position:absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avatar{
    height: 130px;
    width: 130px;
    border-radius: 50%;
    border: 1px solid gray;
    overflow: hidden;
    img{
        height: 100%;
        width: 100%
    }
}
.loginForm{
    position: absolute;
    top:50%;
    transform: translateY(-50%);
    width:80%;
    padding: 0 10px;
}
</style>