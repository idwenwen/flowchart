import { toRadian } from '../../../tools/extension/angle'

export default {
  name: 'circle',
  draw: {
    path: function circle (ctx, par) {
      ctx.arc(
        par.center[0],
        par.center[0],
        par.radius,
        toRadian(par.startAngle),
        toRadian(par.endAngle),
        par.anticlockwise || false
      )
    },
    paramFilter: {
      radius: `${'number'}`,
      center: `${'[]'} ${'number'} len ${'2'}`, // 左上角点
      startAngle: `${'int'} min ${0} max ${360}`,
      endAngle: `${'int'} min ${0} max ${360}`,
      anticlockwise: `${'?boolean'}`,

      // 绘制方式
      stroke: `${'?boolean'}`, // 是否用stroke方式来绘制
      fill: `${'?boolean'}`, // 是否用fill方式来绘制

      // 绘制颜色
      color: `${'string'}` // 当前长方形的内容。
    }
  }
}
