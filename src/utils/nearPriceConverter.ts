function toYoktoNear(near) {
  let parts = (near + '').split('.')
  let demical_string_part
  let integer_part
  if ((near + '').indexOf('.') !== -1) {
    demical_string_part = parts[1]
    integer_part = parts[0]
    if (Number(integer_part) === 0) {
      integer_part = ''
    }
  } else {
    integer_part = parts[0]
    demical_string_part = ''
  }

  return integer_part + (demical_string_part + '0'.repeat(24)).substring(0, 24)
}

function getDisplayPrice(near) {
  if (near % 1 === 0) {
    return near.toFixed(0)
  } else if ((near * 10) % 1 === 0) {
    return near.toFixed(1)
  } else if ((near * 100) % 1 === 0) {
    return near.toFixed(2)
  } else {
    return near.toFixed(3)
  }
}

export { toYoktoNear, getDisplayPrice }
