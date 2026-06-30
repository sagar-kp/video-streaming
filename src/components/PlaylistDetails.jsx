import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useWindowWidth from "../hooks/useWindowWidth";
import Sidebar from "./reusables/Sidebar";
import { VideoCard } from "./VideoDetails";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { loadImage } from "../utils/myFunctions";
import LoadingSpinner from "./reusables/LoadingSpinner";
import { Loading } from "../assets";
import { useQuery } from "@tanstack/react-query";
import { getPlaylistById, getPlaylistItems } from "../services";
import "./styles/playlistDetails.css";

export default function PlaylistDetails() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const currLangCode = cookies.get("i18next") || "en";
  const list = searchParams.get("list");
  const windowWidth = useWindowWidth();
  const [updated, setUpdated] = useState(null);

  const { data: playlistData, isLoading: loading } = useQuery({
    queryKey: ["playlist", list],
    queryFn: () => getPlaylistById(list),
    enabled: Boolean(list),
  });

  const { data: playlistItemsData } = useQuery({
    queryKey: ["playlist-items", list],
    queryFn: () => getPlaylistItems(list),
    enabled: Boolean(list),
  });

  const playlist = useMemo(
    () => playlistData?.data?.items?.[0] ?? {},
    [playlistData],
  );
  const playlistVideos = useMemo(
    () => playlistItemsData?.data?.items ?? [],
    [playlistItemsData],
  );

  const imageUrl = playlist?.snippet?.thumbnails?.medium?.url;

  const { data: imgSrc } = useQuery({
    queryKey: ["playlist-image", imageUrl],
    queryFn: () => loadImage(imageUrl),
    enabled: Boolean(imageUrl),
    gcTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  useEffect(() => {
    document.title = "Vi-Stream";
    if (playlist?.snippet?.title) {
      document.title = `${playlist.snippet.title} - Vi-Stream`;
    }
  }, [playlist]);

  useEffect(() => {
    if (playlistVideos?.length > 0) {
      let date = "";
      let diff = [];
      playlistVideos?.forEach((obj) => {
        diff?.push(Date.now() - Date.parse(obj?.snippet?.publishedAt));
      });
      date = new Date(
        Date.parse(
          playlistVideos?.[diff?.indexOf(Math.min(...diff))]?.snippet
            ?.publishedAt,
        ),
      )?.toDateString();
      date = date?.slice(4, 10) + "," + date?.slice(11);
      setUpdated(date);
    } else {
      setUpdated(null);
    }
  }, [playlistVideos]);
  return (
    <div className="playlist-container">
      <Sidebar />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={windowWidth > 1080 ? "d-flex" : ""}>
          <div
            className={`left-panel text-white ${windowWidth > 1080 ? "left-panel-wide" : ""}`}
          >
            <img
              className="playlist-img"
              src={imgSrc ?? Loading}
              alt="playlist"
            />
            <div className="playlist-title">{playlist?.snippet?.title}</div>
            <div className="fw-bold playlist-channel">
              {playlist?.snippet?.channelTitle}
            </div>
            {playlistVideos?.length > 0 && (
              <div className="d-flex playlist-stats">
                {playlistVideos?.length} {t("videos", "videos")} &nbsp;{" "}
                {updated && (
                  <span>{`${
                    currLangCode === "hi" ? updated : ""
                  } ${t("lastUpdated", "Last updated on")} ${
                    currLangCode === "hi" ? "" : updated
                  }`}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={`right-panel ${windowWidth > 1080 ? "layout-wide" : ""}`}
          >
            {playlistVideos?.map((obj, idx) => (
              <VideoCard key={obj?.id} det={{ obj, idx }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
