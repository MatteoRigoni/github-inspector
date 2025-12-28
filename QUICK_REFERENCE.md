# Quick Reference Cheat Sheet

## 🚀 Common Tasks

### Create a New Page
```
1. Create: app/my-page/page.tsx
2. Access: http://localhost:3000/my-page
```

### Create a New API Endpoint
```
1. Create: app/api/my-endpoint/route.ts
2. Export: export async function GET() { ... }
3. Access: http://localhost:3000/api/my-endpoint
```

### Add State to Component
```typescript
const [value, setValue] = useState<Type>(initialValue);
setValue(newValue);  // Updates and triggers re-render
```

### Fetch Data on Load
```typescript
useEffect(() => {
  fetchData();
}, []);  // Empty array = run once
```

### Make API Call
```typescript
// GET
const response = await fetch("/api/endpoint");
const data = await response.json();

// POST
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
});
```

---

## 📝 JSX Syntax

```tsx
{/* Comments */}
{variable}                    {/* Display variable */}
{condition && <div>...</div>} {/* If condition */}
{condition ? <A /> : <B />}    {/* If-else */}
{array.map(item => <div key={item.id}>{item.name}</div>)}  {/* Loop */}
```

---

## 🔄 State Updates

```typescript
// Add to array
setItems([...items, newItem]);

// Update in array
setItems(items.map(item => item.id === id ? updatedItem : item));

// Remove from array
setItems(items.filter(item => item.id !== id));

// Update object
setState({ ...state, key: newValue });
```

---

## 🎯 Event Handlers

```typescript
// Button click
<button onClick={() => handleClick()}>Click</button>

// Form submit
<form onSubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>

// Input change
<input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>
```

---

## 🔌 API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";

// GET
export async function GET() {
  const data = getData();
  return NextResponse.json(data);
}

// POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate
  if (!body.name) {
    return NextResponse.json(
      { error: "Name required" },
      { status: 400 }
    );
  }
  // Process
  const result = createData(body);
  return NextResponse.json(result, { status: 201 });
}

// PUT (with [id] folder)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // ... update logic
}

// DELETE (with [id] folder)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... delete logic
}
```

---

## 🎨 Common Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

return loading ? <div>Loading...</div> : <div>Content</div>;
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await doSomething();
} catch (err) {
  setError(err instanceof Error ? err.message : "Error occurred");
}

{error && <div className="error">{error}</div>}
```

### Modal/Dialog
```typescript
const [showModal, setShowModal] = useState(false);

{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

---

## 📦 Imports

```typescript
// React hooks
import { useState, useEffect } from "react";

// Next.js navigation
import Link from "next/link";
import { useRouter } from "next/navigation";

// Next.js API
import { NextRequest, NextResponse } from "next/server";

// Your own modules
import { functionName } from "./path/to/file";
```

---

## 🛠️ Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check for errors
npm install pkg  # Install package
```

---

## 🔍 Debugging

```typescript
// Console logs
console.log("Debug:", variable);
console.error("Error:", error);

// Check state
console.log("Current state:", apiKeys);

// Check API response
const response = await fetch("/api/endpoint");
console.log("Response:", await response.json());
```

---

## ⚠️ Common Mistakes

1. **Forgetting `"use client"`** - Needed for useState, onClick, etc.
2. **Missing `key` prop** - Required in `.map()` loops
3. **Not awaiting params** - In Next.js 16: `const { id } = await params;`
4. **Forgetting `e.preventDefault()`** - In form handlers
5. **Not checking `response.ok`** - Always check API responses

---

## 📚 File Structure Rules

```
app/
  page.tsx              → / (home)
  about/page.tsx        → /about
  api/
    users/route.ts      → /api/users
    users/[id]/route.ts → /api/users/123
```

---

## 🎯 TypeScript Quick Types

```typescript
// Interface
interface User {
  id: string;
  name: string;
}

// State with type
const [users, setUsers] = useState<User[]>([]);

// Function with types
function handleClick(id: string): void {
  // ...
}

// Async function
async function fetchData(): Promise<User[]> {
  // ...
}
```

---

**Keep this file open while coding!** 📌


