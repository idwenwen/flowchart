import { UUID } from '../../../../tools/uuid'
import { defNoEnum } from '../../../../tools/extension/define'
import beat from '../heartbeat'

// 播放对象唯一ID
const randomName = new UUID(index => `Player_${index}`)

/**
 * 当前播放帧。
 * 1. 记录播放帧的基本信息，包括时间，当前状态
 * 2. 基础播放帧的操作，包括加载（ready），播放，暂停，继续，结束等等。
 */
class Player {
  static MaxTimes = 20; // 最大的帧跳转速率倍数。
  static MinTimes = 0.05; // 最小帧跳转速率倍速

  // name: string; 当前帧播放的唯一标识
  // startTime: Duration; 开始时间
  // endTime: Duration; 结束时间
  // runTime: Duration; 已运行时长
  // lastStep: Duration; 上一次运行的时间标记

  // repeat: boolean; 是否循环播放
  // times: number; 当前播放运行倍数

  // started: boolean; 已经开始了与否
  // isPausing: boolean;  正在暂停状态中与否
  // isPlaying: boolean; 正在运行之中
  // finished: boolean; 是否已经完成

  // _context: any; 帧运行上下文

  constructor (name, repeat = false, times = 1, context = null) {
    defNoEnum(this, {
      _context: context,
      name: name || randomName.get().toString()
    })
    this.repeat = repeat
    this.times = times
    this.ready()
  }

  // 上下文设置方法
  set context (newContext) {
    this._context = newContext
  }
  get context () {
    return this._context
  }

  ready () {
    this.startTime = null
    this.endTime = null
    this.runTime = 0
    this.lastStep = null

    this.started = false
    this.isPausing = false
    this.isPlaying = false
    this.finished = false
  }

  // 暂停当前的帧播放
  pause () {
    // 修改当前播放器内容的状态为暂停。
    this.isPausing = true
    // 清除上一帧的计算时间。
    this.lastStep = null
    // 从当前的公共心跳计时器中之中查找并筛入暂停列表之中。
    return beat.pause(this.name)
  }

  // 继续当前帧动画
  continue () {
    // 从暂停列表之中查找到
    return beat.continue(this.name)
  }

  // 快速结束，提升当前帧播放的速度。
  finish () {
    this.times = Player.MaxTimes
  }

  // 直接结束当前的帧播放。
  end () {
    return beat.remove(this.name)
  }

  // 调整帧播放速率
  multiple (times) {
    this.times =
      times > Player.MaxTimes
        ? Player.MaxTimes
        : times < Player.MinTimes
          ? Player.MinTimes
          : times
  }

  // 帧动画播放器加载
  loading (operation, restart) {
    // 播放初始化
    this.ready()

    // 帧动画播放方法
    return timeStep => {
      // 记录开始时间，是否已经开始运行以及，当前运行状态
      if (!this.started) this.started = true
      if (!this.isPlaying) this.isPlaying = true
      if (!this.startTime) this.startTime = timeStep

      // 上一帧的计算时间
      if (!this.lastStep) this.lastStep = timeStep

      // 计算运行间隔时间
      this.runTime += timeStep - this.lastStep

      // 计算下一帧内容，以倍数化当前运行时间来达到提速运行的目的
      let next = operation(this.runTime * this.times)

      // 判定是否有下一帧，或者当前帧集合是否重复播放
      if (!next && this.repeat) {
        this.ready()
        restart && restart()
        next = true
      } else {
        this.isPlaying = false
        this.finished = true
      }
      return next
    }
  }

  // 帧内容计算
  act (..._meta) {}

  // 公共心跳开始运行当前帧内容
  start (...meta) {
    return beat.play(this, ...meta)
  }
}

export default Player
