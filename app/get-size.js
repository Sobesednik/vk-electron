function getSize(sizes, type) {
    return sizes
        .find(size => size.type === type)
}

module.exports = getSize
