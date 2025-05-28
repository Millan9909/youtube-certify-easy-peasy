
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminStats {
  totalUsers: number;
  totalCertificates: number;
  totalWatchHours: number;
  totalCourses: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCertificates: 0,
    totalWatchHours: 0,
    totalCourses: 0
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
      if (data) {
        await fetchStats();
      }
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // جلب إحصائيات المستخدمين
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // جلب إحصائيات الشهادات
      const { count: certificatesCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true });

      // جلب إحصائيات الدورات
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // جلب إحصائيات ساعات المشاهدة
      const { data: watchStats } = await supabase
        .from('video_watch_stats')
        .select('minutes_watched');

      const totalMinutes = watchStats?.reduce((sum, stat) => sum + (stat.minutes_watched || 0), 0) || 0;
      const totalHours = Math.round(totalMinutes / 60);

      setStats({
        totalUsers: usersCount || 0,
        totalCertificates: certificatesCount || 0,
        totalWatchHours: totalHours,
        totalCourses: coursesCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getAllUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        user_roles (role)
      `);

    if (error) throw error;
    return data;
  };

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      });

    if (error) throw error;
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  };

  const sendNotification = async (userId: string, title: string, message: string) => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'admin'
      });

    if (error) throw error;
  };

  const assignCourse = async (courseId: string, userId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('course_assignments')
      .insert({
        course_id: courseId,
        user_id: userId,
        assigned_by: user.id
      });

    if (error) throw error;

    // إرسال إشعار للمستخدم
    await sendNotification(
      userId,
      'دورة جديدة',
      'تم تعيين دورة تدريبية جديدة لك'
    );
  };

  return {
    isAdmin,
    loading,
    stats,
    getAllUsers,
    promoteToAdmin,
    deleteUser,
    sendNotification,
    assignCourse,
    refreshStats: fetchStats
  };
};
