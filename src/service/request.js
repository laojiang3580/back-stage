const axios = require('axios')
const instance =  axios.create({
    baseURL: "http://127.0.0.1:8888/api/private/v1/",
    timeout: 3000
})
instance.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
export default instance