const { spawnSync } = require('child_process');
const path = require('path');

const filesToCheck = [
  'backend/server.js',
  'backend/index.js',
  'backend/middleware/auth.js',
  'backend/middleware/localAuth.js',
  'backend/services/coursesAI.js',
  'backend/services/groqChatbot.js',
  'backend/services/healthChatbot.js',
  'backend/services/localHealthChatbot.js',
  'backend/services/pregnancyDownloadedDatasets.js',
  'backend/services/pregnancyRag.js',
  'backend/services/universalGroqAI.js',
  'backend/services/vertexChatbot.js',
  'backend/scripts/seed-pregnancy-downloaded-datasets.js',
  'frontend/js/config/api-config.js',
  'frontend/js/services/api-service.js',
  'frontend/js/services/db-sync.js',
  'frontend/js/services/hosted-api-fallback.js',
  'frontend/js/features/pregnancy-neon.js',
  'frontend/js/features/pregnancy-rag.js',
  'frontend/js/features/pregnancy-advanced.js',
  'frontend/js/features/courses-ui.js',
  'frontend/script-new.js',
  'frontend/courses-functions.js'
];

let failed = false;

for (const file of filesToCheck) {
  const fullPath = path.join(process.cwd(), file);
  const result = spawnSync(process.execPath, ['--check', fullPath], {
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`CI syntax check passed for ${filesToCheck.length} files.`);
