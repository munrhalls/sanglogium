import { execSync } from 'child_process';

// Get all commits with author and numstat
const raw = execSync('git log --all --pretty=format:"AUTHOR|%an" --numstat --no-merges', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

const lines = raw.split('\n');
const stats = {};
let currentAuthor = null;

for (const line of lines) {
  if (line.startsWith('AUTHOR|')) {
    currentAuthor = line.split('|')[1].trim();
    if (!stats[currentAuthor]) stats[currentAuthor] = { added: 0, removed: 0, files: new Set(), commits: 0 };
    stats[currentAuthor].commits++;
    continue;
  }
  const parts = line.trim().split('\t');
  if (parts.length >= 3 && currentAuthor) {
    const added = parts[0] === '-' ? 0 : parseInt(parts[0], 10);
    const removed = parts[1] === '-' ? 0 : parseInt(parts[1], 10);
    const file = parts[2];
    if (!isNaN(added)) stats[currentAuthor].added += added;
    if (!isNaN(removed)) stats[currentAuthor].removed += removed;
    stats[currentAuthor].files.add(file);
  }
}

// Total lines in codebase (current)
const totalLines = execSync('git ls-files | findstr /v "package-lock" | findstr /v ".jsonl"', { encoding: 'utf-8' })
  .trim().split('\n')
  .filter(f => f.trim() && !f.includes('package-lock') && !f.includes('.jsonl'));

let totalCodebaseLines = 0;
const fileLineCounts = {};
for (const f of totalLines) {
  try {
    const count = parseInt(execSync(`wc -l "${f}" 2>nul || echo 0`, { encoding: 'utf-8' }).trim().split(/\s+/)[0], 10);
    if (!isNaN(count)) { totalCodebaseLines += count; fileLineCounts[f.trim()] = count; }
  } catch {}
}

console.log('=== GIT AUTHOR STATS ===\n');
console.log('Author | Commits | Lines Added | Lines Removed | Files Touched');
console.log('-'.repeat(80));
for (const [author, s] of Object.entries(stats)) {
  console.log(`${author} | ${s.commits} | ${s.added} | ${s.removed} | ${s.files.size}`);
}

console.log(`\n=== CURRENT CODEBASE ===`);
console.log(`Total tracked files (excl lock/jsonl): ${totalLines.length}`);
console.log(`Total lines: ${totalCodebaseLines}`);

// Blame-based attribution: who authored current lines
console.log('\n=== LINE AUTHORSHIP (git blame) ===');
const blameStats = {};
for (const f of totalLines) {
  try {
    const blame = execSync(`git blame --line-porcelain "${f}" 2>nul`, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
    for (const line of blame.split('\n')) {
      if (line.startsWith('author ')) {
        const author = line.substring(7).trim();
        if (!blameStats[author]) blameStats[author] = 0;
        blameStats[author]++;
      }
    }
  } catch {}
}

console.log('\nAuthor | Current Lines Authored | % of Codebase');
console.log('-'.repeat(80));
const totalBlamed = Object.values(blameStats).reduce((a, b) => a + b, 0);
for (const [author, count] of Object.entries(blameStats).sort((a, b) => b[1] - a[1])) {
  const pct = ((count / totalBlamed) * 100).toFixed(1);
  console.log(`${author} | ${count} | ${pct}%`);
}
