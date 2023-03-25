import { myRequest } from './index'
// 1.封装获取首页 Banner 的方法
export function getMusicBanner(type = 0) {
    return myRequest.get({
      url: '/banner',
      data: {
        type
      }
    })
}

//  2.推荐歌曲
export function getPlaylistDetail(id) {
  return myRequest.get({
    url: '/playlist/detail',
    data: {
      id
    }
  })
}

// 3.热门歌单
export function hotMenu(cat=" 全部", limit=6, offset=0) {
  return myRequest.get({
    url: '/top/playlist',
    data: {
      cat,
      limit,
      offset
    }
  })
}

// 4.获取热门歌单分类
export function getPlayListHot() {
  return myRequest.get({
    url: '/playlist/hot'
  })
}

