import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FetchAPI } from "../utils/apiCalls";
import useWindowWidth from "../hooks/useWindowWidth";
import SetTimePassed from "./SetTimePassed";
import ReactPlayer from "react-player";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import { Loading, notFound, unavailableVideo } from "../assets";
import Sidebar from "./reusables/Sidebar";
import cookies from "js-cookie";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import LoadingSpinner from "./reusables/LoadingSpinner";
import "./styles/videoDetails.css";

export const VideoCard = ({ det: { obj, idx } }) => {
  const windowWidth = useWindowWidth();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isPathnamePlaylist = globalThis?.location?.pathname === "/playlist";
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    loadImage(obj?.snippet?.thumbnails?.medium?.url)
      .then((resp) => setImgSrc(resp))
      .catch(() => setImgSrc(notFound));
  }, [obj]);
  return (
    <div
      className={`d-flex ${isPathnamePlaylist ? "video-row--playlist" : "video-row--default"}`}
      key={obj?.id?.videoId}
    >
      {isPathnamePlaylist && (
        <div
          className={`index-box ${windowWidth < 600 ? "index-box-narrow" : ""}`}
        >
          {idx + 1}
        </div>
      )}
      <img
        src={imgSrc ?? Loading}
        alt="thumbnails"
        className={
          isPathnamePlaylist
            ? "thumb--playlist"
            : windowWidth < 1000 && windowWidth > 500
              ? "thumb--wide"
              : "thumb--default"
        }
        onClick={() =>
          navigate(
            isPathnamePlaylist
              ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
              : `/watch?v=${obj?.id?.videoId}`,
          )
        }
      />
      <div className="d-flex meta-col">
        <div>
          <div
            className="videos-title fw-bold cursor-pointer video-title-small"
            onClick={() =>
              navigate(
                isPathnamePlaylist
                  ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
                  : `/watch?v=${obj?.id?.videoId}`,
              )
            }
          >
            {obj?.snippet?.title}
          </div>
          <div
            className={`text-secondary ${isPathnamePlaylist ? "d-flex" : ""}`}
          >
            <div
              className="cursor-pointer channel-link--small"
              onClick={() =>
                navigate(`/channels?id=${obj?.snippet?.channelId}`)
              }
            >
              {obj?.snippet?.channelTitle}
            </div>
            {isPathnamePlaylist && (
              <span className="fw-bold dot-neg">&nbsp;.&nbsp;</span>
            )}
            <div
              className={`time-meta ${isPathnamePlaylist ? "time-meta--playlist" : ""}`}
            >
              {currLangCode === "fr" ? t("ago", "il y a ") : ""}{" "}
              <SetTimePassed
                date={new Date(Date.parse(obj?.snippet?.publishedAt))}
              />{" "}
              {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Comment = ({ obj }) => {
  const navigate = useNavigate();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const [len] = useState(obj?.textOriginal?.length > 485);
  const [open, setOpen] = useState(false);
  return (
    <div className="d-flex comment-row">
      <img
        className="cursor-pointer rounded-circle comment-avatar"
        src={obj?.authorProfileImageUrl}
        onClick={() => navigate(`/channels?id=${obj?.authorChannelId?.value}`)}
      />
      <div className="comment-text">
        <div>
          <span
            className="fw-bold cursor-pointer"
            onClick={() =>
              navigate(`/channels?id=${obj?.authorChannelId?.value}`)
            }
          >
            {obj?.authorDisplayName}
          </span>
          <span>
            &nbsp;
            {currLangCode === "fr" ? t("ago", "il y a") : ""}{" "}
            <SetTimePassed date={new Date(Date.parse(obj?.publishedAt))} />{" "}
            {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
          </span>
        </div>
        <div
          className={`comment-body ${len && !open ? "comment-body--collapsed" : ""}`}
        >
          {obj?.textOriginal}
        </div>
        <button
          className={`bg-transparent fw-bold border-0 ${!len || !open ? "d-none" : ""}`}
          onClick={() => setOpen(false)}
        >
          {t("showLess", "Show less")}
        </button>
        <button
          className={`bg-transparent fw-bold border-0 ${!len || open ? "d-none" : ""}`}
          onClick={() => setOpen(true)}
        >
          ... {t("more", "more")}
        </button>
        <div className="comment-actions-margin">
          <i className="bi bi-hand-thumbs-up icon-lg"></i>
          {Number.parseInt(obj?.likeCount) > 0 && <span>{obj?.likeCount}</span>}
          &nbsp;
          <i className="bi bi-hand-thumbs-down icon-lg"></i>
        </div>
      </div>
    </div>
  );
};

export default function VideoDetails() {
  const { navToggle, setNavToggle } = useAppContext();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("v");
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const [videoDetails, setVideoDetails] = useState([]);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [noVideoFound, setNoVideoFound] = useState(false);
  const [comments, setComments] = useState([]);
  const [channel, setChannel] = useState({});
  const [subscriber, setSubscriber] = useState("");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(false);
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const [channelImgSrc, setChannelImgSrc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Vi-Stream";
    if (id) {
      setLoading(true);
      FetchAPI("videos?part=contentDetails,snippet,statistics&id=" + id)
        .then(({ data }) => {
          if (data?.items) {
            setVideoDetails(data?.items);
            document.title = `${data?.items?.[0]?.snippet?.title} - Vi-Stream`;
            setDescriptionLength(
              data?.items?.[0]?.snippet?.description?.length <= 323,
            );
            FetchAPI(
              `channels?part=snippet,statistics&id=${data?.items[0]?.snippet?.channelId}`,
            )
              .then((respns) => {
                const items = respns?.data?.items?.[0];
                setChannel(items);
                const subs = Number.parseInt(
                  items?.statistics?.subscriberCount,
                );
                setSubscriber(subs > 999 ? roundSubsAndLikes(subs) : subs);
                loadImage(items?.snippet?.thumbnails?.medium?.url)
                  .then((resp) => setChannelImgSrc(resp))
                  .catch(() => {});
              })
              .catch(() => {});
          }
          setLoading(false);
        })
        .catch(() => {
          setNoVideoFound(true);
          setLoading(false);
        });
      const getComments = () => {
        FetchAPI(`commentThreads?part=snippet&videoId=${id}&maxResults=100`)
          .then(({ data }) => {
            setComments(data?.items ? data?.items : []);
          })
          .catch(() => {});
      };
      setTimeout(getComments, 2000);
    } else {
      navigate("/");
    }
  }, [id, navigate]);
  useEffect(() => {
    if ((windowWidth >= 600 && navToggle) || (windowWidth < 600 && !navToggle))
      setNavToggle((prev) => !prev);
  }, [windowWidth]);
  return (
    <>
      {((windowWidth >= 600 && navToggle) ||
        (windowWidth < 600 && !navToggle)) && (
        <div
          className={
            (windowWidth >= 600 && navToggle) ||
            (windowWidth < 600 && !navToggle)
              ? "overlay"
              : "over"
          }
        >
          <div
            className={
              (windowWidth >= 600 && navToggle) ||
              (windowWidth < 600 && !navToggle)
                ? "overlay-content"
                : "over"
            }
          >
            <Navbar />
            <Sidebar marginTopFromProps="60px" />
          </div>
        </div>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : noVideoFound ? (
        <div className="no-video-found">
          <div className="d-flex align-items-center flex-column">
            <img
              src={unavailableVideo}
              alt="unavailable video"
              className="no-video-img"
            />
            {t("vidAvblMore", "This video isn't available anymore")}
            <br />
            <button
              className="fw-bold go-home-btn"
              onClick={() => navigate("/")}
            >
              {t("goToHome", "GO TO HOME")}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`d-flex ${windowWidth < 1000 ? "flex-column" : "flex-row"} video-details-container`}
        >
          <div className="left-column">
            <div
              className={
                windowWidth < 500
                  ? "player-height-small"
                  : windowWidth < 700
                    ? "player-height-medium"
                    : windowWidth < 1300
                      ? "player-height-large"
                      : "player-height-xlarge"
              }
            >
              <ReactPlayer
                controls
                className="vidDetail-react_player"
                url={`https://www.youtube.com/watch?v=${id}`}
              />
            </div>
            {videoDetails?.length > 0 && (
              <div>
                <div className="fw-bold video-heading">
                  {videoDetails?.[0]?.snippet?.title}
                </div>
                <div className="d-flex video-main">
                  <img
                    className="cursor-pointer rounded-circle channel-avatar2"
                    src={channelImgSrc}
                    alt="logo"
                    onClick={() =>
                      navigate(
                        `/channels?id=${videoDetails?.[0]?.snippet?.channelId}`,
                      )
                    }
                  />
                  <div>
                    <div
                      className="fw-bold cursor-pointer channel-name"
                      onClick={() =>
                        navigate(
                          `/channels?id=${videoDetails?.[0]?.snippet?.channelId}`,
                        )
                      }
                    >
                      {videoDetails?.[0]?.snippet?.channelTitle}
                    </div>
                    {subscriber && (
                      <span className="subscriber-count">
                        {subscriber}
                        {` ${t("subs", "subscribers")} `}
                      </span>
                    )}
                  </div>
                  <div
                    className={`likes-box ${windowWidth < 900 ? "likes-box--small" : "likes-box--large"}`}
                  >
                    <i className="bi bi-hand-thumbs-up icon-lg"></i>
                    <span className="likes-count">
                      {Number.parseInt(
                        videoDetails?.[0]?.statistics?.likeCount,
                      ) > 999
                        ? roundSubsAndLikes(
                            Number.parseInt(
                              videoDetails?.[0]?.statistics?.likeCount,
                            ),
                            true,
                          )
                        : videoDetails?.[0]?.statistics?.likeCount}
                    </span>
                    <span className="fw-normal separator">|</span>
                    <i className="bi bi-hand-thumbs-down icon-lg"></i>
                  </div>
                </div>
                <div className="description-box">
                  <div
                    className={`description-body ${!descriptionOpen ? "description-body--collapsed" : ""}`}
                  >
                    <span className="fw-bold">
                      {Number.parseInt(
                        videoDetails?.[0]?.statistics?.viewCount,
                      )?.toLocaleString()}{" "}
                      {t("views", "views")}
                      {` ${currLangCode === "fr" ? t("ago", "il y a ") : ""}`}{" "}
                      <SetTimePassed
                        date={
                          new Date(
                            Date.parse(videoDetails?.[0]?.snippet?.publishedAt),
                          )
                        }
                      />{" "}
                      {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
                    </span>{" "}
                    <br />
                    {videoDetails?.[0]?.snippet?.description}
                    <br />
                    <br />
                    <button
                      className={`bg-transparent fw-bold border-0 ${descriptionLength || !descriptionOpen ? "d-none" : ""} `}
                      onClick={() => setDescriptionOpen(false)}
                    >
                      {t("showLess", "Show less")}
                    </button>
                  </div>
                  <button
                    className={`bg-transparent fw-bold border-0 ${descriptionLength || descriptionOpen ? "d-none" : ""}`}
                    onClick={() => setDescriptionOpen(true)}
                  >
                    ... {t("more", "more")}
                  </button>
                </div>
              </div>
            )}
            {comments?.length > 0 && (
              <div className="comments-section">
                {comments?.map((obj) => (
                  <Comment
                    key={obj?.id}
                    obj={obj?.snippet?.topLevelComment?.snippet}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="right-column">
            {suggestedVideos?.length > 0 &&
              suggestedVideos?.map((obj, idx) => (
                <VideoCard det={{ obj, idx }} key={obj?.id?.videoId} />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
