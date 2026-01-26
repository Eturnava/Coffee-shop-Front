# Migration from Supabase to API-Based Architecture

## Overview

This document outlines the changes made to migrate your Coffee Shop application from Supabase to an API-based architecture. The backend API server handles all coffee data persistence while the frontend applications (main site and admin panel) communicate with it via REST endpoints.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Applications                 │
├────────────────────────────────────────────────────────┤
│  Main Coffee Shop (src/)        Admin Panel             │
│  - Browse coffees               (coffee-admin-shop/)    │
│  - View details                 - Add/Edit coffees      │
│  - Add to cart                  - Manage inventory      │
│  - Checkout                                            │
└────────────────────┬────────────────────────────────────┘
                     │
                ┌────▼──────────────────────┐
                │  API Service Layer        │
                │  (services/api.js)        │
                │  - Fetch coffees          │
                │  - CRUD operations        │
                │  - Data transformation    │
                └────┬──────────────────────┘
                     │
         ┌───────────▼────────────────┐
         │   Express Backend API      │
         │   (server/index.js)        │
         ├────────────────────────────┤
         │ GET    /api/coffees        │
         │ GET    /api/coffees/:id    │
         │ POST   /api/coffees        │
         │ PUT    /api/coffees/:id    │
         │ DELETE /api/coffees/:id    │
         └───────────┬────────────────┘
                     │
         ┌───────────▼────────────────┐
         │  File-based Storage        │
         │  (server/data/coffees.json)│
         └────────────────────────────┘
```

## What Changed

### 1. New API Service Layer
**File:** `coffee-admin-shop/src/services/api.js`

Provides HTTP client functions for all coffee operations:
- `fetchCoffees()` - Retrieve all coffees
- `fetchCoffeeById(id)` - Get a single coffee
- `createCoffee(data)` - Create new coffee
- `updateCoffee(id, data)` - Update existing coffee
- `deleteCoffee(id)` - Remove a coffee

Also includes helper functions for data transformation between admin panel format and API format.

### 2. Updated Admin Context
**File:** `coffee-admin-shop/src/context/CoffeeContext.jsx`

**Changes:**
- Replaced Supabase import with API service
- Removed Supabase connection logic
- Updated coffee CRUD methods to use API (with fallback to local storage)
- Added error handling and loading states
- Added `isAPIConnected` and `error` state tracking

**Before:**
```javascript
import { supabase } from '../lib/supabase'
const { error } = await supabase.from('coffees').insert(...)
```

**After:**
```javascript
import { createCoffee } from '../services/api'
const response = await createCoffee(coffeeData)
```

### 3. Enhanced Components
**Files:** 
- `coffee-admin-shop/src/pages/AddCoffee/AddCoffee.jsx`
- `coffee-admin-shop/src/pages/ManageCoffees/ManageCoffees.jsx`

**Changes:**
- Made submit/delete handlers async to support API calls
- Added loading and error states
- Disabled form inputs during submission
- Display user-friendly error messages
- Show loading indicators

### 4. Environment Configuration
**Files:**
- `.env.example` - Main frontend
- `coffee-admin-shop/.env.example` - Admin panel

Both now require:
```
VITE_API_BASE_URL=http://localhost:3001
```

## Removed Dependencies

The Supabase dependency (`@supabase/supabase-js`) is no longer used in the codebase. You can optionally remove it from `package.json` files if it's not needed elsewhere:

```bash
# In coffee-admin-shop directory
npm uninstall @supabase/supabase-js
```

## Backend API (No Changes Required)

The Express backend server in `server/index.js` already provides the required API endpoints:

```
GET  http://localhost:3001/health           - Health check
GET  http://localhost:3001/api/coffees      - List all coffees
GET  http://localhost:3001/api/coffees/:id  - Get single coffee
POST http://localhost:3001/api/coffees      - Create coffee
PUT  http://localhost:3001/api/coffees/:id  - Update coffee
DELETE http://localhost:3001/api/coffees/:id - Delete coffee
```

**Required Request Body Format:**
```json
{
  "name": "Espresso",
  "description": "Strong and concentrated coffee",
  "long_description": "Longer description...",
  "price_usd": 2.99,
  "price_gel": 8.07,
  "image_url": "https://example.com/image.jpg"
}
```

## Setup Instructions

### 1. Main Frontend

```bash
cd c:\Users\ADMIN\Desktop\Coffee-shop-Front

# Create .env.local from example
cp .env.example .env.local

# Edit .env.local and set API URL (already defaults to localhost:3001)
# VITE_API_BASE_URL=http://localhost:3001

