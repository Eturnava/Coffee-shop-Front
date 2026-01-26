# Quick Reference Card - API Migration

## 🚀 Quick Start (5 mins)

### Step 1: Setup Backend
```bash
cd c:\Users\ADMIN\Desktop\Coffee-shop-Front
npm install
npm run server
```
✓ Should see: `Coffee API running on http://localhost:3001`

### Step 2: Setup Admin Panel
```bash
cd coffee-admin-shop
npm install
cp .env.example .env.local
npm run dev
```
✓ Should open admin panel on http://localhost:5174

### Step 3: Setup Frontend
```bash
cd ..
cp .env.example .env.local
npm run dev
```
✓ Should open frontend on http://localhost:5173

## 🔌 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/coffees` | GET | List all |
| `/api/coffees/:id` | GET | Get one |
| `/api/coffees` | POST | Create |
| `/api/coffees/:id` | PUT | Update |
| `/api/coffees/:id` | DELETE | Delete |

## 📦 Request Body

```json
{
  "name": "Coffee Name",
  "description": "Short desc",
  "long_description": "Long desc (optional)",
  "price_usd": 2.99,
  "price_gel": 8.07,
  "image_url": "https://..."
}
```

## 📝 Environment Variables

```bash
# Both frontends need:
VITE_API_BASE_URL=http://localhost:3001

# For production:
VITE_API_BASE_URL=https://yourdomain.com
```

## 🧪 Test API Manually

```bash
# List all coffees
curl http://localhost:3001/api/coffees

# Create coffee
curl -X POST http://localhost:3001/api/coffees \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","price_usd":1.99,"price_gel":5.37}'

# Get one coffee
curl http://localhost:3001/api/coffees/<ID>

# Update coffee
curl -X PUT http://localhost:3001/api/coffees/<ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","description":"New desc","price_usd":2.99,"price_gel":8.07}'

# Delete coffee
curl -X DELETE http://localhost:3001/api/coffees/<ID>
```

## 💾 Data Storage

**Location:** `server/data/coffees.json`

**Format:**
```json
{
  "coffees": [
    {
      "id": "uuid",
      "name": "Coffee",
      "description": "Desc",
      "price_usd": 2.99,
      "price_gel": 8.07,
      ...
    }
  ]
}
```

## 🔄 API Service Methods

```javascript
// Import
import {
  fetchCoffees,
  fetchCoffeeById,
  createCoffee,
  updateCoffee,
  deleteCoffee,
  transformCoffeeToAPI,
  transformCoffeeFromAPI
} from '../services/api'

// Use
const coffees = await fetchCoffees()
const coffee = await fetchCoffeeById(id)
const newCoffee = await createCoffee(data)
const updated = await updateCoffee(id, data)
await deleteCoffee(id)
```

## 🛠️ Context Methods

```javascript
const {
  coffees,
  ingredients,
  addCoffee,           // async
  updateCoffee,        // async
  deleteCoffee,        // async
  isAPIConnected,
  loading,
  error
} = useCoffeeContext()
```

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `isAPIConnected` is false | Start backend: `npm run server` |
| Port 3001 in use | Change: `PORT=3002 npm run server` |
| `.env.local` not found | Copy: `cp .env.example .env.local` |
| CORS error | Backend already configured for localhost |
| Data not saving | Check `server/data/` has write permissions |

## 📊 State Management

```javascript
// Admin Context provides:
{
  // Data
  coffees: [],           // Array of coffees from API
  ingredients: [],       // Array of ingredients (local)
  
  // Status
  isAPIConnected: bool,  // API available?
  loading: bool,         // Is loading?
  error: string,         // Error message
  
  // Methods (all async)
  addCoffee(data),
  updateCoffee(id, data),
  deleteCoffee(id),
  addIngredient(data),
  updateIngredient(id, data),
  deleteIngredient(id),
  calculateCoffeePrice(ingredients)
}
```

## 🔄 Data Format Conversion

```javascript
// Admin Panel Format
{
  id: "1",
  title: "Espresso",
  description: "Strong",
  image: "url",
  country: "Italy",
  caffeine: 75,
  ingredients: ["ing_1"]
}

// ↔️ Conversion

// API Format
{
  id: "uuid",
  name: "Espresso",
  description: "Strong",
  image_url: "url",
  price_usd: 2.99,
  price_gel: 8.07
}
```

## 📱 Main Frontend Hook

```javascript
// src/hooks/useCoffees.ts
import { useCoffees, useCoffee } from '@/hooks/useCoffees'

// List all coffees
const { data: coffees, isLoading } = useCoffees()

// Get single coffee
const { data: coffee } = useCoffee(id)
```

## 🚨 Error Handling

```javascript
try {
  await addCoffee(data)
} catch (error) {
  console.error('Error:', error.message)
  setError(error.message)
  // Show error to user
}
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `coffee-admin-shop/src/services/api.js` | HTTP client |
| `coffee-admin-shop/src/context/CoffeeContext.jsx` | State mgmt |
| `server/index.js` | API server |
| `server/data/coffees.json` | Data storage |
| `.env.local` | Frontend config |
| `coffee-admin-shop/.env.local` | Admin config |

## 🌍 Deployment URLs

```bash
# Development
Frontend:    http://localhost:5173
Admin:       http://localhost:5174
API:         http://localhost:3001

# Production (update .env.local)
Frontend:    https://yourdomain.com
Admin:       https://yourdomain.com/admin
API:         https://api.yourdomain.com
```

## 📖 Documentation Files

| Document | Content |
|----------|---------|
| `MIGRATION_GUIDE.md` | Full technical migration details |
| `SETUP_API_CHECKLIST.md` | Step-by-step setup & testing |
| `API_MIGRATION_SUMMARY.md` | Quick summary |
| `ARCHITECTURE.md` | System architecture diagrams |
| This file | Quick reference card |

## ✅ Verification Checklist

- [ ] Backend runs without errors
- [ ] Admin panel shows "Connected to API"
- [ ] Can create a coffee
- [ ] Can edit a coffee
- [ ] Can delete a coffee
- [ ] Frontend displays coffees
- [ ] Data persists after page reload
- [ ] Error messages display
- [ ] Loading indicators show during operations

## 🎯 Next Steps

1. **Test thoroughly** using SETUP_API_CHECKLIST.md
2. **Review logs** in browser console and server terminal
3. **Commit changes** to git
4. **Plan production deployment** when ready
5. **Consider adding** authentication, database, image upload

## 💡 Pro Tips

- Keep terminal open showing backend logs for debugging
- Use browser DevTools Network tab to inspect API calls
- Check `server/data/coffees.json` to see data directly
- Refresh browser to test data persistence
- Test with both created coffees and pre-loaded data

## 🆘 Help

1. Check console errors (browser DevTools)
2. Check server logs (terminal running API)
3. Read SETUP_API_CHECKLIST.md troubleshooting
4. Verify environment variables (.env.local)
5. Check that services are running on correct ports

---

**You're all set!** 🎉

Your Coffee Shop is now using API-based architecture instead of Supabase.
