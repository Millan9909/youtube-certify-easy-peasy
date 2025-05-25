
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Plus } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface AddVideoFormProps {
  onAddVideo: (title: string, url: string, courseTitle?: string) => void;
  existingCourses: Course[];
}

export const AddVideoForm = ({ onAddVideo, existingCourses }: AddVideoFormProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [courseOption, setCourseOption] = useState<'new' | 'existing' | 'standalone'>('standalone');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    let courseTitle: string | undefined;

    if (courseOption === 'new' && newCourseName.trim()) {
      courseTitle = newCourseName.trim();
    } else if (courseOption === 'existing' && selectedCourse) {
      courseTitle = selectedCourse;
    }

    onAddVideo(title.trim(), url.trim(), courseTitle);
    
    // إعادة تعيين النموذج
    setTitle('');
    setUrl('');
    setCourseOption('standalone');
    setSelectedCourse('');
    setNewCourseName('');
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/.+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const isValidUrl = url === '' || validateYouTubeUrl(url);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Youtube className="w-6 h-6 mr-3 text-red-600" />
          إضافة فيديو جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عنوان الفيديو */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الفيديو *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الفيديو"
              required
            />
          </div>

          {/* رابط الفيديو */}
          <div className="space-y-2">
            <Label htmlFor="url">رابط يوتيوب *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={!isValidUrl ? 'border-red-500' : ''}
              required
            />
            {!isValidUrl && (
              <p className="text-sm text-red-600">
                يرجى إدخال رابط يوتيوب صحيح
              </p>
            )}
          </div>

          {/* خيارات الدورة */}
          <div className="space-y-4">
            <Label>إضافة إلى دورة</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="standalone"
                  name="courseOption"
                  checked={courseOption === 'standalone'}
                  onChange={() => setCourseOption('standalone')}
                  className="w-4 h-4"
                />
                <Label htmlFor="standalone" className="cursor-pointer">
                  فيديو منفرد (لا ينتمي لدورة)
                </Label>
              </div>

              {existingCourses.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing"
                    name="courseOption"
                    checked={courseOption === 'existing'}
                    onChange={() => setCourseOption('existing')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="existing" className="cursor-pointer">
                    إضافة لدورة موجودة
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new"
                  name="courseOption"
                  checked={courseOption === 'new'}
                  onChange={() => setCourseOption('new')}
                  className="w-4 h-4"
                />
                <Label htmlFor="new" className="cursor-pointer">
                  إنشاء دورة جديدة
                </Label>
              </div>
            </div>

            {/* اختيار دورة موجودة */}
            {courseOption === 'existing' && existingCourses.length > 0 && (
              <div className="space-y-2">
                <Label>اختر الدورة</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر دورة موجودة" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCourses.map((course) => (
                      <SelectItem key={course.id} value={course.title}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* اسم الدورة الجديدة */}
            {courseOption === 'new' && (
              <div className="space-y-2">
                <Label htmlFor="newCourse">اسم الدورة الجديدة</Label>
                <Input
                  id="newCourse"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="أدخل اسم الدورة الجديدة"
                />
              </div>
            )}
          </div>

          {/* معاينة */}
          {title && url && isValidUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">معاينة:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>العنوان:</strong> {title}</p>
                <p><strong>الرابط:</strong> {url}</p>
                <p><strong>النوع:</strong> {
                  courseOption === 'standalone' ? 'فيديو منفرد' :
                  courseOption === 'existing' ? `جزء من دورة: ${selectedCourse}` :
                  courseOption === 'new' ? `دورة جديدة: ${newCourseName}` : ''
                }</p>
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
              disabled={!isValidUrl}
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة الفيديو
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
