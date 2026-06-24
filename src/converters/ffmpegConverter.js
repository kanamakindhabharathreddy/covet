import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton instance to lazy-load and reuse
let ffmpeg = null;

const getMimeType = (ext) => {
  const mimes = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4'
  };
  return mimes[ext.toLowerCase()] || 'application/octet-stream';
};

const getCommandArgs = (inputName, outputName, targetFormat) => {
  const ext = targetFormat.toLowerCase();
  
  // Video formats
  if (['mp4', 'mov', 'mkv'].includes(ext)) {
    return ['-i', inputName, '-c:v', 'libx264', '-c:a', 'aac', outputName];
  } else if (ext === 'webm') {
    return ['-i', inputName, '-c:v', 'libvpx-vp9', '-c:a', 'libopus', outputName];
  } else if (ext === 'avi') {
    return ['-i', inputName, '-c:v', 'mpeg4', '-c:a', 'mp3', outputName];
  }
  
  // Audio formats
  if (['mp3', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
    return ['-i', inputName, outputName];
  } else if (ext === 'wav') {
    // "no codec flags needed, direct container"
    return ['-i', inputName, outputName]; 
  }

  // Fallback for anything else
  return ['-i', inputName, outputName];
};

export const convertWithFFmpeg = async (file, targetFormat, onProgress) => {
  try {
    if (!ffmpeg) {
      if (onProgress) onProgress({ status: 'loading', message: 'Loading engine...' });
      
      ffmpeg = new FFmpeg();
      
      ffmpeg.on('progress', ({ progress, time }) => {
        if (onProgress) onProgress({ status: 'processing', ratio: progress, time });
      });

      // Load core from CDN to prevent local resolution issues in dev/prod
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    const inputExt = file.name.split('.').pop();
    const inputName = `input.${inputExt}`;
    const outputName = `output.${targetFormat}`;

    // Write file to FFmpeg Virtual File System
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Run command
    const args = getCommandArgs(inputName, outputName, targetFormat);
    const execResult = await ffmpeg.exec(args);

    if (execResult !== 0) {
      throw new Error(`FFmpeg exited with code ${execResult}`);
    }

    // Read result
    const outputData = await ffmpeg.readFile(outputName);
    const blob = new Blob([outputData.buffer], { type: getMimeType(targetFormat) });

    // Clean up virtual filesystem
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return blob;
  } catch (error) {
    console.error('FFmpeg Conversion Error:', error);
    throw new Error('Conversion failed: ' + (error.message || 'Unknown error occurred in FFmpeg'));
  }
};
