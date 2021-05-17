export function getPos (event, currentTarget = true) {
  const target = currentTarget ? (currentTarget === true ? (event.target || event.srcElement) : currentTarget) : null
  const targetPos = target ? getElementPosition(target) : null
  let e = event || window.event
  let scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
  let scrollY = document.documentElement.scrollTop || document.body.scrollTop
  let x = e.pageX || e.clientX + scrollX
  let y = e.pageY || e.clientY + scrollY
  // alert('x: ' + x + '\ny: ' + y);
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
