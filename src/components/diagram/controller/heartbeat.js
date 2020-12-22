import { each } from '../../../tools/extension/iteration'
import { Exception } from '../../../tools/exception'
import { Middleware } from '../../../tools/extension/onion'
import renderController from './drawing'

/**
 * 公共心跳关系，主要用于处理动作机制以及，相对固定间隔时间之内的时间
 */
class HeartBeat {
  // runningActions: Mapping<string, player>; 正在运行的Action
  // pausingActions: Mapping<string, player>;  暂停运行Action
  // middleWare: Middleware; Onion 自定义回调包裹。
  // running: boolean; 当前心跳是否在运行，如果running之中没有了内容将会停止。

  constructor () {
    this.running = false
    this.runningActions = new Map() // 运行列表内容
    this.pausingActions = new Map() // 暂停列表
    this.middleWare = new Middleware()
  }

  // 帧动作播放
  play (action, ...meta) {
    const player = action.act(...meta)
    let name = action.name // 获取当前动作名称，具体需要操作的动作需要给定明确的名称。
    this.runningActions.set(name, player)
  }

  // 暂停帧动作
  pause (name) {
    try {
      const res = this.runningActions.get(name)
      if (res) {
        // 将running之中的动作放置到
        this.runningActions.delete(name)
        this.pausingActions.set(name, res)
        return true
      } else {
        throw new Exception(
          'DonotExist',
          `Do not have value name matched with ${name}`,
          Exception.level.Info,
          false
        )
      }
    } catch (err) {
      return false
    }
  }

  // 继续相关动作。
  continue (name) {
    try {
      const res = this.pausingActions.get(name)
      if (res) {
        this.pausingActions.delete(name)
        this.runningActions.set(name, res)
        this.trigger() // 新加running内容，判定当前心跳是否启动。
        return true
      } else {
        throw new Exception(
          'DonotExist',
          `Do not have value name matched with ${name}`,
          Exception.level.Info,
          false
        )
      }
    } catch (_err) {
      return false
    }
  }

  // 删除相关动作
  remove (name) {
    this.runningActions.delete(name)
    this.pausingActions.delete(name)
  }

  // 循环加载触发
  trigger () {
    const _t = this

    const step = timeStep => {
      const ending = []
      each(this.runningActions)((item, key) => {
        if (item(timeStep)) ending.push(key) // 运行当前语句内容，并进行内容判定。
      })
      // 删除已经结束的动作
      each(ending)(name => {
        this.runningActions.delete(name)
      })
      // 通过当前running之中是否还有在播放的帧动作来判别是够需要继续
      return this.runningActions.size > 0
    }

    if (!this.running) { // 判定当前心跳是否在运行，如果没有则启动。
      this.running = true
      const renders = renderController.render()
      const run = () => {
        requestAnimationFrame(timeStep => {
          // 通过中间件的形式，为当前内容添加相关回调与过滤机制。
          this.middleWare.compose()(
            {},
            (context, next) => {
              const hasNext =
              step.call(_t, timeStep) || renderController.isRendering()
              if (hasNext) run()
              else _t.running = false
              renders() // 渲染当前的绘制。
              context.hasNext = hasNext
              next()
            })
        })
      }
      run()
    }
  }
}

const beat = new HeartBeat()

export default beat
