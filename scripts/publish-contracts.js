const { Publisher } = require('@pact-foundation/pact-node');
const dotenv = require('dotenv');
dotenv.config({ debug: true });


// Add debug logging
const result = dotenv.config({ debug: true });

console.log('Dotenv result:', result);

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Parsed variables:', result.parsed);
}

// Check if variables are actually loaded
console.log('PACT_BROKER_BASE_URL:', process.env.PACT_BROKER_BASE_URL);
console.log('PACT_BROKER_TOKEN:', process.env.PACT_BROKER_TOKEN);


const opts = {
  pactFilesOrDirs: ['./pacts'],
  pactBroker: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  consumerVersion: process.env.CONSUMER_VERSION || '1.0.0',
  branch: process.env.GIT_BRANCH || 'main',
  tags: ['main', 'latest']
};

const publisher = new Publisher(opts);

publisher
  .publish()
  .then(() => {
    console.log('✅ Pact contracts published successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to publish pact contracts:', error);
    process.exit(1);
  });
