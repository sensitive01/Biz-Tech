import api from './api';

export const businessService = {
  getBranches: async () => {
    return api.get('/api/branches');
  },

  createBranch: async (branchData) => {
    return api.post('/api/branches', branchData);
  },

  updateBranch: async (id, branchData) => {
    return api.put(`/api/branches/${id}`, branchData);
  },

  deleteBranch: async (id) => {
    return api.delete(`/api/branches/${id}`);
  },

  getBusinesses: async () => {
    return api.get('/api/businesses');
  },

  createBusiness: async (businessData) => {
    return api.post('/api/businesses', businessData);
  },

  updateBusiness: async (id, businessData) => {
    return api.put(`/api/businesses/${id}`, businessData);
  },

  deleteBusiness: async (id) => {
    return api.delete(`/api/businesses/${id}`);
  },
};

export default businessService;

