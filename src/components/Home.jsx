import { useEffect } from "react";
import Sidebar from "./reusables/Sidebar";
import Card from "./reusables/Card";
import { useAppContext } from "../context/AppContext";
import { homePagePlaceholder } from "../utils/placeholderData";
import { getKey } from "../utils/myFunctions";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "../services";

export default function Home() {
  const { selectedCategory } = useAppContext();
  const { data: objects } = useQuery({
    queryKey: ["search-results", selectedCategory],
    queryFn: () => getSearchResults(selectedCategory),
  });
  const dataToBeDisplayed = objects?.data?.items ?? homePagePlaceholder.items;
  useEffect(() => {
    document.title = "Vi-Stream";
  }, []);
  return (
    <div className="d-flex home-margin">
      <Sidebar />
      <div className="container">
        <div className="row">
          {dataToBeDisplayed?.map((obj) => (
            <Card obj={obj} channelOn={true} key={getKey(obj)} />
          ))}
        </div>
      </div>
    </div>
  );
}
