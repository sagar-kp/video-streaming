import { notFound } from "../assets"

export const roundSubsAndLikes = (subs)=>{
  let subLength = String(subs).length
  let round = String(Math.round(subs/Math.pow(10, subLength-3)))
  round = (subLength===4||subLength===7)?`${round.slice(0, 1)}.${round.slice(1)}`:
    (subLength===5||subLength===8)?`${round.slice(0, 2)}.${round.slice(2)}`:round
  return `${round}${subLength<7?'K':'M'} `
  
}

const loadImg = (imageUrl) => {
  return new Promise ((resolve)=>{
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // console.log(img.height, img.width)
      resolve( img.height<150?notFound:String(imageUrl))
    };
    img.onerror = (err) => {
      // console.log("img error");
      // console.error(err);
      reject
    };
  })
};

export const loadImage = async (imgUrl)=> await loadImg(imgUrl)

