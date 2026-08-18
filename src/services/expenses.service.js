import API from "./api";

const ExpenseService = {
  createExpense: async (payload) => {
    const res = await API.post("/api/expenses", payload);
    return res.data;
  },

  updateExpense: async (id, payload) => {
    const res = await API.post(`/api/expenses/${id}/update`, payload);
    return res.data;
  },

  deleteExpense: async (id) => {
    const res = await API.post(`/api/expenses/${id}/delete`);
    return res.data;
  },

  getExpenseReport: async (filters = {}) => {
    const res = await API.get("/api/expenses/report", {
      params: filters,
    });

    return res.data;
  },
};

export default ExpenseService;