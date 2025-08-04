import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FetchAPI } from "../utils/apiCalls";
import { useWindowWidth, SetTimePassed } from "../utils/MyHooks";
import ReactPlayer from "react-player";
import { loadImage, roundSubsAndLikes } from "../utils/myFunctions";
import { Loading, notFound, unavailableVideo } from "../assets";
import Sidebar from "./reusables/Sidebar";
import cookies from "js-cookie";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import LoadingSpinner from "./reusables/LoadingSpinner";

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
      .catch(() => setImgSrc(notFound));
  }, [obj]);
  return (
    <div
      className="d-flex"
      key={obj?.id?.videoId}
      style={{
        padding: !pathname && "1%",
        margin: pathname && "14px 0px",
      }}
    >
      {pathname && (
        <div
          className="d-flex align-items-center text-center"
          style={{
            flex: windowWidth < 600 && "0.1%",
            margin: "0% 1%",
          }}
        >
          {idx + 1}
        </div>
      )}
      <img
        src={imgSrc ?? Loading}
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
      <div className="d-flex" style={{ flex: "60%", paddingLeft: "5px" }}>
        <div>
          <div
            className="videos-title fw-bold cursor-pointer"
            style={{ fontSize: "14px" }}
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
          <div className={`text-secondary ${pathname ? "d-flex" : ""}`}>
            <div
              className="cursor-pointer"
              style={{
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
              <span className="fw-bold" style={{ marginTop: "-5px" }}>
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
    <div className="d-flex" style={{ marginBottom: "12px" }}>
      <img
        className="cursor-pointer rounded-circle"
        src={obj?.authorProfileImageUrl}
        style={{
          width: "40px",
          height: "40px",
          marginRight: "10px",
        }}
        onClick={() => navigate(`/channels?id=${obj?.authorChannelId?.value}`)}
      />
      <div style={{ fontSize: "small" }}>
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
            {` ${currLangCode !== "fr" ? t("ago", "ago") : ""} `}
          </span>
        </div>
        <div
          className="overflow-hidden"
          style={{
            marginTop: "5px",
            lineHeight: "19.5px",
            height: len && !open && "80px",
          }}
        >
          {obj?.textOriginal}
        </div>
        <button
          className={`bg-transparent fw-bold border-0 ${
            !len || !open ? "d-none" : ""
          }`}
          onClick={() => setOpen(false)}
        >
          {t("showLess", "Show less")}
        </button>
        <button
          className={`bg-transparent fw-bold border-0 ${
            !len || open ? "d-none" : ""
          }`}
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

export default function VideoDetails() {
  const { navToggle, setNavToggle } = useAppContext();
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Vi-Stream";
    if (id) {
      setLoading(true);
      FetchAPI("videos?part=contentDetails,snippet,statistics&id=" + id)
        .then(({ data }) => {
          if (data?.items) {
            setVidDetails(data?.items);
            document.title = `${data?.items?.[0]?.snippet?.title} - Vi-Stream`;
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

            // API deprecated
            // FetchAPI(
            //   `search?part=id,snippet&type=video&relatedToVideo=${data?.items?.[0]?.snippet?.title}&maxResults=100`
            // )
            //   .then((respns) => {
            //     setSuggestedVids(
            //       respns?.data?.items ? respns?.data?.items : []
            //     );
            //   })
            //   .catch(() => {});
          }
          setLoading(false);
        })
        .catch(() => {
          setNoVidFound(true);
          setLoading(false);
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
            <Navbar />
            <Sidebar marginTopFromProps="60px" />
          </div>
        </div>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : noVidFound ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: "85vh",
            fontSize: "x-large",
            marginTop: "60px",
          }}
        >
          <div className="d-flex align-items-center flex-column">
            <img
              src={unavailableVideo}
              alt="unavailable video"
              style={{ width: "295px", marginBottom: "20px" }}
            />
            {t("vidAvblMore", "This video isn't available anymore")}
            <br />
            <button
              className="fw-bold bg-transparent"
              onClick={() => navigate("/")}
              style={{
                border: "0.5px solid lightgray",
                borderRadius: "19px",
                fontSize: "small",
                color: "#1e85dd",
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
          className={`d-flex ${
            windowWidth < 1000 ? "flex-column" : "flex-row"
          }`}
          style={{
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
                  className="fw-bold"
                  style={{
                    paddingTop: "10px",
                    fontSize: "large",
                  }}
                >
                  {vidDetails?.[0]?.snippet?.title}
                </div>
                <div className="d-flex" style={{ padding: "2px 0px 10px" }}>
                  <img
                    className="cursor-pointer rounded-circle"
                    src={chnlImgSrc}
                    alt="logo"
                    style={{
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                    }}
                    onClick={() =>
                      navigate(
                        `/channels?id=${vidDetails?.[0]?.snippet?.channelId}`
                      )
                    }
                  />
                  <div>
                    <div
                      className="fw-bold cursor-pointer"
                      style={{
                        marginBottom: "-5px",
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
                    className="d-flex fw-bold"
                    style={{
                      marginBottom: "2px",
                      marginLeft: windowWidth < 900 ? "2%" : "40%",
                      padding: "5px 17px",
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
                      className="fw-normal"
                      style={{
                        fontSize: "20px",
                        marginTop: "-9px",
                        padding: "5%",
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
                    className="overflow-hidden"
                    style={{
                      fontSize: "14px",
                      lineHeight: "19px",
                      height: !descOpen && "79px",
                    }}
                  >
                    <span className="fw-bold">
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
                      className={`bg-transparent fw-bold border-0 ${
                        descLen || !descOpen ? "d-none" : ""
                      } `}
                      onClick={() => setDescOpen(false)}
                    >
                      {t("showLess", "Show less")}
                    </button>
                  </div>
                  <button
                    className={`bg-transparent fw-bold border-0 ${
                      descLen || descOpen ? "d-none" : ""
                    }`}
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
