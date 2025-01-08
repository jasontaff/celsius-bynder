require('dotenv').config({path: '../.env'})
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.KEY,
  secretAccessKey: process.env.SECRET, 
  region: 'us-east-1',
});


const ses = new AWS.SES();

const sendEmail = async () => {
  const params = {
    Source: 'jason.dion.taff@gmail.com', 
    Destination: {
      ToAddresses: ['jason.dion.taff@gmail.com'], 
    },
    Message: {
      Subject: {
        Data: 'Test Email from AWS SES',
      },
      Body: {
        Text: {
          Data: 'This is a test email sent from AWS SES using Node.js!',
        },
        // Optional: Add HTML body
        Html: {
          Data: '<p>This is a test email sent from <strong>AWS SES</strong> using Node.js!</p>',
        },
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


sendEmail();
