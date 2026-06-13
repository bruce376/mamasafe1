
require('dotenv').config();
const { snapshotDownload } = require('@huggingface/hub');
const path = require('path');
const fs = require('fs');

async function downloadModel(modelName, localDirName) {
    const localDir = path.join(__dirname, 'models', localDirName);
    const hfToken = process.env.HUGGING_FACE_HUB_TOKEN;

    console.log(`🚀 Downloading model: ${modelName}`);
    console.log(`📁 Saving to: ${localDir}`);
    console.log(`🔑 Using Hugging Face token: ${hfToken ? '✅ Available' : '❌ Missing'}\n`);

    try {
        await snapshotDownload({
            repo: modelName,
            localDir: localDir,
            localDirUseSymlinks: 'auto',
            hubToken: hfToken,
            progressCallback: (progress) => {
                if (progress.numFilesDone % 5 === 0 || progress.numFilesTotal === progress.numFilesDone) {
                    console.log(`📥 Downloaded ${progress.numFilesDone}/${progress.numFilesTotal} files (${(progress.completedSize / (1024*1024)).toFixed(2)} MB)`);
                }
            }
        });

        console.log('\n🎉 Download complete!');
        console.log(`Model is ready at: ${localDir}`);
        return true;
    } catch (error) {
        console.error('\n❌ Error downloading model:', error.message);
        if (error.message.includes('401') || error.message.includes('access')) {
            console.log('⚠️ Make sure your Hugging Face account has access to this model!');
        }
        return false;
    }
}

async function main() {
    console.log('🧪 First testing with a small public model to verify setup...\n');

    // First download tiny test model
    const testSuccess = await downloadModel(
        'distilbert/distilbert-base-uncased-finetuned-sst-2-english',
        'distilbert-test'
    );

    if (testSuccess) {
        console.log('\n' + '='.repeat(60));
        console.log('🧪 Test download successful! Now let\'s try Llama-2 model...');
        console.log('='.repeat(60) + '\n');

        // Now try Llama model
        await downloadModel(
            'meta-llama/Llama-2-7b-chat-hf',
            'llama-2-7b-chat-hf'
        );
    }
}

main();
