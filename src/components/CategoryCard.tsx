import { Card, CardContent } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  // The new design doesn't use these, but keeping them for data model consistency
  description: string;
  icon: string;
  group_count?: number;
  imageUrl?: string; // Optional image for the new design
}

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image placeholder */}
        <div className="h-40 bg-secondary flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        {/* Name and Label */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.group_count || 0} Groups</p>
        </div>
      </CardContent>
    </Card>
  );
};