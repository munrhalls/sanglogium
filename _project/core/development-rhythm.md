# High-Velocity Development Rhythm

## Core Problem
- Low effectiveness per iteration
- Many iterations per meaningful progress
- Absent-minded prompting loops
- No rhythm/cadence
- Missing OODA loop structure

## Solution: 5-Minute OODA Cycles

### Observe (30 seconds)
- **What**: Quick reality check
- **How**: Look at current state, identify 1 core issue
- **Tool**: `grep_search`, `read_file`, or direct observation

### Orient (60 seconds)
- **What**: Map the terrain
- **How**: Identify options, pick optimal path
- **Tool**: Mental model, decision matrix

### Decide (30 seconds)
- **What**: Choose action
- **How**: Single clear decision
- **Tool**: Direct command

### Act (3 minutes)
- **What**: Execute
- **How**: Focused implementation
- **Tool**: Code changes, build, verify

## Velocity Protocol

### 1. Single-Target Focus
```
BAD: "Fix logging system"
GOOD: "Add network request logging to validateBasket"
```

### 2. 5-Minute Sprints
```
Start: Clear problem statement
End: Working verification
```

### 3. No Distractions
```
NO: Side issues, optimizations, refactoring
YES: Direct path to solution
```

### 4. Immediate Verification
```
Build after every change
Test immediately
Fix or revert fast
```

## Implementation Commands

### Quick Observation
```bash
# Find current state
grep -r "validateBasket" --include="*.ts" --include="*.tsx"
```

### Fast Decision
```bash
# Make the call
npm run build
```

### Direct Action
```bash
# Execute change
edit file.ts "old" "new"
```

## Anti-Patterns to Eliminate

### 1. Analysis Paralysis
- Stop: Overthinking, over-planning
- Start: Direct observation, immediate action

### 2. Scope Creep
- Stop: Adding features, optimizations
- Start: Single target, minimal change

### 3. Iteration Waste
- Stop: Multiple small changes
- Start: One meaningful change per cycle

## Success Metrics

### Velocity Indicators
- **Green**: 1 meaningful change per 5 minutes
- **Yellow**: 2+ iterations per change
- **Red**: 5+ iterations per change

### Quality Gates
- Build passes
- Feature works
- No regressions

## Rhythm Training

### Week 1: 5-Minute Cycles
- Timer for each phase
- Force decisions at 2 minutes
- Build after every change

### Week 2: 3-Minute Cycles
- Faster observation
- Quicker decisions
- Immediate action

### Week 3: 2-Minute Cycles
- Pattern recognition
- Muscle memory
- Flow state

## Emergency Protocol

When stuck > 10 minutes:
1. **STOP** - Current approach failed
2. **RESET** - Clear mental state
3. **SIMPLIFY** - Reduce scope by 90%
4. **DIRECT** - Make the simplest possible change
5. **VERIFY** - Build and test immediately

## Victory Conditions

- **Daily**: 10+ meaningful changes
- **Weekly**: Complete feature delivery
- **Monthly**: System-level improvements

The goal is not perfect code - it's high-velocity, effective iteration.
