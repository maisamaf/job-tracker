# Code Review & Refactoring Recommendations

This document provides a detailed code review and architecture analysis of the recent changes across the codebase, focusing on **AI integration**, **Clean Code**, **Performance Optimization**, and **Security**. 

---

## 1. AI Integration & Prompt Engineering

### 1.1 Optimize `generateJsonObject` Retry Loop (Reduce LLM Latency & Cost)
**File**: [`lib/ai/generate-json-object.ts`](file:///Users/maisam/startup/application-tracker/lib/ai/generate-json-object.ts)

#### Problem
In `generateJsonObject`, when a model does not support native structured JSON generation (common with self-hosted models running on Ollama/Open WebUI), `generateObject` throws an error. The catch block catches this and falls back to a manual `generateText` call. 
However, in subsequent attempts within the loop (e.g., attempt 2, 3), the function **still tries `generateObject` again**, incurring the same overhead, timeout latency, or error cost before falling back again. In a worst-case scenario, up to 9 LLM calls could be made in a single execution.

#### Solution
Cache the capability check dynamically during execution. If `generateObject` fails on the first attempt due to capability issues, mark a flag to skip it and fall back directly to `generateText` on subsequent attempts.

```typescript
// Proposed optimization for lib/ai/generate-json-object.ts
export async function generateJsonObject<T extends z.ZodType>({
  model,
  schema,
  prompt,
  maxAttempts = 3,
}: GenerateJsonObjectOptions<T>): Promise<z.infer<T>> {
  let lastInvalidText = "";
  let lastError = "Unknown parsing error";
  let useTextFallbackOnly = false; // Flag to skip generateObject on fallback models

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptPrompt =
      attempt === 1
        ? `${prompt}\n\nCRITICAL: Respond with ONLY a single valid JSON object.`
        : buildJsonRetryPrompt(prompt, lastInvalidText, lastError);

    if (!useTextFallbackOnly) {
      try {
        const { object } = await generateObject({
          model,
          schema,
          prompt: attemptPrompt,
          temperature: 0,
          // ... repairText logic
        });
        
        // generateObject already performs internal validation. No need for safeParse here.
        return object;
      } catch (error) {
        // Detect structured-output lack of support (e.g., 400 Bad Request or Not Supported)
        const errMsg = error instanceof Error ? error.message.toLowerCase() : "";
        if (errMsg.includes("not supported") || errMsg.includes("bad request") || errMsg.includes("invalid provider")) {
          useTextFallbackOnly = true;
        }
        
        if (error instanceof NoObjectGeneratedError && error.text) {
          lastInvalidText = error.text;
          const recovered = parseAndValidate(schema, error.text);
          if (recovered.success) return recovered.data;
          lastError = recovered.error;
        } else if (error instanceof Error) {
          lastError = error.message;
        }

        if (attempt >= maxAttempts) throw error;
      }
    }

    // Explicit fallback to raw generateText
    const { text } = await generateText({
      model,
      temperature: 0,
      prompt: buildJsonRetryPrompt(prompt, lastInvalidText, lastError),
    });

    const recovered = parseAndValidate(schema, text);
    if (recovered.success) return recovered.data;

    lastInvalidText = text;
    lastError = recovered.error;
  }

  throw new Error(`Failed to generate valid JSON after ${maxAttempts} attempts: ${lastError}`);
}
```

### 1.2 Remove Redundant Schema Validation
**File**: [`lib/ai/generate-json-object.ts`](file:///Users/maisam/startup/application-tracker/lib/ai/generate-json-object.ts#L92-L98)

#### Problem
In the original implementation:
```typescript
const { object } = await generateObject({ ... });
const validated = schema.safeParse(object);
if (validated.success) return validated.data;
```
`generateObject` in the Vercel AI SDK already validates the generated output against the Zod schema internally. If it fails validation, it throws a `TypeValidationError` (which is a subclass of `NoObjectGeneratedError`). If `object` is successfully returned, it is guaranteed to conform to the Zod schema shape. Running `schema.safeParse` again adds redundant validation overhead.

---

## 2. Clean Code & Architecture

### 2.1 Mismatched/Dead File: `features/profile/actions/parse-cv.ts`
**Files**: 
- [`features/profile/actions/parse-cv.ts`](file:///Users/maisam/startup/application-tracker/features/profile/actions/parse-cv.ts) (Untracked)
- [`app/api/profile/parse-cv/route.ts`](file:///Users/maisam/startup/application-tracker/app/api/profile/parse-cv/route.ts)

#### Problem
The file `features/profile/actions/parse-cv.ts` is placed in an `actions` directory, but it contains a Next.js `POST` route handler, which Next.js completely ignores outside of the `app` router. 
Furthermore, it defines a streaming CV parser using `streamText`, whereas the active page `SettingsView` is fetching `/api/profile/parse-cv` which maps to `app/api/profile/parse-cv/route.ts`—a simpler, non-streaming route.

#### Recommendations
- **Option A (Clean up)**: If the streaming CV parser is not needed, delete `features/profile/actions/parse-cv.ts` to prevent confusion about how CVs are parsed.
- **Option B (Implement Streaming)**: If streaming CV parsing is preferred (which gives a better real-time UX): (Implement this one)
  1. Move the streaming logic from `features/profile/actions/parse-cv.ts` to `app/api/profile/parse-cv/route.ts` to replace the simple JSON parser.
  2. Update the frontend in `SettingsView` to use the `streamAndParseCv` client helper to update the UI on each chunk.

### 2.2 Form State Regression on Validation Failure
**File**: [`features/applications/components/application-form.tsx`](file:///Users/maisam/startup/application-tracker/features/applications/components/application-form.tsx)

#### Problem
A regression was introduced in `ApplicationForm` where the helper `fieldValue` was removed. 
For uncontrolled inputs like `salaryMin`, `salaryMax`, `notes`, and `status`, their defaultValue is now bound to `initialData?.salaryMin ?? ""`. If a user is creating a new application, inputs some notes and salaries, and submits the form, if server-side validation fails (e.g. because `company` is empty), the form renders again with the validation errors, but **the user's typed values in `salaryMin`, `salaryMax`, and `notes` are completely lost** because they revert to `initialData` (which is `undefined`).

#### Solution
Ensure all uncontrolled inputs fall back to the submitted values (`state.values`) in their `defaultValue` binding:
```typescript
defaultValue={state.values?.salaryMin ?? initialData?.salaryMin ?? ""}
defaultValue={state.values?.salaryMax ?? initialData?.salaryMax ?? ""}
defaultValue={state.values?.notes ?? initialData?.notes ?? ""}
```

### 2.3 UI Deduplication: Use Standard `<Tabs>` component
**File**: [`features/applications/components/application-detail.tsx`](file:///Users/maisam/startup/application-tracker/features/applications/components/application-detail.tsx#L387-L406)

#### Problem
In `ApplicationDetailView`, the tabs are built using basic HTML `<button>` elements inside a custom `nav`. This ignores ARIA accessibility requirements for tab navigation (such as keyboard Arrow navigation, `aria-controls`, and `role="tabpanel"`).
The project already includes a standard, accessible `<Tabs>` component (imported from `@/components/ui/tabs`), which is used inside `SettingsView`.

#### Solution
Refactor `ApplicationDetailView` to use the standard `<Tabs>` component:
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// In the component:
<Tabs defaultValue="overview" className="w-full">
  <TabsList variant="line" className="mb-6">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="process">Process</TabsTrigger>
    <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Overview Content */}
  </TabsContent>
  <TabsContent value="process">
    {/* Process Content */}
  </TabsContent>
  <TabsContent value="interview-prep">
    {/* Interview Prep Content */}
  </TabsContent>
</Tabs>
```

---

## 3. Performance & Optimization

### 3.1 Unused/Dead Dependencies in `package.json`
**File**: [`package.json`](file:///Users/maisam/startup/application-tracker/package.json)

#### Problem
The `dependencies` section includes several unused npm packages that were likely installed accidentally instead of adding shadcn components:
- `card`
- `label`
- `select`
- `textarea`
- `i`
- `@extractus/article-extractor` (not used by any imports; Cheerio and Jina Reader are used instead)

#### Recommendation
Run the following command to clean up these packages and shrink `node_modules`:
```bash
bun remove card label select textarea i @extractus/article-extractor
```

### 3.2 Missing Request Timeouts on Scraper Fetches
**Files**:
- [`features/applications/actions/autofill-from-url.ts`](file:///Users/maisam/startup/application-tracker/features/applications/actions/autofill-from-url.ts#L120)
- [`features/job-intel/actions/ingest-posting.ts`](file:///Users/maisam/startup/application-tracker/features/job-intel/actions/ingest-posting.ts)

#### Problem
External HTTP requests (e.g., to `r.jina.ai` or target company websites via Cheerio) are made using standard `fetch` without an `AbortSignal`. If the third-party scraper hangs, the Next.js server threads will be blocked indefinitely, leading to resource exhaustion.

#### Solution
Introduce a helper or inline `AbortController` to timeout external fetches after 10 seconds:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

try {
  const response = await fetch(url, {
    headers,
    signal: controller.signal,
  });
  // ...
} finally {
  clearTimeout(timeoutId);
}
```

---

## 4. Security Enhancements

### 4.1 Validate Context Scope in `PATCH` Route Handler
**File**: [`app/api/interview-prep/[applicationId]/route.ts`](file:///Users/maisam/startup/application-tracker/app/api/interview-prep/%5BapplicationId%5D/route.ts#L36)

#### Problem
In the `PATCH` handler, the parameter `applicationId` from the route path is completely ignored:
```typescript
const updated = await saveAnswer(questionId, userAnswer);
```
While `saveAnswer` verifies that the logged-in user owns the question, it does not verify that the question belongs to the `applicationId` specified in the path. This permits logical parameter mismatches.

#### Solution
Update `saveAnswer` to validate `applicationId` as well:
```typescript
// features/interview-prep/actions/save-answer.ts
export async function saveAnswer(applicationId: string, questionId: string, userAnswer: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updated = await db
    .update(interviewQuestions)
    .set({ userAnswer, updatedAt: new Date() })
    .where(
      and(
        eq(interviewQuestions.id, questionId),
        eq(interviewQuestions.applicationId, applicationId), // Scope constraint
        eq(interviewQuestions.userId, session.user.id)
      )
    )
    .returning();

  return updated[0] || null;
}
```

### 4.2 Clean Up `request.json()` Parsing in API Routes
**Files**:
- [`app/api/gap-analysis/route.ts`](file:///Users/maisam/startup/application-tracker/app/api/gap-analysis/route.ts)
- [`app/api/interview-prep/route.ts`](file:///Users/maisam/startup/application-tracker/app/api/interview-prep/route.ts)

#### Problem
In the `POST` handlers, the code does `const body = await request.json()`. If a client makes a request with an empty body or invalid JSON formatting, the handler throws a parsing error, resulting in an unhandled crash returning a `500 Internal Server Error`.

#### Solution
Wrap request parsing in a try-catch block and return a proper `400 Bad Request`:
```typescript
let body: any;
try {
  body = await request.json();
} catch {
  return Response.json({ error: "Invalid or empty JSON body" }, { status: 400 });
}
```

### 4.3 Vector Dimension Mismatch Risk
**File**: [`lib/db/schema.ts`](file:///Users/maisam/startup/application-tracker/lib/db/schema.ts#L83)

#### Problem
The `embedding` vector column is defined with exactly `1024` dimensions:
```typescript
embedding: vector("embedding", { dimensions: 1024 })
```
If the user selects an OpenAI model (`text-embedding-3-small` or `text-embedding-ada-002`) in their profile settings for generating embeddings, OpenAI returns `1536` dimensions by default. Attempting to insert a 1536-dimensional array into a 1024-dimensional column will crash the database.

#### Solution
When implementing the embedding generation logic, either:
1. Hardcode the embedding requests to specify exactly 1024 dimensions (e.g., using OpenAI's `dimensions` parameter for `text-embedding-3-small`).
2. Or change the column dimension based on the preferred model and document it clearly.(Implement this one)

---

## 5. UI/UX Polish

### 5.1 Timeline Connector Visual Bug
**File**: [`features/applications/components/application-timeline.tsx`](file:///Users/maisam/startup/application-tracker/features/applications/components/application-timeline.tsx#L147)

#### Problem
When an application is in a terminal stage (`rejected` or `withdrawn`), the component renders a 6th item at the bottom of the timeline. However, because the 5th item has `isLast = true` (since its index is `TIMELINE_STAGES.length - 1`), the check `{!isLast && ...}` evaluates to `false`. As a result, the vertical connecting line between the 5th stage ("Offered / closed") and the 6th stage ("Rejected" / "Withdrawn") is omitted, causing a visual break in the timeline:

```
◯ Bookmarked
 |
◯ Applying
 |
◯ Applied
 |
◯ Interviewing
 |
◯ Offered / closed
           <-- Visual Gap: Line is missing here
● Rejected
```

#### Solution
Modify the line visibility constraint to account for the terminal stage:
```typescript
// Replace line 147:
{!isLast && (
// With:
{(!isLast || isTerminal) && (
```

### 5.2 Optimistic Board Updates Missing Error UI Feedback
**File**: [`features/board/components/kanban-board.tsx`](file:///Users/maisam/startup/application-tracker/features/board/components/kanban-board.tsx#L90)

#### Problem
When dragging a card on the Kanban board fails on the server, the code correctly reverts the state. However, the card simply snaps back to its original column without any visual indication or error message. The user is left confused about why the action was rejected.

#### Recommendation
Implement a simple toast or error message on transition failure:
```typescript
if (result?.errors) {
  // Revert board state...
  toast.error(result.errors.root?.[0] || "Failed to update application status.");
}
```
