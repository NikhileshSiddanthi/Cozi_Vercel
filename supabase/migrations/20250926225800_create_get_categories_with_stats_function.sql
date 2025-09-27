CREATE OR REPLACE FUNCTION get_categories_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  icon text,
  color_class text,
  group_count bigint,
  engagement_score bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH thirty_days_ago AS (
    SELECT (NOW() - INTERVAL '30 days') as date
  ),
  posts_engagement AS (
    SELECT
      g.category_id,
      SUM(p.like_count + p.comment_count + 1) as score
    FROM posts p
    JOIN groups g ON p.group_id = g.id
    WHERE p.created_at >= (SELECT date FROM thirty_days_ago)
    GROUP BY g.category_id
  ),
  groups_counts AS (
    SELECT
      g.category_id,
      COUNT(g.id) as group_count
    FROM groups g
    WHERE g.is_approved = true
    GROUP BY g.category_id
  )
  SELECT
    c.id,
    c.name,
    c.description,
    c.icon,
    c.color_class,
    COALESCE(gc.group_count, 0) as group_count,
    COALESCE(pe.score, 0) as engagement_score
  FROM
    categories c
  LEFT JOIN
    posts_engagement pe ON c.id = pe.category_id
  LEFT JOIN
    groups_counts gc ON c.id = gc.category_id
  ORDER BY
    (CASE
      WHEN c.name IN ('Organizations', 'Personalities') AND COALESCE(pe.score, 0) < 10 THEN 1
      ELSE 0
    END),
    COALESCE(pe.score, 0) DESC;
END;
$$ LANGUAGE plpgsql;