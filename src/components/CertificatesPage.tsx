
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateGenerator } from './CertificateGenerator';
import { useState } from 'react';
import { Award, Download, Eye } from 'lucide-react';

export const CertificatesPage = () => {
  const { certificates, loading } = useCertificates();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-12">جاري تحميل الشهادات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Award className="w-8 h-8 text-yellow-600" />
        <h1 className="text-3xl font-bold">شهاداتي</h1>
      </div>

      {certificates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لا توجد شهادات بعد
            </h3>
            <p className="text-gray-500">
              أكمل الدورات للحصول على شهادات إنجاز
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 text-yellow-600" />
                  <span className="text-sm text-gray-500">
                    {formatDate(certificate.issued_at)}
                  </span>
                </div>
                <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {certificate.course.description}
                </p>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    عرض الشهادة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // في المستقبل يمكن إضافة تحميل PDF
                      alert('سيتم تحميل الشهادة قريباً!');
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* مودال عرض الشهادة */}
      {selectedCertificate && (
        <CertificateGenerator
          course={{
            id: selectedCertificate.course_id,
            title: selectedCertificate.course.title,
            description: selectedCertificate.course.description,
            totalVideos: 1,
            completedVideos: 1
          }}
          userName="المتدرب" // سيتم تحديثه لاحقاً من الملف الشخصي
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};
