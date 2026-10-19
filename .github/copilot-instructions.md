## Purpose
Short, actionable guidance for AI coding agents working on this React + Vite frontend.

## How to run (developer commands)
- Install deps: `npm install`
- Start dev server: `npm run dev` (uses Vite)
- Build for production: `npm run build`
- Quick lint: `npm run lint`

These scripts are defined in `package.json`.

## Big-picture architecture
- Frontend: React (React 19) + Vite
- State: Redux Toolkit + `redux-persist` (store under `src/stores/` and slices in `src/stores/slices/`)
- HTTP: `axios` with a centralized client at `src/config/axios/axiosClient.js`
- Services: thin wrappers for API calls in `src/services/*` (e.g., `productService.js`, `userService.js`)
- Routing: React Router entries in `src/routers/` (`AppRoutes.jsx`, `AdminRoute.jsx`)
- Layouts & pages: `src/layouts/` and `src/pages/*` (pages organized by feature)
- Styling: SCSS modules under `src/styles/` (component and page folders)

Design rationale (observed)
- Services decouple API endpoints from UI. When adding endpoints, add or update functions in `src/services/*` and use the shared `axiosClient`.
- Components/pages manage UI state (loading, error) locally and call services; follow that pattern when adding features (see `src/pages/home/ProductManagement.jsx`).

Project-specific conventions
- File naming: React components and pages use PascalCase (`ProductManagement.jsx`, `AdminDashboard.jsx`).
- Services export a default object (e.g. `export default { getAllProducts, ... }`).
- Navigation: route changes often use `useNavigate()` and sometimes pass `state` (e.g., edit uses `navigate('/add-product', { state: { product } })`).
- Defensive data access: many components assume nested arrays (e.g., `product.sizes[0]?.imageUrl`). Validate arrays before indexing.

Integration points and external deps
- Firebase config located at `src/config/firebase/firebaseConfig.js` — update when changing auth/storage usage.
- Axios base/client in `src/config/axios/axiosClient.js` — update interceptors/auth headers here.
- Third-party UI libs: `antd`, `lucide-react`, `react-toastify` — prefer existing UI patterns/components when adding UI.

Common data shape notes (examples from product pages)
- Product structure (observed in `ProductManagement.jsx`):
  - product.sizes: array of size objects
  - size.flavors: array of flavor objects with `quantityInStock`, `quantitySold`, `active` flags
  - size fields: `imageUrl`, `imageUrls` (gallery), `price`, `discountPrice`, `size`, `weight`

Coding guidelines for agents
- Small, focused PRs. Mirror existing patterns (service -> page -> component).
- Update `src/config/axios/axiosClient.js` for cross-cutting HTTP changes (auth token handling, base URL).
- Update `src/services/*` for new endpoints and unit-test wrappers if adding business logic.
- When changing UI, update relevant SCSS under `src/styles/` and follow existing naming (BEM-like classes). See `src/styles/pages/home/ProductManagement.scss`.
- Run `npm run lint` before PR.

Debugging tips
- Reproduce front-end errors by running `npm run dev` and opening browser console and Vite terminal logs.
- For API issues, inspect network tab and check axios client interceptors in `src/config/axios/axiosClient.js`.

Where to look first when asked to implement a feature
1. Identify or add service method in `src/services/*`.
2. Wire UI in the appropriate page under `src/pages/*` and follow the loading/error pattern.
3. Add or update routes in `src/routers/AppRoutes.jsx`.
4. Add styles to `src/styles/` and keep class names consistent.

If anything here is unclear or you'd like more examples (e.g., a template service + page), tell me what feature you plan to add and I will expand the instructions with concrete code snippets.
