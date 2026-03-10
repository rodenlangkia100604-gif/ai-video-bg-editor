import Replicate from "replicate";

export async function handler(event, context) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "No file uploaded" }),
      };
    }

    // For testing: simple JSON response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Function works! Replace this with your AI logic." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
