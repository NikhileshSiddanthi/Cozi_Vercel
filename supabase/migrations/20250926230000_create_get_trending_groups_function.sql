CREATE OR REPLACE FUNCTION get_trending_groups(days_range integer DEFAULT 7)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    member_count integer,
    category_name text,
    trend_score double precision,
    new_posts bigint,
    new_members bigint,
    new_comments bigint,
    trend_change double precision
) AS $$
DECLARE
    end_date timestamp;
    start_date timestamp;
    prev_start_date timestamp;
    prev_end_date timestamp;
BEGIN
    end_date := NOW();
    start_date := end_date - (days_range || ' days')::interval;
    prev_end_date := start_date;
    prev_start_date := prev_end_date - (days_range || ' days')::interval;

    RETURN QUERY
    WITH current_period_posts AS (
        SELECT group_id, count(*) as new_posts
        FROM posts
        WHERE created_at >= start_date AND created_at < end_date
        GROUP BY group_id
    ),
    previous_period_posts AS (
        SELECT group_id, count(*) as prev_posts
        FROM posts
        WHERE created_at >= prev_start_date AND created_at < prev_end_date
        GROUP BY group_id
    ),
    current_period_members AS (
        SELECT group_id, count(*) as new_members
        FROM group_members
        WHERE status = 'approved' AND joined_at >= start_date AND joined_at < end_date
        GROUP BY group_id
    ),
    previous_period_members AS (
        SELECT group_id, count(*) as prev_members
        FROM group_members
        WHERE status = 'approved' AND joined_at >= prev_start_date AND joined_at < prev_end_date
        GROUP BY group_id
    ),
    current_period_comments AS (
        SELECT p.group_id, count(c.id) as new_comments
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.created_at >= start_date AND c.created_at < end_date
        GROUP BY p.group_id
    ),
    previous_period_comments AS (
        SELECT p.group_id, count(c.id) as prev_comments
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.created_at >= prev_start_date AND c.created_at < prev_end_date
        GROUP BY p.group_id
    )
    SELECT
        g.id,
        g.name,
        g.description,
        g.member_count,
        cat.name as category_name,
        (COALESCE(cpp.new_posts, 0) * 0.5) + (COALESCE(cpm.new_members, 0) * 0.3) + (COALESCE(cpc.new_comments, 0) * 0.2) as trend_score,
        COALESCE(cpp.new_posts, 0) as new_posts,
        COALESCE(cpm.new_members, 0) as new_members,
        COALESCE(cpc.new_comments, 0) as new_comments,
        CASE
            WHEN (COALESCE(ppp.prev_posts, 0) + COALESCE(ppm.prev_members, 0) + COALESCE(ppc.prev_comments, 0)) > 0
            THEN ((COALESCE(cpp.new_posts, 0) + COALESCE(cpm.new_members, 0) + COALESCE(cpc.new_comments, 0)) - (COALESCE(ppp.prev_posts, 0) + COALESCE(ppm.prev_members, 0) + COALESCE(ppc.prev_comments, 0)))::float / (COALESCE(ppp.prev_posts, 0) + COALESCE(ppm.prev_members, 0) + COALESCE(ppc.prev_comments, 0))::float * 100
            WHEN (COALESCE(cpp.new_posts, 0) + COALESCE(cpm.new_members, 0) + COALESCE(cpc.new_comments, 0)) > 0
            THEN 100.0
            ELSE 0.0
        END as trend_change
    FROM groups g
    JOIN categories cat ON g.category_id = cat.id
    LEFT JOIN current_period_posts cpp ON g.id = cpp.group_id
    LEFT JOIN previous_period_posts ppp ON g.id = ppp.group_id
    LEFT JOIN current_period_members cpm ON g.id = cpm.group_id
    LEFT JOIN previous_period_members ppm ON g.id = ppm.group_id
    LEFT JOIN current_period_comments cpc ON g.id = cpc.group_id
    LEFT JOIN previous_period_comments ppc ON g.id = ppc.group_id
    WHERE g.is_approved = true
    ORDER BY trend_score DESC
    LIMIT 5;

END;
$$ LANGUAGE plpgsql;