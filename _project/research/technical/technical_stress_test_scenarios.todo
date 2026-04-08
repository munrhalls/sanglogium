# Technical Stress Test Scenarios - Polish Market Interview Prep
**Based on sanglogium project analysis and market requirements**

## Stress Test Framework

### Category 1: Next.js 15 & React Architecture (Critical)
**Scenario 1: Server Components Deep Dive**
```
"You have this ProductPage component in your sanglogium project:
- It's an async Server Component
- It fetches data using getProductBySlug()
- It has console.log statements on lines 13-15

Explain:
1. Why are these console.log statements problematic in production?
2. How would you optimize the data fetching pattern?
3. What's the difference between Server and Client Components here?
4. How would you implement proper error handling?"
```

**Expected Senior Answer:**
- Console.log in production = performance impact, security risk
- Parallel fetching with Promise.all() for related products
- Server Component = runs on server, no client-side JS
- Error boundary + try/catch + proper notFound() handling

**Scenario 2: Data Fetching Optimization**
```
"In your product page, you're fetching product then related products sequentially:
```tsx
const product = await getProductBySlug(slug);
const relatedProducts = await getRelatedProducts(product._id, ...);
```

How would you optimize this pattern for:
1. Performance (waterfall elimination)
2. Error handling (partial failures)
3. Caching strategy
4. Loading states"
```

**Expected Senior Answer:**
- Promise.all() for parallel fetching
- Promise.allSettled() for partial failure handling
- Next.js cache() function + revalidation
- Streaming UI with Suspense boundaries

### Category 2: TypeScript Mastery (Critical)
**Scenario 3: Type Safety Issues**
```
"Looking at your getProductBySlug function:
```tsx
export interface Product {
  image: any;
  gallery?: any[];
}
```

Why is 'any' problematic here? How would you:
1. Define proper image types from Sanity schema?
2. Make the function type-safe?
3. Handle null/undefined cases properly?"
```

**Expected Senior Answer:**
- 'any' defeats TypeScript purpose, runtime errors
- Use Sanity's generated types or define proper interfaces
- Use Pick<SanityProduct, ...> for type safety
- Proper null checking with optional chaining

**Scenario 4: Generic Type Patterns**
```
"You need to create a generic data fetching hook:
```tsx
function useData<T>(fetcher: () => Promise<T>) {
  // Implementation
}
```

Implement this hook with:
1. Loading states
2. Error handling
3. Caching
4. Type safety"
```

**Expected Senior Answer:**
- Generic type parameter T
- State management with useState
- Error boundary integration
- Proper TypeScript return types

### Category 3: Performance & Optimization (Critical)
**Scenario 5: Performance Debugging**
```
"Your product page loads slowly. Debug step-by-step:
1. How would you identify the bottleneck?
2. What tools would you use?
3. What are common Next.js performance issues?
4. How would you fix them in sanglogium?"
```

**Expected Senior Answer:**
- Lighthouse, Web Vitals, Bundle Analyzer
- Network tab waterfall analysis
- Common issues: large bundles, unoptimized images, data waterfalls
- Solutions: code splitting, image optimization, parallel data fetching

**Scenario 6: Memory Management**
```
"In React, what causes memory leaks? How would you:
1. Identify them in sanglogium?
2. Fix useEffect cleanup?
3. Handle event listeners?
4. Manage subscriptions?"
```

**Expected Senior Answer:**
- Unmounted component updates, unclosed subscriptions
- useEffect cleanup functions
- removeEventListener in cleanup
- AbortController for fetch requests

### Category 4: System Design (Senior Level)
**Scenario 7: E-commerce Architecture**
```
"Design the architecture for sanglogium's product catalog:
1. Database schema for products/categories
2. Search functionality
3. Filtering system
4. Caching strategy
5. Scalability considerations"
```

**Expected Senior Answer:**
- Sanity CMS for content + relational DB for transactions
- Full-text search with Elasticsearch/Algolia
- Faceted search with indexed filters
- CDN + Redis caching
- Horizontal scaling with load balancers

