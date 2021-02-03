import { SeverityLevel } from '../exception/index'
import * as display from '../console'
import isFunction from 'lodash/isFunction'
import { each } from '../extension/iteration'

// Default level for log
const defaultFormat = 'DEFAULT'

/** ***Logger *****/
export class Logger {
  // 规格话log信息的 函数 ，用户可以自主设置。
  static formatter = new Map();

  // 指向全局的唯一一个logger实例
  static logger = null;
  static level = SeverityLevel;

  // memorize: Map<string, string[]>; 相关等级的日志信息。
  // format: Function; 规整当前的log日志内容

  constructor (format = defaultFormat) {
    // 单例模式
    if (!Logger.logger) {
      this.memorize = new Map()
      this.format = isFunction(format)
        ? format
        : Logger.formatter.get(format)
      return this
    } else {
      return Logger.logger
    }
  }

  /**
   * 组合当前的日志信息
   * @param errorType 错误类行
   * @param level 错误级别
   */
  log (errorType, level = SeverityLevel.Unified) {
    // 判定是否有当前的错误界别，如果没有的话则自定义为unified无法分类
    Logger.level[level] || (level = SeverityLevel.Unified)

    // 错误信息与等级内容规格化函数
    const info = this.format(errorType, level)

    // 获取当前已有的错误列表内容。
    const cache = this.memorize.get(level) || []

    // 存储当前的日志信息。
    cache.push(info)
    this.memorize.set(level, cache)
  }

  /**
   * 日志打印
   * @param level Severity level
   */
  exhibition (level = SeverityLevel.Unified) {
    // 判定是否有当前的错误界别，如果没有的话则自定义为unified无法分类
    Logger.level[level] || (level = SeverityLevel.Unified)
    display[level](...(this.memorize.get(level) || []))
  }

  /**
   * 依据给定等级返回错误日志
   * @param level Severity level
   */
  get (level = SeverityLevel.Unified) {
    // 判定是否有当前的错误界别，如果没有的话则自定义为unified无法分类
    Logger.level[level] || (level = SeverityLevel.Unified)
    return this.memorize.get(level)
  }

  /**
   * 返回所有的日志信息
   */
  getAll () {
    const all = {}
    each(this.memorize)((val, key) => {
      all[key] = val
    })
    return all
  }

  /**
   * 添加信息的等级信息
   * @param level Severity level
   */
  static set (level) {
    if (!Logger.level[level]) {
      Logger.level[level] = level
    }
  }
}

// [level] - [error type]: [error message] - [time now]
// 基础的格式话信息方法
Logger.formatter.set(defaultFormat, (error, level) => {
  const now = new Date().toString()
  return `${level} - ${error.msg()} - ${now}`
})

const logger = new Logger()
Logger.logger = logger // Global default logger instance

export default Logger
