export function getPos (event, currentTarget = true) {
  const target = currentTarget ? (currentTarget === true ? (event.target || event.srcElement) : currentTarget) : null
  const targetPos = target ? getElementPosition(target) : null
  let e = event || window.event
  let {scrollX, scrollY} = countingScroll(target)
  let x = e.clientX + scrollX
  let y = e.clientY + scrollY
  // console.log('x: ' + x + '\ny: ' + y)
  return targetPos ? [x - targetPos.x, y - targetPos.y] : [x, y]
}

export function compareToPos (pos, currentTarget, newTarget) {
  const currentPos = getElementPosition(currentTarget)
  const newPos = getElementPosition(newTarget)
  return [
    pos[0] + currentPos.x - newPos.x,
    pos[1] + currentPos.y - newPos.y
  ]
}

function countingScroll (e) {
  let x = 0
  let y = 0
  while (e != null) {
    x += (e.scrollLeft || 0)
    y += (e.scrollTop || 0)
    e = e.parentNode
  }
  return { scrollX: x, scrollY: y }
}

function getElementPosition (e) {
  let x = 0
  let y = 0
  while (e != null) {
    x += e.offsetLeft
    y += e.offsetTop
    e = e.offsetParent
  }
  return { x: x, y: y }
}
