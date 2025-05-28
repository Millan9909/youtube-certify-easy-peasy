
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from '@/hooks/useAdmin';
import { useCourses } from '@/hooks/useCourses';
import { Users, Award, Clock, BookOpen, Crown, Trash2, Send } from 'lucide-react';

export const AdminDashboard = () => {
  const { stats, getAllUsers, promoteToAdmin, deleteUser, sendNotification } = useAdmin();
  const { courses } = useCourses();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      setLoading(true);
      await promoteToAdmin(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      setLoading(true);
      await deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationTitle || !notificationMessage) return;

    try {
      setLoading(true);
      await sendNotification(selectedUser, notificationTitle, notificationMessage);
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedUser('');
      alert('تم إرسال الإشعار بنجاح');
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم الأدمن</h1>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الشهادات</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ساعات المشاهدة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWatchHours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
      </div>

      {/* إدارة المستخدمين */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{user.full_name || 'بدون اسم'}</h3>
                  <p className="text-sm text-gray-600">{user.id}</p>
                  <Badge variant={user.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                    {user.user_roles?.[0]?.role === 'admin' ? 'أدمن' : 'مستخدم'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {user.user_roles?.[0]?.role !== 'admin' && (
                    <Button
                      size="sm"
                      onClick={() => handlePromoteUser(user.id)}
                      disabled={loading}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      ترقية لأدمن
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إرسال الإشعارات */}
      <Card>
        <CardHeader>
          <CardTitle>إرسال إشعار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اختر المستخدم</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">اختر مستخدم</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">عنوان الإشعار</label>
            <Input
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="عنوان الإشعار"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">محتوى الإشعار</label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="محتوى الإشعار"
              className="w-full p-2 border rounded-md h-24"
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={loading || !selectedUser || !notificationTitle || !notificationMessage}
          >
            <Send className="w-4 h-4 mr-2" />
            إرسال الإشعار
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
