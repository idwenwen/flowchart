import { each, toArray } from '../../utils/iteration'

/**
 * 绘制过程对象，提供绘制前后的准备，收尾工作与常用的绘制方式。
 */
class Brushing {
  // ctx: CanvasRenderingContext2D;

  /**
   * 创建绘制过程，。
   * @param ctx 绘制原料
   */
  constructor (ctx) {
    this.ctx = ctx
  }

  save () {
    this.ctx.save()
    return this
  }

  restore () {
    this.ctx.restore()
    return this
  }

  beginPath () {
    this.ctx.beginPath()
    return this
  }

  closePath () {
    this.ctx.closePath()
    return this
  }

  stroke () {
    this.ctx.stroke()
    return this
  }

  fill () {
    this.ctx.fill()
    return this
  }

  style (style) {
    if (style) {
      each(style)((val, key) => {
        this.ctx[key] = val
      })
    }
  }

  call (cb) {
    if (cb) {
      // 存在当前函数则调用。
      const _t = this
      cb = toArray(cb)
      each(cb)(val => {
        val(_t.ctx)
      })
    }
  }

  /**
   * 图像绘制工作整体流程
   * @param path 绘制方法
   * @param parameter 绘制所需参数
   * @param custom 自定义预设生命周期
   */
  drawing (path, parameter, customProcess) {
    // 当当前回调之中有出现报错, 则当前绘制将会自动终止。
    this.call(customProcess.beforeSave) // 存储先的预设工作
    this.save()
    this.call(customProcess.beforeSave) // 绘制钱的预设工作

    this.beginPath() // 路径绘制开始
    path.call(this, this.ctx, parameter) // 路径绘制
    this.closePath() // 路径绘制结束

    this.call(customProcess.afterDraw) // 绘制后回调函数
    this.restore()
    this.call(customProcess.afterRestore)
  }
}

export default Brushing
