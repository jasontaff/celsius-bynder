require('dotenv').config({path: '../.env'})
var configObject = require('./config/config.json');
var Bynder = require('@bynder/bynder-js-sdk');
const fs = require('fs');
const path = require('path');

//create bynder session
const bynder = new Bynder({ baseURL: "https://celsius.bynder.com/api/", permanentToken: process.env.BYNDER_TOKEN});


try {
    let fileCount = 0;
    const fileExtensions = {};

function readDirectory(directory) {
  // Read all files in the directory
  const files = fs.readdirSync(directory);
  // Loop through each file
  files.forEach((file) => {
    // Get the full path of the file
    const filePath = path.join(directory, file);
    // Check if it's a file or directory
    if (fs.statSync(filePath).isDirectory()) {
      // If it's a directory, call readDirectory again recursively
      readDirectory(filePath);
    } else {
      // If it's a file, increment the fileCount variable
      fileCount++;
      // And do something with the file, such as reading its contents
      console.log(filePath);

      // Get the file extension
      const extension = path.extname(filePath).toLowerCase();
      // Add it to the fileExtensions object if it doesn't exist
      if (!fileExtensions[extension]) {
        fileExtensions[extension] = true;
      }
    }
  });
}



// Call the function with the directory you want to read
readDirectory('../../_CREATIVE/International/');

console.log(`Found ${fileCount} files.`);
console.log('File extensions:');
console.log(Object.keys(fileExtensions));
} catch (error) {
    console.log(error);
}
