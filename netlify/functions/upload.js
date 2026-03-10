const Replicate = require("replicate");
const Busboy = require("busboy");
const fs = require("fs");
const path = require("path");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Initialize Replicate with your API key
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    return new Promise((resolve, reject) => {
        const busboy = new Busboy({ headers: event.headers });
        let videoFilePath = "";

        // Save uploaded video to temp folder
        busboy.on("file", (fieldname, file, filename) => {
            videoFilePath = path.join("/tmp", filename);
            const writeStream = fs.createWriteStream(videoFilePath);
            file.pipe(writeStream);
        });

        busboy.on("finish", async () => {
            try {
                // Call the Replicate AI model for video background removal
                const output = await replicate.run(
                    "cjwbw/video-background-removal",
                    { input: { video: fs.createReadStream(videoFilePath) } }
                );

                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ message: "AI finished processing!", result: output })
                });
            } catch (err) {
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ message: "AI processing failed", error: err.message })
                });
            }
        });

        busboy.end(Buffer.from(event.body, "base64"));
    });
};
