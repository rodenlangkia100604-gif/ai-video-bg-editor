import Replicate from "replicate";
import Busboy from "busboy";

export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: "Method not allowed" }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "No file uploaded" }),
      };
    }

    // Initialize Busboy
    const busboy = new Busboy({ headers: event.headers });
    let fileBuffer;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    await new Promise((resolve, reject) => {
      busboy.on("finish", resolve);
      busboy.end(Buffer.from(event.body, "base64"));
    });

    if (!fileBuffer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Failed to read file" }),
      };
    }

    // Call Replicate API for background removal
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await replicate.run(
      "stability-ai/stable-diffusion-background-removal:latest",
      {
        input: { image: fileBuffer.toString("base64") },
      }
    );

    // Return the AI-generated result
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