# Install and run
npm install
npm run dev
```

### 2. Admin Panel

```bash
cd c:\Users\ADMIN\Desktop\Coffee-shop-Front\coffee-admin-shop

# Create .env.local from example
cp .env.example .env.local

# Edit .env.local and set API URL
# VITE_API_BASE_URL=http://localhost:3001

# Install and run
npm install
npm run dev
```

### 3. Backend API Server

```bash
cd c:\Users\ADMIN\Desktop\Coffee-shop-Front

# Install dependencies
npm install

# Start server (default port 3001)
npm run server
# Or with custom port: PORT=3001 npm run server
```

## Data Flow Example: Creating a Coffee

### Admin Panel Flow:
```
User fills form → AddCoffee.handleSubmit()
    ↓
addCoffee() from CoffeeContext
    ↓
transformCoffeeToAPI() - Convert format
    ↓
createCoffee() from API service
    ↓
fetch POST /api/coffees
    ↓
Backend validates & saves to JSON file
    ↓
Response with new coffee object
    ↓
transformCoffeeFromAPI() - Convert back to admin format
    ↓
setCoffees() - Update state
    ↓
Navigate back to dashboard
```

## Fallback Behavior

If the API connection fails, the admin panel will:
1. Log a warning
2. Continue using local storage (browser localStorage)
3. Show `isAPIConnected: false` in context
4. Display error messages to the user

This allows the application to still function offline, though changes won't persist to the server.

## Future Enhancements

### 1. Database Integration
Replace `server/data/coffees.json` with a database:

```javascript
// Current: File-based
const data = await fs.readFile(DATA_FILE)

// Future: Database
const coffees = await Coffee.findAll()
```

Options: PostgreSQL (Supabase), MongoDB, MySQL, etc.

### 2. Authentication
Add user authentication to secure the admin panel:

```javascript
app.post('/api/auth/login', async (req, res) => {
  // Verify credentials
  // Return JWT token
})

// Protected endpoint
app.use('/api/admin/*', verifyToken)
```

### 3. Image Upload
Currently using external URLs. Add image upload functionality:

```javascript
app.post('/api/coffees/:id/image', uploadMiddleware, (req, res) => {
  // Save image, update coffee record
})
```

### 4. Ingredients API
Create similar endpoints for ingredients management:

```
GET    /api/ingredients
POST   /api/ingredients
PUT    /api/ingredients/:id
DELETE /api/ingredients/:id
```

## Troubleshooting

### Frontend shows "API connection failed"
1. Check backend server is running on port 3001
2. Verify `VITE_API_BASE_URL` in `.env.local`
3. Check browser console for CORS errors
4. Ensure no firewall blocking port 3001

### Changes not persisting
1. Verify backend is running
2. Check `server/data/coffees.json` exists and is writable
3. Look for errors in backend console
4. Check application errors in browser console

### Form submissions fail with no error
1. Check network tab in browser DevTools
2. Verify API payload format matches server expectations
3. Check backend validation errors

## File Summary

| File | Purpose | Status |
|------|---------|--------|
| `coffee-admin-shop/src/services/api.js` | API client service | ✅ New |
| `coffee-admin-shop/src/context/CoffeeContext.jsx` | Context using API | ✅ Updated |
| `coffee-admin-shop/src/pages/AddCoffee/AddCoffee.jsx` | Add coffee form | ✅ Updated |
| `coffee-admin-shop/src/pages/ManageCoffees/ManageCoffees.jsx` | Coffee management | ✅ Updated |
| `coffee-admin-shop/.env.example` | Env template | ✅ Updated |
| `.env.example` | Env template | ✅ New |
| `server/index.js` | API server | ✅ No change needed |
| `coffee-admin-shop/src/lib/supabase.js` | Old Supabase client | ⚠️ Unused (can delete) |

## Next Steps

1. **Test the application:**
   - Start backend server
   - Run frontend and admin panel
   - Create, edit, delete a coffee
   - Verify data persists

2. **Update environment variables:**
   - Create `.env.local` files in both applications
   - Set `VITE_API_BASE_URL` to your backend URL

3. **Remove Supabase dependencies:**
   - Run `npm uninstall @supabase/supabase-js` in admin panel
   - Remove VITE_SUPABASE_* from any remaining env files

4. **Consider adding:**
   - Error logging
   - Request timeouts
   - Retry logic
   - API rate limiting
   - Input validation on backend

5. **For production:**
   - Deploy backend API to cloud (Heroku, Railway, AWS, etc.)
   - Update `VITE_API_BASE_URL` to production API URL
   - Add authentication
   - Set up HTTPS
   - Configure CORS properly
