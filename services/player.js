import {myRequest} from "../services/index"
// 5.获取播放页的歌曲详情
export function getSongDetail(ids) {
  return myRequest.get({
    url: '/song/detail',
    data: {
      ids
    }
  })
}

// 6.获取歌词信息
export function getSongLyric(id) {
  return myRequest.get({
    url: '/lyric',
    data: {
      id
    }
  })
}