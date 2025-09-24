-- Create a function to update group member counts
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update member count when a new member is added with approved status
    IF NEW.status = 'approved' THEN
      UPDATE public.groups 
      SET member_count = (
        SELECT COUNT(*) 
        FROM public.group_members 
        WHERE group_id = NEW.group_id AND status = 'approved'
      )
      WHERE id = NEW.group_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update member count when status changes
    IF OLD.status != NEW.status THEN
      UPDATE public.groups 
      SET member_count = (
        SELECT COUNT(*) 
        FROM public.group_members 
        WHERE group_id = NEW.group_id AND status = 'approved'
      )
      WHERE id = NEW.group_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update member count when a member is removed
    UPDATE public.groups 
    SET member_count = (
      SELECT COUNT(*) 
      FROM public.group_members 
      WHERE group_id = OLD.group_id AND status = 'approved'
    )
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on group_members table
DROP TRIGGER IF EXISTS trigger_update_group_member_count ON public.group_members;
CREATE TRIGGER trigger_update_group_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_member_count();

-- Update existing member counts to fix current data
UPDATE public.groups 
SET member_count = (
  SELECT COUNT(*) 
  FROM public.group_members 
  WHERE group_id = groups.id AND status = 'approved'
);