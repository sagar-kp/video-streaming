import { SetTimePassed } from "../../utils/MyHooks"
import { useNavigate } from "react-router-dom"
import cookies from "js-cookie"
import { useTranslation } from "react-i18next"
import { loadImage } from "../../utils/myFunctions"
import { useEffect, useState } from "react";

export default function Card({obj, channelOn}){
  const navigate = useNavigate()
  const [imgSrc, setImgSrc] = useState("")
  const currLangCode = cookies.get("i18next")||"en" 
  const {t} = useTranslation()
  useEffect(()=>{
    loadImage(obj.snippet?.thumbnails?.medium.url)
    .then(resp=>setImgSrc(resp))
    .catch(err=>{
      // console.log(err)
    })
  },[obj])
  return (
    <div key={obj.id.hasOwnProperty("videoId")?obj.id.videoId:obj.id.hasOwnProperty("playlistId")?obj.id.playlistId:obj.id.channelId} 
      className={`col-md-4 col-xl-${channelOn?"4":"3"} col-xxl-2 col-lg-${channelOn?"4":"3"} col-sm-6 col-xs-6 col-xxs-12 p-2`}
    >
      <div style={{textAlign:obj.id.channelId&&"center"}}>
        <img src={imgSrc} alt="thumbnails"
          style={{cursor:"pointer",  maxInlineSize:"100%", width:obj.id?.channelId?"45%":"100%", 
            margin:obj.id.channelId&&"5%", borderRadius:obj.id?.channelId?"50%":"13px", blockSize:"auto"
          }} 
          onClick={()=>{
            navigate(obj.id?.videoId?`/watch?v=${obj.id.videoId}`:obj.id?.playlistId?`/playlist?list=${obj.id.playlistId}`:`/channels?id=${obj.id?.channelId}`)
          }}
        />
      </div>
      <div className="videos-title" 
        style={{cursor:"pointer", padding:"2.9% 0% 0.1%", fontWeight:"bold", fontSize:window.location.pathname==="/channels"?"14px":"16px",
          textAlign:obj.id.channelId&&"center"
        }}
        onClick={()=>{
          navigate(obj.id.videoId?`/watch?v=${obj.id.videoId}`:obj.id?.playlistId?`/playlist?list=${obj.id.playlistId}`:`/channels?id=${obj.id?.channelId}`)
        }}
      >
        {obj.snippet?.title}
      </div>
      {channelOn&&<div className={obj.id.channelId?"videos-title":"over"} 
        style={{  cursor:"pointer", fontSize:window.location.pathname==="/channels"?"small":"14.4px"}}
        onClick={()=>navigate(`/channels?id=${obj.snippet.channelId}`)}
      >
        {obj.id?.channelId?obj.snippet.description:obj.snippet?.channelTitle}
      </div>}
      {obj.id.playlistId&&<div style={{cursor:"pointer", fontSize:"14.4px"}}
        onClick={()=>navigate(`/playlist?list=${obj.id?.playlistId}`)}
      >
        {window.location.pathname==="/channels"?t("viewFullPL","View full playlist"):t("viewFullPL","VIEW FULL PLAYLIST").toUpperCase()}
      </div>}
      {obj.id?.videoId&&<div style={{padding:"0% 0% 6%", fontSize:window.location.pathname==="/channels"?"small":"14.4px"}}>
        {currLangCode==="fr"?t("ago", "il y a "):""} <SetTimePassed date={new Date(Date.parse(obj.snippet?.publishedAt))}/> {` ${currLangCode!=="fr"?t("ago", "ago"):""} `}
      </div>}
      <div></div>
    </div>
        
  )
}