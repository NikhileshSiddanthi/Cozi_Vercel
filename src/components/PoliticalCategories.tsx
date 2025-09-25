import React from 'react';
import { Globe, Landmark, Briefcase, BarChart3 } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  {
    id: 'international',
    title: 'International Issues',
    subtitle: 'Global affairs, international relations, world events.',
    icon: Globe,
  },
  {
    id: 'politics',
    title: 'Politics',
    subtitle: 'Political discussions, parties, and governance.',
    icon: Landmark,
  },
  {
    id: 'economy',
    title: 'Economy & Business',
    subtitle: 'Economic policies, regulations, and finance.',
    icon: Briefcase,
  },
  {
    id: 'data',
    title: 'Data & Statistics',
    subtitle: 'Insights, stats, and analytics on politics & society.',
    icon: BarChart3,
  },
];

interface PoliticalCategoriesProps {
  onCategoryClick?: (categoryId: string) => void;
}

export const PoliticalCategories: React.FC<PoliticalCategoriesProps> = ({ 
  onCategoryClick 
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick?.(categoryId);
  };

  return (
    <section className="bg-gray-50 p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Political Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore diverse discussions and join communities that matter to you.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {categories.map((category) => {
          const IconComponent = category.icon;
          
          return (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 cursor-pointer transition-transform hover:scale-105 duration-300"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-gray-700" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {category.title}
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-gray-500 text-center">
                {category.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PoliticalCategories;