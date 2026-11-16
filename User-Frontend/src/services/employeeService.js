import api from './api';

export const employeeService = {
  // Employees CRUD
  getEmployees: async () => {
    return api.get('/api/employees');
  },

  createEmployee: async (employeeData) => {
    return api.post('/api/employees', employeeData);
  },

  updateEmployee: async (id, employeeData) => {
    return api.put(`/api/employees/${id}`, employeeData);
  },

  deleteEmployee: async (id) => {
    return api.delete(`/api/employees/${id}`);
  },

  // Attendance
  getAttendance: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/employees/attendance${query ? `?${query}` : ''}`);
  },

  recordAttendance: async (attendanceData) => {
    return api.post('/api/employees/attendance', attendanceData);
  },

  // Leave Requests & Permissions
  getLeaveRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/employees/leaves${query ? `?${query}` : ''}`);
  },

  submitLeaveRequest: async (leaveData) => {
    return api.post('/api/employees/leaves', leaveData);
  },

  reviewLeaveRequest: async (id, reviewData) => {
    return api.put(`/api/employees/leaves/${id}/review`, reviewData);
  },

  deleteLeaveRequest: async (id) => {
    return api.delete(`/api/employees/leaves/${id}`);
  },
};

export default employeeService;

