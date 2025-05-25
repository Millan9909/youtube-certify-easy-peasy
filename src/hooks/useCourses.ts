
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  created_by: string;
  videos: Video[];
  totalVideos: number;
  completedVideos: number;
}

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  duration_seconds: number;
  order_index: number;
  course_id: string;
  progress?: {
    watched_seconds: number;
    completed: boolean;
  };
}

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch courses with videos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          videos (
            *
          )
        `);

      if (coursesError) throw coursesError;

      // Fetch user progress for all videos
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Combine courses with progress data
      const coursesWithProgress = coursesData?.map(course => {
        const videosWithProgress = course.videos.map((video: any) => {
          const progress = progressData?.find(p => p.video_id === video.id);
          return {
            ...video,
            progress: progress ? {
              watched_seconds: progress.watched_seconds,
              completed: progress.completed
            } : {
              watched_seconds: 0,
              completed: false
            }
          };
        });

        const completedVideos = videosWithProgress.filter(v => v.progress?.completed).length;

        return {
          ...course,
          videos: videosWithProgress,
          totalVideos: videosWithProgress.length,
          completedVideos
        };
      }) || [];

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (title: string, description: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCourses();
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      return null;
    }
  };

  const addVideoToCourse = async (courseId: string, title: string, youtubeUrl: string, videoId: string, duration: number) => {
    try {
      const { error } = await supabase
        .from('videos')
        .insert({
          course_id: courseId,
          title,
          youtube_url: youtubeUrl,
          youtube_video_id: videoId,
          duration_seconds: duration,
          order_index: 0
        });

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  const updateProgress = async (videoId: string, watchedSeconds: number, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          watched_seconds: watchedSeconds,
          completed: completed,
          last_watched_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  return {
    courses,
    loading,
    createCourse,
    addVideoToCourse,
    updateProgress,
    refreshCourses: fetchCourses
  };
};
