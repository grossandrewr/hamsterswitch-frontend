import OpenAI from "openai";
import axios from 'axios';

const openAiKey = "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"
const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });

const systemPrompt = `
Overview:
You will be providing music recommendations based on the user's prompt. The goal is to satisfy
the user's request while expanding their musical horizons. 
Output a list of dictionaries, with no additional characters like newlines, exactly like this:
[{"album": album_1, "artist": artist_1}, {"album": album_2, "artist": artist_2}, ...]"
Do not reveal Steps or intermediate information to the user.

Step 1: 
Determine if (A) the user is looking for music similar to an artist they mentioned in their prompt
or (B) the user is looking for music written by the specific artist they mentioned in their prompt. 
Depending on your decision, categorize the prompt as "similar" or "specific". 

Step 2: 
Create an initial list of 4 albums that satisfy the user's request - do not repeat any albums.
If your result from Step 1 is "similar", DO NOT include any albums by the artist mentioned in the prompt. 

Step 3: 
Take your initial list from Step 2 and go through it one album at a time. If your result from Step 1 is "similar"
and the artist mentioned in the quotes has an album by that name, discard the album entirely. Replace it with a new album
so that the list still has 4 albums. Return the list of 4 albums. 

Step 4: 
Take the albums that you returned in Step 3 and pass them to the user. 
Output them as a list of dicts, with no additional characters like newlines, exactly like this:
[{"album": album_1, "artist": artist_1}, {"album": album_2, "artist": artist_2}, ..."
Do not include any additional text other than this list. 
`
const promptInstructions = `
  Please recommend music albums that satisfy the following request. 
  Output them as a list of dicts, with no additional characters like newlines, exactly like this: 
  [{"album": album_1, "artist": artist_1}, {"album": album_2, "artist": artist_2}, ..."
  Do not include any additional text other than this list. 
  The prompt is: 
`

// export const makeGPTRequest = async (searchString) => {
//     const promptString = promptInstructions + searchString
//     const completion = await openai.chat.completions.create({
//         messages: [
//             { 
//                 role: "system", 
//                 content: systemPrompt 
//             },
//             { 
//                 role: "user", 
//                 content: searchString 
//             },
//         ],
//         model: "gpt-4-turbo-2024-04-09",
//     });
//     return completion.choices[0];
// }

export const makeGPTRequest = async (searchString) => {
  const backendUrl = process.env.BACKEND_URL
  const result = await axios.post("http://localhost:8000/get-albums", { searchString: searchString })
  return result;
}
