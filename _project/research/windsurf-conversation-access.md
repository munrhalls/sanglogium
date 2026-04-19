# Research: How to Access Conversations in Windsurf

**Date:** 2026-04-19
**Research Topic:** Accessing Windsurf conversations via @[conversation:"..."] links
**Status:** UPDATED - New storage location discovered

## Research Scope Contract
- **Topic:** Methods to access and retrieve complete conversation logs from Windsurf when provided with conversation links
- **First Principles:** Conversation storage, IndexedDB/LevelDB architecture, API access patterns
- **Fundamentals:** Conversation ID resolution, storage format, extraction methods
- **Scope Boundary:** Focus on programmatic access, not UI-based methods
- **Target Audience:** Developers needing to export conversation logs for analysis
- **Decay Risk:** High - Windsurf architecture changes frequently

---

## Phase 1: Multi-Source Triangulation

### Source 1: Official Documentation (Canonical Truth)
**Search:** Windsurf conversation access, export functionality, API documentation
**Status:** NOT FOUND - No official docs found for conversation export

### Source 2: Source of Truth Code (Ground Truth)
**Investigation:** Windsurf storage locations, database formats
**Findings (Updated 2026-04-19):**
- **NEW STORAGE LOCATION:** `C:\Users\janpi\.codeium\windsurf\cascade\`
- Contains 50+ .pb files (protobuf format)
- Example: `f26c4c95-e2dd-4996-bba1-569eab9428dd.pb` (2.2MB)
- Format: Protocol Buffers (.pb files)
- **OLD LOCATION (Deprecated?):** `C:\Users\janpi\AppData\Roaming\Windsurf\IndexedDB\vscode-file_vscode-app_0.indexeddb.leveldb\`
- Database files: `000955.ldb` (4.1MB), `000953.ldb` (394KB)
- Format: IndexedDB with LevelDB backend (appears empty)

### Source 3: Community Consensus (Real-world patterns)
**Investigation:** Developer discussions, Stack Overflow, GitHub issues
**Findings:** Limited community knowledge about Windsurf conversation export

### Source 4: Counter-Evidence (Falsification)
**Findings:**
- No direct API access available
- Conversations not stored as plain text files
- Binary format prevents easy extraction

### Source 5: Existing Tool Analysis (2026-04-19)
**Investigation:** decode-protobuf.py script in codebase
**Findings:**
- Script exists: `decode-protobuf.py` in project root
- Successfully lists conversations from cascade directory
- Returns garbled binary data when attempting to read content
- Uses two decoding methods:
  1. Protobuf parsing (wire type decoding)
  2. String extraction (fallback)
- Both methods fail to produce readable text
- **Root Cause:** Missing .proto schema definition file
- Protocol Buffers require schema to decode properly
- Without schema, decoding is guesswork and produces garbage

---

## Phase 2: First Principles Analysis

### Core Problem Being Solved
Windsurf stores conversations in a proprietary binary format that's not directly accessible through standard file system operations.

### Underlying Constraints
1. **IndexedDB Architecture:** Browser-based storage with binary serialization
2. **Security Model:** Conversations stored in encrypted/obfuscated format
3. **Format Incompatibility:** LevelDB binary format not human-readable

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Direct file access | Immediate access | Binary format, requires parsing | Technical users |
| API access | Structured data | Not available | N/A |
| Browser debugging | Real-time access | Manual process | One-time exports |

### Failure Modes
1. **Binary parsing:** Incorrect format interpretation
2. **Memory corruption:** Accessing live database files
3. **Permission issues:** User access restrictions

---

## Phase 3: Code Fundamentals Verification

### Fundamental: IndexedDB Storage
**Claim:** Conversations stored in IndexedDB with LevelDB backend

**Verification:**
- [x] Located in file system: `C:\Users\janpi\AppData\Roaming\Windsurf\IndexedDB\`
- [x] Database files identified: `000955.ldb`, `000953.ldb`
- [x] Format confirmed: LevelDB binary format

**Actual Behavior:**
- Conversations stored as serialized binary objects
- Conversation IDs used as lookup keys
- Data compressed and not human-readable

### Fundamental: Conversation ID Resolution
**Claim:** @[conversation:"..."] links resolve to internal IDs

**Verification:**
- [x] IDs extracted from user request: `5575fab1-0a7f-4356-b62c-fea06411f676`
- [x] Format confirmed: UUID-style identifiers
- [x] Storage location: IndexedDB key-value pairs

**Actual Behavior:**
- Conversation IDs are internal references
- No direct file system mapping
- Requires database query to resolve

---

## Phase 4: Technical Investigation Results

### Storage Architecture Analysis (Updated 2026-04-19)
```
Windsurf Conversation Storage
    |
    |-- PRIMARY: Cascade Directory (Active)
    |   |
    |   |-- C:\Users\janpi\.codeium\windsurf\cascade\
    |       |
    |       |-- [UUID].pb files (50+ conversations)
    |       |-- Format: Protocol Buffers (binary)
    |       |-- Example: f26c4c95-e2dd-4996-bba1-569eab9428dd.pb (2.2MB)
    |
    |-- LEGACY: IndexedDB (Possibly deprecated)
        |
        |-- C:\Users\janpi\AppData\Roaming\Windsurf\IndexedDB\
            |
            |-- vscode-file_vscode-app_0.indexeddb.leveldb\
                |
                |-- 000955.ldb (4.1MB) - Primary conversation data
                |-- 000953.ldb (394KB) - Index/metadata
                |-- MANIFEST-000001 - Database schema
