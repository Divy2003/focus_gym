
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteDietPlanMutation } from '../../features/diets/dietsApiSlice';
import ConfirmationModal from './ConfirmationModal';
import '../../styles/admin/DietPlansList.css';

const DietPlansList = ({ dietPlans }) => {
  if (!dietPlans || dietPlans.length === 0) {
    return <p>No diet plans found.</p>;
  }
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [deleteDietPlan] = useDeleteDietPlanMutation();

  const toggleExpand = (id) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteDietPlan(selectedPlan._id);
    setDeleteModalOpen(false);
  };

  return (
    <div className="diet-plans-list-container">
      {dietPlans.map(plan => (
        <div key={plan._id} className="diet-plan-card">
          <div className="card-header">
            <h3>{plan.title}</h3>
            <div className="card-actions">
              <button onClick={() => toggleExpand(plan._id)}>{expandedPlan === plan._id ? 'Collapse' : 'Expand'}</button>
              <Link to={`/admin/diets/edit/${plan._id}`} className="edit-link">Edit</Link>
              <button onClick={() => openDeleteModal(plan)} className="delete-btn">Delete</button>
            </div>
          </div>
          {expandedPlan === plan._id && (
            <div className="card-details">
              <p><strong>Target Audience:</strong> {plan.targetAudience.replace('_', ' ')}</p>
              <h4>Meals:</h4>
              {plan.meals.map((meal, index) => (
                <div key={index} className="meal-details">
                  <h5>{meal.name}</h5>
                  <ul>
                    {meal.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.food} ({item.quantity}) - {item.calories} kcal
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {isDeleteModalOpen && <ConfirmationModal title="Delete Diet Plan" message={`Are you sure you want to delete ${selectedPlan?.title}?`} onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} />}
    </div>
  );
};

export default DietPlansList;
