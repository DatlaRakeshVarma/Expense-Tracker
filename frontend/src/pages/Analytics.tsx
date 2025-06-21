import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, subDays, subWeeks } from 'date-fns';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

interface AnalyticsData {
  categoryBreakdown: Array<{ category: string; amount: number }>;
  monthlyBreakdown: Array<{ month: string; amount: number }>;
  totalSpending: number;
}

type TimeframeType = 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'lastmonth' | 'last2months' | '3months' | '6months' | '1year';

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeframeType>('thismonth');
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const expenses = await response.json();
        setFilteredExpenses(filterExpensesByTimeframe(expenses, timeframe));
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const getDateRange = (timeframe: TimeframeType) => {
    const now = new Date();
    
    switch (timeframe) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        };
      case 'thisweek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'thismonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'lastmonth':
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'last2months':
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now)
        };
      case '3months':
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: endOfMonth(now)
        };
      case '6months':
        return {
          start: startOfMonth(subMonths(now, 6)),
          end: endOfMonth(now)
        };
      case '1year':
        return {
          start: startOfMonth(subMonths(now, 12)),
          end: endOfMonth(now)
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  };

  const filterExpensesByTimeframe = (expenses: Expense[], timeframe: TimeframeType) => {
    const { start, end } = getDateRange(timeframe);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  };

  const getTimeframeLabel = (timeframe: TimeframeType) => {
    switch (timeframe) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'thisweek':
        return 'This Week';
      case 'thismonth':
        return 'This Month';
      case 'lastmonth':
        return 'Last Month';
      case 'last2months':
        return 'Last 2 Months';
      case '3months':
        return 'Last 3 Months';
      case '6months':
        return 'Last 6 Months';
      case '1year':
        return 'Last 12 Months';
      default:
        return 'This Month';
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchExpenses();
    }
  }, [token]);

  useEffect(() => {
    if (analyticsData) {
      fetchExpenses();
    }
  }, [timeframe, analyticsData]);

  const colors = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1', '#6B7280', '#84CC16', '#F97316', '#14B8A6'];

  const getChartData = () => {
    if (!filteredExpenses.length) return { categoryData: [], monthlyData: [], totalSpending: 0 } as {
    categoryData: Array<{ category: string; amount: number }>;
    monthlyData: Array<{ month: string; amount: number }>;
    totalSpending: number;
  };

    // Category breakdown
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount
    }));

    // Time-based breakdown
    let monthlyData: Array<{ month: string; amount: number }> = [];
    
    if (['today', 'yesterday'].includes(timeframe)) {
      // For single days, show hourly breakdown
      const hourlyBreakdown = filteredExpenses.reduce((acc, expense) => {
        const hour = format(new Date(expense.date), 'HH:00');
        acc[hour] = (acc[hour] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      monthlyData = Object.entries(hourlyBreakdown).map(([hour, amount]) => ({
        month: hour,
        amount
      })).sort((a, b) => a.month.localeCompare(b.month));
    } else if (timeframe === 'thisweek') {
      // For this week, show daily breakdown
      const dailyBreakdown = filteredExpenses.reduce((acc, expense) => {
        const day = format(new Date(expense.date), 'EEE');
        acc[day] = (acc[day] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      monthlyData = weekDays.map(day => ({
        month: day,
        amount: dailyBreakdown[day] || 0
      }));
    } else {
      // For longer periods, show monthly breakdown
      const monthlyBreakdown = filteredExpenses.reduce((acc, expense) => {
        const month = format(new Date(expense.date), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      monthlyData = Object.entries(monthlyBreakdown).map(([month, amount]) => ({
        month,
        amount
      })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    }

    const totalSpending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return { categoryData, monthlyData, totalSpending };
  };

  const { categoryData, monthlyData, totalSpending } = getChartData() as {
    categoryData: Array<{ category: string; amount: number }>;
    monthlyData: Array<{ month: string; amount: number }>;
    totalSpending: number;
  };
  const averageSpending = monthlyData.length > 0 
    ? monthlyData.reduce((sum, item) => sum + (item.amount as number), 0) / monthlyData.length 
    : 0;

  const topCategories = categoryData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const getChartLabel = () => {
    if (['today', 'yesterday'].includes(timeframe)) {
      return 'Hourly Spending';
    } else if (timeframe === 'thisweek') {
      return 'Daily Spending This Week';
    } else {
      return 'Monthly Spending Trend';
    }
  };

  const getAverageLabel = () => {
    if (['today', 'yesterday'].includes(timeframe)) {
      return 'Avg. Hourly';
    } else if (timeframe === 'thisweek') {
      return 'Avg. Daily';
    } else {
      return 'Avg. Monthly';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Analyze your spending patterns and trends
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white min-w-[160px]"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisweek">This Week</option>
              <option value="thismonth">This Month</option>
              <option value="lastmonth">Last Month</option>
              <option value="last2months">Last 2 Months</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Spending ({getTimeframeLabel(timeframe)})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalSpending.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{getAverageLabel()}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{averageSpending.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-full">
              <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {categoryData.length}
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-full">
              <PieChartIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {totalSpending > 0 ? (
        <div className="space-y-8">
          {/* Spending Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>{getChartLabel()}</span>
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor' }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  labelStyle={{ color: 'inherit' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5" />
                <span>Spending by Category</span>
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={(entry) => `${entry.category}: ₹${entry.amount.toFixed(2)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Categories</h2>
              <div className="space-y-4">
                {topCategories.map((category, index) => {
                  const percentage = totalSpending > 0 
                    ? (category.amount / totalSpending) * 100 
                    : 0;
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{category.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <BarChart3 className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No data for {getTimeframeLabel(timeframe).toLowerCase()}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {timeframe === 'today' 
              ? "You haven't added any expenses today yet." 
              : timeframe === 'yesterday'
              ? "No expenses were recorded yesterday."
              : `No expenses found for the selected time period.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;