# API Migration - Implementation Checklist

## Quick Setup

### Step 1: Environment Configuration ✅
- [x] Create `.env.local` in coffee-admin-shop
- [x] Create `.env.local` in main frontend
- [x] Set `VITE_API_BASE_URL=http://localhost:3001`

### Step 2: Backend Server Setup
- [ ] Navigate to project root directory
- [ ] Ensure `server/index.js` has proper CORS configuration
- [ ] Start backend: `npm run server`
- [ ] Verify it runs on http://localhost:3001
- [ ] Test health endpoint: `curl http://localhost:3001/health`

### Step 3: Admin Panel
- [ ] Navigate to `coffee-admin-shop/`
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env.local` has `VITE_API_BASE_URL=http://localhost:3001`
- [ ] Start: `npm run dev`
- [ ] Test API connection in console: `isAPIConnected` should be `true`

### Step 4: Main Frontend
- [ ] Navigate to main directory
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env.local` has `VITE_API_BASE_URL=http://localhost:3001`
- [ ] Start: `npm run dev`
- [ ] Verify coffee list loads from API

## Testing Checklist

### Admin Panel - Create Coffee
- [ ] Navigate to "Add New Coffee"
- [ ] Fill in all fields (name, description, price in USD/GEL, image URL)
- [ ] Submit form
- [ ] Verify coffee appears in "Manage Coffees" table
- [ ] Verify data persists in `server/data/coffees.json`

### Admin Panel - Update Coffee
- [ ] Click "Edit" on any coffee
- [ ] Modify a field (e.g., name, price)
- [ ] Submit form
- [ ] Verify changes appear in table
- [ ] Verify changes persist in JSON file

### Admin Panel - Delete Coffee
- [ ] Click "Delete" on any coffee
- [ ] Confirm deletion
- [ ] Verify coffee removed from table
- [ ] Verify removed from JSON file

### Main Frontend
- [ ] Refresh page
- [ ] Verify all coffees display correctly
- [ ] Click on a coffee to view details
- [ ] Add coffee to cart
- [ ] Verify cart updates

## Troubleshooting

### "isAPIConnected is false" or "API connection failed"

```bash
# 1. Check backend is running
curl http://localhost:3001/health
# Should return: {"ok": true}

# 2. Check VITE_API_BASE_URL in admin panel .env.local
cat coffee-admin-shop/.env.local

# 3. Check browser console for CORS errors
# If CORS error: verify server has correct CORS settings

# 4. Try different port (if 3001 is in use)
PORT=3002 npm run server
# Update .env.local: VITE_API_BASE_URL=http://localhost:3002
```

### Form submission shows "Failed to save coffee"

```bash
# 1. Check backend console for errors
# 2. Verify coffee payload format
# Required fields: name, description, price_usd, price_gel
# Optional: long_description, image_url

# 3. Check coffees.json exists and is writable
ls -la server/data/coffees.json

# 4. Verify no validation errors in backend response
# Check Network tab in DevTools
```

### Data not persisting

```bash
# 1. Verify server/data/coffees.json has write permissions
chmod 666 server/data/coffees.json

# 2. Check data directory exists
mkdir -p server/data

# 3. Restart backend server
# Stop (Ctrl+C) and restart: npm run server
```

### CORS errors

If you see: `Access to XMLHttpRequest blocked by CORS policy`

The server already has CORS configured. Verify in `server/index.js`:

```javascript
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:5173"],
  credentials: false,
}))
```

If using different ports, add them to the origin array.

## API Endpoint Reference

All endpoints use JSON and return JSON responses.

### GET /api/coffees
Fetch all coffees
```bash
curl http://localhost:3001/api/coffees
```
Response:
```json
[
  {
    "id": "uuid",
    "name": "Espresso",
    "description": "Strong coffee",
    "long_description": "...",
    "price_usd": 2.99,
    "price_gel": 8.07,
    "image_url": "https://...",
    "created_at": "2025-01-26T...",
    "updated_at": "2025-01-26T..."
  }
]
```

### GET /api/coffees/:id
Fetch single coffee
```bash
curl http://localhost:3001/api/coffees/550e8400-e29b-41d4-a716-446655440000
```

### POST /api/coffees
Create new coffee
```bash
curl -X POST http://localhost:3001/api/coffees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Coffee",
    "description": "Description",
    "price_usd": 3.99,
    "price_gel": 10.77
  }'
```

### PUT /api/coffees/:id
Update coffee
```bash
curl -X PUT http://localhost:3001/api/coffees/550e8400... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description",
    "price_usd": 4.99,
    "price_gel": 13.47
  }'
```

### DELETE /api/coffees/:id
Delete coffee
```bash
curl -X DELETE http://localhost:3001/api/coffees/550e8400...
```

## Key Changes Summary

### What's New
- ✅ `coffee-admin-shop/src/services/api.js` - HTTP client
- ✅ `.env.example` files - Environment templates
- ✅ Enhanced error handling in components
- ✅ Loading states in forms

### What's Updated
- ✅ `CoffeeContext.jsx` - Now uses API
- ✅ `AddCoffee.jsx` - Async form submission
- ✅ `ManageCoffees.jsx` - Async delete with loading

### What's Unchanged
- ✅ `server/index.js` - Already had API
- ✅ Database schema - Using same JSON format
- ✅ UI/UX - No visual changes

## Success Criteria

- [ ] Backend server starts without errors
- [ ] Admin panel connects to API
- [ ] Can create a new coffee
- [ ] Can edit existing coffee
- [ ] Can delete a coffee
- [ ] Main frontend displays coffees
- [ ] Data persists across page reloads
- [ ] Error messages display correctly
- [ ] Loading indicators show during operations

## Performance Tips

### For Development
- Keep backend server running in one terminal
- Run admin panel in another terminal
- Enable browser DevTools Network tab for debugging

### For Production
1. Deploy backend to cloud service (Heroku, Railway, AWS Lambda, etc.)
2. Update `VITE_API_BASE_URL` in production build
3. Add request timeout (default: no timeout)
4. Consider caching responses with React Query
5. Add request retry logic for better reliability

## Questions?

Check these files for more details:
- `MIGRATION_GUIDE.md` - Full migration documentation
- `server/index.js` - Backend API implementation
- `coffee-admin-shop/src/services/api.js` - Frontend API client
- `coffee-admin-shop/src/context/CoffeeContext.jsx` - State management
