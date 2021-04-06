import { each } from '../tools/extension/iteration'
import Middleware from '../tools/extension/onion'
import renderController from './drawing'
import throttle from 'lodash/throttle'
import { record } from '../../utils/exception'

/**
 * 公共心跳关系，主要用于处理动作机制以及，相对固定间隔时间之内的时间
 */
class HeartBeat {
  // runningActions: Mapping<string, player>; 正在运行的Action
  // pausingActions: Mapping<string, player>;  暂停运行Action
  // middleWare: Middleware; Onion 自定义回调包裹。
  // running: boolean; 当前心跳是否在运行，如果running之中没有了内容将会停止。
  static timeBetween = 0

  constructor () {
    this.running = false
    this.runningActions = new Map() // 运行列表内容
    this.pausingActions = new Map() // 暂停列表
    this.middleWare = new Middleware()
  }

  /**
   * 运行帧动画内容。
   * @param {Player} action player的衍生对象
   * @param  {...any} meta act函数调用的时候传递的参数内容
   */
  play (action, ...meta) {
    const player = action.act(...meta)
    let name = action.name // 获取当前动作名称，具体需要操作的动作需要给定明确的名称。
    this.runningActions.set(name, player)
    this.trigger()
  }

  /**
   * 暂停当前的动画内容。
   * @param {string} name 动画名称
   */
  pause (name) {
    const res = this.runningActions.get(name)
    if (res) {
      // 将running之中的动作放置到
      this.runningActions.delete(name)
      this.pausingActions.set(name, res)
      return true
    } else {
      record('DonotExist', `Do not have value name matched with ${name}`)
      return false
    }
  }

  /**
   * 继续当前动画函数
   * @param {String} name 动画名称
   */
  continue (name) {
    const res = this.pausingActions.get(name)
    if (res) {
      this.pausingActions.delete(name)
      this.runningActions.set(name, res)
      this.trigger() // 新加running内容，判定当前心跳是否启动。
      return true
    } else {
      record('DonotExist', `Do not have value name matched with ${name}`)
      return false
    }
  }

  /**
   * 删除当前待运行的动画对象。
   * @param {String} name 删除当前动画
   */
  remove (name) {
    this.runningActions.delete(name)
    this.pausingActions.delete(name)
  }

  // 循环加载触发
  trigger () {
    if (!this.running) { // 判定当前心跳是否在运行，如果没有则启动。
      const _t = this

      // 动画的心跳步骤。
      const animateStep = function (timeStep) {
        const ending = []
        // 遍历当前的运行动画，运行动画并确定是否已经结束
        each(_t.runningActions)((item, key) => {
          if (!item(timeStep)) ending.push(key) // 运行当前语句内容，并进行内容判定。
        })
        // 删除已经结束的动作
        each(ending)(name => {
          _t.runningActions.delete(name)
        })
        // 通过当前running之中是否还有在播放的帧动作来判别是够需要继续
        return this.runningActions.size > 0
      }

      // 表示当前再运行态。
      this.running = true

      // 获取绘制列表
      const renders = renderController.render()

      let timestepCheck = 0
      const timestep = throttle(function () {
        // 通过中间件的形式，为当前内容添加相关回调与过滤机制。
        _t.middleWare.compose()(
          {},
          (context, next) => {
            // debugger
            // 如果还有动画再运行，或者还有内容需要渲染的化，则将自动进入下一次渲染循环
            const hasNext =
            animateStep.call(_t, timestepCheck) || renderController.isRendering()

            // 如果有下一步的化则调用循环队列内容。
            if (hasNext) run()
            // 如果没有下一步则将当前运行状态修改成为false
            else _t.running = false

            // 渲染当前的绘制内容。
            renders()

            // onion之中下一步传递的参数内容。
            context.hasNext = hasNext
            next()
          })
      }, HeartBeat.timeBetween)

      // 通过requestAnimationFrame来实现异步队列循环。
      const run = function () {
        requestAnimationFrame(timeStep => {
          timestepCheck = timeStep
          timestep()
        })
      }
      run()
    }
  }
}

const beat = new HeartBeat()

export default beat