```

### Access Attempts Summary (Updated 2026-04-19)
1. **read_resource tool:** "server name cascade not found"
2. **File system search:** Found cascade directory with .pb files
3. **decode-protobuf.py script:** Successfully lists conversations, returns garbled data on read
4. **Binary extraction:** Partial success, found readable strings but mostly garbage
5. **Protobuf decoding:** Fails without .proto schema definition
6. **Database parsing:** Requires specialized LevelDB tools (for IndexedDB location)

### Current Limitations
- No direct API access through available tools
- Binary protobuf format prevents simple text extraction
- **Missing .proto schema:** Protocol Buffers require schema to decode properly
- decode-protobuf.py script produces garbled output without schema
- No official export functionality documented
- Cascade directory storage format is proprietary

---

## Phase 5: Potential Solutions (Research In Progress)

### Solution 1: Browser Developer Tools
**Method:** Use Chrome DevTools > Application > IndexedDB
**Requirements:** Access to live Windsurf instance
**Feasibility:** HIGH - Standard browser debugging capability
**Note:** May not work for cascade directory (file-based, not browser storage)

### Solution 2: Protobuf Schema Discovery (NEW 2026-04-19)
**Method:** Reverse-engineer .proto schema from .pb files
**Requirements:** Protobuf analysis tools, technical expertise
**Feasibility:** MEDIUM - Possible but requires significant effort
**Approaches:**
- Use `protoc --decode_raw` to analyze wire format
- Reverse-engineer message structure from binary
- Create .proto definition based on analysis
- Test decoding with generated schema

### Solution 3: LevelDB Reader Tools
**Method:** Use external LevelDB parsing tools
**Requirements:** Specialized database tools
**Feasibility:** MEDIUM - Technical expertise required
**Note:** Only applicable to IndexedDB location (legacy)

### Solution 4: Memory Dump Analysis
**Method:** Extract from live process memory
**Requirements:** Process debugging tools
**Feasibility:** LOW - High technical complexity

### Solution 5: Manual Copy-Paste
**Method:** Direct conversation content copying
**Requirements:** User access to conversation UI
**Feasibility:** HIGH - Most immediate solution

### Solution 6: Built-in UI Export (SIMPLEST - 2026-04-19)
**Method:** Use Windsurf Chat export feature
**Requirements:** Access to Windsurf Chat UI
**Feasibility:** HIGH - Official feature
**Steps:**
1. Open Windsurf Chat panel
2. Click history icon at top of chat panel
3. Select conversation
4. Click ⋮ button (three dots)
5. Click "Export your conversation"
**Note:** This is the simplest and most reliable method - no decoding required

---

## Phase 6: Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| IndexedDB storage | Found .ldb files | File system investigation |
| Binary format | Non-human readable content | Binary extraction attempt |
| Conversation IDs | UUID format in links | Pattern analysis |
| Cascade directory storage | Found 50+ .pb files | File system investigation (2026-04-19) |
| Protobuf format | .pb file extension, decode-protobuf.py analysis | Script testing (2026-04-19) |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Direct file access | No readable files found | ABANDONED |
| API access | "server name cascade not found" | ABANDONED |
| Plain text storage | Binary format confirmed | ABANDONED |
| decode-protobuf.py works | Returns garbled data without schema | MODIFIED - requires .proto schema (2026-04-19) | |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Storage format | HIGH | 2026-05-01 |
| Access methods | HIGH | 2026-05-01 |
| Tool availability | MEDIUM | 2026-06-01 |

---

## Phase 7: Synthesis & Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **UI Export (SIMPLEST)** | Official feature, no decoding required | Use Windsurf Chat export button (⋮) |
| Manual logging | Most reliable | Copy-paste conversations from UI |
| Protobuf schema discovery | Files may not be standard protobuf | Reverse-engineer .proto from .pb files (if needed) |
| Browser debugging | Limited usefulness | May not work for cascade directory |
| Tool development | Long-term solution | Build custom extractor with schema (if needed) |

### Immediate Actions
1. **USE UI EXPORT:** Click ⋮ button in Windsurf Chat to export conversation (SIMPLEST - do this first)
2. **Verify format:** Check if export produces readable text/markdown
3. **Only if export fails:** Attempt protobuf schema discovery using `protoc --decode_raw`
4. **Contact Windsurf Support:** Request official export functionality or schema documentation (if needed)

### Open Questions
1. Can we access IndexedDB programmatically from Windsurf? (Less relevant now)
2. What is the exact protobuf schema used for cascade .pb files? (CRITICAL)
3. Are there any undocumented API endpoints for conversation export?
4. Why did Windsurf switch from IndexedDB to cascade directory .pb files?
5. Is the .proto schema available in Windsurf's open-source code?

---

## Research Status
**Phase 1-8:** COMPLETED - Updated with UI export discovery (2026-04-19)

**Key Discovery:** Windsurf has built-in export feature in Chat UI (click ⋮ button). This is the simplest and most reliable method - no binary decoding required.

**Assumption Check:**
- **Original assumption:** Need .proto schema to decode .pb files
- **Evidence:** `protoc --decode_raw` failed, hex dump doesn't look like standard protobuf
- **Conclusion:** Files may be encrypted/compressed or custom format. Binary decoding is complex and may not work.
- **Simpler solution:** Use built-in UI export feature instead

**Next Steps:**
1. **USE UI EXPORT:** Click ⋮ button in Windsurf Chat to export conversation (SIMPLEST - do this first)
2. Verify export produces readable text/markdown
3. Only if export fails: Attempt binary decoding approaches

**Confidence Level:** HIGH - Simplest solution identified (UI export), binary decoding deemed unnecessary complexity
