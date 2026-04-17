# Environment Variables Test Specification

## Test Overview
Tests the environment variable configuration system, ensuring proper validation, loading, and error handling.

## Test 1: Required Variables Validation

### Setup
- Application startup
- Missing required variables

### Test Steps
1. Remove GUEST_CHECKOUT_SANITY_PROJECT_ID
2. Start application
3. Verify error thrown immediately
4. Check error message mentions missing variable
5. Restore variable
6. Verify application starts

### Verification
- Missing required variables detected
- Clear error messages provided
- Application fails fast on misconfiguration

## Test 2: Variable Type Validation

### Setup
- Environment with invalid types
- Validation schema active

### Test Steps
1. Set GUEST_CHECKOUT_REDIS_PORT to "invalid" (string)
2. Start application
3. Verify type error thrown
4. Set to negative number
5. Verify range error thrown
6. Set to valid port number
7. Verify application starts

### Verification
- Type validation works
- Range validation enforced
- Proper error messages for invalid types

## Test 3: Default Values Loading

### Setup
- Application with optional variables missing
- Default values configured

### Test Steps
1. Remove GUEST_CHECKOUT_QUEUE_CONCURRENCY
2. Start application
3. Verify default value used (5)
4. Remove GUEST_CHECKOUT_RESERVATION_TTL
5. Verify default TTL used (600)
6. Check all optional defaults

### Verification
- Default values loaded correctly
- Missing optional variables handled
- Application runs with defaults

## Test 4: Environment-Specific Configuration

### Setup
- Multiple environment files
- NODE_ENV variations

### Test Steps
1. Set NODE_ENV=development
2. Load configuration
3. Verify development settings applied
4. Set NODE_ENV=production
5. Reload configuration
6. Verify production settings applied
7. Set NODE_ENV=test
8. Verify test settings applied

### Verification
- Environment-specific configs loaded
- Settings change per environment
- Correct defaults per environment

## Test 5: Security Variables Handling

### Setup
- Sensitive variables present
- Security validation enabled

### Test Steps
1. Set GUEST_CHECKOUT_STRIPE_SECRET_KEY
2. Verify key not logged
3. Check masking in error messages
4. Test with weak webhook secret
5. Verify security warning
6. Check secret strength validation

### Verification
- Secrets properly masked
- Security warnings for weak secrets
- No secret leakage in logs

## Test 6: Configuration Hot Reload

### Setup
- Application running
- File watching enabled

### Test Steps
1. Start application with initial config
2. Modify GUEST_CHECKOUT_LOG_LEVEL
3. Verify configuration reloads
4. Check new log level applied
5. Modify required variable
6. Verify validation error
7. Restore variable

### Verification
- Hot reload works for optional vars
- Required changes trigger validation
- Configuration updates applied

## Test 7: Invalid Variable Prefixes

### Setup
- Environment with wrong prefixes
- Prefix validation enabled

### Test Steps
1. Set SANITY_PROJECT_ID (wrong prefix)
2. Start application
3. Verify variable ignored
4. Set GUEST_CHECKOUT_SANITY_PROJECT_ID
5. Verify variable loaded
6. Test mixed prefixes

### Verification
- Only correct prefixes accepted
- Wrong prefixes ignored
- Clear documentation of correct prefixes

## Test 8: Configuration Schema Validation

### Setup
- Complex configuration object
- Joi schema validation

### Test Steps
1. Load valid configuration
2. Verify schema validation passes
3. Load configuration with nested errors
4. Verify detailed error messages
5. Test with partial configuration
6. Check missing nested fields

### Verification
- Schema validation comprehensive
- Error messages specific
- Nested validation works

## Test 9: Environment Variable Overrides

### Setup
- Multiple configuration sources
- Override order testing

### Test Steps
1. Set variable in .env file
2. Override in shell environment
3. Verify shell value wins
4. Test with Docker environment
5. Verify Docker overrides .env
6. Check precedence order

### Verification
- Override order correct
- Shell overrides file
- Docker overrides both

## Test 10: Configuration Export/Import

### Setup
- Configuration management tools
- Export functionality

### Test Steps
1. Export current configuration
2. Verify all variables included
3. Import to new environment
4. Verify configuration loads
5. Test with masked secrets
6. Check secrets excluded from export

### Verification
- Export includes all variables
- Import works correctly
- Secrets protected in export

## Test 11: Runtime Configuration Updates

### Setup
- Admin configuration endpoint
- Runtime updates enabled

### Test Steps
1. Update GUEST_CHECKOUT_LOG_LEVEL via API
2. Verify change applied immediately
3. Update queue configuration
4. Verify new settings used
5. Attempt to update required variable
6. Verify runtime update blocked

### Verification
- Optional variables updatable
- Required variables locked
- Changes apply immediately

## Test 12: Configuration Backup and Restore

### Setup
- Configuration backup system
- Restore functionality

### Test Steps
1. Create configuration backup
2. Verify backup contains all variables
3. Modify configuration
4. Restore from backup
5. Verify original config restored
6. Test with corrupted backup

### Verification
- Backup captures all settings
- Restore works completely
- Corrupted backups handled

## Test 13: Configuration Validation Performance

### Setup
- Large configuration set
- Performance monitoring

### Test Steps
1. Load 1000 environment variables
2. Measure validation time
3. Verify under 100ms
4. Test with complex validation
5. Check performance impact
6. Optimize if needed

### Verification
- Validation performant
- Large sets handled efficiently
- No performance bottlenecks

## Test 14: Configuration Documentation

### Setup
- Configuration documentation generator
- Variable metadata

### Test Steps
1. Generate configuration documentation
2. Verify all variables documented
3. Check types and defaults included
4. Verify examples provided
5. Test documentation accuracy
6. Update variable and regenerate

### Verification
- Documentation complete
- Examples accurate
- Updates reflected automatically
