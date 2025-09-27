import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LatestGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count: number;
  category_name: string;
  is_public: boolean;
}

export const useLatestGroups = (limit: number = 10) => {
  const [latestGroups, setLatestGroups] = useState<LatestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          created_at,
          member_count,
          is_public,
          categories(name)
        `)
        .eq('is_approved', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const formattedGroups: LatestGroup[] = (data || []).map(group => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        created_at: group.created_at,
        member_count: group.member_count || 0,
        category_name: group.categories?.name || 'Uncategorized',
        is_public: group.is_public
      }));

      setLatestGroups(formattedGroups);
    } catch (err) {
      console.error('Error fetching latest groups:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestGroups();
  }, [limit]);

  return {
    latestGroups,
    loading,
    error,
    refetch: fetchLatestGroups
  };
};