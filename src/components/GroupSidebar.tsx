import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Settings, UserPlus, Eye, Lock, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface GroupSidebarProps {
  groupId: string;
  className?: string;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
  categories?: {
    name: string;
  };
}

export const GroupSidebar = ({ groupId, className = '' }: GroupSidebarProps) => {
  const { user } = useAuth();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchGroupInfo();
    if (user) {
      checkMembership();
    }
  }, [groupId, user]);

  const fetchGroupInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          is_public,
          member_count,
          created_at,
          categories(name)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      setGroupInfo(data);
    } catch (error) {
      console.error('Error fetching group info:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();

      setIsMember(!!data);
    } catch (error) {
      // User is not a member
      setIsMember(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !groupInfo) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          status: 'approved',
          role: 'member'
        });

      if (error) throw error;
      setIsMember(true);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  if (loading || !groupInfo) {
    return (
      <Card className={`w-72 ${className}`}>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-72 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Info
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Group Name & Privacy */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{groupInfo.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={groupInfo.is_public ? 'default' : 'secondary'} className="gap-1">
                  {groupInfo.is_public ? (
                    <><Eye className="h-3 w-3" /> Public</>
                  ) : (
                    <><Lock className="h-3 w-3" /> Private</>
                  )}
                </Badge>
                {groupInfo.categories && (
                  <Badge variant="outline">{groupInfo.categories.name}</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {groupInfo.description && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {groupInfo.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{groupInfo.member_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(groupInfo.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              {!isMember && groupInfo.is_public && (
                <Button 
                  onClick={handleJoinGroup}
                  className="w-full gap-2"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Join Group
                </Button>
              )}
              
              {isMember && (
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-1">
                    Member
                  </Badge>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Group Settings
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <Separator />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Links</h4>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8">
                  <MessageSquare className="h-3 w-3" />
                  Recent Posts
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8">
                  <Calendar className="h-3 w-3" />
                  Events
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};