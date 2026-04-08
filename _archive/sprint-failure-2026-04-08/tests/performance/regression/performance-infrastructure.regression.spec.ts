import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Performance Infrastructure Regression Containment Tests
 * 
 * These tests ensure that the performance testing infrastructure
 * itself remains intact and functional. Run before and after
 * any performance-related changes.
 */

test.describe('Performance Infrastructure Regression Containment', () => {
  
  test('Lighthouse config is valid and contains required assertions', async () => {
    const configPath = path.join(process.cwd(), 'lighthouserc.js');
    const configExists = fs.existsSync(configPath);
    expect(configExists).toBe(true);
    
    const config = fs.readFileSync(configPath, 'utf8');
    
    // Verify required assertions are present
    expect(config).toContain('largest-contentful-paint');
    expect(config).toContain('server-response-time');
    expect(config).toContain('cumulative-layout-shift');
    expect(config).toContain('categories:performance');
  });

  test('Existing performance tests are present', async () => {
    const testPath = path.join(process.cwd(), 'tests', 'performance', 'homepage-budget.spec.ts');
    const testsExist = fs.existsSync(testPath);
    expect(testsExist).toBe(true);
  });

  test('Bundle analyzer is configured in next.config.ts', async () => {
    const configPath = path.join(process.cwd(), 'next.config.ts');
    const config = fs.readFileSync(configPath, 'utf8');
    
    expect(config).toContain('@next/bundle-analyzer');
    expect(config).toContain('ANALYZE');
  });

  test('Web Vitals component exists', async () => {
    const componentPath = path.join(process.cwd(), 'app', 'components', 'analytics', 'WebVitals.tsx');
    const componentExists = fs.existsSync(componentPath);
    expect(componentExists).toBe(true);
  });

  test('New performance test files exist', async () => {
    const basePath = path.join(process.cwd(), 'tests', 'performance');
    
    expect(fs.existsSync(path.join(basePath, 'web-vitals.spec.ts'))).toBe(true);
    expect(fs.existsSync(path.join(basePath, 'core-web-vitals.spec.ts'))).toBe(true);
    expect(fs.existsSync(path.join(basePath, 'api-efficiency.spec.ts'))).toBe(true);
    expect(fs.existsSync(path.join(basePath, 'BUDGETS.md'))).toBe(true);
  });

  test('Lighthouse CI workflow exists', async () => {
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'lighthouse-ci.yml');
    const workflowExists = fs.existsSync(workflowPath);
    expect(workflowExists).toBe(true);
  });
});
