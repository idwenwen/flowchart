export default {
  name: 'trangle',
  draw: {
    path: function trangle (ctx, par) {
      if (par.progress >= 0 || !par.progress) {
        let nowPos = [par.point[0], par.point[1] + par.radius] // 启始位置点，第一个弧度的起始位置。
        ctx.moveTo(nowPos[0], nowPos[1])

        // 绘制左上弧度
        // 绘制上边界
        // 绘制右上弧度
        // 绘制右边界
        // 绘制右下弧度
        // 绘制下边界
        // 绘制左下弧度
        // 绘制左边界
        if (par.stroke) {
          ctx.strokeStyle = par.color
          ctx.stroke()
        } else {
          ctx.fillStyle = par.color
          ctx.fill()
        }
      }
    },
    paramFilter: {
      radius: `${'number'}`,
      width: `${'number'}`, // 长方形宽
      height: `${'number'}`, // 长方形高
      point: `${'[]'} ${'number'} len ${'2'}`, // 左上角点
      progress: `${'?number'} max ${1} min ${0}`, // 长方形完成度

      // 绘制方式
      stroke: `${'?boolean'}`, // 是否用stroke方式来绘制
      fill: `${'?boolean'}`, // 是否用fill方式来绘制

      // 绘制颜色
      color: `${'string'}` // 当前长方形的内容。
    }
  }
}
