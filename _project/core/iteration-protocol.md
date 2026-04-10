# High-Effectiveness Iteration Protocol

## The 3-Minute Rule

### Phase 1: Observe (30 seconds)
```bash
# Quick reality check
grep -r "problem" --include="*.ts"
# or
read_file target.ts
# or
list_dir current/
```

### Phase 2: Decide (30 seconds)
- **Single decision only**
- **No analysis paralysis**
- **Make the call**

### Phase 3: Act (2 minutes)
- **Direct implementation**
- **Build immediately**
- **Verify working**

## Decision Matrix

### When to Edit
```
YES: Clear target, known solution
NO: Unclear, multiple options
```

### When to Search
```
YES: Need to find specific code
NO: General exploration
```

### When to Build
```
YES: After any change
NO: Before verification
```

## Anti-Death Patterns

### 1. The Prompting Loop
```
DEATH: "Let me think about this..."
LIFE: "Make decision now"
```

### 2. The Analysis Trap
```
DEATH: "Let me analyze all options..."
LIFE: "Pick best option, execute"
```

### 3. The Perfection Delay
```
DEATH: "Let me make this perfect..."
LIFE: "Make it work, optimize later"
```

## Victory Commands

### Quick Wins
```bash
# Fast observation
grep -r "functionName" --include="*.ts"

# Direct action
edit file.ts "old" "new"

# Immediate verification
npm run build
```

### Emergency Escape
```bash
# When stuck > 5 minutes
# 1. Simplify scope by 90%
# 2. Make smallest possible change
# 3. Build and verify
# 4. Iterate or pivot
```

## Success Metrics

### Velocity Check
- **1 change per 3 minutes** = Winning
- **1 change per 5 minutes** = Acceptable
- **1 change per 10+ minutes** = Death

### Quality Check
- **Build passes** = Continue
- **Build fails** = Fix immediately
- **Feature works** = Victory

## Mental State Management

### Flow State Triggers
- **Timer pressure**: 3-minute deadline
- **Clear target**: Single objective
- **Immediate feedback**: Build results

### Death State Triggers
- **Open-ended analysis**: No deadline
- **Multiple targets**: Confusion
- **Delayed feedback**: No verification

## Protocol Activation

### When Starting Work
1. **Set timer for 3 minutes**
2. **State single objective**
3. **Start observation phase**

### When Stuck
1. **STOP current approach**
2. **RESET timer to 3 minutes**
3. **SIMPLIFY objective by 90%**
4. **EXECUTE immediately**

### When Victorious
1. **VERIFY working**
2. **DOCUMENT win**
3. **MOVE to next target**

## The No-Excuses Rule

### Acceptable Reasons to Slow Down
- **Build failure** (fix immediately)
- **Feature not working** (debug immediately)
- **External dependency** (work around immediately)

### Unacceptable Reasons to Slow Down
- **"I need to think more"** (DECIDE NOW)
- **"Let me explore options"** (PICK ONE NOW)
- **"Let me make it perfect"** (MAKE IT WORK NOW)

## Implementation Checklist

### Before Starting
- [ ] Single clear objective
- [ ] 3-minute timer set
- [ ] Build verification ready

### During Execution
- [ ] Direct action only
- [ ] No side quests
- [ ] No analysis paralysis

### After Completion
- [ ] Build passes
- [ ] Feature works
- [ ] Next objective ready

## The Ultimate Goal

**Transform from:**
```
2 hours, 16 minutes = 1 meaningful change
```

**To:**
```
2 hours, 16 minutes = 40+ meaningful changes
```

This is the difference between missing everything and winning everything in the agentic era.
