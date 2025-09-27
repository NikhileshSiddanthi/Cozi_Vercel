import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  category_name: string;
  trend_score: number;
  new_posts: number;
  new_members: number;
  new_comments: number;
  trend_change: number;
}

export const useTrendingGroups = (daysRange: number = 7) => {
  const [trendingGroups, setTrendingGroups] = useState<TrendingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingGroups();
  }, [daysRange]);

  const fetchTrendingGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching trending groups...');

      // Get date range for calculations
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysRange);

      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - (daysRange * 2));
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - daysRange);

      // Fetch all approved groups with their categories
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          member_count,
          categories!inner(name)
        `)
        .eq('is_approved', true);

      if (groupsError) {
        console.error('Groups fetch error:', groupsError);
        throw groupsError;
      }

      console.log('Fetched groups:', groups?.length || 0);

      if (!groups || groups.length === 0) {
        console.log('No groups found, setting empty array');
        setTrendingGroups([]);
        setLoading(false);
        return;
      }

      // Calculate trending scores for each group
      const trendingData = await Promise.all(
        groups.map(async (group) => {
          // Get new posts in the last week
          const { count: newPosts } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .gte('created_at', startDate.toISOString());

          // Get new members in the last week
          const { count: newMembers } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('status', 'approved')
            .gte('joined_at', startDate.toISOString());

          // Get new comments in the last week
          const { count: newComments } = await supabase
            .from('comments')
            .select(`
              *,
              posts!inner(group_id)
            `, { count: 'exact', head: true })
            .eq('posts.group_id', group.id)
            .gte('created_at', startDate.toISOString());

          // Get previous week data for trend comparison
          const { count: prevPosts } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', prevEndDate.toISOString());

          const { count: prevMembers } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('status', 'approved')
            .gte('joined_at', prevStartDate.toISOString())
            .lt('joined_at', prevEndDate.toISOString());

          const { count: prevComments } = await supabase
            .from('comments')
            .select(`
              *,
              posts!inner(group_id)
            `, { count: 'exact', head: true })
            .eq('posts.group_id', group.id)
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', prevEndDate.toISOString());

          // Calculate trend score (weighted)
          const postsScore = (newPosts || 0) * 0.5;
          const membersScore = (newMembers || 0) * 0.3;
          const commentsScore = (newComments || 0) * 0.2;
          const trendScore = postsScore + membersScore + commentsScore;

          // Calculate trend change percentage
          const prevTotalActivity = (prevPosts || 0) + (prevMembers || 0) + (prevComments || 0);
          const currentTotalActivity = (newPosts || 0) + (newMembers || 0) + (newComments || 0);
          const trendChange = prevTotalActivity > 0
            ? ((currentTotalActivity - prevTotalActivity) / prevTotalActivity) * 100
            : currentTotalActivity > 0 ? 100 : 0;

          return {
            id: group.id,
            name: group.name,
            description: group.description || '',
            member_count: group.member_count || 0,
            category_name: group.categories?.name || 'Uncategorized',
            trend_score: trendScore,
            new_posts: newPosts || 0,
            new_members: newMembers || 0,
            new_comments: newComments || 0,
            trend_change: Math.round(trendChange)
          };
        })
      );

      // Sort by trend score and limit to top 5
      const sortedTrending = trendingData
        .sort((a, b) => b.trend_score - a.trend_score)
        .slice(0, 5);

      setTrendingGroups(sortedTrending);
    } catch (err) {
      console.error('Error fetching trending groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending groups');
    } finally {
      setLoading(false);
    }
  };

  return { trendingGroups, loading, error, refetch: fetchTrendingGroups };
};