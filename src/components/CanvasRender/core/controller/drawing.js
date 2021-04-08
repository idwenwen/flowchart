import { throttle, remove } from 'lodash'
import UUID from '../../tools/uuid'
import { each, toArray } from '../../tools/iteration'
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
  // 多次绘制之间的间隔情况。
  static between = 0;
  // willDraw: Drawable[];

  constructor () {
    this.drawableList = []
  }
  // 通过当前的绘制队列是否有drawAble来判定是否需要渲染。
  isRendering () {
    return this.drawableList.length > 0
  }

  // 添加信息的drawable内容
  add (drawable) {
    // 查询当前的drawList之中是否存在同名的绘制
    const index = this.drawableList.findIndex(val => val.uuid === drawable.uuid)
    if (index < 0) {
      this.drawableList.push(drawable)
      // 添加绘制对象之后激活心跳内容。
      beat.trigger()
    } else {
      // 如果存在当前drawable内容则将会调整渲染顺序。
      this.drawableList.splice(index, 1)
      this.drawableList.push(drawable)
    }
  }

  // 移除已有的drawable对象
  remove (uuid) {
    remove(this.drawableList, val =>
      toArray(uuid).find(item => val.uuid === item)
    )
  }

  // 渲染函数，返回绘制函数内容。
  render () {
    const _t = this
    return throttle(function () {
      // 依据drawList判定绘制内容。
      if (_t.drawableList.length > 0) {
        const finish = []
        // 遍历当前的绘制列表
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
