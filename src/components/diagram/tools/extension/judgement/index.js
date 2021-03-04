
export function isProxy (obj) {
  try {
    // eslint-disable-next-line no-new
    new Proxy(obj, {})
    return false
  } catch (err) {
    return true
  }
}
