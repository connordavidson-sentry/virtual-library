#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const RELEASE = `virtual-library@${require('../package.json').version}`;
const BUILD_DIR = path.join(__dirname, '../build');
const ORG = 'vlib';
const PROJECT = 'javascript-react';

console.log('📦 Uploading source maps to Sentry...');
console.log(`Release: ${RELEASE}`);
console.log(`Org: ${ORG}`);
console.log(`Project: ${PROJECT}`);

try {
  // Inject Debug IDs into built files
  console.log('Injecting Debug IDs...');
  execSync(
    `npx sentry-cli sourcemaps inject "${BUILD_DIR}/static/js"`,
    { stdio: 'inherit' }
  );

  // Create a release in Sentry
  console.log('Creating release...');
  execSync(
    `npx sentry-cli releases --org ${ORG} --project ${PROJECT} new ${RELEASE}`,
    { stdio: 'inherit' }
  );

  // Upload source maps
  console.log('Uploading source maps...');
  execSync(
    `npx sentry-cli sourcemaps upload --org ${ORG} --project ${PROJECT} --release ${RELEASE} --validate "${BUILD_DIR}/static/js" --url-prefix "~/static/js"`,
    { stdio: 'inherit' }
  );

  // Finalize the release
  console.log('Finalizing release...');
  execSync(
    `npx sentry-cli releases --org ${ORG} --project ${PROJECT} finalize ${RELEASE}`,
    { stdio: 'inherit' }
  );

  console.log('✅ Source maps uploaded successfully!');
} catch (error) {
  console.error('❌ Failed to upload source maps:', error.message);
  process.exit(1);
}
