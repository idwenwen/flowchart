import {eq} from 'lodash'

export function into (str, match) {
  return str.toString().toLowerCase().search(match.toLowerCase()) >= 0
}

export function intoFirst (str, match) {
  return str.toString().toLowerCase().search(match.toLowerCase()) === 0
}

export function is (str, equ) {
  return eq(str.toString().toLowerCase(), equ.toLowerCase())
}
