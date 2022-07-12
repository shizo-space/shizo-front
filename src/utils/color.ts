// rarity 0 -> common, 4 -> legendary
export const getRarityColor = (rarity, secondary = false) => {
    if (rarity == 0) {
        return secondary ? '#9E9E9E' : '#BDBDBD'
    } else if (rarity == 1) {
        return secondary ? '#19934A' : '#14B454'
    } else if (rarity == 2) {
        return secondary ? '#146BD1' : '#1681FF'
    } else if (rarity == 3) {
        return secondary ? '#6F3EAE' : '#8C50D9'
    } else if (rarity == 4) {
        return secondary ? '#E27B01' : '#EC850C'
    }
}

export const hexToRgb = hex => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}
