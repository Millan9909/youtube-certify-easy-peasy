
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Certificate {
  id: string;
  course_id: string;
  issued_at: string;
  course: {
    title: string;
    description: string;
  };
}

export const useCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Certificate interface
      const transformedData = data?.map(cert => ({
        id: cert.id,
        course_id: cert.course_id,
        issued_at: cert.issued_at,
        course: {
          title: cert.courses?.title || '',
          description: cert.courses?.description || ''
        }
      })) || [];
      
      setCertificates(transformedData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    certificates,
    loading,
    refresh: fetchCertificates
  };
};
