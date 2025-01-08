require('dotenv').config({path: '../.env'})
var configObject = require('./config.json');
var Bynder = require('@bynder/bynder-js-sdk');
var axios = require('axios');
var request = require('request');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

var logFileName = `file_${getCurrentTimestamp()}.log`;
var logFilePath = path.join('../logs/', logFileName);
var logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Attach an error event listener to the logStream
logStream.on('error', (error) => {
  console.error('An error occurred during the write operation:', error);
});

// Create a reference to the original console.log and console.error functions
var originalConsoleLog = console.log;
var originalConsoleError = console.error;

// Override console.log and console.error to log to both console and file
console.log = (...args) => {
  const logMessage = `${getCurrentTimestamp()} ${args.join(' ')}`;
  originalConsoleLog(...args); // Log to console
  try {
    logStream.write(`${logMessage}\n`); // Log to file
  } catch (error) {
    console.error('An error occurred during the write operation:', error);
  }
};

console.error = (...args) => {
  const logMessage = `${getCurrentTimestamp()} ${args.join(' ')}`;
  originalConsoleError(...args); // Log to console
  try {
    logStream.write(`${logMessage}\n`); // Log to file
  } catch (error) {
    console.error('An error occurred during the write operation:', error);
  }
};


function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

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
const fileExtensions = ['.tiff', '.psd', '.psb', '.ai', '.pdf', '.zip'];


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

  const segments = pathName.split('\\');

  let department = null;
  let department_meta_id_value = null;
  const departmentTypes = Object.keys(configObject.department);

  for (const key of departmentTypes) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
      department = keyword.toLowerCase();
      department_meta_id_value = configObject.department[keyword];
      break;
    }
    // if (pathName.toLowerCase().includes(keyword.toLowerCase())) {
    //   department = keyword.toLowerCase();
    //   department_meta_id_value = configObject.department[keyword];
    //   break;
    // }
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

// *Required - Get Main Country through file path
function getMainCountry(pathName) {

    let countryObj= {};
      let matchingObj= {};
    
      for (const [key, value] of Object.entries(configObject.main_country)) {
        if (pathName.toLowerCase().includes(key.toLowerCase())) {
          matchingObj[key] = value;
        }
      }
    
        //If there are 1 or more matching keys from in the pathName
        if (Object.keys(matchingObj).length > 0) {
          countryObj.country_id = "DE8BBD4F-DFDA-4559-849714F7954AE3A2";
          countryObj.country_meta_ids = matchingObj;
        } 
       
        return countryObj;
}

// *Required - Get Asset Category through file path
function getAssetCategory(pathName){

  const segments = pathName.split('\\');

  let assetCategory = null;
  let assetCategory_meta_id = null;
  const assetCategories = Object.keys(configObject.asset_category);

  for (const key of assetCategories) {
      var keyword = key.toLowerCase();
      var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
      if (isMatch) {
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

  const segments = pathName.split('\\');

  let assetSubCategory = null;
  let assetSubCategory_meta_id_value = null;
  const assetSubCategories = Object.keys(configObject.asset_sub_category);

  for (const key of assetSubCategories) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
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

//Get Asset Sub Type Category
function getAssetSubTypeCategory(pathName){

  const segments = pathName.split('\\');

  let assetSubTypeCategory = null;
  let assetSubTypeCategory_meta_id_value = null;
  const assetSubTypeCategories = Object.keys(configObject.asset_sub_type_category);

  for (const key of assetSubTypeCategories) {

    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
      assetSubTypeCategory = keyword.toLowerCase();
      assetSubTypeCategory_meta_id_value = configObject.asset_sub_type_category[keyword];
      break;
    }
  }

  let assetSubTypeCategoryObj = {
    asset_sub_type_category_name: assetSubTypeCategory,
    asset_sub_type_category_id: "308BC25B-12D2-4EF0-960E467CAC1D359E",
    asset_sub_type_category_meta_id: null
  };

  if (assetSubTypeCategory) {
    assetSubTypeCategoryObj.asset_sub_type_category_meta_id = assetSubTypeCategory_meta_id_value;
  }

  return assetSubTypeCategoryObj;

}

//Get Advertising Type
function getAdvertisingType(pathName){

  const segments = pathName.split('\\');

  let advertisingType = null;
  let advertisingType_meta_id_value = null;
  const advertisingTypes = Object.keys(configObject.advertising_type);

  for (const key of advertisingTypes) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
      advertisingType = keyword.toLowerCase();
      advertisingType_meta_id_value = configObject.advertising_type[keyword];
     break;
    }
 
  }

  let advertisingTypeObj = {
    advertisingType_name: advertisingType,
    advertisingType_id: "14B6E5F5-A323-470B-93BBA05A8D30D1F4",
    advertisingType_meta_id: null
  };

  if (advertisingType) {
    advertisingTypeObj.advertisingType_meta_id = advertisingType_meta_id_value;
  }

 return advertisingTypeObj;
}

