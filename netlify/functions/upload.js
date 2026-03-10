// netlify/functions/upload.js
import Replicate from "replicate";
import Busboy from "busboy";

export async function handler(event, context) {
  try {
    // Check if body exists
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "No file uploaded" }),
      };
    }

    // Parse uploaded file (base64 from frontend)
    const busboy = new Busboy({ headers: event.headers });
    let fileData;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileData = Buffer.concat(chunks);
      });
    });

    await new Promise((resolve, reject) => {
      busboy.on("finish", resolve);
      busboy.on("error", reject);
      busboy.end(Buffer.from(event.body, "base64"));
    });

    if (!fileData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Failed to parse file" }),
      };
    }

    // Initialize Replicate with your API key
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // Call your AI model (replace with your green-screen model ID)
    const output = await replicate.run(
      "YOUR_GREEN_SCREEN_MODEL_ID",
      { input: fileData }
    );

    // Return JSON result
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, output }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
