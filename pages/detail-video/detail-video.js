// pages/detail-video/detail-video.js
import { getMvUrl, getMvInfo, getMvRelated } from '../../services/video'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    mvUrl: '',
    danmuList: [
      {
        text: '哈哈哈，真好听',
        color: '#ff0000',
        time: 3 // 弹幕出现的时间
      },
      {
        text: '不错哦',
        color: '#ffff00',
        time: 10
      },
      {
        text: '嘿嘿嘿，太好听了',
        color: '#00ffff',
        time: 15
      }
    ],
    mvInfo: {},
    mvRelated: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 1.获取id
    const id = options.id
    this.setData({ id })

    // 2.调用fetchMvUrl()请求 mvUrl 数据
    this.fetchMvUrl()

    // 3. 获取mv的info
    this.fetchMvInfo()

    // 4.请求相关视频
    this.fetchMvRelated()
  },

  // 2.请求mvUrl数据
  async fetchMvUrl() {
    // 这里直接写this.data.id，或者上面直接写id都可以
    const res = await getMvUrl(this.data.id)
    // console.log(res, '---mvurl---');
    this.setData({ mvUrl: res.data.url })
  },
  
  // 3.请求mv详情数据
  async fetchMvInfo() {
    const res = await getMvInfo(this.data.id)
    // console.log(res, '---info---');
    this.setData({
      mvInfo: res.data
    })
  },

  // 4.请求相关视频
  async fetchMvRelated() {
    const res = await getMvRelated(this.data.id)
    // console.log(res, '----mvRelated---');
    this.setData({mvRelated: res.data})
  },
  // 推荐视频再点进去，接口有问题，出不来页面
  // onMvRelatedTap(e) {
  //   const index = e.currentTarget.dataset.item
  //   console.log(index,'----index---');
  //   const tapItem = this.data.mvRelated[index]
  //   console.log(tapItem, '-----点击推荐视频-----');
  //   wx.navigateTo({
  //     url: `/pages/detail-video/detail-video?id=${tapItem.vid}`,
  //   })
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})