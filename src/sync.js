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

//Department Types
const departmentTypes = ['dep_collegiate', 'dep_creative', 'dep_general_marketing', 'dep_media_digital', 'dep_packaging', 'dep_pr', 'dep_social', 'dep_sports_marketing',
 'dep_street_teams', 'dep_trade'];

// Asset Categories
const assetCategories = ['paid', 'organic', 'pos', 'shell_sheets', 'key_acct', 'cans', 'boxes', 'trays', 'packets', 'linear', 
'digital', 'branding', 'renderings', 'print', 'website', 'portfolio', 'advertising', 'partnership', 'templates', 'sports_and_recreation', 'product', 'organizations'];

// Asset Sub-Categories
const assetSubCategories = ['stock', 'corporate', 'logo', 'font', 'color', 'brand guidelines', 'brochure', 'template', 'commercial',
 'motion graphic', 'webinar', 'b_roll', 'music track', 'podcast', 'interview recording', 'infographic', 'icon', 'rendering', 'apparel', 
 'shoots', 'events', 'displays', 'innovation', 'standard', 'cling', 'strip', 'card', 'banner', 's helf', 'low_res', 'high_res', 'horizontal', 
 'vertical', 'style guide', 'form', 'fitness', 'athlete', 'signage', 'wraps', 'barcodes'];

function isHidden(file) {
  return file.charAt(0) === '.';
}

// *Required - Get the file extension for asset type
function getAssetType(file) {
  const extension = path.extname(file).toLowerCase();
  
  if (imageExtensions.includes(extension)) {
    return {
      asset_type_name: 'photo',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_photo_meta_id: configObject.asset_type.photo
    };
  } else if (videoExtensions.includes(extension)) {
    return {
      asset_type_name: 'video',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_photo_meta_id: configObject.asset_type.video
    };
  } else if (audioExtensions.includes(extension)) {
    return {
      asset_type_name: 'audio',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_photo_meta_id: configObject.asset_type.audio
    };;
  } else if (graphicExtensions.includes(extension)) {
    return {
      asset_type_name: 'graphic',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_photo_meta_id: configObject.asset_type.graphic
    };
  }else if (fileExtensions.includes(extension)) {
    return {
      asset_type_name: 'file',
      asset_type_id: configObject.asset_type.asset_type_id,
      asset_type_photo_meta_id: configObject.asset_type.file
    };
  } else {
    return {
      asset_type_name: 'other',
      asset_type_id: '',
      asset_type_photo_meta_id: ''
    };
  }
}

// *Required - Get Department Type through file path
function getDepartmentType(pathName) {
  let department = null;
  for (const keyword of departmentTypes) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      department = keyword;
      department.toLowerCase();
      break;
    }
  }

  let departmentObj = {
    department_name: department,
    department_id: configObject.department.department_id,
    department_meta_id: ''
  };

  switch (department) {
    case 'dep_collegiate':
      departmentObj.department_meta_id = configObject.department.collegiate;
      break;
    case 'dep_creative':
      departmentObj.department_meta_id = configObject.department.creative;
      break;
    case 'dep_general_marketing':
      departmentObj.department_meta_id = configObject.department.general_marketing;
      break;
    case 'dep_media_digital':
      departmentObj.department_meta_id = configObject.department.media_digital;
      break;
    case 'dep_packaging':
      departmentObj.department_meta_id = configObject.department.packaging;
      break;
    case 'dep_pr':
      departmentObj.department_meta_id = configObject.department.pr;
      break;
    case 'dep_social':
      departmentObj.department_meta_id = configObject.department.social;
      break;
    case 'dep_sports_marketing':
      departmentObj.department_meta_id = configObject.department.sports_marketing;
      break;
    case 'dep_street_teams':
      departmentObj.department_meta_id = configObject.department.street_teams;
      break;
    case 'dep_trade':
      break;
    default:
      departmentObj.department_id = null;
      departmentObj.department_meta_id = null;
      break;
  }

  return departmentObj;
}

// *Required - Get Asset Category through file path
function getAssetCategory(pathName){
  let assetCategory = null;
  for (const keyword of assetCategories) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      assetCategory = keyword;
      assetCategory.toLowerCase();
      break;
    }
  }

  let assetCategoryObj = {
    asset_category_name: assetCategory,
    asset_category_id: configObject.asset_category.asset_category_id,
    asset_category_meta_id: ''
  };

  switch (assetCategory) {
    case 'paid':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.paid;
      break;
    case 'organic':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.organic;
      break;
    case 'pos':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.pos;
      break;
    case 'shell_sheets':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.shell_sheets;
      break;
    case 'key_acct':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.key_acct;
      break;
    case 'cans':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.cans;
      break;
    case 'boxes':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.boxes;
      break;
    case 'trays':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.trays;
      break;
    case 'packets':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.packets;
      break;
    case 'linear':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.linear;
      break;
    case 'digital':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.digital;
      break;
    case 'branding':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.branding;
      break;
    case 'renderings':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.renderings;
      break;
    case 'print':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.print;
      break;
    case 'website':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.website;
      break;
    case 'portfolio':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.portfolio;
      break;
    case 'advertising':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.advertising;
      break;
    case 'partnership':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.partnership;
      break;
    case 'templates':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.templates;
    break;
    case 'sports_and_recreation':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.sports_and_recreation;
      break;
    case 'product':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.product;
      break;
    case 'organizations':
      assetCategoryObj.asset_category_meta_id = configObject.asset_category.organizations;
      break;
    default:
      assetCategoryObj.asset_category_id = null;
      assetCategoryObj.asset_category_meta_id = null;
      break;
  }

  return assetCategoryObj;

} 

//get Asset Sub-Category through file path
function getAssetSubCategory(pathName){
  let assetSubCategory = null;
  for (const keyword of assetSubCategories) {
    if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
      assetSubCategory = keyword;
      assetSubCategory.toLowerCase();
      break;
    }
  }

  let assetSubCategoryObj = {
    asset_sub_category_name: assetSubCategory,
    asset_sub_category_id: configObject.asset_sub_category.asset_sub_category_id,
    asset_sub_category_meta_id: ''
  };

  switch (assetSubCategory) {
    case 'apparel':
      assetSubCategoryObj.asset_sub_category_meta_id = configObject.asset_sub_category.apparel;
      break;
    case 'athlete':
      assetSubCategoryObj.asset_sub_category_meta_id = configObject.asset_sub_category.athlete;
      break;
    default:
      assetSubCategoryObj.asset_sub_category_id = null;
      assetSubCategoryObj.asset_sub_category_meta_id = null;
      break;
  }

  return assetSubCategoryObj;

}

// Recursive function to read all file assets in a directory and sub directories
function readAssets(directory, assets) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {

    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
       readAssets(filePath, assets); // Recursive call for subdirectories
    } else if (!isHidden(file)) {
      var extension = getAssetType(file);
     
      if (extension.asset_type_name !== 'other') {
        var department = getDepartmentType(filePath);   
        
           if (department.department_name  !== null){
            var assetCategory = getAssetCategory(filePath); 

            if (assetCategory.asset_category_name  !== null){

              var assetSubCategory = getAssetSubCategory(filePath); 

                assets[filePath] = { 
                  file_path: filePath, 
                  asset_type: extension,
                  department_type: department,
                  asset_category: assetCategory,
                  asset_sub_category: assetSubCategory
                };

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