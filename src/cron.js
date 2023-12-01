const cron = require('node-cron');
const { spawn } = require('child_process');

// Define the schedule for the cron job (7 AM, noon, and 4 PM Monday through Friday, and midnight every day)
const schedule = '0 7,12,16 * * 1-5,0';

// Create the cron job
cron.schedule(schedule, () => {
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
    if (code === 0) {
      console.log('sync.js executed successfully.');
    } else {
      console.error(`sync.js execution failed with code ${code}.`);
    }
  });
});

console.log('Cron job scheduled to run sync.js at 7 AM, noon, and 4 PM from Monday through Friday, and midnight every day.');
