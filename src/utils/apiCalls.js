import axios from "axios";

const env = import.meta.env

// console.log(env.VITE_KEY)
const BASE_URL = 'http://localhost:5000/'

// const headers = {
//   'X-RapidAPI-Key': env.VITE_KEY,
//   'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
// }

export const FetchAPI = async (url)=>{
  return await axios.get(`${BASE_URL}${url}`)
}