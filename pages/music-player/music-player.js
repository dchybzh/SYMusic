// pages/music-player/music-player.js
import { throttle } from "underscore"
import playerStore, { audioContext } from "../../store/playerStore"

const app = getApp()

const modeName = ["order", "repeat", "random"]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stateKeys: ["id", "currentSong", "currentTime", "durationTime", "lyricInfos",
      "currentLyricText", "currentLyricIndex", "isPlaying", "playModeIndex"],

    id: 0,
    currentSong: {},  // 当前歌曲的信息
    currentTime: 0, // 当前播放时间
    durationTime: 0, // 歌曲总时间
    lyricInfos: [],  // 当前歌曲的歌词信息
    currentLyricText: "",  // 当前歌词文本
    currentLyricIndex: 0,  // 当前歌词文本

    isPlaying: true, // 播放和暂停按钮

    playSongIndex: 0,
    playSongList: [],
    isFirstPlay: true,  // 只有第一次监听才需要加载的方法

    playModeName: "order", // 播放模式图片，默认是顺序播放

    pageTitles: ["歌曲", "歌词"],
    currentPage: 0, //  翻页的当前页
    contentHeight: 0,  // 翻页内容区域的高度
    satusHeight: 20, // 状态栏默认高度
    sliderValue: 0,  // sliderValue用百分数，也就是当前时间➗总时间*100
    isSliderChanging: false,
    isWaiting: false, // 为修复反复跳进度条设置的

    lyricScrollTop: 0 //歌词滚动位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 0.获取设备信息 - 状态栏的高度
    this.setData({ satusHeight: app.globalData.statusBarHeight })
    this.setData({ contentHeight: app.globalData.contentHeight })
    // 1.获取传入的id
    const id = options.id

    // 2.根据 id 播放歌曲
    if (id) {
      playerStore.dispatch("playMusicWithSongIdAction", id)
    }

    // 3.获取 store 共享数据,注意 如果是多个，要写成数组，并且是 onStates
    playerStore.onStates(["playSongIndex", "playSongList"], this.getPlaySongInfosHandler)
    playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
  },

  // --------------- 方法 ----------------
  // 更新进度
  // 设置节流，500毫秒更新一次,leading 是第一次要不要更新,trailing 是最后一次是否更新，默认是true
  updateProgress: throttle(function (currentTime) {
    if (this.data.isSliderChanging) return
    // 1.记录当前播放时间, 2.修改 sliderValue 
    const sliderValue = currentTime / this.data.durationTime * 100
    this.setData({ currentTime, sliderValue })
  }, 800, { leading: false, trailing: false }),

  // ================ 事件监听 ================
  onNavBackTap() {
    wx.navigateBack()
  },
  // 1.监听滑动轮播图
  onSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  },

  // 2.监听点击导航栏
  onNavTapItem(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentPage: index })
  },

  // 3.监听滑块点击事件
  onSliderChange(e) {
    this.data.isWaiting = true
    setTimeout(() => {
      this.data.isWaiting = false
    }, 1500)
    // 1.获取点击的滑块位置对应的值
    const value = e.detail.value

    // 2.计算出要播放的位置时间 毫秒
    const currentTime = value / 100 * this.data.durationTime

    // 3.设置播放器，播放计算出的时间，这里提示要设置成 秒,
    // 这里设置好时间播的时候，在 onTimeUpdate(() => {audioContext.currentTime返回的可能是之前的时间})获取时间的时候
    audioContext.seek(currentTime / 1000)
    this.setData({ currentTime, isSliderChanging: false, sliderValue: value })
  },

  // 4.监听滑动滑块事件,滑动停止后会到3的滑块点击事件
  // 节流throttle，当一直滑动滑块的时候，这个函数会反复调用，我们不希望调用的很快，就用到了节流
  onSliderChanging: throttle(function (e) {
    // 1.获取滑动到的位置的 value
    const value = e.detail.value

    // 2.根据当前的值，计算出对应的时间，滑动的过程是需要改时间的，但是播放进度要等松手后再改
    const currentTime = value / 100 * this.data.durationTime
    this.setData({ currentTime }) //setData 时界面会重新渲染

    // 3.当前正在滑动
    this.data.isSliderChanging = true
  }, 100),


  // 5.监听播放和暂停的点击事件
  onPlayOrPauseTap() {
    playerStore.dispatch("changeMusicStatusAction")
  },

  // 6.监听点击上一首
  onPrevBtnTap() {
    playerStore.dispatch("palyNewMusicAction", false)
  },

  // 7.监听点击下一首
  onNextBtnTap() {
    playerStore.dispatch("palyNewMusicAction")
  },

  // 9.监听播放模式 Mode 模式
  onModeBtnTap() {
    playerStore.dispatch("changePlayModeAction")
  },

  // ================ store 共享数据 ================
  // 1.拿到推荐歌曲的列表
  getPlaySongInfosHandler({ playSongList, playSongIndex }) {
    // 这里直接解构
    // console.log(playSongList, playSongIndex , '---value----');
    if (playSongList) {
      this.setData({ playSongList })
    }
    // 如果是0的话是就是false了，就存不上了，但0不是undefined，所以可以存上
    // 所以有0的话不能直接判断
    if (playSongIndex !== undefined) {
      this.setData({ playSongIndex })
    }
  },
  getPlayerInfosHandler({
    id, currentSong, currentTime, durationTime,
    lyricInfos, currentLyricText, currentLyricIndex, isPlaying, playModeIndex
  }) {
    if (id !== undefined) {
      this.setData({ id })
    }
    if (currentSong) {
      this.setData({ currentSong })
    }
    if (currentTime !== undefined) {
      // 根据当前时间改变进度
      this.updateProgress(currentTime)
    }
    if (durationTime !== undefined) {
      this.setData({ durationTime })
    }
    if (lyricInfos) {
      this.setData({ lyricInfos })
    }
    if (currentLyricText) {
      this.setData({ currentLyricText })
    }
    if (currentLyricIndex !== undefined) {  // 修改 lyric 的 scrollTop
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
    }
    if (isPlaying !== undefined) {
      this.setData({ isPlaying })
    }
    if (playModeIndex !== undefined) {
      this.setData({ playModeName: modeName[playModeIndex] })
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
    // 卸载监听store
    playerStore.offStates(['playSongList', 'playSongIndex'], this.getPlaySongInfosHandler)
    playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
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