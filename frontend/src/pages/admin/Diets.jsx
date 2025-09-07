import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useGetDietPlansQuery, useDeleteDietPlanMutation } from '../../redux/api/gymApi';
import { setFilters } from '../../redux/slices/dietPlansSlice';
import { Search, Plus, Edit, Trash2, Loader2, Eye, Copy, Check } from 'lucide-react';
import '../../styles/admin/DietsPage.css';

const DietsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filters } = useSelector(state => state.dietPlans);
  const { data, isLoading, error, refetch } = useGetDietPlansQuery(filters);
  const [deleteDietPlan] = useDeleteDietPlanMutation();

  const [copiedUrl, setCopiedUrl] = useState(null);

  const dietPlans = data?.dietPlans || [];
  const pagination = data?.pagination || {};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      try {
        await deleteDietPlan(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete diet plan:', err);
      }
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    if (error.status === 401) {
      // The baseQueryWithReauth will handle the redirect
      return (
        <div className="error-message">
          Your session has expired. Redirecting to login...
        </div>
      );
    }
    return (
      <div className="error-message">
        Error loading diet plans: {error.data?.message || error.message}
      </div>
    );
  }

  return (
    <div className="diets-page-container">
      <div className="diets-page-content">
        <div className="diets-header">
          <div className="header-title">
            <h1>Diet Plans</h1>
            <p>Create and manage diet plans for your members.</p>
          </div>
          <Link to="/admin/diets/new" className="add-diet-btn">
            <Plus size={20} />
            Create Diet Plan
          </Link>
        </div>

        <div className="filters-container">
          <div className="filters-flex">
            <div className="search-input-container">
              <Search size={20} className="icon" />
              <input
                type="text"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => dispatch(setFilters({ search: e.target.value, page: 1 }))}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="diets-table-container">
          <div className="table-wrapper">
            <table className="diets-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Target Audience</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin inline-block" /></td></tr>
                ) : error ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-red)' }}>Error loading diet plans.</td></tr>
                ) : dietPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td><div className="title">{plan.title}</div></td>
                    <td><div className="audience">{plan.targetAudience.replace('_', ' ')}</div></td>
                    <td>{plan.duration}</td>
                    <td>
                      <div className="action-buttons">
                        <a href={plan.pdfUrl} target="_blank" rel="noopener noreferrer" className="icon-btn" title="View PDF">
                          <Eye size={16} />
                        </a>
                        <button onClick={() => handleCopyLink(plan.pdfUrl)} className="icon-btn" title="Copy PDF Link">
                          {copiedUrl === plan.pdfUrl ? <Check size={16} color="var(--green)" /> : <Copy size={16} />}
                        </button>
                        <button onClick={() => navigate(`/admin/diets/edit/${plan._id}`)} className="icon-btn" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(plan._id)} className="icon-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.total > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.count)} of {pagination.count} results</div>
              <div className="pagination-controls">
                <button onClick={() => dispatch(setFilters({ page: pagination.current - 1 }))} disabled={pagination.current === 1} className="page-btn">Previous</button>
                <span className="page-indicator">Page {pagination.current} of {pagination.total}</span>
                <button onClick={() => dispatch(setFilters({ page: pagination.current + 1 }))} disabled={pagination.current === pagination.total} className="page-btn">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietsPage;
