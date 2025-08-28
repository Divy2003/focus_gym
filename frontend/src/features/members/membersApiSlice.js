
import { apiSlice } from '../api/apiSlice';

export const membersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: () => '/members',
      providesTags: (result) => 
        result?.members
          ? [...result.members.map(({ _id }) => ({ type: 'Member', id: _id })), { type: 'Member', id: 'LIST' }]
          : [{ type: 'Member', id: 'LIST' }],
    }),
    addMember: builder.mutation({
      query: (member) => ({
        url: '/members',
        method: 'POST',
        body: member,
      }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    updateMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/members/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
    }),
    deleteMember: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Member', id }],
    }),
    bulkDeleteMembers: builder.mutation({
      query: (memberIds) => ({
        url: '/members/bulk-delete',
        method: 'POST',
        body: { memberIds },
      }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    sendMessage: builder.mutation({
      query: ({ memberIds, message }) => ({
        url: '/members/send-message',
        method: 'POST',
        body: { memberIds, message },
      }),
    }),
  }),
});

export const {
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useBulkDeleteMembersMutation,
  useSendMessageMutation,
} = membersApiSlice;
