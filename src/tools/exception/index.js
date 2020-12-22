/**
 * Logger helps to note error message as in defferent level, and will throw it out autoly.
 *
 * There have three different component into Logger.
 * 1. Console: Displaying message to console compatiblely
 * 2. Logger: Storing log info
 * 3. Exception: Customer exception for common mistakes, support extension
 */

import { capitalize, has } from 'lodash'
import { logger } from '../logger'

export const SeverityLevel = {
  Info: 'Info',
  Debug: 'Debug',
  Warn: 'Warn',
  Error: 'Error',
  Unified: 'Unified' // Unified level for vague-level log
}

/** ***Exception *****/
export class Exception extends Error {
  // 当前内容与Logger公用同一个对象，所以logger之中有修改的话，当前值也会被修改
  static level = SeverityLevel;
  // severity: string; 当前错误的等级。
  // alias: string; 当前错误的别称
  constructor (
    alias,
    msg,
    severity = SeverityLevel.Unified,
    cacheIntoLog = true
  ) {
    super(msg)
    this.alias = alias
    this.severity = severity
    if (cacheIntoLog) logger.log(this, severity)
  }

  msg () {
    return `${capitalize(this.alias)}: ${capitalize(this.message)}`
  }
}

export default function record (excep, catched, final) {
  try {
    if (excep instanceof Exception) {
      throw excep
    } else if (has(excep, ['alias', 'msg'])) {
      throw new Exception(excep.alias, excep.msg, excep.severity, excep.cacheIntoLog)
    }
  } catch (err) {
    catched && catched(err)
  } finally {
    final && final()
  }
}
