#!/usr/bin/env node

/**
 * Production Build Script
 * Builds the application for production deployment
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🏗️  Building LifeLog for production...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
  console.log('✅ Clean completed');
} catch (error) {
  console.log('⚠️  Clean step had issues (continuing...)');
}

// Run type checking
console.log('\n🔍 Running type checks...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking passed');
} catch (error) {
  console.error('❌ Type checking failed:', error.message);
  process.exit(1);
}

// Run linting
console.log('\n🧹 Running linting...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.error('❌ Linting failed:', error.message);
  console.log('💡 Run "npm run lint:fix" to auto-fix issues');
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm run test', { stdio: 'inherit' });
  console.log('✅ All tests passed');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}

// Build applications
console.log('\n🏗️  Building applications...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Verify build outputs
const buildPaths = ['frontend/dist', 'backend/dist'];

console.log('\n📋 Verifying build outputs...');
buildPaths.forEach(buildPath => {
  if (fs.existsSync(buildPath)) {
    const stats = fs.statSync(buildPath);
    console.log(
      `✅ ${buildPath} exists (${stats.isDirectory() ? 'directory' : 'file'})`
    );
  } else {
    console.log(`❌ ${buildPath} not found`);
  }
});

console.log('\n🎉 Production build complete!');
console.log('\n📦 Build artifacts:');
console.log('  frontend/dist/ - Frontend static files');
console.log('  backend/dist/  - Backend compiled JavaScript');
console.log('\n🚀 Ready for deployment!');
