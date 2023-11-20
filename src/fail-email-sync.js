require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
var request = require('request');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');


//create Bynder session
const bynder = new Bynder({
  baseURL: process.env.BYNDER_API_PATH,
  permanentToken: process.env.BYNDER_TOKEN,
});


async function getAllBynderAssets() {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
              limit: 1000,
              page: 1,
              orderBy: 'dateModified desc'
            };
      
            const bynderAssets = await getAllBynderMediaItems(params);
      
            console.log("-----Finished getting all assets on Bynder----- Bynder total assets = " + Object.keys(bynderAssets).length);
      
            const filenames = bynderAssets.map((asset) => asset.name);
            const duplicateFilenames = findDuplicates(filenames);
      
            console.log("Duplicate file names:");
      
            // Log the count of each duplicate
            duplicateFilenames.forEach((filename) => {
              const count = filenames.filter((name) => name === filename).length;
              console.log(`Filename: ${filename} | Count: ${count}`);
            });
      
            resolve(); // Resolve the Promise after the loop is complete
          } catch (error) {
            reject(error);
          }
    });
  }
  
  async function getAllBynderMediaItems(params) {
    var recursiveGetAssets = (_params, assets) => {
  
      bynderFileArray = assets;
      var params = { ..._params }; // gathers the rest of the list of arguments into an array
      params.page = !params.page ? 1 : params.page;
      params.limit = !params.limit ? defaultAssetsNumberPerPage : params.limit;
  
      return bynder.getMediaList(params)
        .then(data => {
          bynderFileArray = assets.concat(data);
          
          //if date return length is equal to limit, call again. 
          //if not, it got the rest of assets 
          if (data && data.length === params.limit) {
            
            params.page += 1;
            return recursiveGetAssets(params, bynderFileArray);
          }
          
          return bynderFileArray;
        })
        .catch(error => {
          return error;
        });
    };
    return recursiveGetAssets(params, []);
  }


  function findDuplicates(arr) {
    const duplicates = [];
    const countMap = {};
  
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      countMap[item] = countMap[item] ? countMap[item] + 1 : 1;
      if (countMap[item] === 2) {
        duplicates.push(item);
      }
    }
  
    return duplicates;
  }

getAllBynderAssets();

