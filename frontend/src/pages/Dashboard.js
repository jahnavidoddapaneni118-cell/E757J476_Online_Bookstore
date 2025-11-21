import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../utils/api';
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin()) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <CustomerDashboard user={user} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your bookstore today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats?.overview?.totalCustomers || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Books"
          value={stats?.overview?.totalBooks || 0}
          icon={BookOpen}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.overview?.totalOrders || 0}
          icon={ShoppingCart}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.overview?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats?.charts?.orderStatus?.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status.status)}`} />
                    <span className="text-sm font-medium capitalize">{status.status}</span>
                  </div>
                  <span className="text-sm text-gray-600">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Books */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Books</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats?.tables?.topBooks?.slice(0, 5).map((book) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${book.price} • {book.totalSold} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${book.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats?.tables?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.totalAmount}</p>
                    <span className={`badge ${getOrderStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {stats?.tables?.lowStock?.length > 0 ? (
                stats.tables.lowStock.map((book) => (
                  <div key={book.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-500">${book.price}</p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-warning">
                        {book.stockQty} left
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">All books are well stocked!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Discover your next favorite book in our collection.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Browse Books</h3>
                <p className="text-sm text-gray-600">Explore our extensive collection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600">Track your recent purchases</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <p className="text-sm text-gray-600">Browse by genre</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome to Online Bookstore
          </h3>
          <p className="text-gray-600 mb-4">
            You're now part of our reading community! Here's what you can do:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              Browse thousands of books across different categories
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              Place orders and track their status
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              Read reviews and ratings from other customers
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              Manage your profile and order history
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped: 'bg-purple-400',
    delivered: 'bg-green-400',
    cancelled: 'bg-red-400',
    completed: 'bg-green-500',
  };
  return colors[status] || 'bg-gray-400';
};

const getOrderStatusBadge = (status) => {
  const badges = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
    completed: 'badge-success',
  };
  return badges[status] || 'badge-info';
};

export default Dashboard;