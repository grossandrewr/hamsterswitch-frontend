import axios from 'axios';


export const makeGPTRequest = async (searchString) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const result = await axios.post(`${backendUrl}/get-albums`, { searchString: searchString })
  return result;
}
