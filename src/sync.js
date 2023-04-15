require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

//create Bynder session
const bynder = new Bynder({ baseURL: "https://celsius.bynder.com/api/", permanentToken: process.env.BYNDER_TOKEN});


//blank objects for config
var defaultObject = new Object();


//populate default values for object
for (var key in configObject.defaults) {
  var key = key;
  var value =  configObject.defaults[key];
  defaultObject[key] = value;
}
let fileCount = 0;
const fileExtensions = {};

// Create a new workbook and worksheet
const workbook = new ExcelJS.Workbook();

// Create a worksheet for the first directory
const worksheet1 = workbook.addWorksheet('Directory 1');
// Set up the columns for the first worksheet
worksheet1.columns = [  { header: 'Last Accessed Date', key: 'accessedDate', width: 25 },  { header: 'File Path', key: 'path', width: 100 }];

// Freeze the first row and bold the header row for the first worksheet
worksheet1.views = [  { state: 'frozen', xSplit: 0, ySplit: 1 }];
worksheet1.getRow(1).font = { bold: true };

// Create a worksheet for the second directory
const worksheet2 = workbook.addWorksheet('Directory 2');
// Set up the columns for the second worksheet
worksheet2.columns = [  { header: 'Last Accessed Date', key: 'accessedDate', width: 25 },  { header: 'File Path', key: 'path', width: 100 }];

// Freeze the first row and bold the header row for the second worksheet
worksheet2.views = [  { state: 'frozen', xSplit: 0, ySplit: 1 }];
worksheet2.getRow(1).font = { bold: true };

function readDirectory(directory, worksheet) {
  // Read all files in the directory
  const files = fs.readdirSync(directory);
  // Loop through each file
  files.forEach((file) => {
    // Get the full path of the file
    const filePath = path.join(directory, file);
    // Check if it's a file or directory

    if (filePath.includes('Ardagh.sb-6283627e-mngWTN')) {
      console.log('The file contains the string!');

    }else{
      if (fs.statSync(filePath).isDirectory()) {
        // If it's a directory, call readDirectory again recursively
        readDirectory(filePath, worksheet);
      } else {
        // If it's a file, increment the fileCount variable
        fileCount++;
        // And do something with the file, such as reading its contents
        console.log(filePath);
  
    
               // Get the local accessed date of the file
        const fileStats = fs.statSync(filePath);
        const accessedDate = fileStats.atime;
  
        // Format the date and time stamp
        const formattedAccessedDate = accessedDate.toLocaleString();
  
        // Write the accessed date and file path to the worksheet
        worksheet.addRow({ accessedDate: formattedAccessedDate, path: filePath });
        
  
      }
    }


  
  });
}

// Call the readDirectory function with the first directory to be processed
readDirectory('../../_CREATIVE/International/', worksheet1);

// Call the readDirectory function with the second directory to be processed
readDirectory('../../_CREATIVE/US/', worksheet2);

// Save the workbook to a file
workbook.xlsx.writeFile('file_access_dates.xlsx')
  .then(() => {
    console.log('Workbook saved successfully!');
  })
  .catch((err) => {
    console.error(err);
  });