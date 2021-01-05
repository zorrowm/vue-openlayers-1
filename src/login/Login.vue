<template>
    <div class="login">
        <a-col class="loginLeft" :span="15" :offset="2">
            <p class="loginName">Openlayers地图实例</p>
        </a-col>
        <a-col class="loginRight" :span="7">
            <a-form-model
                class="loginForm"
                ref="loginForm"
                :model="formData"
                :rules="rules"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
            >
                <a-form-model-item  prop="username">
                    <a-input v-model="formData.username" placeholder="账号" @pressEnter="onSubmit">
                        <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, 0.25)" />
                    </a-input>
                </a-form-model-item>
                <a-form-model-item  prop="password">
                    <a-input type="password" v-model="formData.password" placeholder="密码" @pressEnter="onSubmit">
                        <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, 0.25)" />
                    </a-input>
                </a-form-model-item>
                <a-form-model-item >
                    <a-button class="loginButton" type="primary" @click="onSubmit"> 登录 </a-button>
                </a-form-model-item>
            </a-form-model>
        </a-col>
    </div>
</template>
<script>
import { mapMutations } from 'vuex'
export default {
    name: 'Login',
    data() {
        return {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
            formData:{
                username: "",
                password: "",
            },
            rules: {
                username: [
                    { required: true, message: '请输入账号', trigger: 'blur' },
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ],
            }
        }
    },
    methods: {
        ...mapMutations(['setState']),
        onSubmit() {
            // 验证表单填写
            this.$refs.loginForm.validate(valid => {
                if(valid){
                    if(this.formData.username === "admin" && this.formData.password === "123456") {
                        this.$notification.success({
                            message: '登录成功',
                            description: '即将跳转首页',
                        })
                        
                        // 存储在 VueX 调用mutations存储state值
                        this.setState({
                            user: {
                                username: this.formData.username,
                                password: this.formData.password,
                            }
                        })

                        // sessionStorage存储
                        sessionStorage.setItem("userInformation", JSON.stringify(this.formData))

                        // vue-router 传参方式（ 接参：this.$route.params ）query会拼接到url，params不会
                        this.$router.push({
                            name: 'Layout',
                            params: {
                                username: this.formData.username,
                                password: this.formData.password,
                            }
                        })
                        
                    }else{
                        this.$notification.error({
                            message: '请输入正确的账号密码',
                            description: '',
                        })
                    }
                } else {
                    this.$notification.error({
                        message: '请输入账号密码',
                        description: '',
                    })
                }
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.login {
    width: 100%;
    height: 100%;
    color: #fff;
    background: url(~@/assets/background.jpg) center no-repeat;
    background-size: 100% 100%;

    .loginLeft {
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;

        .loginName {
            font-size: 60px;
        }
    }

    .loginRight {
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;

        .loginForm {
            width: 100%;
            height: 200px;

            .loginButton {
                width: 100%;
            }
        }
    }
}
</style>