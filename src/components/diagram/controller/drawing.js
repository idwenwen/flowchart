import { throttle, remove } from 'lodash'
import UUID from '@/tools/uuid'
import { each, toArray } from '@/tools/extension/iteration'
import beat from './heartbeat'

const DrawableId = new UUID(index => `Drawable_${index}`)

// 可绘制对象。
export class Drawable {
  // uuid: string;
  // canvas: HTMLCanvasElement;
  // drawing: Function;
  constructor (canvas, drawing, uuid, origin) {
    this.uuid = uuid || DrawableId.get().toString()
    this.canvas = canvas
    this.drawing = drawing
    this._origin = origin
  }

  render () {
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawing(ctx) // 内容绘制
  }
}

class Render {
  static between = 0;
  // willDraw: Drawable[];

  constructor () {
    this.drawableList = []
  }

  isRendering () {
    return this.drawableList.length > 0
  }

  // 添加信息的drawable内容
  add (drawable) {
    if (!this.drawableList.find(val => val.uuid === drawable.uuid)) {
      this.drawableList.push(drawable)
      beat.trigger()
    }
  }

  // 移除已有的drawable对象
  remove (uuid) {
    remove(this.drawableList, val =>
      toArray(uuid).find(item => val.uuid === item)
    )
  }

  render () {
    const _t = this
    return throttle(function () {
      if (_t.drawableList.length > 0) {
        const finish = []
        each(_t.drawableList)(function (val, index) {
          val.render()
          finish.push(index)
        })
        // 绘制完成之后删除当前待绘制内容。
        remove(_t.drawableList, (_val, index) =>
          finish.indexOf(index) >= 0
        )
      }
    }, Render.between)
  }
}

const renderController = new Render()

export default renderController
