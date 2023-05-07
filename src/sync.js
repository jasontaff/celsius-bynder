require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

//create Bynder session
const bynder = new Bynder({ baseURL: process.env.BYNDER_API_PATH, permanentToken: process.env.BYNDER_TOKEN});

//Approved Asset Types
const imageExtensions = ['.jpg', '.jpeg', '.png'];
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.mpeg', '.3gp', '.m4v', '.mpg', '.webm', '.ts', '.asf', '.rm', '.vob', '.m2ts', '.mp2'];
const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma', '.aiff', '.m4a', '.alac', '.mp2', '.amr', '.ac3', '.midi', '.opus'];
const graphicExtensions = ['.gif', '.bmp', '.eps', '.svg'];
const fileExtensions = ['.tiff', '.psd', '.psb', '.ai', '.pdf'];



function isHidden(file) {
  return file.charAt(0) === '.';
}

// Function to get the file extension
function getExtension(file) {
  const extension = path.extname(file).slice(1).toLowerCase();

  if (imageExtensions.includes(extension)) {
    return 'photo';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  } else if (audioExtensions.includes(extension)) {
    return 'audio';
  } else if (graphicExtensions.includes(extension)) {
    return 'graphic';
  }else if (fileExtensions.includes(extension)) {
    return 'file';
  } else {
    return 'other';
  }
}

// Recursive function to read all file assets in a directory and sub directories
function readAssets(directory, assets) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      readAssets(filePath, assets); // Recursive call for subdirectories
    } else if (!isHidden(file)) {
      const extension = getExtension(file);
      assets[filePath] = { path: filePath, type: extension };
    
    }
  });
}

// Function to create a global object with all file assets and their paths
function getAllAssets(directory) {
  const assets = {};
  readAssets(directory, assets);
  return assets;
}

// start:
const assets = getAllAssets(configObject.defaults.directory);
console.log(assets);







function getTimestamp(dataString){
  const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }
  return new Date(dataString).toLocaleDateString(undefined, options);
}



//blank objects for config
// var defaultObject = new Object();


// //populate default values for object
// for (var key in configObject.defaults) {
//   var key = key;
//   var value =  configObject.defaults[key];
//   defaultObject[key] = value;
// }
// let fileCount = 0;
// const fileExtensions = {};

// // Create a new workbook and worksheet
// const workbook = new ExcelJS.Workbook();

// // Create a worksheet for the first directory
// const worksheet1 = workbook.addWorksheet('Directory 1');
// // Set up the columns for the first worksheet
// worksheet1.columns = [  { header: 'Last Accessed Date', key: 'accessedDate', width: 25 },  { header: 'File Path', key: 'path', width: 100 }];

// // Freeze the first row and bold the header row for the first worksheet
// worksheet1.views = [  { state: 'frozen', xSplit: 0, ySplit: 1 }];
// worksheet1.getRow(1).font = { bold: true };

// // Create a worksheet for the second directory
// const worksheet2 = workbook.addWorksheet('Directory 2');
// // Set up the columns for the second worksheet
// worksheet2.columns = [  { header: 'Last Accessed Date', key: 'accessedDate', width: 25 },  { header: 'File Path', key: 'path', width: 100 }];

// // Freeze the first row and bold the header row for the second worksheet
// worksheet2.views = [  { state: 'frozen', xSplit: 0, ySplit: 1 }];
// worksheet2.getRow(1).font = { bold: true };



// // Call the readDirectory function with the first directory to be processed
// readDirectory('../../_CREATIVE/International/', worksheet1);

// // Call the readDirectory function with the second directory to be processed
// readDirectory('../../_CREATIVE/US/', worksheet2);

// // Save the workbook to a file
// workbook.xlsx.writeFile('file_access_dates.xlsx')
//   .then(() => {
//     console.log('Workbook saved successfully!');
//   })
//   .catch((err) => {
//     console.error(err);
//   });