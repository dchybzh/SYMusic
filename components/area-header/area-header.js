// components/area-header/area-header.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "默认标题"
    },
    hasMore: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 1.监听点击更多
    onMoreTap() {
      this.triggerEvent('moreclick')
    }
  }
})
