// store/recommendStore.js
import { HYEventStore } from "hy-event-store"
// 导入自己封装的Api
import { getPlaylistDetail } from "../services/music"

// 创建实例对象
const recommendStore = new HYEventStore({
  state: {
    recommendSongInfo: []
  },
  // 发起请求
  actions: {
    // 歌曲排行热歌
    async fetchRecommendSongsAction(ctx) {
      const res = await getPlaylistDetail(3778678)
      // console.log(res, '---fetchRecommendSongsAction--');
      // 使用 ctx 更改数据
      ctx.recommendSongInfo = res.playlist
    }
  }
})

// 导出实例对象
export default recommendStore