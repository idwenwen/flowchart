import { isString } from 'lodash'

export default {
  name: 'icon',
  draw: {
    path: function icon (ctx, par) {
      const topLeft = [
        par.center[0] - par.width / 2,
        par.center[1] - par.height / 2
      ]
      if (isString(par.image)) {
        let img = new Image()
        img.onload = function () {
          ctx.drawImage(img, topLeft[0], topLeft[1], par.width, par.height)
        }
        img.src = par.image
      } else {
        ctx.drawImage(par.image, topLeft[0], topLeft[1], par.width, par.height)
      }
    },
    paramFilter: {
      image: `${'?file'}`,
      width: `${'number'}`,
      height: `${'?number'}`,
      center: `${'[number, number]'}`
    }
  }
}
