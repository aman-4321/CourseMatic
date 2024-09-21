import { useState } from "react";
import axios from "axios";

const VideoToAudioConverter = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setAudioUrl("");
    setTranscript("");
    setError("");
  };

  const handleConvert = async () => {
    if (!videoFile) {
      setError("Please select a video file to convert.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setAudioUrl(response.data.audioUrl);
      setTranscript(response.data.transcript);
    } catch (e) {
      setError("Failed to convert the video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Video to Audio Converter
        </h1>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleConvert}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          disabled={!videoFile || loading}
        >
          {loading ? "Converting..." : "Convert to Audio"}
        </button>

        {audioUrl && (
          <div className="mt-6">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>

            <a
              href={audioUrl}
              download
              className="block mt-2 text-center text-indigo-600 hover:underline"
            >
              Download Audio
            </a>

            <button
              onClick={() => alert(transcript)}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Get Transcript
            </button>

            {transcript && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
                <p className="text-sm text-gray-700">{transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoToAudioConverter;
