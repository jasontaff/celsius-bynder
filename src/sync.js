require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
var request = require('request');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

//create Bynder session
const bynder = new Bynder({
  baseURL: process.env.BYNDER_API_PATH,
  permanentToken: process.env.BYNDER_TOKEN,
});


//Approved Asset Types
const imageExtensions = ['.jpg', '.jpeg', '.png'];
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.mpeg', '.3gp', '.m4v', '.mpg', '.webm', '.ts', '.asf', '.rm', '.vob', '.m2ts', '.mp2'];
const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma', '.aiff', '.m4a', '.alac', '.mp2', '.amr', '.ac3', '.midi', '.opus'];
const graphicExtensions = ['.gif', '.bmp', '.eps', '.svg'];
const fileExtensions = ['.tiff', '.psd', '.psb', '.ai', '.pdf'];


var serverAssets = "";
var bynderAssets = "";

function isFileModifiedAfterBynderCreation(severModifiedDate, bynderCreationDate) {
  const serverModifiedTimestamp = new Date(severModifiedDate).getTime();
  const bynderCreationTimestamp = new Date(bynderCreationDate).getTime();

  return serverModifiedTimestamp > bynderCreationTimestamp;
}



function isHidden(file) {
  return file.charAt(0) === '.';
}

function  getFileNameOnly(pathName){
  const file_name_only = path.basename(pathName).toLowerCase();
  return file_name_only;
}

// *Required - Get the file extension for asset type
function getAssetType(file) {
  const extension = path.extname(file).toLowerCase();
  
  if (imageExtensions.includes(extension)) {
    return {
      asset_type_name: 'photo',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_meta_id: configObject.asset_type.photo
    };
  } else if (videoExtensions.includes(extension)) {
    return {
      asset_type_name: 'video',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_meta_id: configObject.asset_type.video
    };
  } else if (audioExtensions.includes(extension)) {
    return {
      asset_type_name: 'audio',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_meta_id: configObject.asset_type.audio
    };;
  } else if (graphicExtensions.includes(extension)) {
    return {
      asset_type_name: 'graphic',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_meta_id: configObject.asset_type.graphic
    };
  }else if (fileExtensions.includes(extension)) {
    return {
      asset_type_name: 'file',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_meta_id: configObject.asset_type.file
    };
  } else {
    return {
      asset_type_name: 'other',
      asset_type_id: '',
      asset_type_meta_id: ''
    };
  }
}

// *Required - Get Department Type through file path
function getDepartmentType(pathName) {
  let department = null;
  let department_meta_id_value = null;
  const departmentTypes = Object.keys(configObject.department);

  for (const keyword of departmentTypes) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      department = keyword.toLowerCase();
      department_meta_id_value = configObject.department[keyword];
      break;
    }
  }

  let departmentObj = {
    department_name: department,
    department_id: "7DA6072B-9B6E-47C4-926C877D91C6706B",
    department_meta_id: null
  };

  if (department) {
    departmentObj.department_meta_id = department_meta_id_value;
  }

  return departmentObj;
}

// *Required - Get Asset Category through file path
function getAssetCategory(pathName){
  let assetCategory = null;
  let assetCategory_meta_id = null;
  const assetCategories = Object.keys(configObject.asset_category);

  for (const keyword of assetCategories) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      assetCategory = keyword.toLowerCase();
      assetCategory_meta_id = configObject.asset_category[keyword];
      break;
    }
  }

  let assetCategoryObj = {
    asset_category_name: assetCategory,
    asset_category_id: "C7AD8F6F-E3B1-4C49-93975E6766772052",
    asset_category_meta_id: null
  };

  if (assetCategory) {
    assetCategoryObj.asset_category_meta_id = assetCategory_meta_id;
  }

  return assetCategoryObj;

} 

//Get Asset Sub-Category through file path
function getAssetSubCategory(pathName){
  let assetSubCategory = null;
  let assetSubCategory_meta_id_value = null;
  const assetSubCategories = Object.keys(configObject.asset_sub_category);

  for (const keyword of assetSubCategories) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      assetSubCategory = keyword.toLowerCase();
      assetSubCategory_meta_id_value = configObject.asset_sub_category[keyword];
      break;
    }
  }

  let assetSubCategoryObj = {
    asset_sub_category_name: assetSubCategory,
    asset_sub_category_id: "AA31523D-201B-4B61-9B03EE84EE2C1FA8",
    asset_sub_category_meta_id: null
  };

  if (assetSubCategory) {
    assetSubCategoryObj.asset_sub_category_meta_id = assetSubCategory_meta_id_value;
  }

  return assetSubCategoryObj;

}

