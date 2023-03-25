import { HYEventStore } from "hy-event-store"

// 还有一种写法 可以抽取成常量
// const PLAY_SONG_INDEX = "playSongIndex"
const playerStore = new HYEventStore({
  state: {
    playSongList: [],
    playSongIndex: 0
    // [PLAY_SONG_INDEX]: 0
  }
})

export default playerStore