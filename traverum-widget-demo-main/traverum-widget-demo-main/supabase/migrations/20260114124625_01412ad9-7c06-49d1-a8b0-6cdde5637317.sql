-- Allow public read access to active experiences
CREATE POLICY "Public can view active experiences" 
  ON experiences 
  FOR SELECT 
  USING (experience_status = 'active');

-- Allow public read access to media for active experiences
CREATE POLICY "Public can view media for active experiences" 
  ON media 
  FOR SELECT 
  USING (experience_id IN (
    SELECT id FROM experiences WHERE experience_status = 'active'
  ));

-- Allow public read access to available future sessions
CREATE POLICY "Public can view available sessions" 
  ON experience_sessions 
  FOR SELECT 
  USING (
    session_status = 'available' 
    AND session_date >= CURRENT_DATE
    AND experience_id IN (
      SELECT id FROM experiences WHERE experience_status = 'active'
    )
  );