//Get Product Type through file path
function getProductType(pathName){
  let productType = null;
  let productType_meta_id_value = null;
  const productTypes = Object.keys(configObject.product);

  for (const keyword of productTypes) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      productType = keyword.toLowerCase();
      productType_meta_id_value = configObject.product[keyword];
      break;
    }
  }
  let productTypeObj = {
    productType_name: productType,
    productType_id: "5B8FE18F-1552-411E-93F27070ECE3410D",
    productType_meta_id: null
  };

  if (productType) {
    productTypeObj.productType_meta_id = productType_meta_id_value;
  }

 return productTypeObj;

}

//Get Product Name through file path
function getProductName (pathName){
  let productName = null;
  let productName_meta_id_value = null;
  const productNames = Object.keys(configObject.product_name);

  for (const keyword of productNames) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      productName = keyword.toLowerCase();
      productName_meta_id_value = configObject.product_name[keyword];
      break;
    }
  }
  let productNameObj = {
    productName_name: productName,
    productName_id: "4B32BAF8-F97C-4BC0-875DEACD47914DEC",
    productName_meta_id: null
  };

  if (productName) {
    productNameObj.productName_meta_id = productName_meta_id_value;
  }

 return productNameObj;

}

//Get Event Name through file path
function getEventName(pathName){
  let eventName = null;
  let eventName_meta_id_value = null;
  const eventNames = Object.keys(configObject.event);

  for (const keyword of eventNames) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      eventName = keyword.toLowerCase();
      eventName_meta_id_value = configObject.event[keyword];
      break;
    }
  }

  let eventNameObj = {
    event_name: eventName,
    event_name_id: "626C6C67-9084-407C-A1055C519A193CAE",
    event_name_meta_id: null
  };

  if (eventName) {
    eventNameObj.event_name_meta_id = eventName_meta_id_value;
  }

  return eventNameObj;

}

//Get Company Name through file path
function getCompanyName(pathName){
  let companyName = null;
  let companyName_meta_id_value = null;
  const companyNames = Object.keys(configObject.company);

  for (const keyword of companyNames) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      companyName = keyword.toLowerCase();
      companyName_meta_id_value = configObject.company[keyword];
      break;
    }
  }

  let companyNameObj = {
    company_name: companyName,
    company_name_id: "7EB122B6-00AF-48C7-AC5078A64F4469AC",
    company_name_meta_id: null
  };
  if (companyName) {
    companyNameObj.company_name_meta_id = companyName_meta_id_value;
  }

  return companyNameObj;
}

//Get Product Sub Type from file name
function getProductSubType(fileName){
  let productSubTypeObj = {};
  let matchingObj = {};

  for (const [key, value] of Object.entries(configObject.product_sub_type)) {
    if (fileName.includes(key)) {
      matchingObj[key] = value;
    }
  }

  //If there are 1 or more matching keys from in the filename
  if (Object.keys(matchingObj).length > 0) {
    productSubTypeObj.productSubType_id = "43A45382-5080-4D89-985CB39557324D9A";
    productSubTypeObj.productSubType_meta_ids = matchingObj;
  } 
  return productSubTypeObj;

}

//Get Usage Rights 
function getUsageRights(fileName){
  let usage_rights = "internal";
  let usage_rights_meta_id_value = configObject.usage_rights.internal_use_only;
  if (fileName.includes("extl")) {
    usage_rights = "external";
    usage_rights_meta_id_value = configObject.usage_rights.approved_for_external_usage
  }

  let usageRightsObj = {
    usage_rights_name: usage_rights,
    usage_rights_id: "1ED0B844-9771-49FC-B788D4ACB5441206",
    usage_rights_meta_id: usage_rights_meta_id_value
  };

  return usageRightsObj;
}

