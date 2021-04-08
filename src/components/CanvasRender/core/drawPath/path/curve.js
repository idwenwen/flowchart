import { each } from '../../../tools/iteration'

export default {
  name: 'curve',
  draw: {
    path: function curve (ctx, par) {
      each(par.points)((point, i) => {
        const x = point[0] || 0
        const y = point[1] || 0
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          if (par.points[i + 1]) {
            let endX = 0
            let endY = 0
            if (par.points[i + 2]) {
              endX = (x + (par.points[i + 1].x || par.points[i + 1][0])) / 2
              endY = (y + (par.points[i + 1].y || par.points[i + 1][1])) / 2
            } else {
              endX = par.points[i + 1].x || par.points[i + 1][0]
              endY = par.points[i + 1].y || par.points[i + 1][1]
            }
            ctx.quadraticCurveTo(x, y, endX, endY)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.strokeStyle = par.color
      ctx.lineWidth = par.lineWidth
      par.dash && ctx.setLineDash(par.dash === true ? [5] : par.dash)
      ctx.stroke()
    },
    paramFilter: {
      points: `${'[[number, number]]'}`,
      color: `number`,
      dash: `[number]`
    }
  }
}
