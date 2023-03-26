// components/play-list/play-list.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Array,
      value: []
    },
    playModeName: {
      type: String,
      value: ''
    },
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
    onIconBtnTap() {
      // console.log('点击了', this.properties.playModeName);
      this.triggerEvent("IconBtnTap")
    },
    onPlayListTap(e) {
      // this.triggerEvent("playListTap")

      // const id = this.properties.itemData.id
      console.log("点击了", e);
      // wx.navigateTo({
      //   url: `/pages/music-player/music-player?id=${id}`,
      // })
    }
  }
})
