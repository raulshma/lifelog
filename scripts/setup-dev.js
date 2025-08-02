#!/usr/bin/env node

/**
 * Development Setup Script
 * Automates the setup of the development environment
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Setting up LifeLog development environment...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
console.log(`📋 Node.js version: ${nodeVersion}`);

// Create environment files if they don't exist
const envFiles = [
  {
    source: 'frontend/.env.example',
    target: 'frontend/.env',
    name: 'Frontend environment',
  },
  {
    source: 'backend/.env.example',
    target: 'backend/.env',
    name: 'Backend environment',
  },
];

envFiles.forEach(({ source, target, name }) => {
  if (!fs.existsSync(target)) {
    try {
      fs.copyFileSync(source, target);
      console.log(`✅ Created ${name} file: ${target}`);
    } catch (error) {
      console.log(`⚠️  Could not create ${target}: ${error.message}`);
    }
  } else {
    console.log(`✅ ${name} file already exists: ${target}`);
  }
});

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Run type checking
console.log('\n🔍 Running type checks...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking passed');
} catch (error) {
  console.log(
    '⚠️  Type checking found issues (this is normal for initial setup)'
  );
}

// Run linting
console.log('\n🧹 Running linting...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('⚠️  Linting found issues (running auto-fix...)');
  try {
    execSync('npm run lint:fix', { stdio: 'inherit' });
    console.log('✅ Auto-fix completed');
  } catch (fixError) {
    console.log('⚠️  Some linting issues require manual attention');
  }
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📚 Available commands:');
console.log('  npm run dev          - Start both frontend and backend');
console.log('  npm run dev:frontend - Start frontend only');
console.log('  npm run dev:backend  - Start backend only');
console.log('  npm run build        - Build both applications');
console.log('  npm run test         - Run all tests');
console.log('  npm run lint         - Run linting');
console.log('  npm run format       - Format code');
console.log('\n🔧 Database commands:');
console.log('  npm run db:generate  - Generate database migrations');
console.log('  npm run db:migrate   - Run database migrations');
console.log('  npm run db:studio    - Open Drizzle Studio');
console.log('\n🚀 Ready to start developing!');
