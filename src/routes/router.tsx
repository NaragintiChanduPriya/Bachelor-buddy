import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireOnboarding } from './RequireOnboarding'
import { RouteError } from './RouteError'

/** Every page is lazy so each route ships its own chunk. */
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Food = lazy(() => import('./pages/Food'))
const FoodDetail = lazy(() => import('./pages/FoodDetail'))
const Groceries = lazy(() => import('./pages/Groceries'))
const Shop = lazy(() => import('./pages/Shop'))
const ShopDetail = lazy(() => import('./pages/ShopDetail'))
const Deals = lazy(() => import('./pages/Deals'))
const Homes = lazy(() => import('./pages/Homes'))
const HomeDetail = lazy(() => import('./pages/HomeDetail'))
const Savings = lazy(() => import('./pages/Savings'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Budget = lazy(() => import('./pages/Budget'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Settings = lazy(() => import('./pages/Settings'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const NotFound = lazy(() => import('./NotFound'))

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <Onboarding />,
    errorElement: <RouteError />,
  },
  {
    path: '/',
    element: <RequireOnboarding />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Dashboard />, errorElement: <RouteError /> },
          { path: 'chat', element: <Chat />, errorElement: <RouteError /> },
          { path: 'food', element: <Food />, errorElement: <RouteError /> },
          { path: 'food/:id', element: <FoodDetail />, errorElement: <RouteError /> },
          { path: 'groceries', element: <Groceries />, errorElement: <RouteError /> },
          { path: 'shop', element: <Shop />, errorElement: <RouteError /> },
          { path: 'shop/:id', element: <ShopDetail />, errorElement: <RouteError /> },
          { path: 'deals', element: <Deals />, errorElement: <RouteError /> },
          { path: 'homes', element: <Homes />, errorElement: <RouteError /> },
          { path: 'homes/:id', element: <HomeDetail />, errorElement: <RouteError /> },
          { path: 'savings', element: <Savings />, errorElement: <RouteError /> },
          { path: 'expenses', element: <Expenses />, errorElement: <RouteError /> },
          { path: 'budget', element: <Budget />, errorElement: <RouteError /> },
          { path: 'notifications', element: <Notifications />, errorElement: <RouteError /> },
          { path: 'settings', element: <Settings />, errorElement: <RouteError /> },
        ],
      },
    ],
  },
  {
    // Outside the app shell, so an unknown URL shows a clean full page without the sidebar.
    path: '*',
    element: (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ),
  },
])
