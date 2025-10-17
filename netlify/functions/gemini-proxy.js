    // Netlify FunctionsはNode.js環境で実行されます
    const fetch = require('node-fetch');

    // 環境変数からAPIキーを取得。NetlifyのUIで設定します。
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

    exports.handler = async (event, context) => {
        // GET以外のリクエストをブロック
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "Method Not Allowed" }),
            };
        }

        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Server configuration error: API Key is missing." }),
            };
        }

        try {
            // ブラウザから送られたペイロードを取得
            const payload = JSON.parse(event.body);

            // Gemini APIにリクエストを転送
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Geminiからのエラー応答をそのまま返す
                return {
                    statusCode: response.status,
                    body: JSON.stringify({ 
                        message: "Gemini API Error", 
                        details: data.error ? data.error.message : data
                    }),
                };
            }

            // 成功した応答をブラウザに返す
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };

        } catch (error) {
            console.error("Function execution error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to process request on the server.", error: error.message }),
            };
        }
    };
    
