import { useEffect, useState } from "react"
import { FetchAPI } from "../utils/apiCalls"
import Sidebar from "./reusables/Sidebar"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useWindowWidth, SetTimePassed } from "../utils/MyHooks"
import cookies from "js-cookie"
import { useTranslation } from "react-i18next"


export default function SearchResults({ navToggle, setSelectedCategory, selectedCategory}){
  const [objs, setObjs] = useState([])
  const [searchParams] = useSearchParams()
  const windowWidth = useWindowWidth()
  const navigate = useNavigate()
  const currLangCode = cookies.get("i18next")||"en"
  const {t} = useTranslation()
  const [noResults, setNoResults] = useState(false)
  const query = searchParams.get('query')
  useEffect(()=>{
    
    if (!query) setNoResults(true)
    else {
      document.title = `${query} - YouTube`
      FetchAPI(`search?part=snippet&q=${query}&order=date&maxResults=50`)
      .then(({data})=>{
        //console.log(data)
        if(data.items){ 
          setNoResults(false)
          let arr = data.items.filter(obj=>obj.id.hasOwnProperty("videoId"))
          let arr2 = data.items.filter(obj=>!obj.id.hasOwnProperty("videoId"))
          //console.log(arr, arr2)
          setObjs(data.items)
        } else{
          setNoResults(true)
        }
      })
      .catch(err=>{
        // console.log(err)
      })
    }
  }, [query])
  return <div style={{display:"flex"}} >
    <Sidebar navToggle={navToggle} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
    {noResults? <div style={{display:"flex", flex:"100%", justifyContent:"center", paddingTop:"6%"}}><h4>{t("noResultsFnd", "No results found")}</h4></div>:
    <div style={{margin:"2% 0% 0% 3%"}}>
      {
        objs.map((obj, index)=><div key={index} style={{display:"flex", marginBottom:windowWidth<700&&"5%"}} >
          <div className="search-img_div" style={{flex:"30%", textAlign:"center"}}>
            <img className="search-img" src={obj.snippet.thumbnails.high.url} 
              style={{width:obj.id?.channelId?"40%":"95%", height:!obj.id.channelId&&"83%", 
                margin:obj.id?.channelId&&"0% 2.5% 10% 0%",borderRadius:(obj.id?.channelId)?"50%":"15px"
              }}
              onClick={()=>navigate(obj.id.videoId?`/watch?v=${obj.id.videoId}`:obj.id.playlistId?`/playlist?list=${obj.id.playlistId}`:`/channels?id=${obj.snippet.channelId}`)}
            />
          </div>
          <div style={{flex:"70%"}}>
            <div className="videos-title" 
              style={{ padding:windowWidth<750?"0.2% 2% 0.1%":"2.9% 2% 0.1%", cursor:"pointer", fontSize:windowWidth<750?"15px":"19px",
                lineHeight:windowWidth<750&&"17px"
              }}
              onClick={()=>navigate(obj.id.videoId?`/watch?v=${obj.id.videoId}`:
                obj.id.playlistId?`/playlist?list=${obj.id.playlistId}`:`/channels?id=${obj.snippet.channelId}`
              )}
            >
              {obj.snippet.title}
            </div>
            {!obj.id.hasOwnProperty('channelId')&&<div style={{padding:"0.9% 2% 0.1%", fontSize:"small"}}>
              {currLangCode==="fr"?t("ago", "il y a "):""} <SetTimePassed date={new Date(Date.parse(obj.snippet?.publishedAt))}/> {` ${currLangCode!=="fr"?t("ago", "ago"):""} `}
            </div>}
            {!obj.id.hasOwnProperty('channelId')&&<div style={{padding:"0.1% 2% 0%", cursor:"pointer", fontWeight:"bold", fontSize:"small"}}
              onClick={()=>navigate(`/channels?id=${obj.snippet.channelId}`)}
            >
              {obj.snippet.channelTitle}
            </div>}
            {obj.id.playlistId&&<div style={{padding:"0.1% 2% 0%", cursor:"pointer", fontWeight:"bold", fontSize:"small"}}
              onClick={()=>navigate(`/playlist?list=${obj.id.playlistId}`)}
            >
              {t("viewFullPL", "VIEW FULL PLAYLIST")}
            </div>}
            {obj.id.hasOwnProperty('channelId')&&<div className="videos-title" style={{padding:"0.1% 2% 0%", fontWeight:"normal", fontSize:"small"}}>
              {obj.snippet.description}
            </div>}
          </div>
        </div>)
      }
      
    </div>}
  </div>
}