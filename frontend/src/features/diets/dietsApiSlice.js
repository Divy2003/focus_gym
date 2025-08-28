
import { apiSlice } from '../api/apiSlice';

export const dietsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDietPlans: builder.query({
      query: () => '/diet',
      providesTags: (result) =>
        result?.dietPlans
          ? [...result.dietPlans.map(({ _id }) => ({ type: 'DietPlan', id: _id })), { type: 'DietPlan', id: 'LIST' }]
          : [{ type: 'DietPlan', id: 'LIST' }],
    }),
    addDietPlan: builder.mutation({
      query: (dietPlan) => ({
        url: '/diet',
        method: 'POST',
        body: dietPlan,
      }),
      invalidatesTags: [{ type: 'DietPlan', id: 'LIST' }],
    }),
    updateDietPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/diet/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'DietPlan', id }],
    }),
    deleteDietPlan: builder.mutation({
      query: (id) => ({
        url: `/diet/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'DietPlan', id }],
    }),
  }),
});

export const {
  useGetDietPlansQuery,
  useAddDietPlanMutation,
  useUpdateDietPlanMutation,
  useDeleteDietPlanMutation,
} = dietsApiSlice;
