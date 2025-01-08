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
      
            // const filenames = bynderAssets.map((asset) => asset.name);
           
            const duplicates = findDuplicates(bynderAssets);
         


            duplicates.forEach((duplicate) => {
              console.log(`Duplicate Name: ${duplicate.name}`);
              console.log("Occurrences:");

              let latestOccurrenceId = null;
              let latestDate = null;
              let latestOccurrenceName = null;

              duplicate.occurrences.forEach((occurrence) => {
                console.log(`  Name:  | ID: ${occurrence.id}  | DateCreated ${occurrence.dateCreated}`);

                const currentDate = new Date(occurrence.dateCreated);
        
                if (!latestDate || currentDate > latestDate) {
                    latestDate = currentDate;
                    latestOccurrenceId = occurrence.id;
                    latestOccurrenceName = occurrence.name;
                }
            });
        
            if (latestOccurrenceId !== null) {
               console.log(`Latest Occurrence: Name - ${latestOccurrenceName} | ID - ${latestOccurrenceId}`);
               console.log("Delete: " + latestOccurrenceName + " : " + latestOccurrenceId );
               // Delete the asset from Bynder with the ID
               deleteBynderAsset(latestOccurrenceName, latestOccurrenceId);
            } else {
                console.log("No occurrences found.");
            }
        
            
            console.log("------------------------------");
          
            });
            console.log("Total Dups Found: " +duplicates.length)
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

  function findDuplicates(bynderAssets) {
    const duplicates = [];
    const nameOccurrences = {};
  
    for (let i = 0; i < bynderAssets.length; i++) {
      
      const item = bynderAssets[i];
      const name = item.name;
      const id = item.id;
      const dateCreated = item.dateCreated;
  
      nameOccurrences[name] = nameOccurrences[name] ? nameOccurrences[name] + 1 : 1;
  
      if (nameOccurrences[name] >= 2) {
        // This is the second occurrence of the name, grab all occurrences and push into duplicates array
        const allOccurrences = bynderAssets
          .filter((asset) => asset.name === name)
          .map((occurrence) => ({ name: occurrence.name, id: occurrence.id, dateCreated: occurrence.dateCreated }));
  
        duplicates.push({ name: name, occurrences: allOccurrences});
  
        // // // Log the duplicate name and its occurrence count
        //  console.log(`Duplicate Name: ${name} | Occurrences Count: ${allOccurrences.length}`);
  
        // // // Log the other occurrences for visibility
        //  console.log(`Other Occurrences for ${name}: `, allOccurrences.slice(1));
      }
    }
  

    return duplicates;
  }

  async function deleteBynderAsset(name, id) {
    return new Promise((resolve, reject) => {
      bynder.deleteMedia({
        id: id,
      })
        .then((data) => {
          console.log("Successfully deleted Bynder asset: " + name);
          resolve();
        })
        .catch((error) => {
          console.error("FAILED TO DELETE BYNDER ASSET: " + name);
          console.log(error.response.data);
          reject(error);
        });
    });
  }

getAllBynderAssets();
