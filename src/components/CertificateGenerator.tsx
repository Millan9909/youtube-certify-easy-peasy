
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, X } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  totalVideos: number;
  completedVideos: number;
}

interface CertificateGeneratorProps {
  course: Course;
  userName: string;
  onClose: () => void;
}

export const CertificateGenerator = ({ course, userName, onClose }: CertificateGeneratorProps) => {
  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownload = () => {
    // في التطبيق الحقيقي، ستقوم بإنشاء PDF أو صورة للشهادة
    alert('سيتم تحميل الشهادة قريباً!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شهادة إتمام دورة ${course.title}`,
        text: `لقد أكملت بنجاح دورة "${course.title}" في منصة الشهادات التعليمية`,
        url: window.location.href
      });
    } else {
      // نسخ رابط المشاركة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المشاركة!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-screen overflow-y-auto">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center">
              <Award className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">شهادة الإنجاز</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Certificate Design */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-4 border-yellow-400 rounded-lg p-12 text-center">
              {/* Certificate Header */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">شهادة إتمام</h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto"></div>
              </div>

              {/* Recipient */}
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">تُمنح هذه الشهادة إلى</p>
                <h2 className="text-3xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2 inline-block">
                  {userName}
                </h2>
                <p className="text-lg text-gray-600">لإتمامه بنجاح</p>
              </div>

              {/* Course Info */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-green-700 mb-4">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>
                <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                  <p className="text-sm text-gray-600">
                    عدد الفيديوهات المكتملة: <span className="font-semibold text-blue-600">{course.completedVideos}</span>
                  </p>
                </div>
              </div>

              {/* Date and Signature */}
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-2">تاريخ الإنجاز</p>
                  <p className="font-semibold text-gray-800">{currentDate}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">الختم الرسمي</span>
                  </div>
                  <p className="text-sm text-gray-600">منصة الشهادات التعليمية</p>
                </div>
                
                <div className="text-right">
                  <div className="w-32 border-b-2 border-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">توقيع المدير</p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  رقم الشهادة: CERT-{course.id}-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 p-6 border-t bg-gray-50">
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              تحميل الشهادة
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              مشاركة الشهادة
            </Button>
          </div>

          {/* Achievement Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">إحصائيات الإنجاز</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{course.totalVideos}</div>
                <div className="text-sm text-gray-600">فيديو مكتمل</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">نسبة الإكمال</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">شهادة حاصل عليها</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