//Recursive function to read all file assets in a directory and sub directories
function readAssets(directory, assets) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {

    var filePath = path.join(directory, file);

      //remove file name and extension from filepath 
      var file_path_only = path.dirname(filePath);
    

    if (fs.statSync(filePath).isDirectory()) {
       readAssets(filePath, assets); // Recursive call for subdirectories
    } else if (!isHidden(file)) {

     
   
      var extension = getAssetType(file);
     
      if (extension.asset_type_name !== 'other') {

        var department =  getDepartmentType(file_path_only);   
        
           if (department.department_name  !== null){
            var assetCategory = getAssetCategory(file_path_only); 

            if (assetCategory.asset_category_name  !== null){
                  var file_name_only = getFileNameOnly(filePath);
                  var usage_rights = getUsageRights(file_name_only);
                  var file_stats = fs.statSync(filePath);

                  assets[filePath] = { 
                    full_path: filePath,
                    file_path_only: file_path_only, 
                    file_name_only: file_name_only,
                    modified_date: file_stats.mtime,
                    asset_type: extension,
                    department_type: department,
                    asset_category: assetCategory,
                    usage_right: usage_rights
                  };


                  //GET OPTIONAL METAPROPERITES//
                  var assetSubCategory = getAssetSubCategory(file_path_only); 

                  if (assetSubCategory.asset_sub_category_name !== null) {
                    assets[filePath].asset_sub_category = assetSubCategory;
                  }

                  var product = getProductType(file_path_only);
                  if (product.productType_name !== null) {
                    assets[filePath].product = product;
                  }

                  var productName = getProductName(file_path_only);
                  if (productName.productName_name !== null) {
                    assets[filePath].product_name = productName;
                  }

                  var eventName = getEventName(file_path_only);
                  if (eventName.event_name !== null) {
                    assets[filePath].event = eventName;
                  }

                  var company = getCompanyName(file_path_only);
                  if (company.company_name !== null) {
                    assets[filePath].company = company;
                  }

                  var product_sub_type_obj = getProductSubType(file_name_only);
                  if (Object.keys(product_sub_type_obj).length) {
                    assets[filePath].product_sub_types = product_sub_type_obj;
                  }



              }else{
                //SKIP THE FILE IF  NO ASSET CATEGORY TYPE IS ASSIGNED
                console.log("--- NO ASSET CATEGORY ASSIGNED ---:"  + filePath + " --- SKIPPING" );
              }
           }else{
              //SKIP THE FILE IF NO DEPARTMENT TYPE IS ASSIGNED
              console.log("--- NO DEPARTMENT TYPE ASSIGNED ---:"  + filePath + " --- SKIPPING" );
           }
      }else{
        //SKIP THE FILE IF  DOESN'T MEET A PROPER ASSET TYPE
        console.log("--- NOT A VALID ASSET ---:"  + filePath + " --- SKIPPING" );
      }
    
    }
  });
}

// Function to create a global object with all file assets and their paths
function getAllServerAssets(directory) {
  const assets = {};
  readAssets(directory, assets);
  return assets;
}

async function uploadFileToBynder(asset) {
  return new Promise((resolve, reject) => {
  var full_path = asset.full_path;
  var file_name_only = asset.file_name_only;

  var stats = fs.statSync(asset.full_path);
       bynder.uploadFile({
           filename: asset.file_name_only,
           body: fs.createReadStream(asset.full_path),  
           length: stats.size,
           data: { 
               brandId: "94A5CF49-3FAB-4801-A9A50E2C2D072798",
               name: file_name_only,    
               property_Org_Category: '',  'metaproperty.3E4D131B-61D1-4269-9A8C64352F962010': "DEC4407F-4384-48F7-9645FC3DD18C2260",
               property_Asset_Type: '',  'metaproperty.8961A884-9F3A-4406-AEA266B0311932FF': asset.asset_type.asset_type_meta_id,
               property_Department: '',  'metaproperty.7DA6072B-9B6E-47C4-926C877D91C6706B': asset.department_type.department_meta_id,
               property_Asset_Category: '',  'metaproperty.C7AD8F6F-E3B1-4C49-93975E6766772052': asset.asset_category.asset_category_meta_id,
               property_Usage_Rights: '',  'metaproperty.1ED0B844-9771-49FC-B788D4ACB5441206': asset.usage_right.usage_rights_meta_id                                     
           },

           }).then((data) => {
              if (data.success == true) {
                console.log("Successfully uploaded asset: " + full_path + " to Bynder!");
                resolve(); // Resolve the promise when upload is successful
              } else {
                reject("Failed to upload asset: " + full_path + " to Bynder!");
              }
      
           })
           .catch((error) => {
            console.log(error);
            reject(error);
        });
  });
}

