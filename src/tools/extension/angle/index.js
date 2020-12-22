import {divide, multiple} from 'lodash'

function equallyAngle (angle) {
  const bet = 360
  let final = angle
  while (final > bet || final < 0) {
    final > 0 ? (final -= bet) : (final += bet)
  }
  return final
}

export function toRadian (angle) {
  return multiple(divide(equallyAngle(angle), 360), 2) * Math.PI
}

export function toAngle (radian) {
  return multiple(divide(radian, 2 * Math.PI), 360)
}
