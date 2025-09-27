import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Flag,
  Building2,
  Globe,
  Users,
  Crown,
  Briefcase,
  TrendingUp,
  Vote,
  Gavel,
  MapPin
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  Flag,
  Building2,
  Globe,
  Users,
  Crown,
  TrendingUp,
  Briefcase,
  Vote,
  Gavel,
  MapPin
};

// Modern accent colors for icon badges
const accentColors = [
  'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
];

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_class: string;
  group_count?: number;
}

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const Icon = iconMap[category.icon] || Flag;

  // Get consistent accent color based on category ID
  const accentColorIndex = category.id.charCodeAt(0) % accentColors.length;
  const accentColor = accentColors[accentColorIndex];

  return (
    <Card 
      className="group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden h-auto min-h-[220px] modern-card-hover relative"
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardHeader className="pb-4 pt-6 relative z-10">
        {/* Icon Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${accentColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
            <Icon className="h-7 w-7" />
          </div>
          {/* Group Count Badge */}
          <Badge
            variant="outline"
            className="text-xs px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-muted-foreground border-muted-foreground/20 hover:bg-muted/70 transition-all duration-300 rounded-full group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
          >
            <Users className="h-3 w-3 mr-1" />
            {category.group_count || 0} groups
          </Badge>
        </div>
        
        {/* Title */}
        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 mb-3">
          {category.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {category.description}
        </p>

        {/* Interactive bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </CardContent>
    </Card>
  );
};