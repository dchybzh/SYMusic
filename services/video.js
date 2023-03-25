import { myRequest } from './index'
// offset 和 limit 不能写死，因为有可能会变化，可以当参数传进来，给个默认值
// 1.获取 top mv
export function getTopMv(offset = 0, limit = 20) {
  return myRequest.get({
    url: '/top/mv',
    data: {
      limit,
      offset
    }
  })
}

// 2.获取 mv 地址
export function getMvUrl(id) {
  return myRequest.get({
    url: '/mv/url',
    data: {
      id: id
    }
  })
}

// 3.请求视频详情信息
export function getMvInfo(mvid) {
  return myRequest.get({
    url: '/mv/detail',
    data: {
      mvid
    }
  })
}

// 4.请求相关视频
export function getMvRelated(id) {
  return myRequest.get({
    url: '/related/allvideo',
    data: {
      id
    }
  })
}