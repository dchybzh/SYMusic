// 微信小程序节点查询
// 封装获取轮播图组件的高度 传进来选择器
export function querySelect(selector) {
  // console.log("------封装的querySelector------");
  return new Promise(resolve => {
    const query = wx.createSelectorQuery() // 创建节点查询器 query
    query.select(selector).boundingClientRect() // 选择节点，获取节点位置信息的查询请求，选择器所在的长方形
    query.exec((res) => {
      resolve(res) 
    })
  })
}