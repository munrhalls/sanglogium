Adhere with strict discipline: keep everything robust, coherent, simplest possible. If anything complicates or is vague, stop immediately.

Template: System Contract

# System Contract: [Feature Name]

**The Lead Domino** - Do not plan implementation details. Only map state boundaries and data structures.

## 1. State Location
Where does the state live?
- [e.g., Zustand store, React Context, URL params, server state]

## 2. Data Contract
What is the exact TypeScript Interface?

```typescript
interface [ContractName] {
  [property]: [type];
  // ...
}
```

## 3. Why This Matters
By locking in the data contract, everything else becomes a predictable mathematical reality.
