export default {
  name: 'icon',
  draw: {
    path: function icon (ctx, par) {
      const topLeft = [
        par.center[0] - par.width / 2,
        par.center[1] - par.height / 2
      ]
      ctx.drawImage(par.image, topLeft[0], topLeft[1], par.width, par.height)
    },
    paramFilter: {
      image: `${'?file'}`,
      width: `${'number'}`,
      height: `${'?number'}`,
      center: `${'[number, number]'}`
    }
  }
}