//Get Sports Entities
function getSportsEntities(pathName){

  const segments = pathName.split('\\');

  let sportsEntity = null;
  let sportsEntities_meta_id_value = null;
  const sportsEntities = Object.keys(configObject.sports_entities);

  for (const key of sportsEntities) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
      sportsEntity = keyword.toLowerCase();
      sportsEntities_meta_id_value = configObject.sports_entities[keyword];
      break;
    }
  }
  let sportsEntitiesObj = {
    sportsEntities_name: sportsEntity,
    sportsEntities_id: "11E20DE7-8BF4-4943-BF65204753FF63CD",
    sportsEntities_meta_id: null
  };

  if (sportsEntity) {
    sportsEntitiesObj.sportsEntities_meta_id = sportsEntities_meta_id_value;
   // console.log(sportsEntitiesObj);
  }
  
 return sportsEntitiesObj;


}

//Get Product Type through file path
function getProductType(pathName){

  const segments = pathName.split('\\');

  let productType = null;
  let productType_meta_id_value = null;
  const productTypes = Object.keys(configObject.product);

  for (const key of productTypes) {

    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
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

  const segments = pathName.split('\\');

  let productName = null;
  let productName_meta_id_value = null;
  const productNames = Object.keys(configObject.product_name);

  for (const key of productNames) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
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

  const segments = pathName.split('\\');

  let eventName = null;
  let eventName_meta_id_value = null;
  const eventNames = Object.keys(configObject.event);

  for (const key of eventNames) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
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

  const segments = pathName.split('\\');

  let companyName = null;
  let companyName_meta_id_value = null;
  const companyNames = Object.keys(configObject.company);

  for (const key of companyNames) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
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

//Get Campaign Type through file path
function getCampaignType(pathName){

  const segments = pathName.split('\\');

  let campaign_type_name = null;
  let campaign_type_meta_id_value = null;
  const campaign_types = Object.keys(configObject.campaign_type);

  for (const key of campaign_types) {
    var keyword = key.toLowerCase();
    var isMatch = segments.some(segment => segment.toLowerCase() === keyword);
    if (isMatch) {
      campaign_type_name = keyword.toLowerCase();
      campaign_type_meta_id_value = configObject.campaign_type[keyword];
      break;
    }
  
  }

  let campaignTypesObj = {
    campaign_type_name: campaign_type_name,
    campaign_type_id: "0AF95F3D-0EA5-4944-B22C8DE7C9B348C",
    campaign_type_meta_id: null
  };
  if (campaign_type_name) {
    campaignTypesObj.campaign_type_meta_id = campaign_type_meta_id_value;
  }

  return campaignTypesObj;
 



}

//Get Usage Rights 
function getUsageRights(fileName){
  let usage_rights = "internal";
  let usage_rights_meta_id_value = configObject.usage_rights.internal_use_only;
  if (fileName.includes("extl")) {
    usage_rights = "external";
    usage_rights_meta_id_value = configObject.usage_rights.extl
  }

  let usageRightsObj = {
    usage_rights_name: usage_rights,
    usage_rights_id: "1ED0B844-9771-49FC-B788D4ACB5441206",
    usage_rights_meta_id: usage_rights_meta_id_value
  };

  return usageRightsObj;
}

//Get Product Sub Type from file name
function getProductSubType(fileName){
  let productSubTypeObj = {};
  let matchingObj = {};

  for (const [key, value] of Object.entries(configObject.product_sub_type)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
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

//Get Flavors
function getFlavors(fileName){
  let flavorsObj = {};
  let matchingObj = {};

  for (const [key, value] of Object.entries(configObject.flavors)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }

    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      flavorsObj.flavors_id = "F0801F2D-F91E-4F62-B59F6581E8FB7B2C";
      flavorsObj.flavors_meta_ids = matchingObj;
    } 
    return flavorsObj;
}

//Get Countries
// function getCountries(fileName){
//   let countryObj= {};
//   let matchingObj= {};

//   for (const [key, value] of Object.entries(configObject.country)) {
//     if (fileName.toLowerCase().includes(key.toLowerCase())) {
//       matchingObj[key] = value;
//     }
//   }

//     //If there are 1 or more matching keys from in the filename
//     if (Object.keys(matchingObj).length > 0) {
//       countryObj.country_id = "697F646C-9594-4A3A-92716AD65D29CE90";
//       countryObj.country_meta_ids = matchingObj;
//     } 
//     return countryObj;
// }

//Get Year
function getYear(fileName){
  let yearObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.year)) {
    if (fileName.toLowerCase().includes(key)) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      yearObj.year_id = "8582BD37-9C90-4447-B2D6DC9F75C42131";
      yearObj.year_meta_ids = matchingObj;
    } 
    return yearObj;
}

//Get Dimension
function getDimension(fileName){
  let dimensionObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.dimension)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      dimensionObj.dimension_id = "AEB1FED2-413E-4BF8-AFEF0145B3E50370";
      dimensionObj.dimension_meta_ids = matchingObj;
    } 
    return dimensionObj;

}

