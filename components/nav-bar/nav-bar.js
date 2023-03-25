// components/nav-bar/nav-bar.js
const app = getApp()
Component({
  // 多插槽要开启
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    satusHeight: 20
  },

  lifetimes: {
    attached() {
      this.setData({satusHeight: app.globalData.statusBarHeight})
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 返回按钮
    onLeftClick() {
      //  //返回上一级，关闭当前页面
      //  wx.navigateBack({
      //   delta: 1
      // })
      this.triggerEvent("leftclick")
    }
  }
})
