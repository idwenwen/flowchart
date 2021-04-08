import EXHIBITION from '../console'

// 日志等级信息控制
class LoggerLevel {
  constructor () {
    this.levels = {
      DEBUGGER: 'debugger',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error'
    }
  }
  hasLevel (type) {
    return this.levels[type.toUpperCase()]
  }
  getLevel (type) {
    return this.levels[type.toUpperCase()]
  }
  setLevel (newType) {
    this.levels[newType.toUpperCase()] = newType.toLowerCase()
  }
  removeLevel (type) {
    delete this.levels[type.toUpperCase()]
  }
  getAll () {

  }
}
// 全局日志等级对象
const LOG_LEVEL = new LoggerLevel()

// 当前日志系统内容
class Logger {
  constructor (structure) {
    // 当前日志信息记录
    this.logger = new Map()
    this.structure = structure
  }

  // 日志类型对象类型操作
  addType (type) {
    LOG_LEVEL.setLevel(type)
    this.logger.set(LOG_LEVEL.getLevel(type), [])
  }
  removeType (type) {
    this.logger.delete(LOG_LEVEL.getLevel(type))
    LOG_LEVEL.removeLevel(type)
  }

  // 日志记录
  addLogger (level, content) {
    if (!LOG_LEVEL.hasLevel(level)) { // 如果当前等级存在
      LOG_LEVEL.setLevel(level)
    }
    const exLevel = LOG_LEVEL.getLevel(level)
    const list = this.logger.get(exLevel) || []
    list.push(`${exLevel}-${content}-<date>`)
    this.logger.set(exLevel, list)
  }
  clearLogger (level) {
    this.logger.delete(LOG_LEVEL.getLevel(level))
  }
  exhibition (level) {
    const list = this.logger.get(LOG_LEVEL.getLevel(level))
    EXHIBITION.exhibition(list.join('\n'))
  }
}
Logger.LEVELS = LOG_LEVEL

const logger = new Logger()

export default logger
