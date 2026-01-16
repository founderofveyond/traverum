import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformExperience, transformSession } from '@/lib/experienceTransform';

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('experience_status', 'active');

      if (error) throw error;
      return (data ?? []).map(exp => transformExperience(exp));
    },
  });
}

export function useExperience(slug: string | undefined) {
  return useQuery({
    queryKey: ['experience', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('slug', slug)
        .eq('experience_status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch media for images
      const { data: media } = await supabase
        .from('media')
        .select('url, sort_order')
        .eq('experience_id', data.id)
        .order('sort_order');

      return transformExperience(data, media ?? []);
    },
    enabled: !!slug,
  });
}

export function useExperienceSessions(experienceId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', experienceId],
    queryFn: async () => {
      if (!experienceId) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('experience_sessions')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('session_status', 'available')
        .gte('session_date', today)
        .gt('spots_available', 0)
        .order('session_date')
        .order('start_time');

      if (error) throw error;
      return (data ?? []).map(transformSession);
    },
    enabled: !!experienceId,
  });
}
