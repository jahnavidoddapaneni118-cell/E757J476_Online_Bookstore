import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Charts from './pages/Charts';
// Note: You can create additional pages for Categories, Orders, etc.

// Landing page component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-br from-primary-50 to-blue-100 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Welcome to</span>{' '}
                  <span className="block text-primary-600 xl:inline">
                    Online Bookstore
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover thousands of books across different genres. 
                  A complete bookstore management system with advanced features 
                  for both customers and administrators.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Sign Up
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-r from-primary-400 to-blue-500 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl font-bold mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-2">CS 665 Project</h2>
              <p className="text-lg">Online Bookstore Management System</p>
              <div className="mt-6 text-sm opacity-90">
                <p>✨ User Authentication & Authorization</p>
                <p>📖 Complete CRUD Operations</p>
                <p>📊 Advanced Analytics & Visualizations</p>
                <p>🛒 Order Management System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your bookstore
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <FeatureItem
                title="User Management"
                description="Complete authentication system with role-based access control for customers and administrators."
                icon="👥"
              />
              <FeatureItem
                title="Book Catalog"
                description="Comprehensive CRUD operations for managing books, categories, authors, and publishers."
                icon="📚"
              />
              <FeatureItem
                title="Order Processing"
                description="Full order management system with status tracking and inventory management."
                icon="🛒"
              />
              <FeatureItem
                title="Analytics Dashboard"
                description="Rich data visualizations and reporting for business insights and performance tracking."
                icon="📊"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ title, description, icon }) => {
  return (
    <div className="relative">
      <div className="text-3xl mb-4">{icon}</div>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {title}
        </h3>
        <p className="mt-2 text-base text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
};

// Simple pages for Categories and Orders (you can expand these)
const Categories = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="mt-2 text-gray-600">
          Manage book categories and genres
        </p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600">
            Categories page is under development. This would include:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Create, edit, and delete categories</li>
            <li>• Assign books to categories</li>
            <li>• View category statistics</li>
            <li>• Manage category hierarchy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">
          View and manage customer orders
        </p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600">
            Orders page is under development. This would include:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• View all orders with filtering and search</li>
            <li>• Update order status</li>
            <li>• Process refunds and cancellations</li>
            <li>• Generate order reports</li>
            <li>• Customer order history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Books />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Orders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin-only routes */}
            <Route
              path="/charts"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <Charts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-xl font-semibold text-gray-900">Users Management</h2>
                      <p className="text-gray-600 mt-2">This page is under development.</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
                      <p className="text-gray-600 mt-2">This page is under development.</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;