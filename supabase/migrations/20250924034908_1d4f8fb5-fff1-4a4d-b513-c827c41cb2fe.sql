-- Fix the search path for the function we just created
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;