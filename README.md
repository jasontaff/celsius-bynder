# Celsius Server to Bynder Portal Automation Sync

## Overview
This repository contains a Node.js-based automation script to synchronize digital assets from a Celsius server to the Bynder portal. The synchronization ensures that assets are uploaded to the Bynder portal multiple times a day, enabling seamless asset management and access.

## Features
- Automated syncing of digital assets from the Celsius server to Bynder.
- Scheduled execution using a cron job.
- Error logging and retry mechanisms to handle upload failures.
- Configurable settings for file directories, upload intervals, and authentication.

## Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- Access to the Bynder API with valid credentials.
- Network access to the Celsius server and Bynder portal.

## Installation
1. Clone the repository:  
 
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Bynder token
   BYNDER_TOKEN=<your-bynder-token>
   BYNDER_API_PATH=<your-bynder-api-path>

   # Email
   EMAIL_USER=<your-email-user>
   EMAIL_PASSWORD=<your-email-password>
   ```

## Usage
### Start the Cron Job
To start the automation sync, run:
```bash
npm run cron
```
This will execute the `cron.js` script, which schedules and runs the synchronization process based on the defined interval.

### Script Details
- **`cron.js`**: The entry point for scheduling the sync task.


## Customization
### Adjust Cron Schedule
Modify the schedule inside the `cron.js` file to change the synchronization frequency. The cron expression can follow the [cron format](https://crontab.guru/).

### Error Logging


## Troubleshooting
- **Missing Files**: Ensure the asset path is correctly set and accessible.
- **API Errors**: Verify your Bynder token and API path.
- **Permission Issues**: Ensure proper read/write permissions for the asset directory and log file.

## Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.


## Contact
For support or further information on rules etc.., please contact [jason.dion.taff@gmail.com].

