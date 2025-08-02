import axios from "axios";

const env = import.meta.env;

const headers = {
  "X-RapidAPI-Key": env.VITE_KEY,
  "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
};

export const FetchAPI = async (url) => {
  return await axios.get(`${env.VITE_YT_URL}${url}`, { headers });
};
