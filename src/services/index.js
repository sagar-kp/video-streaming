import API_CONSTANTS from "../constants/API_CONSTANTS";
import { FetchAPI } from "../utils/apiCalls";

const {
  getSearchResultsURL,
  getPlaylistByIdURL,
  getPlaylistItemsURL,
  getVideoDetailsURL,
  getChannelDetailsURL,
  getChannelVideosURL,
  getChannelPlaylistsURL,
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

export const getChannelVideos = (channelId) => {
  return FetchAPI(getChannelVideosURL(channelId));
};

export const getChannelPlaylists = (channelId, channelTitle) => {
  return FetchAPI(getChannelPlaylistsURL(channelId, channelTitle));
};

export const getComments = (videoId) => {
  return FetchAPI(getCommentsURL(videoId));
};
