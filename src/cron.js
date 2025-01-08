require('dotenv').config({path: '../.env'})
const cron = require('node-cron');
const { spawn } = require('child_process');
const fs = require('fs');

// Lock file path
const lockFilePath = 'cron.lock';

// run every hour from 6 am to 7 pm, Monday through Friday, 
const schedule = '0 6-19 * * 1-5';

// Create the cron job
cron.schedule(schedule, () => {
  // Check if the lock file exists
  if (fs.existsSync(lockFilePath)) {
    console.log('Previous job is still running. Skipping the current scheduled run.');
    return;
  }

  // Create the lock file
  fs.writeFileSync(lockFilePath, '');

  // Define the command to run sync.js
  const command = 'sync-in-batches.js';

  // Spawn a child process to execute sync.js
  const child = spawn('node', [command]);

  // Handle stdout data
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  // Handle stderr data
  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  // Handle the exit of the child process
  child.on('close', (code) => {
    // Remove the lock file after the job finishes
    fs.unlinkSync(lockFilePath);

    if (code === 0) {
      console.log('sync.js executed successfully.');
    } else {
      console.error(`sync.js execution failed with code ${code}.`);
    }
  });
});

console.log('run every hour from 6 am to 7 pm, Monday through Friday');


