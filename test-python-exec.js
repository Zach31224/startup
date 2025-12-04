// Quick test of Python execution
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testPythonExecution() {
  const code = 'print("Hello, World!")';
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `python_test_${Date.now()}.py`);
  
  try {
    await fs.writeFile(tempFile, code, 'utf8');
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      const pythonProcess = spawn('python', [tempFile]);
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', async (code) => {
        await fs.unlink(tempFile);
        
        if (code === 0) {
          console.log('✅ Python execution successful!');
          console.log('Output:', stdout);
          resolve(true);
        } else {
          console.log('❌ Python execution failed');
          console.log('Error:', stderr);
          resolve(false);
        }
      });
      
      pythonProcess.on('error', async (err) => {
        await fs.unlink(tempFile);
        console.log('❌ Failed to start Python:', err.message);
        resolve(false);
      });
    });
  } catch (error) {
    console.log('❌ Test error:', error.message);
    return false;
  }
}

testPythonExecution().then(() => {
  console.log('\nTest complete!');
  process.exit(0);
});
