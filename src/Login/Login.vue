<template>
    <div class="login">
        <a-col class="loginLeft" :span="15" :offset="2">
            <p class="loginName">Openlayers地图学习实例</p>
        </a-col>
        <a-col class="loginRight" :span="7">
            <a-form-model
                class="loginForm"
                ref="ruleForm"
                :model="formData"
                :rules="rules"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
            >
                <a-form-model-item  prop="username">
                    <a-input v-model="formData.username" placeholder="账号">
                        <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, 0.25)" />
                    </a-input>
                </a-form-model-item>
                <a-form-model-item  prop="password">
                    <a-input v-model="formData.password" placeholder="密码">
                        <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, 0.25)" />
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
                name: [
                    { required: true, message: 'Please input Activity name', trigger: 'blur' },
                    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
                ],
            }
        }
    },
    created() {

    },
    methods: {
        ...mapMutations(['setState']),
        onSubmit() {
            if(this.formData.username === "admin" && this.formData.password === "123456") {
                this.$notification.success({
                    message: '登录成功',
                    description: '即将跳转',
                })
                
                // vue-router 传参方式（ 接参：this.$route.params ）
                this.$router.push({
                    name: '/',
                    params: {
                        username: this.formData.username,
                        password: this.formData.password,
                    }
                })
                console.log(this.$route.params);
                // 存储在VueX 调用mutations存储state值
                this.setState({
                    user: {
                        username: this.formData.username,
                        password: this.formData.password,
                    }
                })
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.login {
    width: 100%;
    height: 100%;
    color: #fff;

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
            width: 400px;
            height: 200px;

            .loginButton {
                width: 100%;
            }
        }
    }
}
</style>