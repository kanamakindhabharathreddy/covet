import * as Papa from 'papaparse';
import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as XLSX from 'xlsx';

const readFile = (file, asArrayBuffer = false) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    if (asArrayBuffer) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
};

const cleanDataAST = (data) => {
  if (!Array.isArray(data)) return data;

  // 1. Remove trailing empty objects (ghost artifacts)
  const filtered = data.filter(row => {
    if (typeof row !== 'object' || row === null) return true;
    return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
  });

  // 2. Safely convert numeric strings to native numbers (without stripping leading zeros)
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

export const convertData = async (file, targetFormat, onProgress) => {
  try {
    const inputExt = file.name.split('.').pop().toLowerCase();
    const format = targetFormat.toLowerCase();

    // Fire initial progress event (10%)
    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.1, message: 'Reading file...' });
    }

    const isXlsxInput = inputExt === 'xlsx';
    const fileData = await readFile(file, isXlsxInput);

    // Update progress after read (30%)
    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.3, message: 'Parsing data...' });
    }

    let parsedData = null;

    try {
      if (inputExt === 'json') {
        parsedData = JSON.parse(fileData);
      } else if (inputExt === 'xml') {
        parsedData = new XMLParser({ ignoreAttributes: false }).parse(fileData);
      } else if (inputExt === 'yaml' || inputExt === 'yml') {
        parsedData = yaml.load(fileData);
      } else if (inputExt === 'csv') {
        parsedData = Papa.parse(fileData, { header: true, skipEmptyLines: true }).data;
      } else if (isXlsxInput) {
        const workbook = XLSX.read(fileData, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet, { blankrows: false });
      } else {
        throw new Error('Unsupported input format: ' + inputExt);
      }

      // Apply cleanup for Ghost Artifacts and Numeric Typing
      parsedData = cleanDataAST(parsedData);
    } catch (err) {
      throw new Error(`Failed to parse ${inputExt.toUpperCase()} file: ${err.message}`);
    }

    // Update progress after parse (60%)
    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.6, message: 'Serializing format...' });
    }

    let outputBlob = null;

    try {
      if (format === 'json') {
        const outputString = JSON.stringify(parsedData, null, 2);
        outputBlob = new Blob([outputString], { type: 'application/json' });
      } else if (format === 'xml') {
        const builder = new XMLBuilder({ ignoreAttributes: false });
        
        // XML strictly requires exactly one root node.
        let dataToSerialize = parsedData;
        if (Array.isArray(parsedData)) {
          dataToSerialize = { root: { item: parsedData } };
        } else if (typeof parsedData === 'object' && parsedData !== null) {
          // If the object has multiple top-level keys, it will generate multiple root nodes
          if (Object.keys(parsedData).length !== 1) {
            dataToSerialize = { root: parsedData };
          }
        } else {
          dataToSerialize = { root: parsedData };
        }

        const outputString = builder.build(dataToSerialize);
        outputBlob = new Blob([outputString], { type: 'application/xml' });
      } else if (format === 'yaml' || format === 'yml') {
        const outputString = yaml.dump(parsedData);
        outputBlob = new Blob([outputString], { type: 'application/x-yaml' });
      } else if (format === 'csv') {
        // PapaParse expects arrays
        const dataToSerialize = Array.isArray(parsedData) ? parsedData : [parsedData];
        const outputString = Papa.unparse(dataToSerialize);
        outputBlob = new Blob([outputString], { type: 'text/csv' });
      } else if (format === 'xlsx') {
        const dataToSerialize = Array.isArray(parsedData) ? parsedData : [parsedData];
        const worksheet = XLSX.utils.json_to_sheet(dataToSerialize);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        outputBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else {
        throw new Error('Unsupported output format: ' + format);
      }
    } catch (err) {
      throw new Error(`Failed to serialize to ${format.toUpperCase()}: ${err.message}`);
    }

    // Update progress before returning (100%)
    if (onProgress) {
      onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
    }

    return outputBlob;
  } catch (error) {
    throw new Error(error.message || 'Conversion failed');
  }
};
