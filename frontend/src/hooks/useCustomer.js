import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import toast from 'react-hot-toast';

export const useCustomerList = (params) =>
  useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.list(params).then(r => r.data),
  });

export const useCustomer360 = (id) =>
  useQuery({
    queryKey: ['customer360', id],
    queryFn: () => customersApi.get360(id).then(r => r.data),
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => customersApi.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (err) => {
      toast.error(err?.message ?? 'Failed to create customer');
    },
  });
};

export const useDeactivateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => customersApi.deactivate(id, { reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deactivated');
    },
    onError: (err) => toast.error(err?.message ?? 'Failed to deactivate customer'),
  });
};