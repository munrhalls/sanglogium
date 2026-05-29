import { readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';

async function getDirSize(dirPath) {
  let total = 0;
  try {
    const entries = await readdir(dirPath, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        try {
          const s = await stat(join(entry.parentPath || dirPath, entry.name));
          total += s.size;
        } catch {}
      }
    }
  } catch {}
  return total;
}

// Simpler approach - just scan direct subdirs
async function scanDir(dirPath, minSizeMB = 100) {
  const results = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = join(dirPath, entry.name);
        const size = await getDirSize(fullPath);
        if (size > minSizeMB * 1024 * 1024) {
          results.push({ name: entry.name, sizeGB: (size / (1024 * 1024 * 1024)).toFixed(2), path: fullPath });
        }
      }
    }
  } catch {}
  return results.sort((a, b) => parseFloat(b.sizeGB) - parseFloat(a.sizeGB));
}

async function scanFileTypes(dirPath, exts) {
  const results = [];
  for (const ext of exts) {
    let count = 0;
    let size = 0;
    try {
      const entries = await readdir(dirPath, { withFileTypes: true, recursive: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().endsWith(ext.replace('*', ''))) {
          try {
            const s = await stat(join(entry.parentPath || dirPath, entry.name));
            size += s.size;
            count++;
          } catch {}
        }
      }
    } catch {}
    if (size > 0) {
      results.push({ ext, count, sizeGB: (size / (1024 * 1024 * 1024)).toFixed(2) });
    }
  }
  return results.sort((a, b) => parseFloat(b.sizeGB) - parseFloat(a.sizeGB));
}

const output = [];

// Top-level C: folders
output.push('=== C: DRIVE TOP-LEVEL FOLDERS (excluding system) ===');
const topLevel = await scanDir('C:\\', 100);
for (const r of topLevel) {
  if (!['Windows','$Recycle.Bin','ProgramData','System Volume Information','Config.Msi','Recovery','sang-logium'].includes(r.name)) {
    output.push(`${r.sizeGB.toString().padStart(8)} GB  C:\\\\${r.name}`);
  }
}

// Users\janpi breakdown
output.push('');
output.push('=== USERS\\\\JANPI BREAKDOWN ===');
const userFolders = ['OneDrive','Downloads','Documents','Desktop','AppData','Pictures','Videos','Music'];
for (const f of userFolders) {
  const p = join('C:\\Users\\janpi', f);
  const size = await getDirSize(p);
  if (size > 0) {
    output.push(`${(size / (1024 * 1024 * 1024)).toFixed(2).padStart(8)} GB  Users\\janpi\\${f}`);
  }
}

// AppData breakdown
output.push('');
output.push('=== APPDATA BREAKDOWN ===');
for (const f of ['Local','LocalLow','Roaming']) {
  const p = join('C:\\Users\\janpi\\AppData', f);
  const size = await getDirSize(p);
  output.push(`${(size / (1024 * 1024 * 1024)).toFixed(2).padStart(8)} GB  AppData\\${f}`);
}

// AppData\Local big folders
output.push('');
output.push('=== APPDATA\\LOCAL BIG FOLDERS (>500MB) ===');
const localBig = await scanDir('C:\\Users\\janpi\\AppData\\Local', 500);
for (const r of localBig) {
  output.push(`${r.sizeGB.toString().padStart(8)} GB  AppData\\Local\\${r.name}`);
}

// Downloads file types
output.push('');
output.push('=== DOWNLOADS FILE TYPES ===');
const dlTypes = await scanFileTypes('C:\\Users\\janpi\\Downloads', ['.zip','.exe','.msi','.iso','.rar','.7z']);
for (const r of dlTypes) {
  output.push(`${r.sizeGB.toString().padStart(8)} GB  ${String(r.count).padStart(4)} files  ${r.ext}`);
}

// Program Files big apps
output.push('');
output.push('=== PROGRAM FILES BIG APPS (>1GB) ===');
const pfBig = await scanDir('C:\\Program Files', 1000);
for (const r of pfBig) {
  output.push(`${r.sizeGB.toString().padStart(8)} GB  Program Files\\${r.name}`);
}

// Program Files (x86) big apps
output.push('');
output.push('=== PROGRAM FILES (x86) BIG APPS (>1GB) ===');
const pfx86Big = await scanDir('C:\\Program Files (x86)', 1000);
for (const r of pfx86Big) {
  output.push(`${r.sizeGB.toString().padStart(8)} GB  Program Files (x86)\\${r.name}`);
}

await writeFile('C:\\webdev\\sang-logium\\scripts\\scan-outside-results.txt', output.join('\n'), 'utf-8');
console.log('Results saved to scan-outside-results.txt');
