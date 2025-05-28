
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, Save } from 'lucide-react';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [certificateName, setCertificateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, preferred_certificate_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFullName(data?.full_name || '');
      setCertificateName(data?.preferred_certificate_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          preferred_certificate_name: certificateName
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <Input value={user?.email || ''} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الاسم المفضل للشهادات</label>
            <Input
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              placeholder="الاسم الذي تريد ظهوره في الشهادات"
            />
            <p className="text-sm text-gray-500 mt-1">
              هذا الاسم سيظهر في جميع الشهادات التي تحصل عليها
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
