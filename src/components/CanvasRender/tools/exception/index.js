import Exception from './exception'
import logger from '../log'

export function record (alias, msg, cache = false, level = 'info') {
  if (process.env.NODE_ENV === 'development') {
    try {
      const exception = new Exception(alias, msg)
      if (cache) {
        logger.addLogger(level, exception.toMsg())
      }
      throw exception
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  return false
}
