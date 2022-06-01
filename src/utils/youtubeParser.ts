export const youtubeParser = url => {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  var match = url.match(regExp)
  return match && match[7]?.length == 11 ? match[7] : false
}

export const thetaParser = url => {
  const regExp = /^.*(thetavideoapi.com\/video\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2]?.length > 0 ? match[2] : null
}
