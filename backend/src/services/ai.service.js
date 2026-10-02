const OpenAI = require("openai");
const config = require("../config");

// The AI client is optional. When no key is configured the routes return 503
// rather than crashing the server, so the rest of the app still works.
const client = config.ai.apiKey
    ? new OpenAI({ apiKey: config.ai.apiKey, baseURL: config.ai.baseURL })
    : null;

const isConfigured = () => client !== null;

const NOT_CONFIGURED_MESSAGE =
    "AI features are not configured. Add GROQ_API_KEY to backend/.env";

// Surface actionable upstream failures (bad key, no credit, rate limit)
// instead of a generic message that hides the real cause.
function describeAiError(err, fallback) {
    const upstream = err?.error?.message || err?.error?.error?.message;
    if (err?.status === 401) return "Invalid GROQ_API_KEY.";
    if (err?.status === 429) return "Groq rate limit exceeded.";
    if (upstream) return upstream;
    return fallback;
}

const SUGGESTIONS_SYSTEM_PROMPT =
    "You are a travel advisor inside a personal travel journal app. Based on the user's past trips, " +
    "suggest new destinations they would love. Suggest places they have NOT already visited. " +
    "Ground each suggestion in their history (e.g. they seem to enjoy beaches, mountains, cities).";

const POLISH_SYSTEM_PROMPT =
    "You polish travel journal entries. Improve grammar, flow, and vividness while keeping the " +
    "writer's voice, facts, and first-person perspective. Keep roughly the same length. " +
    "Return ONLY the polished story text, no preamble or commentary.";

const suggestionsSchema = {
    name: "travel_suggestions",
    strict: true,
    schema: {
        type: "object",
        properties: {
            suggestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        destination: { type: "string" },
                        country: { type: "string" },
                        reason: {
                            type: "string",
                            description: "Why this fits the user, referencing their past trips",
                        },
                        bestTime: { type: "string", description: "Best season/months to visit" },
                    },
                    required: ["destination", "country", "reason", "bestTime"],
                    additionalProperties: false,
                },
            },
        },
        required: ["suggestions"],
        additionalProperties: false,
    },
};

// Returns an array of destination suggestions derived from the user's trips
async function generateTravelSuggestions(history) {
    const response = await client.chat.completions.create({
        model: config.ai.model,
        max_tokens: 2048,
        messages: [
            { role: "system", content: SUGGESTIONS_SYSTEM_PROMPT },
            {
                role: "user",
                content: `Here are my past trips as JSON:\n${JSON.stringify(history)}\n\nSuggest 4 new destinations for me.`,
            },
        ],
        response_format: { type: "json_object", json_schema: suggestionsSchema },
    });

    const message = response.choices[0]?.message;
    if (message?.refusal) return null;

    const parsed = JSON.parse(message?.content || "{}");
    return parsed.suggestions || [];
}

// Returns an improved version of a story draft
async function polishStory({ title, story }) {
    const response = await client.chat.completions.create({
        model: config.ai.model,
        max_tokens: 4096,
        messages: [
            { role: "system", content: POLISH_SYSTEM_PROMPT },
            { role: "user", content: `Title: ${title || "(untitled)"}\n\nStory:\n${story}` },
        ],
    });

    const message = response.choices[0]?.message;
    if (message?.refusal) return null;

    return message?.content || "";
}

module.exports = {
    isConfigured,
    NOT_CONFIGURED_MESSAGE,
    describeAiError,
    generateTravelSuggestions,
    polishStory,
};
