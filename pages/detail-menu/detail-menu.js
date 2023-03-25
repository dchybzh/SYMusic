// pages/detail-menu/detail-menu.js
import { getPlayListHot, hotMenu } from "../../services/music"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    songMenus: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchPlayListHot()
  },
  // 1.发送网络请求获取热门歌单分类
  async fetchPlayListHot() {
    const tagRes = await getPlayListHot()
    console.log(tagRes, '--tagRes--');
    const tags = tagRes.tags
    // 2.根据tags去获取对应的歌单
    const allPromise = []
    // 循环tags 里的每一个对象，然后用tag.name再发送请求,获得所有的promise对象，然后再统一解析
    for (const tag of tags) {
      // console.log(tag, "--tag--");
      const promise = hotMenu(tag.name)
      allPromise.push(promise)
    }
    // 3.获取到所有的数据之后，调用一次 setData()
    // all的作用：所有promise都成功后，得到所有成功后的promise结果，
    // 如果有一个先失败了，直接得到最先失败promise的结果
    Promise.all(allPromise).then(res => {
      console.log(res, '--detail-tag--');
      this.setData({ songMenus: res })
    })
  },


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