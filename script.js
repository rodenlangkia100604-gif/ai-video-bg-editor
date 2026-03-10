async function uploadVideo() {
    // Get selected file and background
    let file = document.getElementById("videoUpload").files[0];
    let background = document.getElementById("background").value;

    if (!file) {
        alert("Please upload a video first!");
        return;
    }

    document.getElementById("status").innerText = "Uploading & AI processing...";

    // Prepare form data
    let formData = new FormData();
    formData.append("video", file);
    formData.append("background", background);

    try {
        // Call the backend function
        let response = await fetch("/.netlify/functions/upload", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        document.getElementById("status").innerText = result.message;

        if (result.result) {
            document.getElementById("preview").src = result.result;
        }
    } catch (err) {
        document.getElementById("status").innerText = "Error: " + err.message;
    }
}
