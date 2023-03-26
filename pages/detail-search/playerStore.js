import { HYEventStore } from "hy-event-store"
import { parseLyric } from '../utils/parseLyric'
import { getSongDetail, getSongLyric } from "../services/player.js"
// 创建播放器
export const audioContext = wx.createInnerAudioContext()

// 还有一种写法 可以抽取成常量
// const PLAY_SONG_INDEX = "playSongIndex"
const playerStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0,
    // [PLAY_SONG_INDEX]: 0

    id: 0,
    currentSong: {},  // 当前歌曲的信息
    currentTime: 0, // 当前播放时间
    durationTime: 0, // 歌曲总时间
    lyricInfos: [],  // 当前歌曲的歌词信息
    currentLyricText: "",  // 当前歌词文本
    currentLyricIndex: 0,  // 当前歌词文本

    isFirstPlay: true,  // 只有第一次监听才需要加载的方法

    isPlaying: false, // 是否正在播放
    playModeIndex: 0 // 播放模式的索引。0是顺序播放，1是单曲循环，2是随机播放,
  },

  actions: {
    playMusicWithSongIdAction(ctx, id) {
      // 0. 把原来的数据进行重置
      ctx.currentSong = {}
      ctx.currentTime = 0
      ctx.durationTime = 0
      ctx.currentLyricIndex = 0
      ctx.currentLyricText = ''
      ctx.lyricInfos = []

      // 1.保存id
      ctx.id = id
      ctx.isPlaying = true
      // 2根据 id 获取歌曲的详情
      getSongDetail(id).then((res) => {
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt
      })

      // 2.1获取歌词信息
      getSongLyric(id).then((res) => {
        const lyricString = res.lrc.lyric
        const lyricInfos = parseLyric(lyricString)
        ctx.lyricInfos = lyricInfos
      })

      // 3.播放当前的歌曲,
      // 播放新歌的时候先把当前的停掉
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 4.监听播放的进度，audioContext只需要监听一次就可以了
      if (ctx.isFirstPlay) {
        ctx.isFirstPlay = false

        audioContext.onTimeUpdate(() => {
          // 1.获取当前播放的时间 拿到的是 秒，*1000 变成毫秒，方便转换时间
          ctx.currentTime = audioContext.currentTime * 1000

          // 2.匹配正确的歌词
          if (!ctx.lyricInfos.length) return
          let index = ctx.lyricInfos.length - 1
          for (let i = 0; i < ctx.lyricInfos.length; i++) {
            // 拿到其中一句歌词
            const info = ctx.lyricInfos[i]
            if (info.time > audioContext.currentTime * 1000) {
              index = i - 1
              break
            }
          }
          // 当 i 是 0 的时候，索引就是 -1 了，没有歌词，所以直接返回即可
          if (index === ctx.currentLyricIndex || index === -1) return

          // 3.获取歌词的索引 index 和 text
          const currentLyricText = ctx.lyricInfos[index].text
          ctx.currentLyricText = currentLyricText
          ctx.currentLyricIndex = index
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

          // 6.切换下一首歌曲
          this.dispatch("palyNewMusicAction")

        })
      }
    },
    changeMusicStatusAction(ctx) {
      if (!audioContext.paused) {
        audioContext.pause()
        ctx.isPlaying = false
      } else {
        audioContext.play()
        ctx.isPlaying = true
      }
    },
    changePlayModeAction(ctx) {
      // 1.计算新模式
      let modeIndex = ctx.playModeIndex
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
      ctx.playModeIndex = modeIndex
    },
    palyNewMusicAction(ctx, isNext = true) {
      // console.log('点击了下一首');
      // 8.1获取之前的数据
      const length = ctx.playSongList.length
      let index = ctx.playSongIndex

      // 8.2根据之前的数据计算最新的索引
      switch (ctx.playModeIndex) {
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
      const newSong = ctx.playSongList[index]
      // 再调用方法播放新的数据
      this.dispatch("playMusicWithSongIdAction", newSong.id)
      // 8.4在 store 记录最新的索引
      ctx.playSongIndex = index
    }
  }
})

export default playerStore