//Get Ratio
function getRatio(fileName){
  let ratioObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.ratio)) {
    if (fileName.toLowerCase().includes(key)) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      ratioObj.ratio_id = "EC8FDFC9-243D-444E-A2C27E72247A10BC";
      ratioObj.ratio_meta_ids = matchingObj;
    } 
    return ratioObj;
}

//Get Length
function getLength(fileName){
  let lengthObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.length)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      lengthObj.length_id = "321F85C6-D000-493C-AD0D1E0CA0000224";
      lengthObj.length_meta_ids = matchingObj;
    } 
    return lengthObj;
}

//Get Sound
function getSound(fileName){
  let soundObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.sound)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      soundObj.sound_id = "CFA84AB2-359A-4866-9535DED6A8BBA262";
      soundObj.sound_meta_ids = matchingObj;
    } 
    return soundObj;
}

//Get Language
function getLanguage(fileName){
  let languageObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.language)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      languageObj.language_id = "E2B4C35A-A000-4B94-82CA0D24F71F009A";
      languageObj.language_meta_ids = matchingObj;
    } 
    return languageObj;
}

function getEmphasis(fileName){
  let emphasisObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.emphasis)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      emphasisObj.emphasis_id = "A944CA7E-D1E8-4FDB-A0A0922D17D5ED49";
      emphasisObj.emphasis_meta_ids = matchingObj;
    } 
    return emphasisObj;
}

//Get Location through file name
function getLocation(fileName){
  let locationObj= {};
  let matchingObj= {};

  for (const [key, value] of Object.entries(configObject.location)) {
    if (fileName.toLowerCase().includes(key.toLowerCase())) {
      matchingObj[key] = value;
    }
  }
    //If there are 1 or more matching keys from in the filename
    if (Object.keys(matchingObj).length > 0) {
      locationObj.location_id = "2AAF33AB-E3A2-4052-97809F5AFB22364A";
      locationObj.location_meta_ids = matchingObj;
    } 
    return locationObj;

}

