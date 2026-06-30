import API_CONSTANTS from "../constants/API_CONSTANTS";
import { FetchAPI } from "../utils/apiCalls";

const {
  getSearchResultsURL,
  getPlaylistByIdURL,
  getPlaylistItemsURL,
  getVideoDetailsURL,
  getChannelDetailsURL,
  getCommentsURL,
} = API_CONSTANTS;

export const getSearchResults = (searchQuery) => {
  return FetchAPI(getSearchResultsURL(searchQuery));
};

export const getPlaylistById = (playlistId) => {
  return FetchAPI(getPlaylistByIdURL(playlistId));
};

export const getPlaylistItems = (playlistId) => {
  return FetchAPI(getPlaylistItemsURL(playlistId));
};

export const getVideoDetails = (videoId) => {
  return FetchAPI(getVideoDetailsURL(videoId));
};

export const getChannelDetails = (channelId) => {
  return FetchAPI(getChannelDetailsURL(channelId));
};

export const getComments = (videoId) => {
  return FetchAPI(getCommentsURL(videoId));
};
