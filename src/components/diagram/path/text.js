import { each } from '@/tools/extension/iteration'
import { calculateCanvas } from '../panel/index'
import { flatten } from 'lodash'

function toSameLen (str, len) {
  let index = 0
  const res = []
  do {
    res.push(str.substr(index, len))
    index += len
  } while (str.length > index)
  return res
}

export default {
  name: 'text',
  draw: {
    path: function text (ctx, par) {
      const texts = par.text.split('\n')
      const defStyle = {
        font: par.font || '18px bold 微软雅黑',
        textAlign: par.textAlign || 'center',
        textBaseline: par.textBaseline || 'middle'
      }
      // 最大行宽比较
      let res = each(texts)((content) => {
        let real = [content]
        if (par.maxWidth) {
          const style = calculateCanvas.measureText(content, defStyle)
          if (style && par.maxWidth && style.width > par.maxWidth) {
            const rate = Math.floor((par.maxWidth / style.width) * 100) / 100
            const len = Math.floor(content.length * rate) // 计算最大可能可以获取几个字
            real = toSameLen(content, len)
          }
        }
        return real
      })

      const lineheight =
        (!par.lineHeight || (parseInt(par.font) + 4) > par.lineHeight)
          ? (parseInt(par.font) + 4)
          : par.lineHeight
      // 计算必要的行高。
      res = flatten(res) // 减少数组层级

      // 最大行高的比较
      if (par.maxHeight && res.length * lineheight > par.maxHeight) {
        // 当前展示内容超过最大行高度，所以需要预估最大展示行数。
        const lineNum = Math.floor(
          res.length * (par.maxHeight / (res.length * lineheight))
        )
        // 删除多余的不可展示的内容
        res.splice(lineNum)

        // 替换最后一行内容的最后三个字符为省略号。
        res[res.length - 1] = res[res.length - 1].replace(/.{3}$/, '...')
      }

      // 绘制当前的文字内容。
      ctx.font = par.font || '18px bold 微软雅黑'
      ctx.textAlign = par.textAlign || 'center'
      ctx.textBaseline = par.textBaseline || 'middle'
      const lineMax = (() => {
        let str = ''
        each(res)((content) => {
          if (str.length < content.length) str = content
        })
        return calculateCanvas.measureText(str, defStyle).width
      })()
      each(res)((content, index) => {
        const realCenter = [
          par.center[0] - (res.length / 2 - index) * lineheight,
          par.textAlign
            ? par.textAlign.search('left') >= 0
              ? par.center[1] - lineMax / 2
              : par.textAlign.search('right') >= 0
                ? par.center[1] + lineMax / 2
                : par.center[1]
            : par.center[1]
        ]
        ctx.fillText(content, realCenter[0], realCenter[1], par.maxWidth)
      })
    },
    paramFilter: {
      center: `${'[]'} ${'number'} len ${'2'}`, // 终点位置。
      text: `${'string'}`, // 文字内容 其中可以传递换行符
      font: `${'?string'} default ${'18px bold 微软雅黑'}`,
      maxWidth: '?number', // 最大长度，超出部分会进行自动换行。
      maxHeight: '?number', // 字段展示最大高度。
      lineHeight: '?number', // 每行高度
      color: `${'string'}`, // 当前长方形的内容。
      textAlign: `${'string'} default ${'center'}`,
      textBaseline: `${'string'} default ${'middle'}`
    }
  }
}
