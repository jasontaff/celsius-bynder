console.log('Test script started');

let count = 0;
const interval = setInterval(() => {
  console.log('Count:', count);
  count++;
}, 1000);

setTimeout(() => {
  clearInterval(interval);
  console.log('Test script stopped');
}, 5000);
