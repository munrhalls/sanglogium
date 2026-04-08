import { execSync } from "child_process";

interface TestResult {
  name: string;
  passed: number;
  total: number;
  duration: number;
  success: boolean;
  error?: string;
}

function runTestFile(testFile: string): TestResult {
  const startTime = Date.now();
  
  try {
    const output = execSync(`node ${testFile}`, { 
      encoding: "utf8", 
      stdio: "pipe",
      cwd: process.cwd() 
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Parse output to count passed tests
    const lines = output.split('\n');
    const passedLines = lines.filter(line => line.includes('✅ Test'));
    const passed = passedLines.length;
    
    // Determine total tests based on file
    let total = 0;
    if (testFile.includes('data-integrity')) total = 4;
    else if (testFile.includes('slug-resolution')) total = 8;
    else if (testFile.includes('descendant-unrolling')) total = 8;
    else if (testFile.includes('groq-parameter')) total = 8;
    
    return {
      name: testFile.split('/').pop()?.replace('.test.ts', '') || testFile,
      passed,
      total,
      duration,
      success: true
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      name: testFile.split('/').pop()?.replace('.test.ts', '') || testFile,
      passed: 0,
      total: 1,
      duration,
      success: false,
      error: (error as Error).message
    };
  }
}

function printResults(results: TestResult[]) {
  console.log("\n🧪 Catalogue VFS Test Suite");
  console.log("==========================");
  
  let totalPassed = 0;
  let totalTests = 0;
  let totalDuration = 0;
  
  results.forEach(result => {
    const status = result.success ? "✅" : "❌";
    const passedCount = `${result.passed}/${result.total}`;
    const padding = 20 - result.name.length;
    const spaces = " ".repeat(Math.max(0, padding));
    
    console.log(`${status} ${result.name}:${spaces}${passedCount} passed`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    totalPassed += result.passed;
    totalTests += result.total;
    totalDuration += result.duration;
  });
  
  console.log("==========================");
  const overallStatus = results.every(r => r.success) ? "✅" : "❌";
  console.log(`${overallStatus} Total: ${totalPassed}/${totalTests} passed (${totalDuration}ms)`);
  
  if (results.every(r => r.success)) {
    console.log("\n🎉 All VFS tests passed! Catalogue system is working correctly.");
  } else {
    console.log("\n💥 Some VFS tests failed! Check the errors above.");
  }
}

function main() {
  const startTime = Date.now();
  
  console.log("🚀 Starting Catalogue VFS Test Suite...");
  
  const testFiles = [
    "tests/unit/vfs/data-integrity.test.ts",
    "tests/unit/vfs/slug-resolution.test.ts", 
    "tests/unit/vfs/descendant-unrolling.test.ts",
    "tests/unit/vfs/groq-parameter.test.ts"
  ];
  
  const results = testFiles.map(runTestFile);
  
  printResults(results);
  
  const overallSuccess = results.every(r => r.success);
  
  if (!overallSuccess) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error("❌ Test runner failed:", (error as Error).message);
  process.exit(1);
}