async function getAllBynderAssets() {
  const params = {
    limit: 1000,
    page: 1,
    orderBy: 'dateModified desc'
  };

  bynderAssets = await getAllBynderMediaItems(params);
  console.log("-----Finished getting all assets on Bynder----- Bynder total assets = " + Object.keys(bynderAssets).length);
  await loopThroughAllAssets(serverAssets, bynderAssets);

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

async function loopThroughAllAssets(serverAssets, bynderAssets) {
  console.log("Looping through all assets of Server & Bynder");
  
  for (var filePath in serverAssets) {
    var serverAsset = serverAssets[filePath];
    var serverAssetFileName = serverAsset.file_name_only;
    var foundInBynder = false;

    for (var bynderFilePath in bynderAssets) {
      var bynderAsset = bynderAssets[bynderFilePath];
      var bynderAssetName = bynderAsset.name;
      
      if (bynderAssetName === serverAssetFileName) {
        foundInBynder = true;
        break; // Break the loop when a match is found
      }
    }

    if(foundInBynder){
      try {
        console.log('Match found, comparing the assets ' +  serverAssetFileName);
        await compareAsset(serverAsset, bynderAsset);
      } catch (error) {
     
        console.log(error);
      }
    }else{
      try {
        console.log("File not found in Bynder, uploading: " + serverAsset.full_path + " to Bynder");
        await uploadFileToBynder(serverAsset); // Call the function to upload file to Bynder
      } catch (error) {
     
        console.log(error);
      }

    }
  }
}

async function compareAsset(serverAsset, bynderAsset){

var isModified = isFileModifiedAfterBynderCreation(serverAsset.modified_date, bynderAsset.dateCreated);
  try {
    if(isModified){
      console.log('File modified after Bynder creation:', isModified, '.  Delete Bynder asset ');
     // await deleteBynderAsset(bynderAsset);
    }else{
      console.log('File modified after Bynder creation:', isModified, '.  Ignoring...' );
    }
  } catch (error) {
    console.log(error);
  }

}


// START:
console.log("-----Get All Sever Assets-----");
serverAssets = getAllServerAssets(configObject.defaults.directory);
console.log("-----Finished getting all assets on Server----- Server total assets = " + Object.keys(serverAssets).length);
console.log("-----Get All Bynder Assets-----");
getAllBynderAssets();



// getBynderAssetByName(serverAssets)
// .then(asset => {
//   if (asset) {
//    // console.log('Asset found:', asset);
//   } else {
//     // console.log('Upload New Asset to Bynder...');
//   }
// })
// .catch(error => {
//   console.error('Error:', error);
// });


// async function getBynderAssetByName(serverAssets) {
//   var apiKey = process.env.BYNDER_TOKEN;
//   var bynderURL = process.env.BYNDER_API_PATH;

//   try {
//     var results = [];
//     for (var [key, asset]  of Object.entries(serverAssets)) {
//       var encodedFileName = encodeURIComponent(asset.file_name_only);
//       console.log(encodedFileName);
//         var apiUrl = `${bynderURL}v4/media/?filename=${encodedFileName}`;

//         var response = await axios.get(apiUrl, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${apiKey}`
//           }
//         });
//         console.log(response.data);
//         if (response.data && response.data.length > 0) {
//           console.log("BYNDER NAME: " + asset.file_name_only + " FOUND, START COMPARE");
//         } else {
//           try {
//             console.log("File not found in Bynder, uploading: " + asset.full_path + " to Bynder");
//             await uploadFileToBynder(asset); // Call the function to upload file to Bynder
//           } catch (error) {
         
//             console.log(error);
//           }
//         }
//       }
  
//       return results; // Return the results after the loop finishes
//   } catch (error) {
//     console.error('Error retrieving asset:', error.response ? error.response.data : error.message);
//     return null; // Return null in case of any error
//   }
// }



