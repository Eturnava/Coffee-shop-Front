# Coffee Shop - API Architecture Diagram

## Complete System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          YOUR COFFEE SHOP APPLICATION                     │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER APPLICATIONS                                 │
├──────────────────────────────────────────────────────────────────┬──────────┤
│                                                                   │          │
│  Main Coffee Shop Frontend                  Admin Panel          │  Browser │
│  (src/)                                    (coffee-admin-shop/)  │          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━                ━━━━━━━━━━━━━━━━━━  │          │
│  • Browse coffees              http://localhost:5173            │  Port    │
│  • Coffee details                           • Dashboard         │  5173    │
│  • Add to cart                              • Add Coffee        │          │
│  • Shopping cart                            • Manage Coffees    │  Port    │
│  • Checkout (future)                        • Edit Coffee       │  5174    │
│                                             • Delete Coffee     │          │
│  http://localhost:5173                                          │          │
│                                                                   │          │
│  Uses:                                     Uses:                 │          │
│  • CurrencyContext                         • CoffeeContext      │          │
│  • CartContext                             • API Service        │          │
│  • API Service                                                   │          │
│                                                                   │          │
└──────────────────────────────┬────────────────────────────────┬──────────────┘
                               │                                │
                               │ HTTP Requests                 │
                               │ (fetch)                       │
                               │                                │
┌───────────────────────────────▼────────────────────────────────▼──────────────┐
│                           API SERVICE LAYER                                    │
│                    (coffee-admin-shop/src/services/api.js)                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ HTTP Client Functions                                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • fetchCoffees()              - GET /api/coffees                    │   │
│  │ • fetchCoffeeById(id)         - GET /api/coffees/:id               │   │
│  │ • createCoffee(data)          - POST /api/coffees                  │   │
│  │ • updateCoffee(id, data)      - PUT /api/coffees/:id               │   │
│  │ • deleteCoffee(id)            - DELETE /api/coffees/:id            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Data Transformation Functions                                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • transformCoffeeToAPI()      - Convert admin format → API format   │   │
│  │ • transformCoffeeFromAPI()    - Convert API format → admin format   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Error Handling                                                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • Validates responses                                               │   │
│  │ • Throws meaningful errors                                          │   │
│  │ • Logs to console                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────┬────────────────────────────────────────────────┘
                                │
                                │ HTTP (REST)
                                │ JSON payloads
                                │
            ┌───────────────────▼──────────────────┐
            │   BACKEND EXPRESS API SERVER         │
            │  (server/index.js)                  │
            │  Port: 3001                         │
            ├───────────────────────────────────────┤
            │                                       │
            │  ┌─────────────────────────────────┐ │
            │  │ Routes & Controllers            │ │
            │  ├─────────────────────────────────┤ │
            │  │ GET    /api/coffees        ────┼─┼─→ Read all
            │  │ GET    /api/coffees/:id    ────┼─┼─→ Read one
            │  │ POST   /api/coffees        ────┼─┼─→ Create
            │  │ PUT    /api/coffees/:id    ────┼─┼─→ Update
            │  │ DELETE /api/coffees/:id    ────┼─┼─→ Delete
            │  │ GET    /health             ────┼─┼─→ Health check
            │  └─────────────────────────────────┘ │
            │                                       │
            │  ┌─────────────────────────────────┐ │
            │  │ Middleware                      │ │
            │  ├─────────────────────────────────┤ │
            │  │ • express.json()  - JSON parser │ │
            │  │ • cors()          - CORS setup  │ │
            │  └─────────────────────────────────┘ │
            │                                       │
            │  ┌─────────────────────────────────┐ │
            │  │ Data Functions                  │ │
            │  ├─────────────────────────────────┤ │
            │  │ • readData()   - Read from file │ │
            │  │ • writeData()  - Write to file  │ │
            │  │ • normalize()  - Validate input │ │
            │  └─────────────────────────────────┘ │
            │                                       │
            └───────────────────┬───────────────────┘
                                │
                                │ File I/O
                                │ JSON read/write
                                │
                    ┌───────────▼──────────┐
                    │ FILE STORAGE         │
                    │ (Persistent Data)    │
                    ├──────────────────────┤
                    │                      │
                    │ server/data/         │
                    │ └─ coffees.json      │
                    │                      │
                    │ Contains:            │
                    │ ├─ Coffee objects    │
                    │ ├─ IDs               │
                    │ ├─ Prices (USD/GEL) │
                    │ ├─ Images            │
                    │ └─ Timestamps        │
                    │                      │
                    └──────────────────────┘
