import * as XLSX from 'xlsx';

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read spreadsheet file.'));
    reader.readAsArrayBuffer(file);
  });
};

const cleanDataAST = (data) => {
  if (!Array.isArray(data)) return data;
  const filtered = data.filter(row => {
    if (typeof row !== 'object' || row === null) return true;
    return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
  });
  return filtered.map(row => {
    if (typeof row !== 'object' || row === null) return row;
    const newRow = { ...row };
    for (const key in newRow) {
      const val = newRow[key];
      if (typeof val === 'string' && val.trim() !== '') {
        const trimmed = val.trim();
        const num = Number(trimmed);
        if (!isNaN(num) && String(num) === trimmed) {
          newRow[key] = num;
        }
      }
    }
    return newRow;
  });
};

export const convertSpreadsheet = async (file, targetFormat, onProgress) => {
  try {
    const format = targetFormat.toLowerCase();

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.1, message: 'Reading file...' });
    }

    // Read the file as raw bytes so SheetJS can parse it regardless of format
    const arrayBuffer = await readFileAsArrayBuffer(file);

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.3, message: 'Parsing spreadsheet...' });
    }

    // SheetJS automatically parses the buffer into a Workbook (supports XLSX, CSV, etc.)
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.6, message: 'Encoding format...' });
    }

    let outputBlob = null;

    if (format === 'csv') {
      const csvString = XLSX.utils.sheet_to_csv(sheet);
      outputBlob = new Blob([csvString], { type: 'text/csv' });
    } else if (format === 'json') {
      let jsonData = XLSX.utils.sheet_to_json(sheet, { blankrows: false });
      jsonData = cleanDataAST(jsonData);
      outputBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    } else if (format === 'xlsx') {
      // If the target is XLSX (e.g. converting FROM a CSV), write the existing workbook out to XLSX buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      outputBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else {
      throw new Error('Unsupported spreadsheet target format: ' + format);
    }

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
    }

    return outputBlob;
  } catch (error) {
    throw new Error('Spreadsheet conversion failed: ' + error.message);
  }
};
