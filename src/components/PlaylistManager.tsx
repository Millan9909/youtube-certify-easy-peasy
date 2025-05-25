
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List, Plus, Youtube } from 'lucide-react';

interface PlaylistManagerProps {
  onAddPlaylist: (playlistUrl: string, courseTitle: string) => void;
}

export const PlaylistManager = ({ onAddPlaylist }: PlaylistManagerProps) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [courseTitle, setCourseTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playlistUrl.trim() || !courseTitle.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    onAddPlaylist(playlistUrl.trim(), courseTitle.trim());
    
    // إعادة تعيين النموذج
    setPlaylistUrl('');
    setCourseTitle('');
  };

  const validatePlaylistUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=.+/,
      /^https?:\/\/(www\.)?youtube\.com\/watch\?.*list=.+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const isValidUrl = playlistUrl === '' || validatePlaylistUrl(playlistUrl);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="w-6 h-6 mr-3 text-blue-600" />
          إضافة قائمة تشغيل من يوتيوب
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عنوان الدورة */}
          <div className="space-y-2">
            <Label htmlFor="courseTitle">اسم الدورة *</Label>
            <Input
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="أدخل اسم الدورة التي ستحتوي على قائمة التشغيل"
              required
            />
          </div>

          {/* رابط قائمة التشغيل */}
          <div className="space-y-2">
            <Label htmlFor="playlistUrl">رابط قائمة التشغيل *</Label>
            <Input
              id="playlistUrl"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              className={!isValidUrl ? 'border-red-500' : ''}
              required
            />
            {!isValidUrl && (
              <p className="text-sm text-red-600">
                يرجى إدخال رابط قائمة تشغيل يوتيوب صحيح
              </p>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">ملاحظة مهمة:</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• سيتم استيراد جميع الفيديوهات من قائمة التشغيل تلقائياً</p>
              <p>• يجب أن تكون قائمة التشغيل عامة (Public) للوصول إليها</p>
              <p>• سيتم إنشاء دورة جديدة تحتوي على جميع فيديوهات القائمة</p>
              <p>• يمكن للمتدربين الحصول على شهادة بعد إكمال جميع الفيديوهات</p>
            </div>
          </div>

          {/* معاينة */}
          {courseTitle && playlistUrl && isValidUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">معاينة:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>اسم الدورة:</strong> {courseTitle}</p>
                <p><strong>رابط القائمة:</strong> {playlistUrl}</p>
                <p><strong>النوع:</strong> دورة تحتوي على قائمة تشغيل كاملة</p>
              </div>
            </div>
          )}

          {/* أمثلة على الروابط */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">أمثلة على روابط قوائم التشغيل:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-mono bg-white p-2 rounded border">
                https://www.youtube.com/playlist?list=PLxxx...
              </p>
              <p className="font-mono bg-white p-2 rounded border">
                https://www.youtube.com/watch?v=VIDEO_ID&list=PLxxx...
              </p>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
              disabled={!isValidUrl}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة قائمة التشغيل
            </Button>
          </div>
        </form>

        {/* نصائح إضافية */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">نصائح لأفضل النتائج:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• تأكد من أن جميع الفيديوهات في القائمة متاحة للمشاهدة</p>
            <p>• استخدم عناوين وصفية للدورات لسهولة التنظيم</p>
            <p>• يمكنك إضافة فيديوهات إضافية للدورة لاحقاً</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