**Scenario 8: API Design**
```
"You need to design an API for product recommendations:
1. What endpoints would you create?
2. How would you handle authentication?
3. Rate limiting strategy?
4. Error handling standards?"
```

**Expected Senior Answer:**
- RESTful endpoints with proper HTTP methods
- JWT-based auth with refresh tokens
- Rate limiting per user/IP
- Consistent error response format

### Category 5: Testing & Quality (Important)
**Scenario 9: Testing Strategy**
```
"How would you test sanglogium's ProductPage:
1. Unit tests for data fetching?
2. Component testing?
3. E2E testing?
4. Performance testing?"
```

**Expected Senior Answer:**
- Vitest for unit tests with mocking
- Playwright component testing
- E2E flows with user interactions
- Lighthouse CI for performance

**Scenario 10: Code Quality**
```
"You find console.log statements in production code. How would you:
1. Remove them systematically?
2. Prevent them in future?
3. Set up linting rules?
4. Code review process?"
```

**Expected Senior Answer:**
- Global search + remove
- ESLint rule no-console
- Pre-commit hooks
- Code review checklist

### Category 6: Modern Tooling (Expected)
**Scenario 11: Build Process**
```
"Explain sanglogium's build process:
1. What does 'prebuild' script do?
2. Why is it needed?
3. How would you optimize it?
4. CI/CD integration?"
```

**Expected Senior Answer:**
- Builds catalogue index before Next.js build
- Required for VFS data consistency
- Parallel processing, caching
- GitHub Actions with deployment pipeline

**Scenario 12: Development Workflow**
```
"How would you improve sanglogium's development experience:
1. Hot reload issues?
2. Type checking performance?
3. Testing workflow?
4. Debugging setup?"
```

**Expected Senior Answer:**
- Turbopack for faster builds
- Project references for TypeScript
- Test watchers with coverage
- VS Code debugging configuration

## Evaluation Rubric

### Senior Level Expectations (140,000-200,000 PLN)
**Technical Excellence (40%)**
- Next.js 15 deep knowledge
- TypeScript mastery
- Performance optimization
- System design thinking

**Problem Solving (30%)**
- Debugging methodology
- Tradeoff analysis
- Solution architecture
- Code quality focus

**Communication (20%)**
- Clear technical explanations
- Business context understanding
- Team collaboration
- Documentation skills

**Leadership (10%)**
- Code review best practices
- Mentoring capability
- Process improvement
- Technical decision making

### Red Flags (Immediate Disqualification)
1. **"I don't know"** without showing problem-solving approach
2. **Blaming the code** instead of taking ownership
3. **No consideration for performance** or user experience
4. **Poor communication** in English (B2 minimum required)
5. **Resistance to feedback** or learning

### Green Flags (Strong Hire Signals)
1. **Systematic debugging** approach
2. **Performance-first** mindset
3. **Type safety** emphasis
4. **Business context** awareness
5. **Team collaboration** experience

## Mock Interview Format

### Round 1: Technical Deep Dive (45 minutes)
- Next.js/React patterns (15 minutes)
- TypeScript scenarios (10 minutes)
- Performance debugging (10 minutes)
- System design (10 minutes)

### Round 2: Practical Coding (60 minutes)
- Build a small feature
- Debug existing code
- Optimize performance
- Add tests

### Round 3: System Design (45 minutes)
- Architecture discussion
- Tradeoff analysis
- Scalability planning
- Technical leadership

### Round 4: Culture Fit (30 minutes)
- Communication skills
- Team collaboration
- Learning attitude
- Career goals

## Preparation Checklist

### Before Interview
- [ ] Remove all console.log statements
- [ ] Optimize product page data fetching
- [ ] Add proper error handling
- [ ] Improve TypeScript types
- [ ] Add unit tests for critical functions

### During Interview
- [ ] Think out loud
- [ ] Ask clarifying questions
- [ ] Discuss tradeoffs
- [ ] Show problem-solving process
- [ ] Communicate clearly

### After Interview
- [ ] Send thank you note
- [ ] Reflect on performance
- [ ] Identify improvement areas
- [ ] Follow up appropriately
