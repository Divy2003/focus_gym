// src/store/slices/membersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  selectedMembers: [],
  filters: {
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
  pagination: {
    current: 1,
    total: 1,
    count: 0,
    totalMembers: 0,
  },
  loading: false,
  error: null,
  showAddModal: false,
  showEditModal: false,
  showMessageModal: false,
  editingMember: null,
};

const membersSlice = createSlice({
  name: 'members',
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
    setMembers: (state, action) => {
      state.members = action.payload;
      state.loading = false;
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
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      };
    },
    setSelectedMembers: (state, action) => {
      state.selectedMembers = action.payload;
    },
    toggleMemberSelection: (state, action) => {
      const memberId = action.payload;
      if (state.selectedMembers.includes(memberId)) {
        state.selectedMembers = state.selectedMembers.filter(id => id !== memberId);
      } else {
        state.selectedMembers.push(memberId);
      }
    },
    selectAllMembers: (state) => {
      state.selectedMembers = state.members.map(member => member._id);
    },
    clearSelectedMembers: (state) => {
      state.selectedMembers = [];
    },
    setShowAddModal: (state, action) => {
      state.showAddModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
      if (!action.payload) {
        state.editingMember = null;
      }
    },
    setShowMessageModal: (state, action) => {
      state.showMessageModal = action.payload;
    },
    setEditingMember: (state, action) => {
      state.editingMember = action.payload;
      state.showEditModal = true;
    },
    updateMemberInList: (state, action) => {
      const updatedMember = action.payload;
      const index = state.members.findIndex(member => member._id === updatedMember._id);
      if (index !== -1) {
        state.members[index] = updatedMember;
      }
    },
    removeMemberFromList: (state, action) => {
      const memberId = action.payload;
      state.members = state.members.filter(member => member._id !== memberId);
      state.selectedMembers = state.selectedMembers.filter(id => id !== memberId);
    },
    addMemberToList: (state, action) => {
      state.members.unshift(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setMembers,
  setPagination,
  setFilters,
  resetFilters,
  setSelectedMembers,
  toggleMemberSelection,
  selectAllMembers,
  clearSelectedMembers,
  setShowAddModal,
  setShowEditModal,
  setShowMessageModal,
  setEditingMember,
  updateMemberInList,
  removeMemberFromList,
  addMemberToList,
} = membersSlice.actions;

export default membersSlice.reducer;