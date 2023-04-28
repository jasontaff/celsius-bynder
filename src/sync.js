require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

//create Bynder session
const bynder = new Bynder({ baseURL: process.env.BYNDER_API_PATH, permanentToken: process.env.BYNDER_TOKEN});


function readDirectory(rootDir) {
  // Read the contents of the current directory
  const files = fs.readdirSync(rootDir);

  // Iterate over each item in the directory
  files.forEach(file => {
    // Construct the absolute path of the current item
    const filePath = path.join(rootDir, file);

    // Get the file's stats
    const stats = fs.statSync(filePath);

    // Check if the item is a directory
    if (stats.isDirectory()) {
      // Recursively read the subdirectory
      readDirectory(filePath);
    } else {
      // It's a file, so you can do whatever you want with it
      console.log(filePath);
      // Or perform other operations like reading its contents, etc.
    }
  });
}

// Usage:
readDirectory(configObject.defaults.directory);















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