//Recursive function to read all file assets in a directory and sub directories
function readAssets(directory, assets) {
  try {
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

              var countryObj = getMainCountry(file_path_only);

                 if (Object.keys(countryObj).length) {

                  
        

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
                  //  main_country: countryObj,
                    asset_category: assetCategory,
                    usage_right: usage_rights
                  };


                  assets[filePath].main_country = countryObj;

                  //GET OPTIONAL METAPROPERITES//
                  var assetSubCategory = getAssetSubCategory(file_path_only); 
                  if (assetSubCategory.asset_sub_category_name !== null) {
                    assets[filePath].asset_sub_category = assetSubCategory;
                  }

                  var assetSubTypeCategory = getAssetSubTypeCategory(file_path_only);
                  if (assetSubTypeCategory.asset_sub_type_category_name !== null) {
                    assets[filePath].asset_sub_type_category = assetSubTypeCategory;
                  }
                  
                  var advertisingType = getAdvertisingType(file_path_only);
                  if (advertisingType.advertisingType_name !==null) {
                    assets[filePath].advertising_type = advertisingType;
                  }

                  var sportEntities = getSportsEntities(file_path_only);
                  if (sportEntities.sportsEntities_name !==null) {
                    assets[filePath].sports_entities = sportEntities;
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

                  var campaignType = getCampaignType(file_path_only);
                  if (campaignType.campaign_type_name !== null) {
                    assets[filePath].campaign_type = campaignType;
                  }

                  //GET MULTIPLE OPTIONAL METAPROPERITES
                  var product_sub_type_obj = getProductSubType(file_name_only);
                  if (Object.keys(product_sub_type_obj).length) {
                    assets[filePath].product_sub_types = product_sub_type_obj;
                  }

                  var flavorObj = getFlavors(file_name_only);
                  if (Object.keys(flavorObj).length) {
                    assets[filePath].flavors = flavorObj;
                  }

                //   var countryObj = getCountries(file_name_only);
                //   if (Object.keys(countryObj).length) {
                //     assets[filePath].country = countryObj;
                //   }

                  var yearObjc = getYear(file_name_only);
                  if (Object.keys(yearObjc).length) {
                    assets[filePath].year = yearObjc;
                  }

                  var dimensionObj = getDimension(file_name_only);
                  if (Object.keys(dimensionObj).length) {
                  assets[filePath].dimension = dimensionObj;
                  }

                  var ratioObj = getRatio(file_name_only);
                  if (Object.keys(ratioObj).length) {
                    assets[filePath].ratio = ratioObj;
                  }

                  var lengthObj = getLength(file_name_only);
                  if (Object.keys(lengthObj).length) {
                    assets[filePath].length = lengthObj;
                  }

                  var soundObj = getSound(file_name_only);
                  if (Object.keys(soundObj).length) {
                    assets[filePath].sound = soundObj;
                  }

                  var languageObj = getLanguage(file_name_only);
                  if (Object.keys(languageObj).length) {
                    assets[filePath].language = languageObj;
                  }

                  var emphasisObj = getEmphasis(file_name_only);
                  if (Object.keys(emphasisObj).length) {
                    assets[filePath].emphasis = emphasisObj;
                  }
                  
                  var locationObj = getLocation(file_name_only);
                  if (Object.keys(locationObj).length) {
                    assets[filePath].location = locationObj;
                  }
               

              }else{
                //SKIP THE FILE IF  NO ASSET CATEGORY TYPE IS ASSIGNED
                console.log("--- NO ASSET CATEGORY ASSIGNED ---:"  + filePath + " --- SKIPPING" );
              }

            }else{
            //SKIP THE FILE IF NO MAIN COUNTRY IS ASSIGNED
            console.log("--- NO MAIN COUNTRY  ASSIGNED ---:"  + filePath + " --- SKIPPING" );
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
  } catch (error) {
    console.log(error);
  }

}

// Function to create a global object with all file assets and their paths
function getAllServerAssets(directory) {
  const assets = {};
  readAssets(directory, assets);
  return assets;
}


// START:
console.log("-----Get All Sever Assets-----");
serverAssets = getAllServerAssets(configObject.defaults.directory);
console.log("-----Finished getting all assets on Server----- Server total assets = " + Object.keys(serverAssets).length);

//fail safe if issue and no server assets are found
if( Object.keys(serverAssets).length == 0){
  console.log("No Windows Server Assets Found");
  process.exit(0); // Exit the script
}else{

  console.log("Looping through all assets on the Server");

  var filePaths = {}; // Object to store filenames and their paths

  for (var filePath in serverAssets) {
      var serverAsset = serverAssets[filePath];
      var serverAssetFileName = serverAsset.file_name_only;
      var serverAssetFilePath = serverAsset.file_path_only + '\\\\' + serverAssetFileName;
      
      // Check if the filename already exists in the object
      if (filePaths[serverAssetFileName]) {
          console.log("Duplicate file found: " + serverAssetFilePath);
          console.log("First occurrence: " + filePaths[serverAssetFileName]);
          console.log("Second occurrence: " + serverAssetFilePath);
      } else {
          // Store the file path corresponding to the filename
          filePaths[serverAssetFileName] = serverAssetFilePath;
      }
  }
    console.log("---Find Server Dups...done---");
    logStream.end();
}







