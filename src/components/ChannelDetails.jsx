import { useEffect, useState } from "react";
import { FetchAPI } from "../utils/apiCalls";
import { useNavigate, useSearchParams } from "react-router-dom";
// import Videos from "./reusables/Videos"
import Sidebar from "./reusables/Sidebar";
import { useWindowWidth } from "../utils/MyHooks";
import Card from "./reusables/Card";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import ReactPlayer from "react-player";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { SetTimePassed } from "../utils/MyHooks";

export default function ChannelDetails({
  navToggle,
  selectedCategory,
  setSelectedCategory,
}) {
  let [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currLangCode = cookies.get("i18next") || "en";
  const [channel, setChannel] = useState({});
  const windowWidth = useWindowWidth();
  const [selOptn, setSelOptn] = useState("");
  const [date, setDate] = useState(new Date().toString().split(" "));
  const [vids, setVids] = useState([]);
  const [noLive, setNoLive] = useState(false);
  const [noVids, setNoVids] = useState(false);
  const [noPlaylists, setNoPlaylists] = useState(false);
  const [live, setLive] = useState([]);
  const [unsubVid, setUnsubVid] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    document.title = "YouTube";
    FetchAPI(`channels?part=snippet,statistics&id=${id}`)
      ?.then(({ data }) => {
        let channelData = data;
        setChannel(data?.items ? data?.items[0] : []);
        if (data?.items?.length > 0) {
          loadImage(data?.items?.[0]?.snippet?.thumbnails?.medium?.url)
            ?.then((resp) => setImgSrc(resp))
            ?.catch(() => {});
          document.title = `${data?.items[0]?.snippet?.title} - YouTube`;
          if (data?.items[0]?.brandingSettings?.channel?.unsubscribedTrailer) {
            FetchAPI(
              "videos?part=contentDetails,snippet,statistics&id=" +
                data?.items[0]?.brandingSettings?.channel?.unsubscribedTrailer
            )
              ?.then((respns) => {
                setUnsubVid(
                  respns?.data?.items?.length > 0 ? respns?.data?.items[0] : {}
                );
                setSelOptn("home");
              })
              ?.catch(() => {});
          }
          FetchAPI(
            `search?part=id,snippet&type=playlist&channelId=${id}${
              data?.items?.length > 0
                ? `&channel=${data?.items[0]?.snippet?.title}`
                : ""
            }&maxResults=100`
          )
            .then(({ data }) => {
              let arr = [];
              data?.items?.forEach((obj) => {
                if (
                  channelData?.items?.length > 0 &&
                  obj?.snippet?.channelTitle ===
                    channelData?.items[0]?.snippet?.title
                )
                  arr?.push(obj);
              });
              setPlaylists(arr?.length > 0 ? arr : []);
              setNoPlaylists(arr?.length > 0 ? false : true);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
    FetchAPI(`search?part=snippet,id&channelId=${id}&order=date&maxResults=50`)
      .then(({ data }) => {
        let arr1 = [];
        let arr2 = [];
        if (data.items) {
          const videos = data?.items?.filter((obj) =>
            obj?.id?.hasOwnProperty("videoId")
          );
          videos.forEach((obj) =>
            obj?.snippet?.liveBroadcastContent === "none"
              ? arr1?.push(obj)
              : arr2?.push(obj)
          );
          arr1?.length > 0 ? setVids(arr1) : setNoVids(true);
          arr2?.length > 0 ? setLive(arr2) : setNoLive(true);
        }
      })
      .catch(() => {});
  }, [id]);
  useEffect(() => {
    setDate(
      new Date(Date?.parse(channel?.snippet?.publishedAt))
        ?.toString()
        ?.split(" ")
    );
  }, [channel]);
  return (
    <div style={{ display: "flex", marginTop: "60px" }}>
      <Sidebar
        navToggle={navToggle}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div style={{ flex: "90%" }}>
        <div>
          {channel?.brandingSettings?.image?.bannerExternalUrl && (
            <div
              style={{
                overflow: "hidden",
                height: `${windowWidth * 0.1621}px`,
              }}
            >
              <img
                src={channel?.brandingSettings?.image?.bannerExternalUrl}
                style={{ width: "100%", transform: "translate(0px, -33%)" }} //-228px
                alt="banner"
              />
            </div>
          )}
          <div style={{ display: "flex", marginTop: "30px" }}>
            <img
              src={imgSrc}
              alt="logo"
              style={{
                borderRadius: "50%",
                marginLeft: "20px",
                width: "120px",
                display: windowWidth < 700 && "none",
              }}
            />
            <div style={{ margin: "20px 0px 0px 20px" }}>
              <div style={{ fontSize: "x-large" }}>
                {channel?.snippet?.title}
              </div>
              <div style={{ display: "flex", fontSize: "15px" }}>
                <div style={{ fontWeight: "bold", color: "gray" }}>
                  {channel?.snippet?.customUrl}
                </div>
                &nbsp;
                {channel?.statistics?.subscriberCount &&
                  parseInt(channel?.statistics?.subscriberCount) > 0 && (
                    <div>
                      {`${
                        channel?.statistics?.subscriberCount > 999
                          ? roundSubsAndLikes(
                              channel?.statistics?.subscriberCount
                            )
                          : channel?.statistics?.subscriberCount
                      } ${t("subs", "subscribers")}`}
                      &nbsp;
                    </div>
                  )}
                {channel?.statistics?.videoCount && (
                  <div>
                    {parseInt(channel?.statistics?.videoCount) > 0
                      ? channel?.statistics?.videoCount
                      : t("no", "No ")}{" "}
                    {t("videos", "videos")}
                    {currLangCode === "hi" &&
                    parseInt(channel?.statistics?.videoCount) === 0
                      ? " नहीं"
                      : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            borderBottom: "0.8px solid lightgray",
            marginTop: "20px",
          }}
        >
          {["home", "videos", "playlists", "live", "about"].map((str) => (
            <div
              key={str}
              onClick={() => setSelOptn(str)}
              className="channelDet-options"
              style={{
                color: selOptn === str && "rgb(63,63,63)",
                borderBottom: selOptn === str && "2px solid rgb(63, 63, 63)",
              }}
            >
              {t(str, str?.toUpperCase())?.toUpperCase()}
            </div>
          ))}
        </div>
        {selOptn?.length > 0 && Object.keys(channel)?.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            {selOptn === "home" && (
              <div>
                {channel?.brandingSettings?.channel?.unsubscribedTrailer && (
                  <div style={{ display: windowWidth > 850 && "flex" }}>
                    <div>
                      <div
                        style={{
                          height: windowWidth < 500 ? "174.28px" : "253px",
                          width: windowWidth < 500 ? "300px" : "435px",
                          margin: windowWidth < 610 && "auto",
                        }}
                      >
                        <ReactPlayer
                          controls
                          playing={true}
                          className="vidDetail-react_player"
                          url={`https://www.youtube.com/watch?v=${channel?.brandingSettings?.channel?.unsubscribedTrailer}`}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        margin: windowWidth > 850 ? "0% 20px" : "20px 0px",
                        width:
                          windowWidth <= 850 && windowWidth >= 610 && "435px",
                      }}
                    >
                      {Object.keys(unsubVid)?.length > 0 && (
                        <div>
                          <div
                            className="videos-title"
                            style={{
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                            onClick={() => navigate(`/watch?v=${unsubVid?.id}`)}
                          >
                            {unsubVid?.snippet?.title}
                          </div>

                          <div
                            style={{
                              color: "gray",
                              margin: "8px 0px",
                              fontSize: "small",
                              display: "flex",
                            }}
                          >
                            {unsubVid?.statistics?.viewCount && (
                              <>
                                <span>
                                  {parseInt(
                                    unsubVid?.statistics?.viewCount
                                  )?.toLocaleString()}{" "}
                                  {t("views", "views")} &nbsp;
                                </span>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "larger",
                                    marginTop: "-6px",
                                  }}
                                >
                                  .
                                </div>
                                &nbsp;
                              </>
                            )}
                            {`${
                              currLangCode === "fr" ? t("ago", "il y a") : ""
                            }`}{" "}
                            <SetTimePassed
                              date={
                                new Date(
                                  Date.parse(unsubVid?.snippet?.publishedAt)
                                )
                              }
                            />{" "}
                            {`${currLangCode !== "fr" ? t("ago", "ago") : ""}`}
                          </div>
                          {unsubVid?.snippet?.description &&
                            windowWidth > 850 && (
                              <div style={{ fontSize: "14px" }}>
                                <div
                                  style={{
                                    lineHeight: "20px",
                                    height: "83px",
                                    overflow: "hidden",
                                  }}
                                >
                                  {unsubVid?.snippet?.description}
                                </div>
                                <button
                                  style={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    fontSize: "12px",
                                  }}
                                  onClick={() =>
                                    navigate(`/watch?v=${unsubVid?.id}`)
                                  }
                                >
                                  {t("readMore", "READ MORE")}
                                </button>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {(selOptn === "videos" || selOptn === "live") && (
              <div>
                {(selOptn === "videos" && noVids) ||
                (selOptn === "live" && noLive) ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "15px",
                    }}
                  >
                    {t("noVid", "This channel has no videos.")}
                  </div>
                ) : (
                  <div className="container">
                    <div className="row">
                      {selOptn === "videos"
                        ? vids.map((obj) => (
                            <Card
                              key={obj?.id?.videoId}
                              obj={obj}
                              channelOn={false}
                            />
                          ))
                        : live.map((obj) => (
                            <Card
                              key={obj?.id?.videoId}
                              obj={obj}
                              channelOn={false}
                            />
                          ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {selOptn === "playlists" && (
              <div>
                {noPlaylists ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "15px",
                    }}
                  >
                    {t("noPlayList", "This channel has no playlists.")}
                  </div>
                ) : (
                  <div className="container">
                    <div className="row">
                      {playlists?.map((obj) => (
                        <Card
                          key={obj?.id?.playlistId}
                          obj={obj}
                          channelOn={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {selOptn === "about" && (
              <div style={{ padding: "3% 7%", display: "flex" }}>
                <div style={{ flex: "60%" }}>
                  {channel?.brandingSettings?.channel?.description?.length >
                    0 && (
                    <>
                      {t("descr", "Description")}
                      <br />
                      <br />
                      <span style={{ fontSize: "15px" }}>
                        {channel?.brandingSettings?.channel?.description}
                      </span>
                    </>
                  )}
                </div>
                <div style={{ flex: "30%", marginLeft: "5%" }}>
                  {t("stats", "Stats")}
                  <br />
                  <hr />
                  <span style={{ fontSize: "15px" }}>{`${
                    currLangCode !== "hi" ? t("joined", "Joined") : ""
                  } ${date[1]} ${date[2]}, ${date[3]} ${
                    currLangCode === "hi" ? t("joined", "Joined") : ""
                  }`}</span>
                  <br />
                  <hr />
                  {parseInt(channel?.statistics?.viewCount) > 0 && (
                    <span style={{ fontSize: "15px" }}>
                      {parseInt(
                        channel?.statistics?.viewCount
                      )?.toLocaleString()}{" "}
                      {t("views", "views")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
