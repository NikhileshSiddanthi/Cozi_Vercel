import React from 'react';
import { PoliticalCategories } from '@/components/PoliticalCategories';
import { useNavigate } from 'react-router-dom';

const PoliticalCategoriesExample: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to category page or handle click as needed
    console.log(`Clicked category: ${categoryId}`);
    
    // Example navigation (adjust based on your routing structure)
    switch (categoryId) {
      case 'international':
        navigate('/category/international');
        break;
      case 'politics':
        navigate('/category/politics');
        break;
      case 'economy':
        navigate('/category/economy');
        break;
      case 'data':
        navigate('/category/data');
        break;
      default:
        console.log('Unknown category');
    }
  };

  return (
    <div className="min-h-screen">
      <PoliticalCategories onCategoryClick={handleCategoryClick} />
    </div>
  );
};

export default PoliticalCategoriesExample;