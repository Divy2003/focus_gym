import React from 'react';
import { Link } from 'react-router-dom';
import { useGetDietPlansQuery } from '../../features/diets/dietsApiSlice';
import DietPlansList from '../../components/admin/DietPlansList';
import '../../styles/admin/DietsPage.css';

const Diets = () => {
  const { data: dietPlans, isLoading, isError, error } = useGetDietPlansQuery();

  if (isLoading) return <div className="loading-spinner">Loading diet plans...</div>;
  if (isError) return <div className="error-message">Error: {error.data?.message || 'Failed to load diet plans.'}</div>;

  return (
    <div className="diets-page-container">
      <div className="page-header">
        <h1>Diet Plan Management</h1>
        <Link to="/admin/diets/new" className="add-diet-btn">+ Add Diet Plan</Link>
      </div>
      <DietPlansList dietPlans={dietPlans?.dietPlans} />
    </div>
  );
};

export default Diets;