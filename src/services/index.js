import API_CONSTANTS from "../constants/API_CONSTANTS";
import { FetchAPI } from "../utils/apiCalls";

const {
  getByCategoryURL,
  getSearchResultsURL,
  getPlaylistByIdURL,
  getPlaylistItemsURL,
} = API_CONSTANTS;

export const getByCategory = (selectedCategory) => {
  return FetchAPI(getByCategoryURL(selectedCategory));
};

export const getSearchResults = (searchQuery) => {
  return FetchAPI(getSearchResultsURL(searchQuery));
};

export const getPlaylistById = (playlistId) => {
  return FetchAPI(getPlaylistByIdURL(playlistId));
};

export const getPlaylistItems = (playlistId) => {
  return FetchAPI(getPlaylistItemsURL(playlistId));
};
