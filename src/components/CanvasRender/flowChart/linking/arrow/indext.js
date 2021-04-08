class Arrow {
  toParameter () {
    return {
      point () {
        return this.endPoint
      }
    }
  }
}

export default Arrow
