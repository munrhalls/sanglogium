# Migration Process Pattern

## Purpose
Break down complex unknown tasks into incremental, systematic phases that build on each other.

## Pattern

### Phase 1: Discovery
- Gather intelligence on the unknown problem
- Identify data sources and constraints
- Document requirements clearly

### Phase 2: Mapping
- Create ID-to-path mappings from source data
- Build transformation rules
- Validate mappings against source

### Phase 3: Transformation
- Apply mappings to source data
- Remove deprecated fields
- Add new fields in target format

### Phase 4: Schema Update
- Update schema to accept new fields
- Follow API specifications exactly
- Add validation and defaults

### Phase 5: Migration Script
- Write migration script using existing patterns
- Dry run on small subset for verification
- Execute full migration with error handling

## Rules
1. Never assume - always verify data structures first
2. Each phase must complete before starting next
3. Dry run before full execution
4. Preserve existing data (additive changes)
5. Log everything for debugging
