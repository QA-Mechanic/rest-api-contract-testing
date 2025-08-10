const { Verifier } = require('@pact-foundation/pact');
require('dotenv').config();

const opts = {
  provider: 'jsonplaceholder-provider',
  providerBaseUrl: 'https://jsonplaceholder.typicode.com', // Reliable API
  
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  
  publishVerificationResult: true,
  providerVersion: process.env.PROVIDER_VERSION || '1.0.0',
  providerVersionBranch: process.env.GIT_BRANCH || 'main',
  
  consumerVersionSelectors: [
    { mainBranch: true },
    { deployedOrReleased: true }
  ],
  
  stateHandlers: {
    'posts exist': () => {
      console.log('State: Posts exist - JSONPlaceholder always has posts');
      return Promise.resolve();
    }
  }
};

describe('Provider Verification Tests', () => {
  it('should validate all consumer expectations against JSONPlaceholder API', () => {
    return new Verifier(opts)
      .verifyProvider()
      .then(output => {
        console.log('✅ Provider verification completed successfully!');
      })
      .catch(error => {
        console.error('❌ Provider verification failed:', error.message);
        throw error;
      });
  });
});
