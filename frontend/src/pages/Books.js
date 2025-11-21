import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { booksAPI, categoriesAPI } from '../utils/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  DollarSign,
  Package
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Books = () => {
  const auth = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [pagination.currentPage, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy,
        sortOrder,
      };

      const response = await booksAPI.getBooks(params);
      setBooks(response.data.data.books);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchBooks();
  };

  const handleFilterChange = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchBooks();
  };

  const openCreateModal = () => {
    setEditingBook(null);
    reset();
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    reset({
      title: book.title,
      isbn: book.isbn,
      price: book.price,
      stockQty: book.stockQty,
      description: book.description,
      imageUrl: book.imageUrl,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingBook) {
        await booksAPI.updateBook(editingBook.id, data);
        toast.success('Book updated successfully');
      } else {
        await booksAPI.createBook(data);
        toast.success('Book created successfully');
      }
      closeModal();
      fetchBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        `Failed to ${editingBook ? 'update' : 'create'} book`
      );
    }
  };

  const handleDelete = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await booksAPI.deleteBook(book.id);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Management - CRUD Demo</h1>
          <p className="mt-2 text-gray-600">
            Manage your book inventory and catalog - Create, Read, Update, Delete operations
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search books by title or description..."
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="form-input"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Min Price</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => {
                      setPriceRange(prev => ({ ...prev, min: e.target.value }));
                      handleFilterChange();
                    }}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Max Price</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => {
                      setPriceRange(prev => ({ ...prev, max: e.target.value }));
                      handleFilterChange();
                    }}
                    placeholder="9999"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Sort By</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                      handleFilterChange();
                    }}
                    className="form-input"
                  >
                    <option value="created_at-DESC">Newest First</option>
                    <option value="created_at-ASC">Oldest First</option>
                    <option value="title-ASC">Title A-Z</option>
                    <option value="title-DESC">Title Z-A</option>
                    <option value="price-ASC">Price Low to High</option>
                    <option value="price-DESC">Price High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Books Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="spinner"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory || priceRange.min || priceRange.max
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first book.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => openEditModal(book)}
              onDelete={() => handleDelete(book)}
              onView={() => setViewingBook(book)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{' '}
            of {pagination.totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary btn-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 &&
                    page <= pagination.currentPage + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`btn-sm ${
                      page === pagination.currentPage
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary btn-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <BookModal
          book={editingBook}
          categories={categories}
          onSubmit={handleSubmit(onSubmit)}
          onClose={closeModal}
          register={register}
          errors={errors}
        />
      )}

      {/* View Modal */}
      {viewingBook && (
        <BookViewModal
          book={viewingBook}
          onClose={() => setViewingBook(null)}
        />
      )}
    </div>
  );
};

const BookCard = ({ book, onEdit, onDelete, onView }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative">
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=No+Image';
            }}
          />
        )}
        <div className="absolute top-2 right-2 space-x-1">
          {book.avgRating > 0 && (
            <span className="badge badge-info">
              <Star className="h-3 w-3 mr-1" />
              {book.avgRating}
            </span>
          )}
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="font-semibold text-gray-900 truncate" title={book.title}>
          {book.title}
        </h3>
        
        {book.authors && book.authors.length > 0 && (
          <p className="text-sm text-gray-600 truncate">
            by {book.authors.map(a => a.name).join(', ')}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">{book.price}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-1" />
            {book.stockQty}
          </div>
        </div>
        
        {book.categories && book.categories.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {book.categories.slice(0, 2).map((category) => (
                <span key={category.category_id} className="badge badge-info">
                  {category.name}
                </span>
              ))}
              {book.categories.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{book.categories.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 space-x-2">
          <button
            onClick={onView}
            className="btn-secondary btn-sm flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-secondary btn-sm"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="btn-danger btn-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BookModal = ({ book, categories, onSubmit, onClose, register, errors }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            {book ? 'Edit Book' : 'Add New Book'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="form-input"
                placeholder="Book title"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">ISBN</label>
              <input
                {...register('isbn')}
                className="form-input"
                placeholder="ISBN number"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price *</label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                })}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="form-error">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Stock Quantity</label>
              <input
                {...register('stockQty', {
                  min: { value: 0, message: 'Stock cannot be negative' },
                })}
                type="number"
                className="form-input"
                placeholder="0"
              />
              {errors.stockQty && (
                <p className="form-error">{errors.stockQty.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="form-input"
              placeholder="Book description"
            />
          </div>
          
          <div>
            <label className="form-label">Image URL</label>
            <input
              {...register('imageUrl')}
              type="url"
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {book ? 'Update Book' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookViewModal = ({ book, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Book Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Book Image */}
            <div>
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full rounded-lg shadow-soft"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Book Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                {book.authors && book.authors.length > 0 && (
                  <p className="text-lg text-gray-600">
                    by {book.authors.map(a => a.name).join(', ')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                  <span className="text-xl font-semibold text-green-600">
                    ${book.price}
                  </span>
                </div>
                
                {book.avgRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium">{book.avgRating}</span>
                    <span className="text-gray-500 ml-1">
                      ({book.reviewCount} reviews)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-500 mr-1" />
                  <span className="text-gray-600">
                    {book.stockQty} in stock
                  </span>
                </div>
              </div>
              
              {book.isbn && (
                <div>
                  <span className="text-sm text-gray-500">ISBN: </span>
                  <span className="text-sm text-gray-900">{book.isbn}</span>
                </div>
              )}
              
              {book.publisher && (
                <div>
                  <span className="text-sm text-gray-500">Publisher: </span>
                  <span className="text-sm text-gray-900">{book.publisher}</span>
                </div>
              )}
              
              {book.pubDate && (
                <div>
                  <span className="text-sm text-gray-500">Published: </span>
                  <span className="text-sm text-gray-900">
                    {new Date(book.pubDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {book.categories && book.categories.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Categories:</span>
                  <div className="flex flex-wrap gap-2">
                    {book.categories.map((category) => (
                      <span key={category.category_id} className="badge badge-info">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {book.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Reviews */}
          {book.recentReviews && book.recentReviews.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Recent Reviews
              </h4>
              <div className="space-y-4">
                {book.recentReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 font-medium">
                          {review.reviewerName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;