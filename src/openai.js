import OpenAI from "openai";

const openAiKey = "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"
const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });

const promptInstructions = `
    Please return music albums that satisfy the following prompt. 
    Output them as a list of dicts, with no additional characters like newlines, exactly like this: 
    [{"album": album_1, "artist": artist_1}, {"album": album_2, "artist": artist_2}, ..."
    Do not include any additional text other than this list. 
    If the prompt is factual / binary - do not include albusm unless you are 100% sure they satisfy the prompt.
    There should not be any false positives or factual inquiries. For example, if the request is "albums that received
    a 8.7 on pitchfork" and you don't know the answer, simply return an empty list.
    If the prompt includes "sounds like <band name>"" - do not include any albums by <band name>
    The prompt is: 
`
export const makeGPTRequest = async (searchString) => {
    const promptString = promptInstructions + searchString
    const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: promptString 
            }
        ],
        model: "gpt-4",
    });
    return completion.choices[0];
}
