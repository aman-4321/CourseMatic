import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

const Editor = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1); // Volume range is 0 to 1
  const [playbackRate, setPlaybackRate] = useState<number>(1); // Playback speed
  const playerRef = useRef<ReactPlayer>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setVideoSrc(fileURL);
    }
  };

  const handlePlayPause = () => {
    setPlaying((prev) => !prev);
  };

  const handleLoop = () => {
    setLoop((prev) => !prev);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().requestFullscreen();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOOLBAR  */}
      <div className="h-8 bg-zinc-300">
        <input type="file" accept="video/*" onChange={handleFileUpload} />
      </div>

      {/* VIDEO PLAYER */}
      <div className="flex-1 bg-zinc-900">
        {videoSrc && (
          <ReactPlayer
            ref={playerRef}
            url={videoSrc}
            playing={playing}
            loop={loop}
            volume={volume}
            playbackRate={playbackRate}
            controls={false}
            width="100%"
            height="auto"
          />
        )}
      </div>

      {/* TIMELINE */}

      <div>f</div>

      {/* CONTROLS */}
      <div className="h-8 bg-zinc-300 space-x-4">
        <button onClick={handlePlayPause}>{playing ? "Pause" : "Play"}</button>
        <button onClick={handleLoop}>{loop ? "Unloop" : "Loop"}</button>
        <button onClick={() => handlePlaybackRateChange(2)}>
          Fast Forward
        </button>
        <button onClick={() => handlePlaybackRateChange(1)}>
          Normal Speed
        </button>
        <button onClick={handleFullscreen}>Fullscreen</button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default Editor;
