import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ffmpeg from "fluent-ffmpeg";
import cors from "cors";
import dotenv from "dotenv";
import { AssemblyAI } from "assemblyai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads",
      resource_type: "video",
    };
  },
});

const upload = multer({ storage: storage });

const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY ?? "",
});

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const videoUrl = req.file.path;

    const outputFileName = `${Date.now()}.mp3`;
    const outputPath = `/tmp/${outputFileName}`;

    await new Promise((resolve, reject) => {
      ffmpeg(videoUrl)
        .toFormat("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    const audioUploadResult = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      public_id: `audio/${outputFileName}`,
    });

    console.log("Audio uploaded to Cloudinary:", audioUploadResult.secure_url);

    const config = {
      audio_url: audioUploadResult.secure_url,
    };

    const transcript = await assemblyClient.transcripts.transcribe(config);

    console.log("Transcript:", transcript.text);

    res.json({
      message: "Video converted to audio and transcribed successfully",
      audioUrl: audioUploadResult.secure_url,
      transcript: transcript.text,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during processing" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
