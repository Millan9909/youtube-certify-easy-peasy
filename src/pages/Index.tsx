
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { useYoutube } from "@/hooks/useYoutube";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CertificateGenerator } from "@/components/CertificateGenerator";
import { AddVideoForm } from "@/components/AddVideoForm";
import { PlaylistManager } from "@/components/PlaylistManager";
import { Trophy, Play, Award, Youtube, Plus, List, LogOut } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { courses, loading: coursesLoading, createCourse, addVideoToCourse, updateProgress } = useCourses();
  const { extractVideoId, getVideoInfo } = useYoutube();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedCourse, setCompletedCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'add-video' | 'add-playlist'>('courses');

  // Redirect to auth if not logged in
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const addVideo = async (title: string, url: string, courseTitle?: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('رابط يوتيوب غير صحيح');
      return;
    }

    const videoInfo = await getVideoInfo(videoId);
    if (!videoInfo) {
      alert('فشل في الحصول على معلومات الفيديو');
      return;
    }

    let courseId: string;

    if (courseTitle) {
      // Find existing course or create new one
      const existingCourse = courses.find(c => c.title === courseTitle);
      if (existingCourse) {
        courseId = existingCourse.id;
      } else {
        const newCourse = await createCourse(courseTitle, 'دورة تحتوي على فيديوهات تعليمية');
        if (!newCourse) {
          alert('فشل في إنشاء الدورة');
          return;
        }
        courseId = newCourse.id;
      }
    } else {
      // Create single video course
      const newCourse = await createCourse(title, 'فيديو تعليمي منفرد');
      if (!newCourse) {
        alert('فشل في إنشاء الدورة');
        return;
      }
      courseId = newCourse.id;
    }

    await addVideoToCourse(courseId, title, url, videoId, videoInfo.duration);
  };

  const addPlaylist = async (playlistUrl: string, courseTitle: string) => {
    // Create course for playlist
    const course = await createCourse(courseTitle, 'دورة تم إنشاؤها من قائمة تشغيل يوتيوب');
    if (!course) return;

    // Mock playlist videos (in real app, use YouTube API)
    const mockVideos = [
      { title: 'الدرس الأول', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { title: 'الدرس الثاني', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { title: 'الدرس الثالث', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    ];

    for (const video of mockVideos) {
      const videoId = extractVideoId(video.url);
      if (videoId) {
        const videoInfo = await getVideoInfo(videoId);
        if (videoInfo) {
          await addVideoToCourse(course.id, video.title, video.url, videoId, videoInfo.duration);
        }
      }
    }
  };

  const onVideoComplete = async (videoId: string) => {
    await updateProgress(videoId, 0, true);
    
    // Check if course is completed
    const course = courses.find(c => c.videos.some(v => v.id === videoId));
    if (course) {
      const completedCount = course.videos.filter(v => v.progress?.completed || v.id === videoId).length;
      if (completedCount === course.totalVideos) {
        setCompletedCourse(course);
        setShowCertificate(true);
      }
    }
  };

  const updateVideoProgress = async (videoId: string, progress: number) => {
    const video = courses.flatMap(c => c.videos).find(v => v.id === videoId);
    if (video) {
      const watchedSeconds = Math.round((progress / 100) * video.duration_seconds);
      const completed = progress >= 80; // Complete at 80%
      await updateProgress(videoId, watchedSeconds, completed);
    }
  };

  const getCourseProgress = (course: any) => {
    if (course.totalVideos === 0) return 0;
    const totalProgress = course.videos.reduce((sum: number, video: any) => {
      const progress = video.progress ? (video.progress.watched_seconds / video.duration_seconds) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0);
    return totalProgress / course.totalVideos;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                منصة الشهادات التعليمية
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">مرحباً،</span>
              <span className="font-semibold text-blue-600">{user.email}</span>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>الدورات</span>
          </button>
          <button
            onClick={() => setActiveTab('add-video')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'add-video'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيديو</span>
          </button>
          <button
            onClick={() => setActiveTab('add-playlist')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'add-playlist'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>إضافة قائمة تشغيل</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {selectedVideo ? (
              <div className="space-y-6">
                <Button
                  onClick={() => setSelectedVideo(null)}
                  variant="outline"
                  className="mb-4"
                >
                  العودة للدورات
                </Button>
                <VideoPlayer
                  video={selectedVideo}
                  onComplete={onVideoComplete}
                  onProgressUpdate={updateVideoProgress}
                />
              </div>
            ) : (
              <>
                {coursesLoading ? (
                  <div className="text-center py-12">جاري تحميل الدورات...</div>
                ) : courses.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        لا توجد دورات بعد
                      </h3>
                      <p className="text-gray-500 mb-4">
                        ابدأ بإضافة فيديو أو قائمة تشغيل من يوتيوب
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button 
                          onClick={() => setActiveTab('add-video')}
                          className="bg-gradient-to-r from-blue-600 to-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة فيديو
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('add-playlist')}
                          variant="outline"
                        >
                          <List className="w-4 h-4 mr-2" />
                          إضافة قائمة تشغيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <CardDescription>{course.description}</CardDescription>
                            </div>
                            {course.completedVideos === course.totalVideos && course.totalVideos > 0 && (
                              <Badge className="bg-green-100 text-green-800">
                                مكتملة
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>التقدم</span>
                              <span>{Math.round(getCourseProgress(course))}%</span>
                            </div>
                            <Progress value={getCourseProgress(course)} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>{course.completedVideos} من {course.totalVideos} فيديو</span>
                          </div>

                          <div className="space-y-2">
                            {course.videos.map((video: any) => (
                              <div key={video.id} className="flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedVideo(video)}
                                  className="flex-1 justify-start"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  <span className="truncate">{video.title}</span>
                                </Button>
                                {video.progress?.completed && (
                                  <Badge variant="secondary" className="text-green-600">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>

                          {course.completedVideos === course.totalVideos && course.totalVideos > 0 && (
                            <Button
                              onClick={() => {
                                setCompletedCourse(course);
                                setShowCertificate(true);
                              }}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700"
                            >
                              <Award className="w-4 h-4 mr-2" />
                              عرض الشهادة
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'add-video' && (
          <AddVideoForm onAddVideo={addVideo} existingCourses={courses} />
        )}

        {activeTab === 'add-playlist' && (
          <PlaylistManager onAddPlaylist={addPlaylist} />
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && completedCourse && (
        <CertificateGenerator
          course={completedCourse}
          userName={user.email || 'المتدرب'}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default Index;
