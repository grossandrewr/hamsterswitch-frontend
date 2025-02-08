import { makeGPTSearchRequest } from "./openAIApi.js";
import { searchForAlbum } from "./spotifyApi.js";

export const cycleProgressText = (setProgressText) => {
  const stringTimingMap = [
    ["Analyzing your query... ", 0],
    ["Running the algorithm... ", 1000],
    ["Processing albums...", 3750],
    ["Almost ready... ", 6500],
  ];
  stringTimingMap.forEach(([text, time]) => {
    setTimeout(() => setProgressText(text), time);
  });
};

export const processAlbumsSearch = async (searchString, token) => {
  const albumsToFind = await makeGPTSearchRequest(searchString);
  const results = await Promise.all(
    albumsToFind
      .slice(0, 4)
      .map(({ album, artist }) => searchForAlbum(token, album, artist)),
  );
  return results;
};
