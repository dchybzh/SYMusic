import { HYEventStore } from "hy-event-store"
import { getPlaylistDetail } from "../services/music"
export const rankMap = {
  newRank: 3779629,
  originRank: 2884035,
  upRank: 19723756
}
const rankStore = new HYEventStore({
  state: {
    newRank: [],
    originRank: [],
    upRank: []
  },
  actions: {
    // 获取巅峰榜下的数据
    fetchRankDataAction(ctx) {
      for (const key in rankMap) {
        const id = rankMap[key]
        getPlaylistDetail(id).then(res => {
          // console.log(res, "--rankData--");
          ctx[key] = res.playlist
        })
      }
    }
  }
})

// 发起action
// rankStore.dispatch("fetchRankDataAction")

export default rankStore