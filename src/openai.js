import OpenAI from "openai";

const openAiKey = "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"
const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });

const promptString = `
    Please recommend music albums that satisfy the following request. 
    Output them as a list of dicts, with no additional characters like newlines, exactly like this: 
    [{"album": album_1, "artist": artist_1}, {"album": album_2, "artist": artist_2}, ..."
    Do not include any additional text other than this list. 
    The prompt is: modern albums that sound like The Beatles.
`
export const makeGPTRequest = async () => {
    const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: promptString 
            }
        ],
        model: "gpt-3.5-turbo",
    });
    return completion.choices[0];
}
