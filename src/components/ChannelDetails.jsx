import { useEffect, useState } from "react";
import { FetchAPI } from "../utils/apiCalls";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./reusables/Sidebar";
import useWindowWidth from "../hooks/useWindowWidth";
import Card from "./reusables/Card";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import ReactPlayer from "react-player";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import SetTimePassed from "./SetTimePassed";
import LoadingSpinner from "./reusables/LoadingSpinner";
import "./styles/channelDetails.css";

export default function ChannelDetails() {
  let [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currLangCode = cookies.get("i18next") || "en";
  const [channel, setChannel] = useState({});
  const windowWidth = useWindowWidth();
  const [selectedOption, setSelectedOption] = useState("");
  const [date, setDate] = useState(new Date().toString().split(" "));
  const [videos, setVideos] = useState([]);
  const [noLive, setNoLive] = useState(false);
  const [noVideos, setNoVideos] = useState(false);
  const [noPlaylists, setNoPlaylists] = useState(false);
  const [live, setLive] = useState([]);
  const [unsubscribedVideo, setUnsubscribedVideo] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Vi-Stream";
    setLoading(true);
    FetchAPI(`channels?part=snippet,statistics&id=${id}`)
      ?.then(({ data }) => {
        let channelData = data;
        setChannel(data?.items ? data?.items[0] : []);
        if (data?.items?.length > 0) {
          loadImage(data?.items?.[0]?.snippet?.thumbnails?.medium?.url)
            ?.then((resp) => setImgSrc(resp))
            ?.catch(() => {});
          document.title = `${data?.items[0]?.snippet?.title} - Vi-Stream`;
          if (data?.items[0]?.brandingSettings?.channel?.unsubscribedTrailer) {
            FetchAPI(
              "videos?part=contentDetails,snippet,statistics&id=" +
                data?.items[0]?.brandingSettings?.channel?.unsubscribedTrailer,
            )
              ?.then((respns) => {
                setUnsubscribedVideo(
                  respns?.data?.items?.length > 0 ? respns?.data?.items[0] : {},
                );
                setSelectedOption("home");
              })
              ?.catch(() => {});
          }
          FetchAPI(
            `search?part=id,snippet&type=playlist&channelId=${id}${
              data?.items?.length > 0
                ? `&channel=${data?.items[0]?.snippet?.title}`
                : ""
            }&maxResults=100`,
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
              setNoPlaylists(arr?.length === 0);
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    FetchAPI(`search?part=snippet,id&channelId=${id}&order=date&maxResults=50`)
      .then(({ data }) => {
        let arr1 = [];
        let arr2 = [];
        if (data.items) {
          const videos = data?.items?.filter((obj) =>
            obj?.id?.hasOwnProperty("videoId"),
          );
          videos.forEach((obj) =>
            obj?.snippet?.liveBroadcastContent === "none"
              ? arr1?.push(obj)
              : arr2?.push(obj),
          );
          arr1?.length > 0 ? setVideos(arr1) : setNoVideos(true);
          arr2?.length > 0 ? setLive(arr2) : setNoLive(true);
        }
      })
      .catch(() => {});
  }, [id]);
  useEffect(() => {
    setDate(
      new Date(Date?.parse(channel?.snippet?.publishedAt))
        ?.toString()
        ?.split(" "),
    );
  }, [channel]);
  return (
    <div className="d-flex channel-container">
      <Sidebar />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="channel-main">
          <div>
            {channel?.brandingSettings?.image?.bannerExternalUrl && (
              <div className="banner-container">
                <img
                  className="w-100 banner-img"
                  src={channel?.brandingSettings?.image?.bannerExternalUrl}
                  alt="banner"
                />
              </div>
            )}
            <div className="channel-header">
              <img className="channel-avatar" src={imgSrc} alt="logo" />
              <div className="channel-info">
                <div className="channel-title">{channel?.snippet?.title}</div>
                <div className="channel-stats">
                  <div className="fw-bold text-secondary">
                    {channel?.snippet?.customUrl}
                  </div>
                  &nbsp;
                  {channel?.statistics?.subscriberCount &&
                    parseInt(channel?.statistics?.subscriberCount) > 0 && (
                      <div>
                        {`${
                          channel?.statistics?.subscriberCount > 999
                            ? roundSubsAndLikes(
                                channel?.statistics?.subscriberCount,
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
          <div className="channel-options-bar">
            {["home", "videos", "playlists", "live", "about"].map((str) => (
              <div
                key={str}
                onClick={() => setSelectedOption(str)}
                className={`channelDet-options channel-option ${
                  selectedOption === str ? "selected" : ""
                }`}
              >
                {t(str, str?.toUpperCase())?.toUpperCase()}
              </div>
            ))}
          </div>
          {selectedOption?.length > 0 && Object.keys(channel)?.length > 0 && (
            <div className="channel-content">
              {selectedOption === "home" && (
                <div>
                  {channel?.brandingSettings?.channel?.unsubscribedTrailer && (
                    <div className={windowWidth > 850 ? "d-flex" : ""}>
                      <div>
                        <div
                          className={`player-wrapper ${windowWidth < 500 ? "player-small" : "player-large"} ${windowWidth < 610 ? "player-auto" : ""}`}
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
                        className={`player-info ${
                          windowWidth > 850
                            ? "player-info-large"
                            : "player-info-small"
                        } ${
                          windowWidth <= 850 && windowWidth >= 610
                            ? "player-info-medium"
                            : ""
                        }`}
                      >
                        {Object.keys(unsubscribedVideo)?.length > 0 && (
                          <div>
                            <div
                              className="videos-title fw-bold cursor-pointer video-title"
                              onClick={() =>
                                navigate(`/watch?v=${unsubscribedVideo?.id}`)
                              }
                            >
                              {unsubscribedVideo?.snippet?.title}
                            </div>

                            <div className="d-flex text-secondary video-meta">
                              {unsubscribedVideo?.statistics?.viewCount && (
                                <>
                                  <span>
                                    {parseInt(
                                      unsubscribedVideo?.statistics?.viewCount,
                                    )?.toLocaleString()}{" "}
                                    {t("views", "views")} &nbsp;
                                  </span>
                                  <div className="fw-bold dot">.</div>
                                  &nbsp;
                                </>
                              )}
                              {`${
                                currLangCode === "fr" ? t("ago", "il y a") : ""
                              }`}{" "}
                              <SetTimePassed
                                date={
                                  new Date(
                                    Date.parse(
                                      unsubscribedVideo?.snippet?.publishedAt,
                                    ),
                                  )
                                }
                              />{" "}
                              {`${
                                currLangCode !== "fr" ? t("ago", "ago") : ""
                              }`}
                            </div>
                            {unsubscribedVideo?.snippet?.description &&
                              windowWidth > 850 && (
                                <div className="description">
                                  {unsubscribedVideo?.snippet?.description}
                                </div>
                              )}
                            {unsubscribedVideo?.snippet?.description &&
                              windowWidth > 850 && (
                                <button
                                  className="read-more"
                                  onClick={() =>
                                    navigate(
                                      `/watch?v=${unsubscribedVideo?.id}`,
                                    )
                                  }
                                >
                                  {t("readMore", "READ MORE")}
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {(selectedOption === "videos" || selectedOption === "live") && (
                <div>
                  {(selectedOption === "videos" && noVideos) ||
                  (selectedOption === "live" && noLive) ? (
                    <div className="no-videos">
                      {t("noVid", "This channel has no videos.")}
                    </div>
                  ) : (
                    <div className="container">
                      <div className="row">
                        {selectedOption === "videos"
                          ? videos.map((obj) => (
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
              {selectedOption === "playlists" && (
                <div>
                  {noPlaylists ? (
                    <div className="no-playlists">
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
              {selectedOption === "about" && (
                <div className="about-section">
                  <div className="about-left">
                    {channel?.brandingSettings?.channel?.description?.length >
                      0 && (
                      <>
                        {t("descr", "Description")}
                        <br />
                        <br />
                        <span className="stats-text">
                          {channel?.brandingSettings?.channel?.description}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="about-right">
                    {t("stats", "Stats")}
                    <br />
                    <hr />
                    <span className="stats-text">{`${
                      currLangCode !== "hi" ? t("joined", "Joined") : ""
                    } ${date[1]} ${date[2]}, ${date[3]} ${
                      currLangCode === "hi" ? t("joined", "Joined") : ""
                    }`}</span>
                    <br />
                    <hr />
                    {parseInt(channel?.statistics?.viewCount) > 0 && (
                      <span className="stats-text">
                        {parseInt(
                          channel?.statistics?.viewCount,
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
      )}
    </div>
  );
}
