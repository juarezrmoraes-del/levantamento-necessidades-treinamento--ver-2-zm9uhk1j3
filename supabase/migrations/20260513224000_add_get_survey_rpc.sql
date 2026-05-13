-- Function to safely allow anonymous users to fetch their own survey by its unguessable UUID
CREATE OR REPLACE FUNCTION public.get_survey_by_id(search_id uuid)
RETURNS SETOF public.survey_leads AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.survey_leads WHERE id = search_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_survey_by_id(uuid) TO anon, authenticated;
