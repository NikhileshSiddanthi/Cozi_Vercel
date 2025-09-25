import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategoryCard } from '@/components/CategoryCard';

import { Vote } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_class: string;
  group_count?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setLoading(false);
        return;
      }

      console.log('Categories fetched:', categoriesData?.length || 0);
      console.log('Categories data:', categoriesData);

      // Fetch group counts and engagement metrics for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('groups')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_approved', true);

          // Calculate engagement score (posts + comments + reactions in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: engagementData } = await supabase
            .from('posts')
            .select(`
              id,
              like_count,
              comment_count,
              created_at,
              groups!inner(category_id)
            `)
            .eq('groups.category_id', category.id)
            .gte('created_at', thirtyDaysAgo.toISOString());

          let engagementScore = 0;
          if (engagementData) {
            engagementScore = engagementData.reduce((sum, post) => {
              return sum + (post.like_count || 0) + (post.comment_count || 0) + 1; // +1 for the post itself
            }, 0);
          }

          return {
            ...category,
            group_count: count || 0,
            engagement_score: engagementScore
          };
        })
      );

      // Sort categories by engagement, but keep Organizations and Personalities at end unless they have high engagement
      const sortedCategories = categoriesWithCounts.sort((a, b) => {
        const aIsSpecial = ['Organizations', 'Personalities'].includes(a.name);
        const bIsSpecial = ['Organizations', 'Personalities'].includes(b.name);
        
        // If both are special or neither are special, sort by engagement
        if (aIsSpecial === bIsSpecial) {
          return (b.engagement_score || 0) - (a.engagement_score || 0);
        }
        
        // If only one is special, check if it has significant engagement (>10)
        if (aIsSpecial && (a.engagement_score || 0) < 10) return 1; // Move to end
        if (bIsSpecial && (b.engagement_score || 0) < 10) return -1; // Move to end
        
        // Otherwise sort by engagement
        return (b.engagement_score || 0) - (a.engagement_score || 0);
      });

      console.log('Categories with counts and engagement:', sortedCategories);
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Vote className="h-16 w-16 text-primary mx-auto animate-float" />
              <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-primary/20 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gradient">Loading COZI...</p>
              <p className="text-sm text-muted-foreground">Preparing your political sphere</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-8 md:mb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient animate-slide-up">
            Welcome to COZI
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
            For a Free, Fair & Open Public Sphere
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 animate-fade-in">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-soft"></div>
            <span>Connecting democratic voices worldwide</span>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce-soft" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-6 md:mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gradient">Political Categories</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore diverse political discussions and join communities that matter to you
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="animate-slide-up" 
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CategoryCard
                category={category}
                onClick={() => navigate(`/category/${category.id}`)}
              />
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="glass-card max-w-md mx-auto">
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No categories available</p>
              <p className="text-sm text-muted-foreground">Check back later for new political discussions</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;