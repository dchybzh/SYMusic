// components/menu-area/menu-area.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '默认歌单'
    },
    menuList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    screenWidth: 375
  },

  // 组件的生命周期
  lifetimes: {
    // 在组件实例刚刚被创建时执行
    created() {
      // created 生命周期不可以使用setData
      // this.setData({screenWidth: app.globalData.screenWidth})
    },
    // 在组件实例进入页面节点树时执行
    attached() {
      this.setData({screenWidth: app.globalData.screenWidth})
    },
    ready() {}  // 在组件在视图层布局完成后执行
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击更多跳转页面
    onMenuMoreClick() {
      wx.navigateTo({
        url: '/pages/detail-menu/detail-menu',
      })
    }
  }
})
