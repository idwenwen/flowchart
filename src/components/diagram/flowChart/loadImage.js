export const icons = {}

export function loadImage (name, image) {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = function () {
      icons[name] = img
      resolve()
    }
    img.src = image
  })
}

export function loadImages (images) {
  const ps = []
  for (const key in images) {
    ps.push(loadImage(key, images[key]))
  }
  return Promise.all(ps)
}