```

## Data Models

### Coffee Object (API Format)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Espresso",
  "description": "Strong concentrated coffee",
  "long_description": "Rich espresso with... (optional)",
  "price_usd": 2.99,
  "price_gel": 8.07,
  "image_url": "https://example.com/coffee.jpg",
  "created_at": "2025-01-26T10:00:00Z",
  "updated_at": "2025-01-26T10:00:00Z"
}
```

### Admin Panel Coffee Format
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Espresso",
  description: "Strong concentrated coffee",
  longDescription: "Rich espresso with... (optional)",
  priceUsd: 2.99,
  priceGel: 8.07,
  image: "https://example.com/coffee.jpg",
  country: "Italy",          // Admin-only field
  caffeine: 75,              // Admin-only field
  ingredients: ["ing_001"]    // Admin-only field
}
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│            CoffeeContext (Admin Panel)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  State:                          Methods:                │
│  • coffees: []                  • addCoffee(data)        │
│  • ingredients: []              • updateCoffee(id, data) │
│  • isAPIConnected: boolean      • deleteCoffee(id)       │
│  • loading: boolean             • addIngredient(ing)     │
│  • error: string                • updateIngredient(...)  │
│                                 • deleteIngredient(id)   │
│                                 • calculateCoffeePrice() │
│                                                           │
│  Initialization:                                         │
│  1. Load from localStorage      (fast)                   │
│  2. Fetch from API              (async)                  │
│  3. Update state with API data  (if connected)           │
│  4. Use localStorage as fallback (if API fails)          │
│                                                           │
│  CRUD Operations:                                        │
│  • Try API first (if connected)                          │
│  • Fallback to localStorage (if API fails)               │
│  • Show errors to user                                   │
│  • Maintain UI consistency                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy (Admin Panel)

```
App.jsx
│
├─ CoffeeProvider
│  │
│  ├─ Dashboard/
│  │  └─ useCoffeeContext()
│  │
│  ├─ AddCoffee/
│  │  ├─ Form with:
│  │  │  ├─ title, country, description
│  │  │  ├─ image, caffeine
│  │  │  └─ ingredients (multi-select)
│  │  │
│  │  ├─ Calls: addCoffee(data)    [ASYNC]
│  │  ├─ Handles: loading, error
│  │  └─ Navigates: to /
│  │
│  ├─ ManageCoffees/
│  │  ├─ Table of all coffees
│  │  │
│  │  ├─ Actions:
│  │  │  ├─ View → ViewCoffee/
│  │  │  ├─ Edit → AddCoffee/ (with ID)
│  │  │  └─ Delete → deleteCoffee(id)  [ASYNC]
│  │  │
│  │  └─ Handles: loading, error, deletingId
│  │
│  ├─ ViewCoffee/:id
│  │  └─ Read-only coffee details
│  │
│  └─ ManageIngredients/
     └─ Ingredient CRUD
```

## Request/Response Cycle Example: Creating a Coffee

```
Timeline:
─────────────────────────────────────────────────────────

T0: User fills form and clicks "Add Coffee"
    ├─ name: "New Blend"
    ├─ description: "Amazing coffee"
    ├─ price_usd: 3.49
    └─ price_gel: 9.43

T1: AddCoffee.handleSubmit() → setIsSubmitting(true)
    
T2: useCoffeeContext().addCoffee(formData)
    
T3: isAPIConnected ? API call : localStorage
    
    [API Path]                    [Fallback Path]
    ├─ transformCoffeeToAPI()    └─ Add to local state
    ├─ api.createCoffee(data)       locally
    ├─ fetch POST /api/coffees
    │
    └─ Backend receives:
       ├─ Validates payload
       ├─ Generates UUID
       ├─ Creates object with timestamps
       ├─ Adds to coffees.json
       ├─ Saves file
       └─ Returns full object

T4: Response returns to frontend
    ├─ transformCoffeeFromAPI()
    └─ setCoffees([...coffees, newCoffee])

T5: UI updates
    ├─ Form cleared
    ├─ Error cleared
    └─ Loading state removed

T6: Navigate to '/'
    └─ Dashboard shows new coffee in list

T7: User sees success
    └─ New coffee appears in ManageCoffees table

Error Scenario (Network fails at T3):
    ├─ Catch block in addCoffee()
    ├─ setError("API connection failed")
    ├─ Fallback to localStorage
    ├─ Show error message to user
    └─ Continue with local-only sync
```

## File Structure Overview

