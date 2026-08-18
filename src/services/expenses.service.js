// services/ExpenseService.ts
import API from './api';

// Optional: define TypeScript interfaces for better type safety
export interface CreateExpensePayload {
  title: string;
  type: string;
  date: string;   // 'YYYY-MM-DD'
  amount: number;
  note?: string;
}

export interface UpdateExpensePayload {
  title?: string;
  type?: string;
  date?: string;
  amount?: number;
  note?: string; 
}

export interface ExpenseReportFilters {
  period?: 'daily' | 'monthly' | 'yearly'; // default: 'daily'
  date?: string;     // YYYY-MM-DD, used when period=daily
  month?: string;    // YYYY-MM, used when period=monthly
  year?: number;     // YYYY, used when period=yearly
  type?: string;     // exact expense type
  search?: string;   // partial title search
  sort_by?: 'date' | 'amount' | 'title' | 'type'; // default: 'date'
  sort_order?: 'asc' | 'desc'; // default: 'desc'
}

const ExpenseService = {
  // =========================
  // BASIC CRUD
  // =========================

  // Create a new expense
  createExpense: async (payload: CreateExpensePayload) => {
    const res = await API.post('/api/expenses', payload);
    return res.data; // { status, message, expense_id }
  },

  // Update an existing expense by ID
  updateExpense: async (id: number, payload: UpdateExpensePayload) => {
    const res = await API.post(`/api/expenses/${id}/update`, payload);
    return res.data; // { status, message }
  },

  // Delete an expense by ID
  deleteExpense: async (id: number) => {
    const res = await API.post(`/api/expenses/${id}/delete`);
    return res.data; // { status, message }
  },

  // =========================
  // REPORT / FILTER
  // =========================

  // Get filtered & sorted expense report with total summary
  getExpenseReport: async (filters?: ExpenseReportFilters) => {
    const res = await API.get('/api/expenses/report', {
      params: filters,
    });
    return res.data; // { status, period, total_amount, total_records, filters, expenses[] }
  },
};

export default ExpenseService;