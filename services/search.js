import { myRequest } from './index'

export function getSearchSong() {
  return myRequest.get({
    url: "/search/hot"
  })
}

export function getSearchSongSuggest(keywords, type = "mobile") {
  return myRequest.get({
    url: '/search/suggest',
    data: {
      keywords,
      type
    }
  })
}
export function getSearchSongDetail(keywords, limit = 30, offset = 30, type = 1) {
  return myRequest.get({
    url: '/search',
    data: {
      keywords,
      limit,
      offset,
      type
    }
  })
}