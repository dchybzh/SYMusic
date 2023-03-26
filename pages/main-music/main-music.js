// pages/main-music/main-music.js
import { getMusicBanner, getPlaylistDetail, hotMenu } from '../../services/music'
import { querySelect } from '../../services/query-select'
// 导入 underscore
import { throttle } from 'underscore'
import recommendStore from '../../store/recommendStore'
import rankStore, { rankMap } from "../../store/rankStore"
import playerStore from '../../store/playerStore'
// 对 querySelect 函数做一个节流
const querySelectThrottle = throttle(querySelect, 50)
// 为获取全局共享数据拿到app
const app = getApp()
const modeName2 = ["order2", "repeat2", "random2"]
// let isShow = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchvalue: '',
    banners: [],
    bannerHeight: 0,
    recommendSongs: [], // 推荐歌曲
    hotMenuList: [],  // 热门歌单
    screenWidth: 375,
    recMenuList: [],  //推荐歌单
    // 巅峰榜数据
    isRankData: false,
    rankInfo: {},

    currentSong: [], // 当前正在播放的歌曲信息
    playSongIndex: 0,
    playSongList: [],
    isPlaying: false,
    isShow: false, // 显示播放列表

    show: false,

    playModeName: 'order2'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 2.请求Banner图
    this.fetchNusicBanner()
    // 3.请求推荐歌曲
    // this.fetchRecommendSongs()

    // playerStore.dispatch("playMusicWithSongIdAction", 233931)
    // 4.获取热门歌单
    this.fetchHotMenuList()

    // 1.先监听store
    recommendStore.onState('recommendSongInfo', this.handelRecommendSongs)
    // 2.后发起actions
    recommendStore.dispatch("fetchRecommendSongsAction")

    // rankStore.onState("newRank",this.handleNewRank)
    // rankStore.onState("originRank",this.handleOriginRank)
    // rankStore.onState("upRank",this.handleUpRank)
    for (const key in rankMap) {
      rankStore.onState(key, this.getRankHandler(key))
    }
    // rankStore.onState("newRank",this.getRankHandler("newRank"))
    // rankStore.onState("originRank",this.getRankHandler("originRank"))
    // rankStore.onState("upRank",this.getRankHandler("upRank"))

    // 发起action
    rankStore.dispatch("fetchRankDataAction")

    playerStore.onStates(["currentSong", "isPlaying", "playSongIndex", "playSongList", "playModeIndex"], this.handlePlayInfos)

    // 从全局数据globalData中获取屏幕尺寸
    this.setData({
      screenWidth: app.globalData.screenWidth
    })


  },
  // 一、界面事件监听
  // 1.点击搜索框跳转新页面
  onSearch() {
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  },
  // 3.监听banner图片的加载
  onBannerImageload(e) {
    // 获取 image 组件的高度，单独封装成工具query-select.js
    // const query = wx.createSelectorQuery()
    // query.select(".banner-image").boundingClientRect()
    // query.exec((res) => {
    //   console.log(res);
    //   this.setData({bannerHeight: res[0].height})
    // })
    querySelectThrottle(".banner-image").then((res) => {
      // console.log(res, '----获取选择器所在的长方形----');
      // console.log(res[0].height, '--height--'); // 因为有很多banner图，所以会执行很多次，所以这里需要写节流
      // 节流可以对频繁操作做优化,下载第三方包underscore使用节流
      this.setData({ bannerHeight: res[0].height })
    })
  },

  // 4.监听推荐歌曲更多more的点击
  onRecommendMoreClick(e) {
    wx.navigateTo({
      url: '/pages/detail-song/detail-song?type=recommend',
    })
  },

  // 5.点击推荐歌曲，获取歌曲列表和当前索引，并存入palyerStore 中，以便在播放页共用
  onSongItemTap(e) {
    // console.log(e);
    const index = e.currentTarget.dataset.index
    // console.log(index, '----index---');
    // console.log('---onSongItemTap---');
    // console.log(this.data.recommendSongs, '---recommendSongs---');
    playerStore.setState('playSongList', this.data.recommendSongs)
    playerStore.setState('playSongIndex', index)
  },

  // 监听底部播放栏
  onPlayOrPauseBtnTap() {
    playerStore.dispatch("changeMusicStatusAction")
  },

  onPlayBarAlbumTap() {
    wx.navigateTo({
      url: '/pages/music-player/music-player',
    })
  },
  // 监听点击播放列表的循环播放icon
  onIconBtnTap() {
    playerStore.dispatch("changePlayModeAction")
  },
  // 点击具体歌曲
  // onPlayListTap(e) {
  //   console.log(e, '---e--- ');
  // },
  onPlayListBtnTap() {
    var sh = this.data.isShow
    if (!sh) {
      this.setData({ isShow: !sh })
      // console.log('---点击--1', this.data.isShow);

    } else {
      this.setData({ isShow: !sh })
      // console.log('---点击--2', this.data.isShow); 
    }
  },


  // ---------- 发送请求获取数据 --------
  // 2.发送请求，请求banner图
  async fetchNusicBanner() {
    const res = await getMusicBanner(2)
    // console.log(res, '---banner---');
    this.setData({ banners: res.banners })
  },

  // 3.推荐歌曲
  /*   async fetchRecommendSongs() {
      const res = await getPlaylistDetail(3778678)
      console.log(res, '--RecommendSongs--');
      const playlist = res.playlist
      const recommenSongs = playlist.tracks.slice(0, 6) // 截取前六条数据
      this.setData({recommendSongs: recommenSongs})
    }, */

  // 4.获取热门歌单
  fetchHotMenuList() {
    hotMenu().then(res => {
      // console.log(res, '--hotMenu--');
      this.setData({ hotMenuList: res.playlists })
    })
    // 这里不用async 和 await 是因为不想上面的阻塞下面的，想同步执行
    // 5.推荐歌单
    hotMenu("华语").then(res => {
      // console.log(res, '--推荐歌单--');
      this.setData({ recMenuList: res.playlists })
    })

  },

  // 二、=========== 从 store 中获取数据 ============
  handelRecommendSongs(value) {
    // 先判断，第一次value里面没有东西，直接return
    if (!value.tracks) return
    // 截取前6条数据
    this.setData({ recommendSongs: value.tracks.slice(0, 6) })
  },
  // handleNewRank(value) {
  //   console.log("新歌榜", value);
  //   const newrankInfo = {...this.data.rankInfo, newRank: value}
  //   this.setData({rankInfo: newrankInfo})
  // },
  // handleOriginRank(value) {
  //   console.log("原创榜", value);
  //   const newrankInfo = {...this.data.rankInfo, originRank: value}
  //   this.setData({rankInfo: newrankInfo})
  // },
  // handleUpRank(value) {
  //   console.log("飙升榜", value);
  //   const newrankInfo = {...this.data.rankInfo, upRank: value}
  //   this.setData({rankInfo: newrankInfo})
  // },

  // 函数的高阶用法 
  getRankHandler(ranking) {
    return (value) => {
      if (!value.name) return
      this.setData({ isRankData: true })
      const newrankInfo = { ...this.data.rankInfo, [ranking]: value }
      this.setData({ rankInfo: newrankInfo })
    }
  },
  handlePlayInfos({ currentSong, isPlaying, playSongIndex, playSongList, playModeIndex }) {
    if (currentSong) {
      // console.log(currentSong);
      this.setData({ currentSong })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
    if (playSongList !== undefined) {
      // console.log(playSongList, "--playSongList--");
      this.setData({ playSongList })
    }
    if (playModeIndex !== undefined) {
      this.setData({ playModeName: modeName2[playModeIndex] })
      // console.log(playModeIndex, this.data.playModeName, '---playModeName---');
    }
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
    recommendStore.offState("recommendSongs", this.handelRecommendSongs)
    // rankStore.offState("newRank",this.handleNewRank)
    // rankStore.offState("originRank",this.handleOriginRank)
    // rankStore.offState("upRank",this.handleUpRank)

    for (const key in rankMap) {
      rankStore.offState(key, this.getRankHandler(key))
    }

    playerStore.offStates(["currentSong", "isPlaying", "playSongIndex", "playSongList", "playModeIndex"], this.handlePlayInfos)

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