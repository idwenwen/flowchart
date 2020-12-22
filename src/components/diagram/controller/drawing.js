import { toArray, throttle, remove } from 'lodash'
import { UUID } from '../../../tools/uuid'
import { each } from '../../../tools/extension/iteration'

const DrawableId = new UUID(index => `Drawable_${index}`)

// 可绘制对象。
export class Drawable {
  // uuid: string;
  // canvas: HTMLCanvasElement;
  // drawing: Function;
  constructor (canvas, drawing, uuid) {
    this.uuid = uuid || DrawableId.get().toString()
    this.canvas = canvas
    this.drawing = drawing
  }

  render () {
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawing(ctx) // 内容绘制
  }
}

class Render {
  static between = 80;
  // willDraw: Drawable[];

  constructor () {
    this.drawableList = []
  }

  isRendering () {
    return this.drawableList.length > 0
  }

  // 添加信息的drawable内容
  add (drawable) {
    this.willDraw.find(val => val.uuid === drawable.uuid) ||
      this.willDraw.push(drawable)
  }

  // 移除已有的drawable对象
  remove (uuid) {
    remove(this.drawableList, val =>
      toArray(uuid).find(item => val.uuid === item)
    )
  }

  render () {
    return throttle(function () {
      if (this.drawableList.length > 0) {
        const finish = []
        each(this.drawableList)((val, index) => {
          val.render()
          finish.push(index)
        })
        // 绘制完成之后删除当前待绘制内容。
        remove(this.drawableList, (_val, index) =>
          finish.find(item => index === item)
        )
      }
    }, Render.between)
  }
}

const renderController = new Render()

export default renderController
