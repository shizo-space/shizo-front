import axios from 'axios'

// const removeEmptyJSONKeysMiddleware = next => (url, options) => {
//   try {
//     const body = JSON.parse(options.body)

//     for (let key of Object.keys(body)) {
//       if (body[key] === '') {
//         delete body[key]
//       }
//     }

//     options.body = JSON.stringify(body)
//     return Promise.resolve(next(url, options))
//   } catch (err) {
//     return Promise.resolve(next(url, options))
//   }
// }

export const requestStates = { notSent: 0, sending: 1, success: 2, failure: 3 }

const directionApiBaseUrl = 'https://shizo.space/directions/api/'

export const directionApi = axios.create({
  baseURL: directionApiBaseUrl,
})

// export const setToken = token => {
//   api = api.headers({ authorization: token })
//   staticAPI = staticAPI.headers({ authorization: token })
// }

// export const removeToken = () => {
//   api = api.headers({ authorization: null })
//   staticAPI = staticAPI.headers({ authorization: null })
// }
