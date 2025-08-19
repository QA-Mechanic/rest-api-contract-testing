require('dotenv').config();
const fs = require('fs');
const https = require('https');
const path = require('path');

console.log('🚀 Publishing Pact contracts via HTTP...');

const config = {
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  token: process.env.PACT_BROKER_TOKEN,
  consumerName: process.env.CONSUMER_NAME,
  providerName: process.env.PROVIDER_NAME,
  version: process.env.CONSUMER_VERSION || 'default-version'
};

// Display configuration clearly
console.log('📋 Publishing Configuration:');
console.log(`   Consumer: ${config.consumerName}`);
console.log(`   Provider: ${config.providerName}`);
console.log(`   Version: ${config.version} ${process.env.CONSUMER_VERSION ? '(from env)' : '(default)'}`);
console.log(`   Broker: ${config.pactBrokerUrl}`);
console.log('');

async function publishPacts() {
  try {
    const pactsDir = './pacts';
    const pactFiles = fs.readdirSync(pactsDir).filter(f => f.endsWith('.json'));
    
    console.log(`📄 Found ${pactFiles.length} pact file(s): ${pactFiles.join(', ')}`);
    console.log(`🔢 All contracts will be published with version: ${config.version}`);
    console.log('');

    for (const file of pactFiles) {
      console.log(`📤 Publishing ${file} with version ${config.version}...`);
      const pactContent = fs.readFileSync(path.join(pactsDir, file), 'utf8');
      const url = `${config.pactBrokerUrl}/pacts/provider/${config.providerName}/consumer/${config.consumerName}/version/${config.version}`;
      
      await uploadPact(url, pactContent, config.token);
      console.log(`✅ ${file} published successfully with version ${config.version}`);
    }

    console.log('');
    console.log('🎉 All contracts published successfully!');
    console.log(`🏷️  Consumer version: ${config.version}`);
    console.log('🔗 Check your Pactflow dashboard to verify contracts');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    process.exit(1);
  }
}

function uploadPact(url, data, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Connection': 'close'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000);
    req.write(data);
    req.end();
  });
}

publishPacts();
