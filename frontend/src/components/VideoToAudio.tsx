"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Download, FileAudio } from "lucide-react";
import axios from "axios";

export default function VideoToAudioConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setAudioUrl("");
      setTranscript("");
      setError("");
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Video to Audio Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, MOV, AVI (MAX. 100MB)
                  </p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {videoFile && (
              <p className="text-sm text-gray-500 text-center">
                Selected file: {videoFile.name}
              </p>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleConvert}
              className="w-full"
              disabled={!videoFile || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileAudio className="mr-2 h-4 w-4" />
                  Convert to Audio
                </>
              )}
            </Button>
            {audioUrl && (
              <div className="space-y-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio tag.
                </audio>
                <Button asChild className="w-full">
                  <a href={audioUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Audio
                  </a>
                </Button>
                <Button
                  onClick={() =>
                    setTranscript(
                      "This is a sample transcript of the converted audio.",
                    )
                  }
                  className="w-full"
                  variant="outline"
                >
                  Get Transcript
                </Button>
                {transcript && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
                    <p className="text-sm text-gray-700">{transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
