import { baseURL } from "./config"
// 封装网络请求 类 -> 实例
class Request {
  constructor(baseURL) {
    this.baseUrl = baseURL
  }
  // 封装request方法
  request(options) {
    // 结构出传过来的options里的 url
    const { url } = options
    // 返回一个 promise 对象
    return new Promise((resolve, reject) => {
      wx.request({
        // 把options传进来
        ...options,
        // 拼接 url
        url: this.baseUrl + url,
        success: (res) => {
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
  get(options) {
    // 这里 return 直接去调用 request 方法，把options 传进来，再加上method
    return this.request({ ...options, method: 'get' })
  }
  post(options) {
    return this.request({ ...options, method: 'post' })
  }
}

// 创建实例
// export const myRequest = new Request('http://codercba.com:9002')
export const myRequest = new Request(baseURL)
