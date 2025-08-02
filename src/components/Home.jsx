import { useState, useEffect } from "react";
// import { useWindowWidth } from "../utils/MyHooks";
import { FetchAPI } from "../utils/apiCalls";
import Sidebar from "./reusables/Sidebar";
// import Videos from "./reusables/Card";
import Card from "./reusables/Card";

export default function Home({
  navToggle,
  selectedCategory,
  setSelectedCategory,
}) {
  // const windowWidth = useWindowWidth()
  const [objs, setObjs] = useState([]);
  //console.log(objs)
  useEffect(() => {
    document.title = "Vi-Stream";
    FetchAPI(
      `search?part=snippet&q=${selectedCategory}&order=date&maxResults=50`
    )
      .then(({ data }) => {
        // console.log(data)
        if (data?.items) {
          let arr1 = [],
            arr2 = [];
          data?.items.forEach((obj) =>
            obj?.id?.hasOwnProperty("videoId")
              ? arr1?.push(obj)
              : arr2?.push(obj)
          );

          setObjs(data?.items);
        } else setObjs([]);
      })
      .catch(() => {});
  }, [selectedCategory]);
  return (
    <div style={{ display: "flex", marginTop: "60px" }}>
      <Sidebar
        navToggle={navToggle}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      <div className="container" style={{}}>
        <div className="row">
          {objs.map((obj) => (
            <Card
              obj={obj}
              channelOn={true}
              key={
                obj?.id?.hasOwnProperty("videoId")
                  ? obj?.id?.videoId
                  : obj?.id?.hasOwnProperty("playlistId")
                  ? obj?.id?.playlistId
                  : obj?.id?.channelId
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
