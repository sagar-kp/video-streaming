import SetTimePassed from "../SetTimePassed";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { getNavigatePath, loadImage } from "../../utils/myFunctions";
import { useEffect, useState } from "react";
import { Loading, notFound } from "../../assets";
import "../styles/card.css";

export default function Card({ obj, channelOn }) {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(null);
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const isPathnameChannels = globalThis.location?.pathname === "/channels";
  const handleClick = () => {
    const id = obj?.id?.videoId || obj?.id?.playlistId || obj?.id?.channelId;
    if (id?.length) navigate(getNavigatePath(obj));
  };
  useEffect(() => {
    const url = obj?.snippet?.thumbnails?.medium?.url;
    if (url?.length)
      loadImage(obj?.snippet?.thumbnails?.medium?.url)
        .then((resp) => {
          setImgSrc(resp);
        })
        .catch(() => setImgSrc(notFound));
    else setImgSrc(null);
  }, [obj]);
  return (
    <div
      key={
        obj?.id?.hasOwnProperty("videoId")
          ? obj?.id?.videoId
          : obj?.id?.hasOwnProperty("playlistId")
            ? obj?.id?.playlistId
            : obj?.id?.channelId
      }
      className={`col-md-4 col-xl-${channelOn ? "4" : "3"} col-xxl-2 col-lg-${
        channelOn ? "4" : "3"
      } col-sm-6 col-xs-6 col-xxs-12 p-2`}
    >
      <div className={`${obj?.id?.channelId ? "text-center" : ""}`}>
        <img
          className={`cursor-pointer ${!imgSrc ? "fade-animation" : ""} card-image ${
            obj?.id?.channelId ? "card-img-channel" : ""
          }`}
          src={imgSrc ?? Loading}
          alt="thumbnails"
          onClick={handleClick}
        />
      </div>
      <div
        className={`videos-title fw-bold cursor-pointer ${obj?.id?.channelId ? "text-center" : ""} card-title ${
          isPathnameChannels ? "card-title-channels" : "card-title-default"
        }`}
        onClick={handleClick}
      >
        {obj?.snippet?.title}
      </div>
      {channelOn && (
        <div
          className={`cursor-pointer ${obj?.id?.channelId ? "videos-title" : "over"} ${
            isPathnameChannels
              ? "channel-desc-channels"
              : "channel-desc-default"
          }`}
          onClick={() => navigate(`/channels?id=${obj?.snippet?.channelId}`)}
        >
          {obj?.id?.channelId
            ? obj?.snippet?.description
            : obj?.snippet?.channelTitle}
        </div>
      )}
      {obj?.id?.playlistId && (
        <div
          className="playlist-link"
          onClick={() => navigate(`/playlist?list=${obj?.id?.playlistId}`)}
        >
          {isPathnameChannels
            ? t("viewFullPL", "View full playlist")
            : t("viewFullPL", "VIEW FULL PLAYLIST")?.toUpperCase()}
        </div>
      )}
      {obj?.id?.videoId && (
        <div
          className={`card-time ${
            isPathnameChannels ? "card-time-channels" : "card-time-default"
          }`}
        >
          {currLangCode === "fr" ? t("ago", "il y a ") : ""}{" "}
          <SetTimePassed
            date={new Date(Date.parse(obj?.snippet?.publishedAt))}
          />{" "}
          {` ${currLangCode === "fr" ? "" : t("ago", "ago")} `}
        </div>
      )}
      <div></div>
    </div>
  );
}
