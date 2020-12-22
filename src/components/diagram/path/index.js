import Figure from '../figure/index'
import circle from './circle'
import curve from './curve'
import rect from './rect'
import text from './text'
import icon from './icon'
import arrow from './arrow'
import { each } from '../../../tools/extension/iteration'

const pathList = [circle, curve, rect, text, icon, arrow];

((pathList) => {
  each(pathList)((val) => {
    Figure.Path.set(val.name, val.draw)
  })
})(pathList)
