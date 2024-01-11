const cron = require('node-cron');
const { spawn } = require('child_process');
const fs = require('fs');

// Lock file path
const lockFilePath = 'cron.lock';

// Define the schedule for the cron job (7 AM, noon, and 4 PM Monday through Friday, and midnight every day)
const schedule = '0 7,12,16 * * 1-5,0';

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
  const command = 'sync.js';

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

console.log('Cron job scheduled to run sync.js at 7 AM, noon, and 4 PM from Monday through Friday, and midnight every day.');
