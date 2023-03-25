// pages/music-player/music-player.js
import { getSongDetail, getSongLyric } from "../../services/player"
import { throttle } from "underscore"
import { parseLyric } from "../../utils/parseLyric"
import playerStore from "../../store/playerStore"

const app = getApp()

// 创建播放器
const audioContext = wx.createInnerAudioContext()
const modeName = ["order", "repeat", "random"]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitles: ["歌曲", "歌词"],
    currentPage: 0, //  翻页的当前页
    contentHeight: 0,  // 翻页内容区域的高度

    id: 0,
    currentSong: [],  // 当前歌曲的信息
    lyricInfos: '',  // 当前歌曲的歌词信息
    satusHeight: 20, // 状态栏默认高度
    currentLyricText: "",  // 当前歌词文本
    currentLyricIndex: 0,  // 当前歌词文本

    currentTime: 0, // 当前播放时间
    durationTime: 0, // 歌曲总时间
    sliderValue: 0,  // sliderValue用百分数，也就是当前时间➗总时间*100
    isSliderChanging: false,
    isWaiting: false, // 为修复反复跳进度条设置的
    isPlaying: true, // 播放和暂停按钮

    lyricScrollTop: 0, //歌词滚动位置

    playSongIndex: 0,
    playSongList: [],
    isfirst: true,  // 只有第一次监听才需要加载的方法

    playModeIndex: 0,  // 播放模式的索引。0是顺序播放，1是单曲循环，2是随机播放,
    playModeName: "order" // 播放模式图片，默认是顺序播放
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
    this.setupPlaySong(id)

    // 5.获取 store 共享数据,注意 如果是多个，要写成数组，并且是 onStates
    playerStore.onStates(["playSongIndex", "playSongList"], this.getPlaySongInfosHandler)
  },
  // --------------- 方法 ----------------
  // 更新进度
  updateProgress() {
    // 1.记录当前播放时间,拿到的是 秒，*1000 变成毫秒，方便转换时间
    // 2.修改 sliderValue 
    const sliderValue = this.data.currentTime / this.data.durationTime * 100

    this.setData({
      currentTime: audioContext.currentTime * 1000,
      sliderValue
    })
  },

  // ========== 播放歌曲的逻辑 =========
  setupPlaySong(id) {
    this.setData({ id })
    // 2根据 id 获取歌曲的详情
    this.fetchGetSongDetail()
    // 2.1获取歌词信息
    this.fetchGetSongLyric()

    // 3.播放当前的歌曲,
    // 播放新歌的时候先把当前的停掉
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true

    // audoContext.onCanplay()

    // 4.监听播放的进度，audioContext只需要监听一次就可以了
    if (this.data.isfirst) {
      this.data.isfirst = false
      // 设置节流，500毫秒更新一次,leading 是第一次要不要更新,trailing 是最后一次是否更新，默认是true
      const throttleUpdateProgress = throttle(this.updateProgress, 500, { leading: false, trailing: false })
      audioContext.onTimeUpdate(() => {
        // console.log('--播放时间--', audioContext.currentTime);
        // - 1.更新歌曲的进度
        // 判断，用临时变量确定是否需要修改时间，当没有在滑动的时候，才会记录时间并修改sliderValue
        if (!this.data.isSliderChanging && !this.data.isWaiting) {
          throttleUpdateProgress()
        }

        // 2.匹配正确的歌词
        if (!this.data.lyricInfos.length) return
        let index = this.data.lyricInfos.length - 1
        for (let i = 0; i < this.data.lyricInfos.length; i++) {
          // 拿到其中一句歌词
          const info = this.data.lyricInfos[i]
          if (info.time > audioContext.currentTime * 1000) {
            index = i - 1
            break
          }
        }
        // console.log(index, this.data.lyricInfos[index].text, '---index---');
        if (index === this.data.currentLyricIndex) return

        // 3.获取歌词的索引 index 和 text
        const currentLyricText = this.data.lyricInfos[index].text
        this.setData({
          currentLyricText,
          currentLyricIndex: index,
          // 4.改变歌词滚动页面的位置,因为设置的line-height 是70rpx，所以这里的单位似乎是px
          lyricScrollTop: 35 * index
        })
      })
      // 3.点击滑块后，时间变了，但是滑块不往前走，所以这里再监听等待,在等待的时候先暂停一下
      audioContext.onWaiting(() => {
        audioContext.pause()
      })

      // 4.监听一旦可以播放的时候canplay，主动调用一下play
      audioContext.onCanplay(() => {
        audioContext.play()
      })

      // 5.歌曲播完后自动播下一首
      audioContext.onEnded(() => {
        // 如果是单曲循环，不需要切换下一首歌
        if (audioContext.loop) return
        
        // 切换下一首歌曲
        this.changeNewSong()
      })
    }

  },


  // 2.获取 id 的详情
  async fetchGetSongDetail() {
    const res = await getSongDetail(this.data.id)
    // console.log(res, '---getSongDetail---');
    this.setData({ currentSong: res.songs[0], durationTime: res.songs[0].dt })
  },

  // 3.获取 id 的歌词信息
  async fetchGetSongLyric() {
    const res = await getSongLyric(this.data.id)
    // console.log(res.lrc.lyric, '---lyric---');
    // console.log(res.lrc, '---lyric---');
    const lyricString = res.lrc.lyric
    const lyricInfos = parseLyric(lyricString)
    this.setData({ lyricInfos })
    // console.log(lyricInfos, '----lyricInfos---');
  },

  // ---------- 事件监听 ----------
  // 导航栏左上角的返回
  onNavBackTap() {
    wx.navigateBack()
  },
  // 1.监听滑动轮播图
  onSwiperChange(event) {
    // console.log(event, "---onSwiperChange---");
    this.setData({ currentPage: event.detail.current })
  },
  // 2.监听点击导航栏
  onNavTapItem(e) {
    const index = e.currentTarget.dataset.index
    // console.log(index, '--index--');
    this.setData({ currentPage: index })
  },


  // 3.监听滑块点击事件
  onSliderChange(e) {
    // console.log("---点击了滑块-----");
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
    if (!audioContext.paused) {
      audioContext.pause()
      this.setData({ isPlaying: false })
    } else {
      audioContext.play()
      this.setData({ isPlaying: true })
    }
  },
  // 6.监听点击上一首
  onPrevBtnTap() {
    this.changeNewSong(false)
  },
  // 7.监听点击下一首
  onNextBtnTap() {
    this.changeNewSong()
  },
  // 8.6和7 的逻辑基本一样，抽取成一个方法，再判断调用即可
  changeNewSong(isNext = true) {
    // console.log('点击了下一首');
    // 8.1获取之前的数据
    const length = this.data.playSongList.length
    let index = this.data.playSongIndex

    // 8.2根据之前的数据计算最新的索引
    switch (this.data.playModeIndex) {
      case 1:  // 当case是1的时候单曲循环，点击下一首还是下一首，如果四自动唱完就循环当前歌曲
      case 0: // 顺序播放
        index = isNext ? index + 1 : index - 1
        if (index === length) {
          index = 0
        }
        if (index === -1) {
          index = length - 1
        }
        break
      // case 1:  // 单曲循环
      //   break
      case 2: // 随机播放
        // Math.random()*N 返回值是一个大于等于0，且小于N的随机数
        index = Math.floor(Math.random() * length)
        break
    }
    // 8.3根据索引获取当前歌曲的信息
    const newSong = this.data.playSongList[index]
    // console.log(newSong.id, "--newSong.id---");
    // 先将数据回到初始状态
    this.setData({ currentSong: {}, sliderValue: 0, curentTime: 0, duration: 0 })
    // 再调用方法播放新的数据
    this.setupPlaySong(newSong.id)
    // 8.4在 store 记录最新的索引
    playerStore.setState("playSongIndex", index)
  },


  // 9.监听播放模式 Mode 模式
  onModeBtnTap() {
    // 1.计算新模式
    let modeIndex = this.data.playModeIndex
    modeIndex = modeIndex + 1
    if (modeIndex === 3) {
      modeIndex = 0
    }
    // 设置是否单曲循环
    if (modeIndex === 1) {
      audioContext.loop = true
    } else {
      audioContext.loop = false
    }
    // 2.保存当前模式
    this.setData({ playModeIndex: modeIndex, playModeName: modeName[modeIndex] })
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