// pages/main-video/main-video.js
import { getTopMv } from '../../services/video'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoList: [],
    offset: 0,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 1.获取topMv
    this.fetchTopMv()
  },

  // 1.发送网络请求的函数方法
  async fetchTopMv() {
    // getTopMv().then((res) => {
    //   this.setData({ videoList: res.data })
    // })
    // 1.1获取数据
    const res = await getTopMv(this.data.offset)

    // 2.将新数据追加到原来数据的后面
    const newVideoList = [...this.data.videoList, ...res.data]

    // 3.设置全新的数据
    this.setData({ videoList: newVideoList })
    // 这里offset的更新还不会引起页面的渲染，所以没必要使用setData修改
    this.data.offset = this.data.videoList.length
    this.data.hasMore = res.hasMore


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh() {
    // console.log('下拉刷新的监听');
    // 1.清空之前的数据
    this.setData({ videoList: [] })
    this.data.offset = 0
    this.hasMore = true

    // 2.重新请求新的数据
    // this.fetchTopMv().then(() => {
    //   // 4.等到有结果之后，再停止下拉刷新
    //   wx.stopPullDownRefresh()
    // })
    await this.fetchTopMv()

    // 4.等到有结果之后，再停止下拉刷新
    wx.stopPullDownRefresh()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // console.log('滚动到底部，加载更多');
    // 1.2判断是否有更多数据，如果有再请求新数据
    if (this.data.hasMore) {
      this.fetchTopMv()
    }
  },

  // -------- 界面事件监听 --------
  onVideoItemtap(e) {
    // console.log('onVideoItemtap');
    // const item = e.currentTarget.dataset.item
    // console.log(item);
    // // 发送带id的路径
    // wx.navigateTo({
    //   url: `/pages/detail-video/detail-video?id=${item.id}`
    // })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})