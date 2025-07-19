import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getBlogs, setFilters } from '../redux/slices/blogSlice';
import { FiSearch, FiFilter, FiHeart, FiMessageCircle, FiEye, FiClock } from 'react-icons/fi';
import { formatDateRelative, createExcerpt, BLOG_CATEGORIES, SORT_OPTIONS } from '../utils/helpers';

const Home = () => {
  const dispatch = useDispatch();
  const { blogs, pagination, isLoading, filters } = useSelector((state) => state.blog);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getBlogs({
      page: 1,
      limit: 10,
      category: filters.category,
      search: filters.search,
      sort: filters.sort
    }));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleCategoryFilter = (category) => {
    dispatch(setFilters({ category, page: 1 }));
  };

  const handleSortChange = (sort) => {
    dispatch(setFilters({ sort, page: 1 }));
  };

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      dispatch(getBlogs({
        page: pagination.currentPage + 1,
        limit: 10,
        category: filters.category,
        search: filters.search,
        sort: filters.sort
      }));
    }
  };

  const BlogCard = ({ blog }) => (
    <article className="card p-6 hover:shadow-lg transition-shadow duration-200">
      {blog.featuredImage && (
        <div className="mb-4">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {blog.category}
        </span>
        <span className="text-gray-400 text-sm">•</span>
        <span className="text-gray-500 text-sm flex items-center gap-1">
          <FiClock size={14} />
          {blog.readTime} min read
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
        <Link 
          to={`/blog/${blog.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {blog.title}
        </Link>
      </h2>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {blog.excerpt || createExcerpt(blog.content, 150)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {blog.author.avatar ? (
            <img
              src={blog.author.avatar}
              alt={blog.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {blog.author.firstName?.[0] || blog.author.username[0]}
              </span>
            </div>
          )}
          <div>
            <Link
              to={`/profile/${blog.author.username}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {blog.author.firstName ? 
                `${blog.author.firstName} ${blog.author.lastName}` : 
                blog.author.username
              }
            </Link>
            <p className="text-xs text-gray-500">
              {formatDateRelative(blog.publishedAt || blog.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <FiHeart size={16} />
            {blog.likeCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <FiMessageCircle size={16} />
            {blog.commentCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <FiEye size={16} />
            {blog.views || 0}
          </span>
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Stories
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Read and share stories from writers around the world. Join our community of passionate bloggers.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Reading
          </Link>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center gap-2"
            >
              <FiFilter size={16} />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.category === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    {BLOG_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          filters.category === category
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input-field"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading && blogs.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="loading-spinner"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Load More */}
              {pagination.hasNext && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="btn-primary px-8 py-3 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More Articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
