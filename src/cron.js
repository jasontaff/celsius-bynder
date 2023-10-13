const cron = require('node-cron');
const { exec } = require('child_process');

// Define the schedule for the cron job (12 AM and 12 PM every day)
const schedule = '0 0,12 * * *';

// Define the command to run the sync.js file
const command = 'node sync.js';

// Create the cron job
cron.schedule(schedule, () => {
  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing the command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }
    console.log(`Command output: ${stdout}`);
  });
});

console.log('Cron job scheduled to run sync.js at 12 AM and 12 PM every day.');
