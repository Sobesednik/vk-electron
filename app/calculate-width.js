function calculateWidth(el) {
    const cs = getComputedStyle(el)
    const paddingRight = parseInt(cs.getPropertyValue('padding-right'), 10)
    const paddingLeft = parseInt(cs.getPropertyValue('padding-left'), 10)
    const cw = el.clientWidth
    return cw - paddingRight - paddingLeft
}

module.exports = calculateWidth
