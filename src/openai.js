import axios from 'axios';

export const makeGPTSearchRequest = async (searchString) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const result = await axios.post(`${backendUrl}/get-albums`, { searchString })
  return result;
}

export const makeGPTDescriptionRequest = async (searchString) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const result = await axios.post(`${backendUrl}/get-description`, { searchString })
  return result;
}
