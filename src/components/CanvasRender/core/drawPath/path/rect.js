export default {
  name: 'rect',
  draw: {
    path: function rect (ctx, par) {
      const x = par.center[0]
      const y = par.center[1]
      const r = par.radius
      const w = par.width
      const h = par.height
      const p = par.progress === 0 ? 0 : par.progress ? par.progress : 1

      if (p <= 0) {
        return
      }

      let nextX = x - w / 2
      let nextY = y - h / 2 + r
      ctx.moveTo(nextX, nextY)

      let arcX = nextX + r
      let arcY = nextY
      let sAng = 1 * Math.PI
      let eAng = (w * p < r) ? (sAng + Math.acos((r - w * p) / r)) : (1.5 * Math.PI)
      ctx.arc(arcX, arcY, r, sAng, eAng, false)

      if (w * p > r) {
        nextX = (w * p) > (w - r) ? nextX + w - 2 * r : nextX + w * p
        nextY = nextY - r
        ctx.lineTo(nextX, nextY)

        if (w * p > w - r) {
          arcX = nextX
          arcY = nextY + r
          sAng = 1.5 * Math.PI
          eAng = p < 1 ? sAng + Math.acos((r - (w - w * p)) / r) : 0
          ctx.arc(arcX, arcY, r, sAng, eAng, false)

          nextX = nextX + (r - (w - w * p))
          nextY = nextY + h - r - Math.cos(0.5 * Math.PI - Math.acos((r - (w - w * p)) / r)) * r
          ctx.lineTo(nextX, nextY)

          arcY = arcY + h - 2 * r
          sAng = 0
          eAng = p < 1 ? sAng + Math.acos((r - (w - w * p)) / r) : 0.5 * Math.PI
          ctx.arc(arcX, arcY, r, sAng, eAng, false)

          nextX = arcX - w + 3 * r
          nextY = arcY + r
          ctx.lineTo(nextX, nextY)
        } else {
          nextY = nextY + h
          ctx.lineTo(nextX, nextY)

          nextX = nextX - w * p + r
          ctx.lineTo(nextX, nextY)
        }
        arcX = nextX
        arcY = nextY - r
        ctx.arc(arcX, arcY, r, 0.5 * Math.PI, 1 * Math.PI, false)
      } else {
        nextX = nextX + w * p
        nextY = nextY + h - 2 * r + Math.sin(0.5 * Math.PI - Math.acos((r - w * p) / r)) * r
        ctx.lineTo(nextX, nextY)

        arcY = arcY + h - 2 * r
        sAng = 1 * Math.PI - Math.acos((r - w * p) / r)
        eAng = 1 * Math.PI
        ctx.arc(arcX, arcY, r, sAng, eAng, false)
      }

      nextX = x - w / 2
      nextY = y - h / 2 + r
      ctx.lineTo(nextX, nextY)

      // let topLeft = [
      //   // 左上角坐标
      //   par.center[0] - par.width / 2,
      //   par.center[1] - par.height / 2
      // ]
      // if (par.progress >= 0 || !par.progress) {
      //   let nowPos = [topLeft[0] + par.radius, topLeft[1]] // 启始位置点，第一个弧度的起始位置。
      //   ctx.moveTo(nowPos[0], nowPos[1])

      //   const x = topLeft[0] || 0
      //   const y = topLeft[1] || 0
      //   const r = par.radius
      //   const w = par.width
      //   const h = par.height
      //   const p = par.progress === 0 ? 0 : par.progress ? par.progress : 1

      //   let nextX = x + w - r
      //   let nextY = y
      //   ctx.moveTo(nextX, nextY)

      //   let arcX = nextX
      //   let arcY = nextY + r
      //   let sAng = 1 * Math.PI
      //   let eAng =
      //     w * p < r ? sAng + Math.acos((r - w * p) / r) : 1.5 * Math.PI
      //   ctx.arc(arcX, arcY, r, sAng, eAng, false)

      //   if (w * p > r) {
      //     nextX = w * p > w - r ? nextX + w - 2 * r : nextX + w * p
      //     nextY = nextY - r
      //     ctx.lineTo(nextX, nextY)

      //     if (w * p > w - r) {
      //       arcX = nextX
      //       arcY = nextY + r
      //       sAng = 1.5 * Math.PI
      //       eAng = p < 1 ? sAng + Math.acos((r - (w - w * p)) / r) : 0
      //       ctx.arc(arcX, arcY, r, sAng, eAng, false)

      //       nextX = nextX + (r - (w - w * p))
      //       nextY =
      //         nextY +
      //         h -
      //         r -
      //         Math.cos(0.5 * Math.PI - Math.acos((r - (w - w * p)) / r)) * r
      //       ctx.lineTo(nextX, nextY)

      //       arcY = arcY + h - 2 * r
      //       sAng = 0
      //       eAng =
      //         p < 1 ? sAng + Math.acos((r - (w - w * p)) / r) : 0.5 * Math.PI
      //       ctx.arc(arcX, arcY, r, sAng, eAng, false)

      //       nextX = arcX - w + 3 * r
      //       nextY = arcY + r
      //       ctx.lineTo(nextX, nextY)
      //     } else {
      //       nextY = nextY + h
      //       ctx.lineTo(nextX, nextY)

      //       nextX = nextX - w * p + r
      //       ctx.lineTo(nextX, nextY)
      //     }
      //     arcX = nextX
      //     arcY = nextY - r
      //     ctx.arc(arcX, arcY, r, 0.5 * Math.PI, 1 * Math.PI, false)
      //   } else {
      //     nextX = nextX + w * p
      //     nextY =
      //       nextY +
      //       h -
      //       2 * r +
      //       Math.sin(0.5 * Math.PI - Math.acos((r - w * p) / r)) * r
      //     ctx.lineTo(nextX, nextY)

      //     arcY = arcY + h - 2 * r
      //     sAng = 1 * Math.PI - Math.acos((r - w * p) / r)
      //     eAng = 1 * Math.PI
      //     ctx.arc(arcX, arcY, r, sAng, eAng, false)
      //   }

      //   nextX = x - w / 2
      //   nextY = y - h / 2 + r
      //   ctx.lineTo(nextX, nextY)
      // 绘制当前的内容。
      if (par.stroke) {
        ctx.strokeStyle = par.color
        ctx.stroke()
      } else {
        ctx.fillStyle = par.color
        ctx.fill()
      }
    },
    paramFilter: {
      radius: `${'number'}`,
      width: `${'number'}`, // 长方形宽
      height: `${'number'}`, // 长方形高
      center: `${'[]'} ${'number'} len ${'2'}`, // 左上角点
      progress: `${'?number'} max ${1} min ${0}`, // 长方形完成度

      // 绘制方式
      stroke: `${'?boolean'}`, // 是否用stroke方式来绘制
      fill: `${'?boolean'}`, // 是否用fill方式来绘制

      // 绘制颜色
      color: `${'string'}` // 当前长方形的内容。
    }
  }
}