```
c:\Users\ADMIN\Desktop\Coffee-shop-Front\
│
├─ .env.example                          ← Frontend env template
├─ .env.local                            ← Frontend env (create from example)
│
├─ server/
│  ├─ index.js                           ← Express API server
│  └─ data/
│     └─ coffees.json                    ← Coffee data storage
│
├─ src/
│  ├─ components/
│  │  ├─ CoffeeCard.tsx
│  │  ├─ CurrencySelector.tsx
│  │  └─ ...other components
│  │
│  ├─ contexts/
│  │  ├─ CartContext.tsx
│  │  └─ CurrencyContext.tsx
│  │
│  ├─ hooks/
│  │  ├─ useCoffees.ts                   ← API hook (uses API service)
│  │  └─ ...other hooks
│  │
│  └─ pages/
│     ├─ CoffeeMenu.tsx
│     ├─ CoffeeDetails.tsx
│     └─ Cart.tsx
│
├─ coffee-admin-shop/
│  ├─ .env.example                       ← Admin env template
│  ├─ .env.local                         ← Admin env (create from example)
│  │
│  ├─ src/
│  │  ├─ services/
│  │  │  └─ api.js                       ← ★ NEW: API client
│  │  │
│  │  ├─ context/
│  │  │  └─ CoffeeContext.jsx            ← ★ UPDATED: Now uses API
│  │  │
│  │  ├─ lib/
│  │  │  └─ supabase.js                  ← ⚠️ No longer used
│  │  │
│  │  └─ pages/
│  │     ├─ AddCoffee/
│  │     │  └─ AddCoffee.jsx             ← ★ UPDATED: Async form
│  │     │
│  │     ├─ ManageCoffees/
│  │     │  └─ ManageCoffees.jsx         ← ★ UPDATED: Async delete
│  │     │
│  │     ├─ ViewCoffee/
│  │     ├─ Dashboard/
│  │     └─ ManageIngredients/
│  │
│  └─ package.json
│
├─ MIGRATION_GUIDE.md                    ← Detailed migration docs
├─ SETUP_API_CHECKLIST.md                ← Setup & testing guide
├─ API_MIGRATION_SUMMARY.md              ← Quick reference
│
├─ package.json
├─ vite.config.ts
└─ ...other config files
```

## Environment Setup

### Main Frontend (.env.local)
```bash
# c:\Users\ADMIN\Desktop\Coffee-shop-Front\.env.local
VITE_API_BASE_URL=http://localhost:3001
```

### Admin Panel (.env.local)
```bash
# c:\Users\ADMIN\Desktop\Coffee-shop-Front\coffee-admin-shop\.env.local
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (.env - optional)
```bash
# c:\Users\ADMIN\Desktop\Coffee-shop-Front\.env
PORT=3001
NODE_ENV=development
```

## Service Dependencies

```
┌──────────────────────────────────────┐
│   React Components                   │
├──────────────────────────────────────┤
│  • AddCoffee.jsx                    │
│  • ManageCoffees.jsx                │
│  • CoffeeMenu.tsx (frontend)        │
└──────────────┬───────────────────────┘
               │
               │ calls
               ▼
┌──────────────────────────────────────┐
│   CoffeeContext                      │
├──────────────────────────────────────┤
│  • addCoffee()                      │
│  • updateCoffee()                   │
│  • deleteCoffee()                   │
│  • Loading, error handling          │
└──────────────┬───────────────────────┘
               │
               │ calls
               ▼
┌──────────────────────────────────────┐
│   API Service (api.js)               │
├──────────────────────────────────────┤
│  • createCoffee()                   │
│  • updateCoffee()                   │
│  • deleteCoffee()                   │
│  • Data transformation              │
└──────────────┬───────────────────────┘
               │
               │ HTTP fetch()
               ▼
┌──────────────────────────────────────┐
│   Express Backend (server/index.js)  │
├──────────────────────────────────────┤
│  • Route handlers                   │
│  • Data validation                  │
│  • File I/O operations              │
└──────────────┬───────────────────────┘
               │
               │ File I/O
               ▼
┌──────────────────────────────────────┐
│   Filesystem Storage                 │
├──────────────────────────────────────┤
│  • server/data/coffees.json         │
└──────────────────────────────────────┘
```

---

**This architecture ensures:**
- ✅ Clear separation of concerns
- ✅ Reusable API service
- ✅ Scalable backend
- ✅ Easy to add authentication
- ✅ Easy to switch to database
- ✅ Works offline with fallback
- ✅ Consistent data across apps
