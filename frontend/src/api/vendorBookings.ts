import { apiClient } from "./client";
import type { Booking, CreateBookingExpensePayload, CreateBookingPayload } from "../types";

export async function getBookings(filter?: "today" | "upcoming" | "past"): Promise<Booking[]> {
  const params = filter ? { type: filter } : {};
  const { data } = await apiClient.get("/api/v1/bookings/list/", { params });
  // Handle paginated response
  return Array.isArray(data) ? data : data.results || [];
}

export async function getCalendar(): Promise<Record<string, CalendarEntry[]>> {
  const { data } = await apiClient.get("/api/v1/bookings/calendar/");
  return data;
}

export async function getDashboardOverview(params?: { year?: number; month?: number }): Promise<DashboardOverview> {
  const { data } = await apiClient.get("/api/v1/bookings/dashboard/", { params });
  return data;
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await apiClient.post("/api/v1/bookings/create/", payload);
  return data;
}

export async function addPayment(bookingId: number, amount: number) {
  const { data } = await apiClient.post(`/api/v1/bookings/add-payment/${bookingId}/`, { amount });
  return data;
}

export async function addExpense(bookingId: number, payload: CreateBookingExpensePayload) {
  const { data } = await apiClient.post(`/api/v1/bookings/add-expense/${bookingId}/`, payload);
  return data;
}

// Re-exporting CalendarEntry for type inference
export interface CalendarEntry {
  booking_id: number;
  customer_name: string;
  phone_number: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  expense_amount: number;
  profit_amount: number;
  payment_status: "NOT_PAID" | "PARTIAL" | "PAID";
  event_status: "TODAY" | "UPCOMING" | "PAST" | "UNKNOWN";
  slots: { start_time: string; end_time: string }[];
}

export interface DashboardTotals {
  bookings: number;
  revenue: number;
  received: number;
  expenses: number;
  profit: number;
  pending_balance: number;
  today?: number;
  upcoming?: number;
  past?: number;
}

export interface DashboardMonth extends DashboardTotals {
  month: number;
}

export interface DashboardOverview {
  year: number;
  month: number;
  totals: DashboardTotals;
  current_month: DashboardTotals;
  monthly: DashboardMonth[];
  recent_bookings: Booking[];
}
