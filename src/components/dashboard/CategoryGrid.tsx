import React from 'react';
import { useNavigate } from 'react-router-dom';
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

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  const navigate = useNavigate();

  return (
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
  );
};