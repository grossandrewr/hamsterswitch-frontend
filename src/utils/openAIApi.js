import axios from "axios";

export const makeGPTSearchRequest = async (searchString) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const response = await axios.post(`${backendUrl}/get-albums`, {
    searchString,
  });

  if (response.status !== 200) {
    throw new Error(
      `Request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  return JSON.parse(response.data);
};

export const makeGPTDescriptionRequest = async (searchString) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const response = await axios.post(`${backendUrl}/get-description`, {
    searchString,
  });
  return response.data;
};
