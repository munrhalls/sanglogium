const fs = require('fs');
const path = require('path');

const LOCK_DIR = path.join(process.cwd(), '.windsurf');
const LOCK_FILE = path.join(LOCK_DIR, 'locks.json');
const STALE_TIMEOUT_MS = 45 * 60 * 1000;

function initStore() {
    if (!fs.existsSync(LOCK_DIR)) fs.mkdirSync(LOCK_DIR, { recursive: true });
    if (!fs.existsSync(LOCK_FILE)) fs.writeFileSync(LOCK_FILE, JSON.stringify({}));
}

function getLocks() {
    initStore();
    try { return JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8')); }
    catch (error) { return {}; }
}

function saveLocks(locks) {
    fs.writeFileSync(LOCK_FILE, JSON.stringify(locks, null, 2));
}

function claim(filepath, agentId) {
    const locks = getLocks();
    const now = Date.now();
    const existingLock = locks[filepath];

    if (existingLock && existingLock.agentId !== agentId) {
        if (now - existingLock.timestamp > STALE_TIMEOUT_MS) {
            console.log(`[WARN] Overriding stale lock on ${filepath} from ${existingLock.agentId}`);
        } else {
            console.error(`[ERROR] File ${filepath} is currently locked by ${existingLock.agentId}`);
            process.exit(1);
        }
    }

    locks[filepath] = { agentId, timestamp: now };
    saveLocks(locks);
    console.log(`[SUCCESS] ${agentId} claimed ${filepath}`);
}

function release(filepath, agentId) {
    const locks = getLocks();
    const existingLock = locks[filepath];

    if (!existingLock) {
        console.log(`[INFO] No active lock found for ${filepath}`);
        return;
    }

    if (existingLock.agentId !== agentId) {
        console.error(`[ERROR] Cannot release ${filepath}. Locked by ${existingLock.agentId}`);
        process.exit(1);
    }

    delete locks[filepath];
    saveLocks(locks);
    console.log(`[SUCCESS] ${agentId} released ${filepath}`);
}

const [,, action, targetFile, agentName] = process.argv;

if (!action || !targetFile || !agentName) {
    console.error("Usage: node scripts/mutex.js <claim|release> <filepath> <agent_id>");
    process.exit(1);
}

if (action === 'claim') claim(targetFile, agentName);
else if (action === 'release') release(targetFile, agentName);
else console.error("Unknown action. Use 'claim' or 'release'.");
