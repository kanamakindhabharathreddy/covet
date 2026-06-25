export const formatMatrix = {
  audio: {
    mp3: { wav: "ffmpeg", flac: "ffmpeg", aac: "ffmpeg", ogg: "ffmpeg", m4a: "ffmpeg" },
    wav: { mp3: "ffmpeg", flac: "ffmpeg", aac: "ffmpeg", ogg: "ffmpeg", m4a: "ffmpeg" },
    flac: { mp3: "ffmpeg", wav: "ffmpeg", aac: "ffmpeg", ogg: "ffmpeg", m4a: "ffmpeg" },
    aac: { mp3: "ffmpeg", wav: "ffmpeg", flac: "ffmpeg", ogg: "ffmpeg", m4a: "ffmpeg" },
    ogg: { mp3: "ffmpeg", wav: "ffmpeg", flac: "ffmpeg", aac: "ffmpeg", m4a: "ffmpeg" },
    m4a: { mp3: "ffmpeg", wav: "ffmpeg", flac: "ffmpeg", aac: "ffmpeg", ogg: "ffmpeg" },
  },
  video: {
    mp4: { webm: "ffmpeg", avi: "ffmpeg", mov: "ffmpeg", mkv: "ffmpeg" },
    webm: { mp4: "ffmpeg", avi: "ffmpeg", mov: "ffmpeg", mkv: "ffmpeg" },
    avi: { mp4: "ffmpeg", webm: "ffmpeg", mov: "ffmpeg", mkv: "ffmpeg" },
    mov: { mp4: "ffmpeg", webm: "ffmpeg", avi: "ffmpeg", mkv: "ffmpeg" },
    mkv: { mp4: "ffmpeg", webm: "ffmpeg", avi: "ffmpeg", mov: "ffmpeg" },
  },
  image: {
    jpg: { jpeg: "canvas", png: "canvas", webp: "canvas", bmp: "canvas", gif: "canvas", pdf: "jspdf" },
    jpeg: { jpg: "canvas", png: "canvas", webp: "canvas", bmp: "canvas", gif: "canvas", pdf: "jspdf" },
    png: { jpg: "canvas", jpeg: "canvas", webp: "canvas", bmp: "canvas", gif: "canvas", pdf: "jspdf" },
    webp: { jpg: "canvas", jpeg: "canvas", png: "canvas", bmp: "canvas", gif: "canvas", pdf: "jspdf" },
    bmp: { jpg: "canvas", jpeg: "canvas", png: "canvas", webp: "canvas", gif: "canvas", pdf: "jspdf" },
    gif: { jpg: "canvas", jpeg: "canvas", png: "canvas", webp: "canvas", bmp: "canvas", pdf: "jspdf" },
  },
  document: {
    docx: { txt: "mammoth", html: "mammoth", pdf: "huggingface" },
    txt: { docx: "docx" },
    pdf: { docx: "huggingface" },
  },
  data: {
    json: { xml: "data", yaml: "data", csv: "data" },
    xml: { json: "data", yaml: "data", csv: "data" },
    yaml: { json: "data", xml: "data", csv: "data" },
    csv: { json: "data", xml: "data", xlsx: "data" },
  },
  spreadsheet: {
    xlsx: { csv: "sheetjs", json: "sheetjs" },
    csv: { xlsx: "sheetjs" },
  },
  ocr: {
    jpg: { txt: "tesseract", docx: "tesseract" },
    jpeg: { txt: "tesseract", docx: "tesseract" },
    png: { txt: "tesseract", docx: "tesseract" },
    tiff: { txt: "tesseract", docx: "tesseract" },
    pdf: { txt: "tesseract", docx: "tesseract" },
  },
};
