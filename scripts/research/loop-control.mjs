#!/usr/bin/env node
/**
 * Loop Control CLI — Control Interface for Research Loop
 *
 * Purpose: Send control signals to the continuous research loop
 * Commands: pause, resume, focus, status
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const CONTROL_DIR = path.join(ROOT, '../_archived_sanglogium', 'research');

const SIGNAL_FILES = {
  pause: path.join(CONTROL_DIR, '.pause'),
  resume: path.join(CONTROL_DIR, '.resume'),
  focus: path.join(CONTROL_DIR, '.focus')
};

const RESEARCH_DIMENSIONS = [
  'design-system-compliance',
  'component-completeness',
  'data-integrity',
  'groq-query-optimization',
  'test-coverage-gaps',
  'performance-bottlenecks',
  'accessibility-compliance',
  'seo-optimization',
  'security-hardening',
  'documentation-gaps'
];

async function sendPauseSignal() {
  try {
    await fs.mkdir(CONTROL_DIR, { recursive: true });
    await fs.writeFile(SIGNAL_FILES.pause, '', 'utf-8');
    console.log('⏸️  Pause signal sent');
    console.log('   The loop will skip the next iteration.');
  } catch (error) {
    console.error('❌ Failed to send pause signal:', error);
    process.exit(1);
  }
}

async function sendResumeSignal() {
  try {
    await fs.mkdir(CONTROL_DIR, { recursive: true });

    // Remove pause signal if exists
    try {
      await fs.unlink(SIGNAL_FILES.pause);
    } catch {
      // File doesn't exist, ignore
    }

    // Send resume signal
    await fs.writeFile(SIGNAL_FILES.resume, '', 'utf-8');
    console.log('▶️  Resume signal sent');
    console.log('   The loop will resume normal operation.');
  } catch (error) {
    console.error('❌ Failed to send resume signal:', error);
    process.exit(1);
  }
}

async function sendFocusSignal(dimension) {
  if (!RESEARCH_DIMENSIONS.includes(dimension)) {
    console.error(`❌ Invalid dimension: ${dimension}`);
    console.log('\nValid dimensions:');
    RESEARCH_DIMENSIONS.forEach(d => console.log(`  - ${d}`));
    process.exit(1);
  }

  try {
    await fs.mkdir(CONTROL_DIR, { recursive: true });
    await fs.writeFile(SIGNAL_FILES.focus, dimension, 'utf-8');
    console.log(`🎯 Focus signal sent: ${dimension}`);
    console.log('   The next iteration will focus on this dimension.');
  } catch (error) {
    console.error('❌ Failed to send focus signal:', error);
    process.exit(1);
  }
}

async function clearFocusSignal() {
  try {
    await fs.unlink(SIGNAL_FILES.focus);
    console.log('🎯 Focus signal cleared');
    console.log('   Loop will return to normal prioritization.');
  } catch {
    console.log('ℹ️  No focus signal to clear');
  }
}

async function getStatus() {
  try {
    const status = {
      paused: false,
      focused: false,
      focusDimension: null
    };

    try {
      await fs.access(SIGNAL_FILES.pause);
      status.paused = true;
    } catch {
      // Not paused
    }

    try {
      const focusContent = await fs.readFile(SIGNAL_FILES.focus, 'utf-8');
      status.focused = true;
      status.focusDimension = focusContent.trim();
    } catch {
      // No focus
    }

    console.log('📊 Research Loop Status\n');
    console.log(`Paused: ${status.paused ? '⏸️  Yes' : '▶️  No'}`);
    console.log(`Focused: ${status.focused ? `🎯 ${status.focusDimension}` : '❌ No'}`);

    if (!status.paused && !status.focused) {
      console.log('\n✅ Loop is running normally');
    }

  } catch (error) {
    console.error('❌ Failed to get status:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔬 Research Loop Control CLI

Usage:
  node loop-control.mjs <command> [options]

Commands:
  pause              Pause the research loop
  resume             Resume the research loop
  focus <dimension>  Focus on a specific dimension
  unfocus            Clear focus signal
  status             Check loop status
  help               Show this help message

Dimensions:
  ${RESEARCH_DIMENSIONS.join('\n  ')}

Examples:
  node loop-control.mjs pause
  node loop-control.mjs focus data-integrity
  node loop-control.mjs status
`);
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'pause':
    await sendPauseSignal();
    break;

  case 'resume':
    await sendResumeSignal();
    break;

  case 'focus':
    if (!arg) {
      console.error('❌ Missing dimension argument');
      showHelp();
      process.exit(1);
    }
    await sendFocusSignal(arg);
    break;

  case 'unfocus':
    await clearFocusSignal();
    break;

  case 'status':
    await getStatus();
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
