import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Simplified interface to match the new design's data requirements
interface Category {
  id: string;
  name: string;
  description: string;
  group_count: number;
}

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Using a Supabase RPC function for efficiency, as suggested in the review.
      const { data, error } = await supabase.rpc('get_categories_with_stats');

      if (error) {
        console.error('Error fetching categories with stats:', error);
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error in useCategories hook:', error);
      setCategories([]); // Set empty array on error to prevent UI breaks
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return { categories, loading, refetch: fetchCategories };
};