// pages/detail-song/detail-song.js
import recommendStore from "../../store/recommendStore"
import rankStore from "../../store/rankStore"
import { getPlaylistDetail } from "../../services/music"
import playerStore from "../../store/playerStore"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "rank",
    key: "newRank",

    songInfo: {},

    id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 1.确定获取数据的类型
    // type: rank -> 榜单数据
    // type: recommend -> 歌单更多数据
    const type = options.type
    this.setData({type})
    // 1.获取 store 中榜单数据
    if (type === "rank") {
      const key = options.key
      this.data.key = key
      rankStore.onState(key, this.handleRank)
    } else if (type === "recommend") {
      recommendStore.onState("recommendSongInfo", this.handleRank)
    } else if (type === "menu") {
      const id = options.id
      this.data.id = id
      this.fetchMenuSongInfo()
    }

  },
  // 请求热门歌单的歌曲
  async fetchMenuSongInfo() {
    const res = await getPlaylistDetail( this.data.id)
    // console.log(res, '---MenuSongInfo---');
    this.setData({songInfo: res.playlist})
  },
  
  // -------------  wxml 事件监听 ---------
  onSongItemTap(e) {
    // console.log('---onSongItemTap---', e);
    const index = e.currentTarget.dataset.index
    playerStore.setState('playSongList', this.data.songInfo.tracks)
    playerStore.setState('playSongIndex', index)
    // console.log(this.data.songInfo.tracks);
  },

  // ================ 监听 Store 共享数据  的回调函数 =============
  handleRank(value) {
    // console.log(value, "----hanleRank---"); 
    if (this.data.type === "recommend") {
      value.name = "推荐歌曲"
    }
    this.setData({songInfo: value})
    // 设置详情页的 navTitle
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.data.type === "rank") {
      rankStore.offState(this.data.key, this.handleRank)
    } else if (this.data.type === "recommend") {
      recommendStore.offState("recommendSongInfo", this.handleRank)
    }
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