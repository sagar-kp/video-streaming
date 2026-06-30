import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "./reusables/Sidebar";
import useWindowWidth from "../hooks/useWindowWidth";
import Card from "./reusables/Card";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import ReactPlayer from "react-player";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import SetTimePassed from "./SetTimePassed";
import LoadingSpinner from "./reusables/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import {
  getChannelDetails,
  getChannelPlaylists,
  getChannelVideos,
  getVideoDetails,
} from "../services";
import "./styles/channelDetails.css";
import PropTypes from "prop-types";

const channelOptions = ["home", "videos", "playlists", "live", "about"];

const UnsubscribedTrailer = ({ unsubscribedTrailer, unsubscribedVideo }) => {
  const windowWidth = useWindowWidth();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();

  return (
    <div className={windowWidth > 850 ? "d-flex" : ""}>
      <div>
        <div
          className={`player-wrapper ${windowWidth < 500 ? "player-small" : "player-large"} ${windowWidth < 610 ? "player-auto" : ""}`}
        >
          <ReactPlayer
            controls
            playing={true}
            className="vidDetail-react_player"
            url={`https://www.youtube.com/watch?v=${unsubscribedTrailer}`}
          />
        </div>
      </div>
      <div
        className={`player-info ${
          windowWidth > 850 ? "player-info-large" : "player-info-small"
        } ${
          windowWidth <= 850 && windowWidth >= 610 ? "player-info-medium" : ""
        }`}
      >
        {Object.keys(unsubscribedVideo)?.length > 0 && (
          <div>
            <Link
              className="videos-title fw-bold cursor-pointer video-title"
              to={`/watch?v=${unsubscribedVideo?.id}`}
            >
              {unsubscribedVideo?.snippet?.title}
            </Link>

            <div className="d-flex text-secondary video-meta">
              {unsubscribedVideo?.statistics?.viewCount && (
                <>
                  <span>
                    {Number.parseInt(
                      unsubscribedVideo?.statistics?.viewCount,
                    )?.toLocaleString()}{" "}
                    {t("views", "views")} &nbsp;
                  </span>
                  <div className="fw-bold dot">.</div>
                  &nbsp;
                </>
              )}
              {`${currLangCode === "fr" ? t("ago", "il y a") : ""}`}{" "}
              <SetTimePassed
                date={
                  new Date(Date.parse(unsubscribedVideo?.snippet?.publishedAt))
                }
              />{" "}
              {currLangCode === "fr" ? "" : t("ago", "ago")}
            </div>
            {unsubscribedVideo?.snippet?.description && windowWidth > 850 && (
              <div className="description">
                {unsubscribedVideo?.snippet?.description}
              </div>
            )}
            {unsubscribedVideo?.snippet?.description && windowWidth > 850 && (
              <Link
                className="read-more"
                to={`/watch?v=${unsubscribedVideo?.id}`}
              >
                {t("readMore", "READ MORE")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChannelDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { t } = useTranslation();
  const currLangCode = cookies.get("i18next") || "en";
  const [selectedOption, setSelectedOption] = useState("");

  const { data: channelData, isLoading: loading } = useQuery({
    queryKey: ["channel-details", id],
    queryFn: () => getChannelDetails(id),
    enabled: Boolean(id),
    retry: false,
  });

  const channel = useMemo(
    () => channelData?.data?.items?.[0] ?? {},
    [channelData],
  );
  const unsubscribedTrailer =
    channel?.brandingSettings?.channel?.unsubscribedTrailer;

  const { data: channelVideosData } = useQuery({
    queryKey: ["channel-videos", id],
    queryFn: () => getChannelVideos(id),
    enabled: Boolean(id),
    retry: false,
  });

  const rawVideos = useMemo(
    () => channelVideosData?.data?.items ?? [],
    [channelVideosData],
  );

  const videos = useMemo(
    () =>
      rawVideos.filter(
        (obj) =>
          obj?.id?.hasOwnProperty("videoId") &&
          obj?.snippet?.liveBroadcastContent === "none",
      ),
    [rawVideos],
  );

  const live = useMemo(
    () =>
      rawVideos.filter(
        (obj) =>
          obj?.id?.hasOwnProperty("videoId") &&
          obj?.snippet?.liveBroadcastContent !== "none",
      ),
    [rawVideos],
  );

  const { data: channelPlaylistsData } = useQuery({
    queryKey: ["channel-playlists", id, channel?.snippet?.title],
    queryFn: () => getChannelPlaylists(id, channel?.snippet?.title),
    enabled: Boolean(id && channel?.snippet?.title),
    retry: false,
  });

  const playlists = useMemo(() => {
    const channelTitle = channel?.snippet?.title;
    if (!channelTitle) return [];
    return (channelPlaylistsData?.data?.items ?? []).filter(
      (obj) => obj?.snippet?.channelTitle === channelTitle,
    );
  }, [channelPlaylistsData, channel?.snippet?.title]);

  const imageUrl = channel?.snippet?.thumbnails?.medium?.url;
  const { data: imgSrc } = useQuery({
    queryKey: ["channel-image", imageUrl],
    queryFn: () => loadImage(imageUrl),
    enabled: Boolean(imageUrl),
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  const { data: trailerData } = useQuery({
    queryKey: ["video-details", unsubscribedTrailer],
    queryFn: () => getVideoDetails(unsubscribedTrailer),
    enabled: Boolean(unsubscribedTrailer),
    retry: false,
  });

  const unsubscribedVideo = useMemo(
    () => trailerData?.data?.items?.[0] ?? {},
    [trailerData],
  );

  const date = useMemo(() => {
    if (!channel?.snippet?.publishedAt) {
      return new Date().toString().split(" ");
    }
    return new Date(Date.parse(channel.snippet.publishedAt))
      .toString()
      .split(" ");
  }, [channel?.snippet?.publishedAt]);

  const noVideos = videos.length === 0;
  const noLive = live.length === 0;
  const noPlaylists = playlists.length === 0;
  const hasChannelData = Object.keys(channel).length > 0;

  useEffect(() => {
    document.title = "Vi-Stream";
  }, []);

  useEffect(() => {
    if (channel?.snippet?.title) {
      document.title = `${channel.snippet.title} - Vi-Stream`;
    }
  }, [channel?.snippet?.title]);

  useEffect(() => {
    if (unsubscribedTrailer) {
      setSelectedOption("home");
    }
  }, [unsubscribedTrailer]);

  if (loading)
    return (
      <div className="d-flex channel-container">
        <Sidebar />
        <LoadingSpinner />
      </div>
    );
  return (
    <div className="d-flex channel-container">
      <Sidebar />
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
                  Number.parseInt(channel?.statistics?.subscriberCount) > 0 && (
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
                    {Number.parseInt(channel?.statistics?.videoCount) > 0
                      ? channel?.statistics?.videoCount
                      : t("no", "No ")}{" "}
                    {t("videos", "videos")}
                    {currLangCode === "hi" &&
                    Number.parseInt(channel?.statistics?.videoCount) === 0
                      ? " नहीं"
                      : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="channel-options-bar">
          {channelOptions.map((str) => (
            <button
              key={str}
              onClick={() => setSelectedOption(str)}
              className={`channelDet-options channel-option ${
                selectedOption === str ? "selected" : ""
              }`}
            >
              {t(str, str?.toUpperCase())?.toUpperCase()}
            </button>
          ))}
        </div>
        {selectedOption?.length > 0 && hasChannelData && (
          <div className="channel-content">
            {selectedOption === "home" && (
              <div>
                {unsubscribedTrailer && (
                  <UnsubscribedTrailer
                    {...{ unsubscribedTrailer, unsubscribedVideo }}
                  />
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
                    currLangCode === "hi" ? "" : t("joined", "Joined")
                  } ${date[1]} ${date[2]}, ${date[3]} ${
                    currLangCode === "hi" ? t("joined", "Joined") : ""
                  }`}</span>
                  <br />
                  <hr />
                  {Number.parseInt(channel?.statistics?.viewCount) > 0 && (
                    <span className="stats-text">
                      {Number.parseInt(
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
    </div>
  );
}

UnsubscribedTrailer.propTypes = {
  unsubscribedTrailer: PropTypes.string,
  unsubscribedVideo: PropTypes.shape({
    id: PropTypes.string,
    snippet: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      publishedAt: PropTypes.string,
    }),
    statistics: PropTypes.shape({
      viewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};
