import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAddDietPlanMutation, useUpdateDietPlanMutation, useGetDietPlansQuery } from '../../features/diets/dietsApiSlice';
import '../../styles/admin/DietPlanForm.css';

const DietPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    targetAudience: 'general',
    meals: [{ name: '', items: [{ food: '', quantity: '', calories: 0, protein: 0 }] }],
  });
  const [error, setError] = useState('');

  const { data: dietPlan } = useGetDietPlansQuery(undefined, {
    selectFromResult: ({ data }) => ({ data: data?.find(p => p._id === id) }),
    skip: !isEditMode,
  });

  const [addDietPlan, { isLoading: isAdding }] = useAddDietPlanMutation();
  const [updateDietPlan, { isLoading: isUpdating }] = useUpdateDietPlanMutation();

  useEffect(() => {
    if (isEditMode && dietPlan) {
      setFormData(dietPlan);
    }
  }, [isEditMode, dietPlan]);

  const handlePlanChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMealChange = (mealIndex, e) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex][e.target.name] = e.target.value;
    setFormData({ ...formData, meals: newMeals });
  };

  const handleItemChange = (mealIndex, itemIndex, e) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].items[itemIndex][e.target.name] = e.target.value;
    setFormData({ ...formData, meals: newMeals });
  };

  const addMeal = () => {
    setFormData({ ...formData, meals: [...formData.meals, { name: '', items: [{ food: '', quantity: '', calories: 0, protein: 0 }] }] });
  };

  const addItem = (mealIndex) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].items.push({ food: '', quantity: '', calories: 0, protein: 0 });
    setFormData({ ...formData, meals: newMeals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditMode) {
        await updateDietPlan({ id, ...formData }).unwrap();
      } else {
        await addDietPlan(formData).unwrap();
      }
      navigate('/admin/diets');
    } catch (err) {
      setError(err.data?.message || 'Failed to save diet plan');
    }
  };

  return (
    <div className="diet-plan-form-container">
      <h1>{isEditMode ? 'Edit' : 'Create'} Diet Plan</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handlePlanChange} required />
        </div>
        <div className="form-group">
          <label>Target Audience</label>
          <select name="targetAudience" value={formData.targetAudience} onChange={handlePlanChange}>
            <option value="general">General</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="weight_gain">Weight Gain</option>
            <option value="muscle_building">Muscle Building</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <h3>Meals</h3>
        {formData.meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="meal-form-section">
            <input type="text" name="name" placeholder="Meal Name (e.g., Breakfast)" value={meal.name} onChange={(e) => handleMealChange(mealIndex, e)} required />
            {meal.items.map((item, itemIndex) => (
              <div key={itemIndex} className="item-form-row">
                <input type="text" name="food" placeholder="Food" value={item.food} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} required />
                <input type="text" name="quantity" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} required />
                <input type="number" name="calories" placeholder="Calories" value={item.calories} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} required />
                <input type="number" name="protein" placeholder="Protein (g)" value={item.protein} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} />
              </div>
            ))}
            <button type="button" onClick={() => addItem(mealIndex)}>+ Add Item</button>
          </div>
        ))}
        <button type="button" onClick={addMeal}>+ Add Meal</button>

        <div className="form-actions">
          <button type="submit" disabled={isAdding || isUpdating}>{isAdding || isUpdating ? 'Saving...' : 'Save Plan'}</button>
          <button type="button" onClick={() => navigate('/admin/diets')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DietPlanForm;