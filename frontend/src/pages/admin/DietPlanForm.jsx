import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDietPlanQuery, useCreateDietPlanMutation, useUpdateDietPlanMutation } from '../../redux/api/gymApi';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import '../../styles/admin/DietPlanForm.css';

const DietPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingPlan, isLoading: isLoadingPlan } = useGetDietPlanQuery(id, { skip: !isEditing });
  const [createDietPlan, { isLoading: isCreating }] = useCreateDietPlanMutation();
  const [updateDietPlan, { isLoading: isUpdating }] = useUpdateDietPlanMutation();

  const [formData, setFormData] = useState({
    title: '',
    targetAudience: 'general',
    duration: '',
    notes: '',
    meals: [],
  });

  useEffect(() => {
    if (isEditing && existingPlan) {
      setFormData(existingPlan);
    }
  }, [isEditing, existingPlan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealChange = (mealIndex, e) => {
    const { name, value } = e.target;
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], [name]: value };
    setFormData(prev => ({ ...prev, meals: updatedMeals }));
  };

  const handleItemChange = (mealIndex, itemIndex, e) => {
    const { name, value } = e.target;
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items[itemIndex] = { ...updatedMeals[mealIndex].items[itemIndex], [name]: value };
    setFormData(prev => ({ ...prev, meals: updatedMeals }));
  };

  const addMeal = () => {
    setFormData(prev => ({ ...prev, meals: [...prev.meals, { name: '', time: '', items: [] }] }));
  };

  const removeMeal = (mealIndex) => {
    const updatedMeals = formData.meals.filter((_, index) => index !== mealIndex);
    setFormData(prev => ({ ...prev, meals: updatedMeals }));
  };

  const addItemToMeal = (mealIndex) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items.push({ food: '', quantity: '', calories: 0, protein: 0 });
    setFormData(prev => ({ ...prev, meals: updatedMeals }));
  };

  const removeItemFromMeal = (mealIndex, itemIndex) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[mealIndex].items = updatedMeals[mealIndex].items.filter((_, index) => index !== itemIndex);
    setFormData(prev => ({ ...prev, meals: updatedMeals }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDietPlan({ id, ...formData }).unwrap();
      } else {
        await createDietPlan(formData).unwrap();
      }
      navigate('/admin/diets');
    } catch (error) {
      console.error('Failed to save diet plan:', error);
      // You can add user-facing error handling here
    }
  };

  if (isLoadingPlan) {
    return <div className="diet-form-container"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="diet-form-container">
      <div className="diet-form-header">
        <h1>{isEditing ? 'Edit Diet Plan' : 'Create New Diet Plan'}</h1>
        <p>Design a structured diet plan for your members.</p>
      </div>

      <form onSubmit={handleSubmit} className="diet-form">
        <div className="form-section">
          <h2>General Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Plan Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select id="targetAudience" name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                <option value="general">General Fitness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="muscle_building">Muscle Building</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration (e.g., 4 weeks)</label>
              <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Meals</h2>
          {formData.meals.map((meal, mealIndex) => (
            <div key={mealIndex} className="meal-card">
              <div className="meal-header">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Meal Name (e.g., Breakfast)</label>
                    <input type="text" name="name" value={meal.name} onChange={(e) => handleMealChange(mealIndex, e)} placeholder="Breakfast" />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="text" name="time" value={meal.time} onChange={(e) => handleMealChange(mealIndex, e)} placeholder="8:00 AM" />
                  </div>
                </div>
                <button type="button" onClick={() => removeMeal(mealIndex)} className="remove-btn"><Trash2 size={16} /></button>
              </div>
              <table className="meal-items-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Quantity</th>
                    <th>Calories</th>
                    <th>Protein (g)</th>
                    <th className="action-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {meal.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td><input type="text" name="food" value={item.food} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} placeholder="e.g., Egg whites" /></td>
                      <td><input type="text" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} placeholder="e.g., 4 large" /></td>
                      <td><input type="number" name="calories" value={item.calories} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} /></td>
                      <td><input type="number" name="protein" value={item.protein} onChange={(e) => handleItemChange(mealIndex, itemIndex, e)} /></td>
                      <td className="action-cell"><button type="button" onClick={() => removeItemFromMeal(mealIndex, itemIndex)} className="remove-btn"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={() => addItemToMeal(mealIndex)} className="add-btn" style={{ marginTop: '1rem' }}>
                <Plus size={16} />
                Add Food Item
              </button>
            </div>
          ))}
          <button type="button" onClick={addMeal} className="add-btn">
            <Plus size={16} />
            Add Meal
          </button>
        </div>

        <div className="form-section">
          <h2>Notes</h2>
          <div className="form-group">
            <label htmlFor="notes">Additional Notes or Instructions</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange}></textarea>
          </div>
        </div>

        <div className="submit-btn-container">
          <button type="submit" className="submit-btn" disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>{isEditing ? 'Save Changes' : 'Create Plan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DietPlanForm;
