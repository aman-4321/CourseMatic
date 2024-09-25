import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const Editor = () => {
  const [videoSrc, setVideoSrc]: any = useState<string | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [videoDur, setDur] = useState<number | null>(null)
  const [playing, setPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1); // Volume range is 0 to 1
  const [playbackRate, setPlaybackRate] = useState<number>(1); // Playback speed
  const playerRef = useRef<ReactPlayer>(null);
  const [count, setCount] = useState(0)
  const [durMap, setDurMap] = useState<number[] | null>(null)
  let totalDur = 0

  useEffect(() => {
    loadDuration(videoSrc)
  }, [videoSrc])

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
  };


  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      if (videoSrc && videoSrc.length > 0) {
        setVideoSrc((prev: any) => [...prev, fileURL]);
        return
      }
      setVideoSrc([fileURL])
    }
  };

  const handlePlayPause = () => {
    setPlaying((prev) => !prev);
  };

  const handleLoop = () => {
    setLoop((prev) => !prev);
  };

  // loads duration of all the video from the videoSrc array
  const loadDuration = async (video: any) => {
    if (video) {
      const dummydur: any = []
      await Promise.all(video.map(async (x: any, index: number) => {
        const a = new Promise(async (resolve, reject) => {
          const video = document.createElement('video');
          video.preload = 'metadata';

          // Create a Blob URL directly from the Blob and set it as the video source
          video.src = x;

          video.onloadedmetadata = () => {
            resolve(video.duration); // Duration in seconds
          };
        })
        a.then((duration: any) => {
          if (dummydur.length == 0 || !dummydur.includes(duration)) {
            dummydur[index] = duration
            setDurMap([...dummydur])
          }
        })
      }))
    }
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Format hours, minutes, and seconds to be two digits
    const formattedHours = hours < 10 ? `0${hours}:` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    const formattedSeconds = secs < 10 ? `0${secs}` : `${secs}`;

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  const getTotalDur = () => {
    for (let index = 0; index < count; index++) {
      if (durMap) {
        // gets the width of each videos
        totalDur += (Math.floor(durMap[index]) * 5) + Math.floor(durMap[index])
      }
    }
    let currentTime = 0

    // get the left margin value for the current video from the video's start
    if (playerRef.current) {
      currentTime = (Math.round(playerRef.current.getCurrentTime()) > 0 ? Math.round(playerRef.current.getCurrentTime()) - 1 : 0) * 6
    }

    // gets the left margin value for all the videos before the current video
    const firstVid = 20 * count
    return 12 + totalDur + firstVid + currentTime
  }

  const handleFullscreen = () => {
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().requestFullscreen();
    }
  };

  const seek = (time: number, vidIndex: number) => {
    setCount(vidIndex)
    playerRef.current?.seekTo(time + 1)
    setPlaying(false);
  }
  
  // split the video into two
  const split = async() => {
    if (!ffmpegRef.current.loaded) {
      await load()
    }
    if (playerRef.current && ffmpegRef.current.loaded && durMap) {
      await ffmpegRef.current.writeFile('splitIn.mp4', await fetchFile(videoSrc[count]))
      await ffmpegRef.current.exec(['-i', `splitIn.mp4`, `-ss`, '00:00:00', '-to', `${formatTime(playerRef.current.getCurrentTime())}`, `-c`, `copy`, `splitOut1.mp4`])
      await ffmpegRef.current.exec(['-i', `splitIn.mp4`, `-ss`, `${formatTime(playerRef.current.getCurrentTime())}`, '-to', `${formatTime(durMap[count]+1)}`, `-c`, `copy`, `splitOut2.mp4`])
      const output1: any = await ffmpegRef.current.readFile('splitOut1.mp4')
      const output2: any = await ffmpegRef.current.readFile('splitOut2.mp4')
      const blobOut1 = new Blob([output1.buffer], {type: 'video/mp4'})
      const blobOut2 = new Blob([output2.buffer], {type: 'video/mp4'})
      const outputUrl1 = URL.createObjectURL(blobOut1)
      const outputUrl2 = URL.createObjectURL(blobOut2)
      const videos = [...videoSrc]
      delete videos[count]
      videos.splice(count, 0, outputUrl1, outputUrl2)
      setVideoSrc(videos)
      loadDuration(videos)
      ffmpegRef.current.deleteFile('splitIn.mp4')
      ffmpegRef.current.deleteFile('splitOut1.mp4')
      ffmpegRef.current.deleteFile('splitOut2.mp4')
    }
  }

  // trim the video
  const trim = async () => {
    if (!ffmpegRef.current.loaded) {
      await load()
    }
    if (playerRef.current && ffmpegRef.current.loaded) {
      await ffmpegRef.current.writeFile('trimIn.mp4', await fetchFile(videoSrc[count]))
      await ffmpegRef.current.exec(['-i', `trimIn.mp4`, `-ss`, '00:00:00', '-to', `${formatTime(playerRef.current.getCurrentTime())}`, `-c`, `copy`, `trimOut.mp4`])
      const output: any = await ffmpegRef.current.readFile('trimOut.mp4')
      const blobOut = new Blob([output.buffer], { type: 'video/mp4' })
      const outputURL = URL.createObjectURL(blobOut)
      const videos = [...videoSrc]
      videos[count] = outputURL
      setVideoSrc(videos)
      loadDuration(videos)
      ffmpegRef.current.deleteFile('trimIn.mp4')
      ffmpegRef.current.deleteFile('trimOut.mp4')
    }
  }

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
            onProgress={(x) => { setDur(x.playedSeconds) }}
            url={videoSrc[count]}
            onEnded={() => {
              if (count > 1) {
                URL.revokeObjectURL(videoSrc[count - 1])
              }
              setCount((x: number) => x + 1)
              if (count == videoSrc.length - 1 && durMap && playerRef.current?.getCurrentTime() == durMap[count]) {
                seek(0, 0)
              }
            }}
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

      <div className="flex px-1 min-h-16 border border-black rounded-md bg-slate-100 my-3 overflow-x-auto relative items-center">
        {/* the red pointer on timeline */}
        {playerRef.current && <div className={`h-11 bg-red-500 w-[2.5px] rounded-md z-10 absolute`} style={{ left: `${getTotalDur()}px` }} />}

        {/* the timeline bars */}
        {durMap && durMap.map((duration: number, vidIndex: number) => {
          return (
            <div className="flex items-center px-2 bg-slate-300 rounded-sm py-1 mr-1">
              {Array.from({ length: duration }).map((_, index) => {
                const barHeight = (index % 5 == 0 ? 10 : 7)
                return (
                  <div className="pr-[5px] cursor-pointer" onClick={() => { seek(index, vidIndex) }}>
                    <button value={index} className='bg-black w-[1px] rounded-md' style={{ height: barHeight * 4 }} />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

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
        <button onClick={trim}>Trim</button>
        <button onClick={split}>Split</button>
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
