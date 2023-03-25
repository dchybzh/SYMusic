// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 3.获取设备信息
    wx.getSystemInfo({
      success: (res) => {
        // console.log(res, '--getSystemInfo--');
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - 44
      }
    })
  },
  globalData: {
    screenWidth: 375,
    screenHeight: 667,
    statusBarHeight: 20,
    contentHeight: 500
  }
})
