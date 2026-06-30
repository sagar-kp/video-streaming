import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import {
  getChannelDetails,
  getComments,
  getSearchResults,
  getVideoDetails,
} from "../services";

export const VideoCard = ({ det: { obj, idx } }) => {
  const windowWidth = useWindowWidth();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const isPathnamePlaylist = globalThis?.location?.pathname === "/playlist";
  const [imgSrc, setImgSrc] = useState("");

  const getThumbnailClassname = () => {
    if (isPathnamePlaylist) return "thumb--playlist";
    else if (windowWidth < 1000 && windowWidth > 500) return "thumb--wide";
    return "thumb--default";
  };
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
      <Link
        className={getThumbnailClassname()}
        to={
          isPathnamePlaylist
            ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
            : `/watch?v=${obj?.id?.videoId}`
        }
      >
        <img
          src={imgSrc ?? Loading}
          alt="thumbnails"
          className="video-thumbnail"
        />
      </Link>
      <div className="d-flex meta-col">
        <div>
          <Link
            className="videos-title fw-bold cursor-pointer video-title-small"
            to={
              isPathnamePlaylist
                ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
                : `/watch?v=${obj?.id?.videoId}`
            }
          >
            {obj?.snippet?.title}
          </Link>
          <div
            className={`text-secondary ${isPathnamePlaylist ? "d-flex" : ""}`}
          >
            <Link
              className="cursor-pointer channel-link--small"
              to={`/channels?id=${obj?.snippet?.channelId}`}
            >
              {obj?.snippet?.channelTitle}
            </Link>
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
              {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Comment = ({ obj }) => {
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const [len] = useState(obj?.textOriginal?.length > 485);
  const [open, setOpen] = useState(false);
  return (
    <div className="d-flex comment-row">
      <Link to={`/channels?id=${obj?.authorChannelId?.value}`}>
        <img
          className="cursor-pointer rounded-circle comment-avatar"
          src={obj?.authorProfileImageUrl}
          alt="user channel"
        />
      </Link>
      <div className="comment-text">
        <div>
          <Link
            className="fw-bold cursor-pointer"
            to={`/channels?id=${obj?.authorChannelId?.value}`}
          >
            {obj?.authorDisplayName}
          </Link>
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
  const [noVideoFound, setNoVideoFound] = useState(false);
  const [subscriber, setSubscriber] = useState("");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(false);
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const [channelImgSrc, setChannelImgSrc] = useState("");

  const {
    data: videoData,
    isLoading: loading,
    isError: isVideoError,
  } = useQuery({
    queryKey: ["video-details", id],
    queryFn: () => getVideoDetails(id),
    enabled: Boolean(id),
    retry: false,
  });

  const videoDetails = videoData?.data?.items ?? [];
  const channelId = videoDetails?.[0]?.snippet?.channelId;
  const videoTitle = videoDetails?.[0]?.snippet?.title;

  const { data: channelData } = useQuery({
    queryKey: ["channel-details", channelId],
    queryFn: () => getChannelDetails(channelId),
    enabled: Boolean(channelId),
    retry: false,
  });

  const { data: suggestedVideosData } = useQuery({
    queryKey: ["search-results", videoTitle],
    queryFn: () => getSearchResults(videoTitle),
    enabled: Boolean(videoTitle),
    retry: false,
  });

  const suggestedVideos = (suggestedVideosData?.data?.items ?? []).filter(
    (obj) => !obj.id?.hasOwnProperty("channelId") && obj.id?.videoId !== id,
  );

  const { data: commentsData } = useQuery({
    queryKey: ["video-comments", id],
    queryFn: () => getComments(id),
    enabled: Boolean(id),
    retry: false,
  });

  const comments = commentsData?.data?.items ?? [];

  useEffect(() => {
    document.title = "Vi-Stream";
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (videoDetails?.length > 0) {
      document.title = `${videoDetails[0]?.snippet?.title} - Vi-Stream`;
      setDescriptionLength(
        videoDetails[0]?.snippet?.description?.length <= 323,
      );
    }
  }, [videoDetails]);

  useEffect(() => {
    setNoVideoFound(Boolean(isVideoError));
  }, [isVideoError]);

  useEffect(() => {
    const items = channelData?.data?.items?.[0];
    if (!items) {
      setSubscriber("");
      setChannelImgSrc("");
      return;
    }

    const subscribers = Number.parseInt(items?.statistics?.subscriberCount);
    setSubscriber(
      subscribers > 999 ? roundSubsAndLikes(subscribers) : subscribers,
    );
    loadImage(items?.snippet?.thumbnails?.medium?.url)
      .then((resp) => setChannelImgSrc(resp))
      .catch(() => setChannelImgSrc(""));
  }, [channelData]);

  useEffect(() => {
    if ((windowWidth >= 600 && navToggle) || (windowWidth < 600 && !navToggle))
      setNavToggle((prev) => !prev);
  }, [windowWidth]);

  const getVideoPlayerClassname = () => {
    if (windowWidth < 500) return "player-height-small";
    else if (windowWidth < 700) return "player-height-medium";
    else if (windowWidth < 1300) return "player-height-large";
    return "player-height-xlarge";
  };

  const existingVideoSection = () => (
    <div
      className={`d-flex ${windowWidth < 1000 ? "flex-column" : "flex-row"} video-details-container`}
    >
      <div className="left-column">
        <div className={getVideoPlayerClassname()}>
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
              <Link
                to={`/channels?id=${videoDetails?.[0]?.snippet?.channelId}`}
              >
                <img
                  className="cursor-pointer rounded-circle channel-avatar2"
                  src={channelImgSrc}
                  alt="logo"
                />
              </Link>
              <div>
                <Link
                  className="fw-bold cursor-pointer channel-name"
                  to={`/channels?id=${videoDetails?.[0]?.snippet?.channelId}`}
                >
                  {videoDetails?.[0]?.snippet?.channelTitle}
                </Link>
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
                  {Number.parseInt(videoDetails?.[0]?.statistics?.likeCount) >
                  999
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
                className={`description-body ${descriptionOpen ? "" : "description-body--collapsed"}`}
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
                  {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
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
  );

  const renderVideoSection = () =>
    noVideoFound ? (
      <div className="no-video-found">
        <div className="d-flex align-items-center flex-column">
          <img
            src={unavailableVideo}
            alt="unavailable video"
            className="no-video-img"
          />
          {t("vidAvblMore", "This video isn't available anymore")}
          <br />
          <button className="fw-bold go-home-btn" onClick={() => navigate("/")}>
            {t("goToHome", "GO TO HOME")}
          </button>
        </div>
      </div>
    ) : (
      existingVideoSection()
    );

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
      {loading ? <LoadingSpinner /> : renderVideoSection()}
    </>
  );
}

VideoCard.propTypes = {
  det: PropTypes.shape({
    obj: PropTypes.shape({
      id: PropTypes.shape({
        videoId: PropTypes.string,
      }),
      snippet: PropTypes.shape({
        thumbnails: PropTypes.shape({
          medium: PropTypes.shape({
            url: PropTypes.string,
          }),
        }),
        title: PropTypes.string,
        publishedAt: PropTypes.string,
        channelId: PropTypes.string,
        channelTitle: PropTypes.string,
        resourceId: PropTypes.shape({
          videoId: PropTypes.string,
        }),
      }),
    }).isRequired,
    idx: PropTypes.number.isRequired,
  }).isRequired,
};

Comment.propTypes = {
  obj: PropTypes.shape({
    authorProfileImageUrl: PropTypes.string,
    authorChannelId: PropTypes.shape({
      value: PropTypes.string,
    }),
    authorDisplayName: PropTypes.string,
    publishedAt: PropTypes.string,
    textOriginal: PropTypes.string,
    likeCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};
