// components/rank-item/rank-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {}
    },
    key: {
      type: String,
      value: "newRank"
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
    onRankItemTap() {
      const key = this.properties.key
      // console.log(key, "---key---");
      wx.navigateTo({
        url: `/pages/detail-song/detail-song?type=rank&key=${key}`,
      })
    }
  }
})
