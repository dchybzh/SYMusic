// pages/detail-search/detail-search.js
import { getSearchSong, getSearchSongSuggest, getSearchSongDetail } from "../../services/search"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotSearch: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchSeachSong()
  },
  async fetchSeachSong() {
    const res = await getSearchSong()
    console.log(res);
    this.setData({hotSearch: res.result.hots})
  },

  // async onSearch(e) {
  //   const res = await getSearchSongDetail()
  //   console.log(res, '----res----');
  //   console.log(e);
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