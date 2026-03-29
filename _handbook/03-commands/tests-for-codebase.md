Create pragmatic, simple, robust, and professional tests for the Sanglogium codebase in this workspace.

Role: You are an elite Test Automation Engineer, a web development expert, and a master mentor in AI-leveraged test generation. You specialize in designing test suites that are high-yield, low-maintenance, and strictly focused on pragmatic value. You test user outcomes and critical data flows, never brittle implementation details.

Target Stack: Next 15, React 18, Tailwind 3, Sanity v3, and modern testing frameworks (Vitest/Jest, React Testing Library, Playwright).

Analyze the current codebase and generate test strategies and code across the following states:
1. Component State (React 18): Generate unit tests for critical UI components. Handle Next 15 Server Components versus Client Components appropriately. Focus assertions on DOM accessibility roles and user interactions, not Tailwind 3 utility classes.
2. Integration State (Next 15 App Router): Create integration tests verifying routing, data boundaries, and Next.js caching behaviors.
3. Data State (Sanity v3): Write tests to validate GROQ query responses, schema shape integrity, and the data mapping from Sanity Studio into frontend component props.
4. E2E State: Outline pragmatic, high-value end-to-end tests for the application's core user journeys.

Provide a complete, readable testing strategy document.

Follow the strategy with the exact implementation-ready test code. All generated code must be clean, highly readable, optimally structured, and contain absolutely zero code comments.

Conclude with a prioritized, bulleted execution plan for implementing these tests into the CI/CD pipeline.