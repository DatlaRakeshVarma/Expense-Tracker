import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface Budget {
  id?: string;
  userId: string;
  monthlyBudget: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchBudget = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/budget', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch budget');
      }

      const data = await response.json();
      setBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (monthlyBudget: number) => {
    if (!token) return;

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ monthlyBudget }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      await fetchBudget();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    if (token) {
      fetchBudget();
    }
  }, [token]);

  return {
    budget,
    loading,
    error,
    fetchBudget,
    updateBudget,
  };
};