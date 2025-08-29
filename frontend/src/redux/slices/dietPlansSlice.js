// src/store/slices/dietPlansSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dietPlans: [],
  currentDietPlan: null,
  filters: {
    search: '',
    targetAudience: '',
    page: 1,
    limit: 10,
  },
  pagination: {
    current: 1,
    total: 1,
    count: 0,
    totalPlans: 0,
  },
  loading: false,
  error: null,
  showCreateModal: false,
  showEditModal: false,
  showViewModal: false,
  editingDietPlan: null,
  formData: {
    title: '',
    targetAudience: 'general',
    duration: '1 week',
    meals: [],
    notes: '',
  },
};

const dietPlansSlice = createSlice({
  name: 'dietPlans',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setDietPlans: (state, action) => {
      state.dietPlans = action.payload;
      state.loading = false;
    },
    setCurrentDietPlan: (state, action) => {
      state.currentDietPlan = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        targetAudience: '',
        page: 1,
        limit: 10,
      };
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
      if (action.payload) {
        state.formData = {
          title: '',
          targetAudience: 'general',
          duration: '1 week',
          meals: [],
          notes: '',
        };
      }
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        state.editingDietPlan = null;
      }
    },
    setShowViewModal: (state, action) => {
      state.showViewModal = action.payload;
      if (!action.payload) {
        state.currentDietPlan = null;
      }
    },
    setEditingDietPlan: (state, action) => {
      state.editingDietPlan = action.payload;
      if (action.payload) {
        state.formData = {
          title: action.payload.title || '',
          targetAudience: action.payload.targetAudience || 'general',
          duration: action.payload.duration || '1 week',
          meals: action.payload.meals || [],
          notes: action.payload.notes || '',
        };
        state.showEditModal = true;
      }
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addMeal: (state) => {
      state.formData.meals.push({
        name: '',
        time: '',
        items: [],
        instructions: '',
      });
    },
    updateMeal: (state, action) => {
      const { index, meal } = action.payload;
      state.formData.meals[index] = { ...state.formData.meals[index], ...meal };
    },
    removeMeal: (state, action) => {
      state.formData.meals.splice(action.payload, 1);
    },
    addMealItem: (state, action) => {
      const mealIndex = action.payload;
      state.formData.meals[mealIndex].items.push({
        food: '',
        ingredients: '',
        quantity: '',
        calories: 0,
        protein: 0,
      });
    },
    updateMealItem: (state, action) => {
      const { mealIndex, itemIndex, item } = action.payload;
      state.formData.meals[mealIndex].items[itemIndex] = {
        ...state.formData.meals[mealIndex].items[itemIndex],
        ...item,
      };
    },
    removeMealItem: (state, action) => {
      const { mealIndex, itemIndex } = action.payload;
      state.formData.meals[mealIndex].items.splice(itemIndex, 1);
    },
    resetFormData: (state) => {
      state.formData = {
        title: '',
        targetAudience: 'general',
        duration: '1 week',
        meals: [],
        notes: '',
      };
    },
    updateDietPlanInList: (state, action) => {
      const updatedPlan = action.payload;
      const index = state.dietPlans.findIndex(plan => plan._id === updatedPlan._id);
      if (index !== -1) {
        state.dietPlans[index] = updatedPlan;
      }
    },
    removeDietPlanFromList: (state, action) => {
      const planId = action.payload;
      state.dietPlans = state.dietPlans.filter(plan => plan._id !== planId);
    },
    addDietPlanToList: (state, action) => {
      state.dietPlans.unshift(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setDietPlans,
  setCurrentDietPlan,
  setPagination,
  setFilters,
  resetFilters,
  setShowCreateModal,
  setShowEditModal,
  setShowViewModal,
  setEditingDietPlan,
  setFormData,
  addMeal,
  updateMeal,
  removeMeal,
  addMealItem,
  updateMealItem,
  removeMealItem,
  resetFormData,
  updateDietPlanInList,
  removeDietPlanFromList,
  addDietPlanToList,
} = dietPlansSlice.actions;

export default dietPlansSlice.reducer;