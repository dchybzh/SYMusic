// 把歌词导出一个对象形式
// 例如：[02:23.56]可是雪 飘进双眼
// 正则表达式内不能写空格，注意：里面有.
const timeReg = /\[(\d{2}):(\d{2}).(\d{2,3})\]/

export function parseLyric(lrcString) {
  const lyricInfos = []
  // 先把歌词里的换行\n 用split去掉，得到一个大的数组
  const lyricLines = lrcString.split('\n')
  // console.log(lyricLines, '---lyricLines---');
  // 循环这个大数组的每一项，每一项都是一行字符串（[时间]文本）
  for (const lineString of lyricLines) {
    // const lyricInfo = {
    //   text: "哈哈哈",
    //   time: 2000
    // }  
    // console.log(lineString, '---lineString---');
    // 使用正则表达式匹配时间
    const res = timeReg.exec(lineString)
    // console.log(res, '---res---');
    // 里面有可能有空行，判断如果不为空，则继续往下运行，把时间转换成毫秒
    if (!res) continue
    const minute = res[1] * 60 * 1000 // 分钟转成毫秒
    const second = res[2] * 1000 //秒转换成毫秒
    // 最后一项毫秒可能是二位或者是三位数，如果是两位的例如 55，相当于是550毫秒,如果是3位，需要乘1转换成数字型
    const mSecond = res[3].length === 2 ? res[3] * 10 : res[3] * 1
    const time = minute + second + mSecond
    const text = lineString.replace(timeReg, '') // 用正则搜索替换成''空字符串
    lyricInfos.push({ time, text })
  }

  return lyricInfos
}