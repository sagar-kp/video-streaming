import { notFound } from "../assets";

export const roundSubsAndLikes = (subs) => {
  const subLength = String(subs)?.length;
  let round = String(Math.round(subs / Math.pow(10, subLength - 3)));
  if (subLength === 4 || subLength === 7)
    round = `${round?.slice(0, 1)}.${round?.slice(1)}`;
  else if (subLength === 5 || subLength === 8)
    round = `${round?.slice(0, 2)}.${round?.slice(2)}`;
  return `${round}${subLength < 7 ? "K" : "M"} `;
};

const loadImg = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(img?.height < 150 ? notFound : String(imageUrl));
    };
    img.onerror = () => {
      resolve(notFound);
      // reject;
    };
  });
};

export const getKey = (obj, index) => {
  if (!obj?.id?.length) return index;
  if (obj?.id?.hasOwnProperty("videoId")) return obj?.id?.videoId;
  if (obj?.id?.hasOwnProperty("playlistId")) return obj.id?.playlistId;
  return obj?.id?.channelId;
};

export const getNavigatePath = (obj) => {
  if (obj?.id?.videoId) return `/watch?v=${obj?.id?.videoId}`;
  else if (obj?.id?.playlistId) return `/playlist?list=${obj?.id?.playlistId}`;
  return `/channels?id=${obj?.id?.channelId}`;
};

export const loadImage = async (imgUrl) => await loadImg(imgUrl);
