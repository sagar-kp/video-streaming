import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FetchAPI } from "../utils/apiCalls";
import { useWindowWidth, SetTimePassed } from "../utils/MyHooks";
import ReactPlayer from "react-player";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import { unavailableVideo } from "../assets";
import Sidebar from "./reusables/Sidebar";
import cookies from "js-cookie";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";

const iStyle = { fontSize: "larger", paddingRight: "5px" };

export const VideoCard = ({ det: { obj, idx } }) => {
  const windowWidth = useWindowWidth();
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = window?.location?.pathname === "/playlist";
  const [imgSrc, setImgSrc] = useState("");
  useEffect(() => {
    loadImage(obj?.snippet?.thumbnails?.medium?.url)
      .then((resp) => setImgSrc(resp))
      .catch(() => {});
  }, [obj]);
  return (
    <div
      key={obj?.id?.videoId}
      style={{
        display: "flex",
        padding: !pathname && "1%",
        margin: pathname && "14px 0px",
      }}
    >
      {pathname && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: windowWidth < 600 && "0.1%",
            textAlign: "center",
            margin: "0% 1%",
          }}
        >
          {idx + 1}
        </div>
      )}
      <img
        src={imgSrc}
        alt="thumbnails"
        style={{
          width: pathname
            ? "165px"
            : windowWidth < 1000 && windowWidth > 500
            ? "30%"
            : "40%",
          borderRadius: "7px",
        }}
        onClick={() =>
          navigate(
            pathname
              ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
              : `/watch?v=${obj?.id?.videoId}`
          )
        }
      />
      <div style={{ display: "flex", flex: "60%", paddingLeft: "5px" }}>
        <div>
          <div
            className="videos-title"
            style={{ cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
            onClick={() =>
              navigate(
                pathname
                  ? `/watch?v=${obj?.snippet?.resourceId?.videoId}`
                  : `/watch?v=${obj?.id?.videoId}`
              )
            }
          >
            {obj?.snippet?.title}
          </div>
          <div style={{ display: pathname && "flex", color: "gray" }}>
            <div
              style={{
                cursor: "pointer",
                fontSize: "12.8px",
                paddingTop: "3px",
              }}
              onClick={() =>
                navigate(`/channels?id=${obj?.snippet?.channelId}`)
              }
            >
              {obj?.snippet?.channelTitle}
            </div>
            {pathname && (
              <span style={{ marginTop: "-5px", fontWeight: "bold" }}>
                &nbsp;.&nbsp;
              </span>
            )}
            <div style={{ fontSize: "small", marginTop: pathname && "3px" }}>
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
    <div style={{ display: "flex", marginBottom: "12px" }}>
      <img
        src={obj?.authorProfileImageUrl}
        style={{
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          marginRight: "10px",
          cursor: "pointer",
        }}
        onClick={() => navigate(`/channels?id=${obj?.authorChannelId?.value}`)}
      />
      <div style={{ fontSize: "small" }}>
        <div>
          <span
            style={{ fontWeight: "bold", cursor: "pointer" }}
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
            {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
          </span>
        </div>
        <div
          style={{
            marginTop: "5px",
            lineHeight: "19.5px",
            height: len && !open && "80px",
            overflow: "hidden",
          }}
        >
          {obj?.textOriginal}
        </div>
        <button
          style={{
            display: (!len || !open) && "none",
            border: "none",
            backgroundColor: "transparent",
            fontWeight: "bold",
          }}
          onClick={() => setOpen(false)}
        >
          {t("showLess", "Show less")}
        </button>
        <button
          style={{
            display: (!len || open) && "none",
            border: "none",
            backgroundColor: "transparent",
            fontWeight: "bold",
          }}
          onClick={() => setOpen(true)}
        >
          ... {t("more", "more")}
        </button>
        <div style={{ marginTop: "7px" }}>
          <i style={iStyle} className="bi bi-hand-thumbs-up"></i>
          {parseInt(obj?.likeCount) > 0 && <span>{obj?.likeCount}</span>}&nbsp;
          <i style={iStyle} className="bi bi-hand-thumbs-down"></i>
        </div>
      </div>
    </div>
  );
};

export default function VideoDetails({
  navToggle,
  setNavToggle,
  setSelectedCategory,
  selectedCategory,
}) {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("v");
  const currLangCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const [vidDetails, setVidDetails] = useState([]);
  const [suggestedVids, setSuggestedVids] = useState([]);
  const [noVidFound, setNoVidFound] = useState(false);
  const [cmnts, setCmnts] = useState([]);
  const [channel, setChannel] = useState({});
  const [subscriber, setSubscriber] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [descLen, setDescLen] = useState(false);
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const [chnlImgSrc, setChnlImgSrc] = useState("");

  useEffect(() => {
    document.title = "YouTube";
    if (id) {
      FetchAPI("videos?part=contentDetails,snippet,statistics&id=" + id)
        .then(({ data }) => {
          if (data?.items) {
            setVidDetails(data?.items);
            document.title = `${data?.items?.[0]?.snippet?.title} - YouTube`;
            setDescLen(data?.items?.[0]?.snippet?.description?.length <= 323);
            FetchAPI(
              `channels?part=snippet,statistics&id=${data?.items[0]?.snippet?.channelId}`
            )
              .then((respns) => {
                //console.log(respns)
                const items = respns?.data?.items?.[0];
                setChannel(items);
                const subs = parseInt(items?.statistics?.subscriberCount);
                setSubscriber(subs > 999 ? roundSubsAndLikes(subs) : subs);
                loadImage(items?.snippet?.thumbnails?.medium?.url)
                  .then((resp) => setChnlImgSrc(resp))
                  .catch(() => {});
              })
              .catch(() => {});
            FetchAPI(
              `search?part=id,snippet&type=video&relatedToVideo=${data?.items?.[0]?.snippet?.title}&maxResults=100`
            )
              .then((respns) => {
                setSuggestedVids(
                  respns?.data?.items ? respns?.data?.items : []
                );
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          setNoVidFound(true);
        });
      const getComments = () => {
        FetchAPI(`commentThreads?part=snippet&videoId=${id}&maxResults=100`)
          .then(({ data }) => {
            setCmnts(data?.items ? data?.items : []);
          })
          .catch(() => {});
      };
      setTimeout(getComments, 2000);
    } else {
      navigate("/");
    }
  }, [id, navigate]);
  useEffect(() => {
    if (windowWidth >= 600 && navToggle) setNavToggle((prev) => !prev);
    else if (windowWidth < 600 && !navToggle) setNavToggle((prev) => !prev);
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
            <Navbar navToggle={navToggle} setNavToggle={setNavToggle} />
            <Sidebar
              navToggle={navToggle}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </div>
      )}
      {noVidFound ? (
        <div
          style={{
            display: "flex",
            height: "85vh",
            justifyContent: "center",
            fontSize: "x-large",
            alignItems: "center",
            marginTop: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={unavailableVideo}
              alt="unavailable video"
              style={{ width: "295px", marginBottom: "20px" }}
            />
            {t("vidAvblMore", "This video isn't available anymore")}
            <br />
            <button
              onClick={() => navigate("/")}
              style={{
                border: "0.5px solid lightgray",
                borderRadius: "19px",
                fontSize: "small",
                backgroundColor: "transparent",
                color: "#1e85dd",
                fontWeight: "bold",
                padding: "7px 15px",
                marginTop: "37px",
              }}
            >
              {t("goToHome", "GO TO HOME")}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: windowWidth < 1000 ? "column" : "row",
            marginTop: "60px",
          }}
        >
          <div style={{ flex: "68%", padding: "2%" }}>
            <div
              style={{
                height:
                  windowWidth < 500
                    ? "200px"
                    : windowWidth < 700
                    ? "300px"
                    : windowWidth < 1300
                    ? "420px"
                    : "470px",
              }}
            >
              <ReactPlayer
                controls
                className="vidDetail-react_player"
                url={`https://www.youtube.com/watch?v=${id}`}
              />
            </div>
            {vidDetails?.length > 0 && (
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    paddingTop: "10px",
                    fontSize: "large",
                  }}
                >
                  {vidDetails?.[0]?.snippet?.title}
                </div>
                <div style={{ display: "flex", padding: "2px 0px 10px" }}>
                  <img
                    src={chnlImgSrc}
                    alt="logo"
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(
                        `/channels?id=${vidDetails?.[0]?.snippet?.channelId}`
                      )
                    }
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "-5px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(
                          `/channels?id=${vidDetails?.[0]?.snippet?.channelId}`
                        )
                      }
                    >
                      {vidDetails?.[0]?.snippet?.channelTitle}
                    </div>
                    {subscriber && (
                      <span style={{ fontSize: "small" }}>
                        {subscriber}
                        {` ${t("subs", "subscribers")} `}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginBottom: "2px",
                      marginLeft: windowWidth < 900 ? "2%" : "40%",
                      display: "flex",
                      padding: "5px 17px",
                      fontWeight: "bold",
                      borderRadius: "60px",
                      backgroundColor: "rgb(242, 242, 242)",
                    }}
                  >
                    <i style={iStyle} className="bi bi-hand-thumbs-up"></i>
                    <span style={{ marginTop: "1.5px" }}>
                      {parseInt(vidDetails?.[0]?.statistics?.likeCount) > 999
                        ? roundSubsAndLikes(
                            parseInt(vidDetails?.[0]?.statistics?.likeCount),
                            true
                          )
                        : vidDetails?.[0]?.statistics?.likeCount}
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        marginTop: "-9px",
                        padding: "5%",
                        fontWeight: "normal",
                      }}
                    >
                      |
                    </span>
                    <i style={iStyle} className="bi bi-hand-thumbs-down"></i>
                  </div>
                </div>
                <div
                  style={{
                    padding: "1%",
                    backgroundColor: "rgb(242, 242, 242)",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "19px",
                      height: !descOpen && "79px",
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {parseInt(
                        vidDetails?.[0]?.statistics?.viewCount
                      )?.toLocaleString()}{" "}
                      {t("views", "views")}
                      {` ${
                        currLangCode === "fr" ? t("ago", "il y a ") : ""
                      }`}{" "}
                      <SetTimePassed
                        date={
                          new Date(
                            Date.parse(vidDetails?.[0]?.snippet?.publishedAt)
                          )
                        }
                      />{" "}
                      {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
                    </span>{" "}
                    <br />
                    {vidDetails?.[0]?.snippet?.description}
                    <br />
                    <br />
                    <button
                      style={{
                        display: (descLen || !descOpen) && "none",
                        border: "none",
                        backgroundColor: "transparent",
                        fontWeight: "bold",
                      }}
                      onClick={() => setDescOpen(false)}
                    >
                      {t("showLess", "Show less")}
                    </button>
                  </div>
                  <button
                    style={{
                      display: (descLen || descOpen) && "none",
                      border: "none",
                      backgroundColor: "transparent",
                      fontWeight: "bold",
                    }}
                    onClick={() => setDescOpen(true)}
                  >
                    ... {t("more", "more")}
                  </button>
                </div>
              </div>
            )}
            {cmnts?.length > 0 && (
              <div style={{ marginTop: "30px" }}>
                {cmnts?.map((obj) => (
                  <Comment
                    key={obj?.id}
                    obj={obj?.snippet?.topLevelComment?.snippet}
                  />
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: "31%", padding: "2%" }}>
            {suggestedVids?.length > 0 &&
              suggestedVids?.map((obj, idx) => (
                <VideoCard det={{ obj, idx }} key={obj?.id?.videoId} />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
