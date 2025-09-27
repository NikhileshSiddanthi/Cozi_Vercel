import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
  imageUrl?: string;
}

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onClick: (groupId: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, onClick }) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onClick(group.id)}
    >
      <CardContent className="p-0">
        {/* Image placeholder */}
        <div className="h-32 bg-secondary flex items-center justify-center">
          <svg
            className="w-10 h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary">{group.name}</h3>
          <p className="text-sm text-muted-foreground h-10 line-clamp-2">
            {group.description || 'No description available.'}
          </p>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{group.member_count} members</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event
                onJoin(group.id);
              }}
            >
              Join Group
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};