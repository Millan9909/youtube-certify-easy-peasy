
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CertificateGenerator } from "@/components/CertificateGenerator";
import { AddVideoForm } from "@/components/AddVideoForm";
import { PlaylistManager } from "@/components/PlaylistManager";
import { Trophy, Play, Award, Youtube, Plus, List } from "lucide-react";

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  completed: boolean;
  progress: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  totalVideos: number;
  completedVideos: number;
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [completedCourse, setCompletedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'add-video' | 'add-playlist'>('courses');
  const [userName, setUserName] = useState('');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const addVideo = (title: string, url: string, courseTitle?: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('رابط يوتيوب غير صحيح');
      return;
    }

    const newVideo: Video = {
      id: videoId,
      title,
      url,
      duration: 0,
      completed: false,
      progress: 0
    };

    if (courseTitle) {
      // إضافة لدورة موجودة أو إنشاء دورة جديدة
      setCourses(prev => {
        const existingCourseIndex = prev.findIndex(c => c.title === courseTitle);
        if (existingCourseIndex >= 0) {
          const updatedCourses = [...prev];
          updatedCourses[existingCourseIndex].videos.push(newVideo);
          updatedCourses[existingCourseIndex].totalVideos++;
          return updatedCourses;
        } else {
          const newCourse: Course = {
            id: Date.now().toString(),
            title: courseTitle,
            description: `دورة تحتوي على فيديوهات تعليمية`,
            videos: [newVideo],
            totalVideos: 1,
            completedVideos: 0
          };
          return [...prev, newCourse];
        }
      });
    } else {
      // إنشاء دورة منفردة
      const newCourse: Course = {
        id: Date.now().toString(),
        title,
        description: 'فيديو تعليمي منفرد',
        videos: [newVideo],
        totalVideos: 1,
        completedVideos: 0
      };
      setCourses(prev => [...prev, newCourse]);
    }
  };

  const addPlaylist = (playlistUrl: string, courseTitle: string) => {
    // محاكاة إضافة قائمة تشغيل
    const mockVideos: Video[] = [
      {
        id: 'vid1',
        title: 'الدرس الأول',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 0,
        completed: false,
        progress: 0
      },
      {
        id: 'vid2',
        title: 'الدرس الثاني',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 0,
        completed: false,
        progress: 0
      },
      {
        id: 'vid3',
        title: 'الدرس الثالث',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 0,
        completed: false,
        progress: 0
      }
    ];

    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseTitle,
      description: 'دورة تم إنشاؤها من قائمة تشغيل يوتيوب',
      videos: mockVideos,
      totalVideos: mockVideos.length,
      completedVideos: 0
    };

    setCourses(prev => [...prev, newCourse]);
  };

  const onVideoComplete = (videoId: string) => {
    setCourses(prev => {
      const updatedCourses = prev.map(course => {
        const videoIndex = course.videos.findIndex(v => v.id === videoId);
        if (videoIndex >= 0 && !course.videos[videoIndex].completed) {
          const updatedVideos = [...course.videos];
          updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], completed: true, progress: 100 };
          
          const completedCount = updatedVideos.filter(v => v.completed).length;
          const updatedCourse = {
            ...course,
            videos: updatedVideos,
            completedVideos: completedCount
          };

          // فحص إكمال الدورة
          if (completedCount === course.totalVideos) {
            setCompletedCourse(updatedCourse);
            setShowCertificate(true);
          }

          return updatedCourse;
        }
        return course;
      });
      return updatedCourses;
    });
  };

  const updateVideoProgress = (videoId: string, progress: number) => {
    setCourses(prev => 
      prev.map(course => ({
        ...course,
        videos: course.videos.map(video => 
          video.id === videoId ? { ...video, progress } : video
        )
      }))
    );
  };

  const getCourseProgress = (course: Course) => {
    const totalProgress = course.videos.reduce((sum, video) => sum + video.progress, 0);
    return course.totalVideos > 0 ? totalProgress / course.totalVideos : 0;
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
            {!userName ? (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="أدخل اسمك"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-40"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">مرحباً،</span>
                <span className="font-semibold text-blue-600">{userName}</span>
              </div>
            )}
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
                {courses.length === 0 ? (
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
                            {course.completedVideos === course.totalVideos && (
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
                            {course.videos.map((video) => (
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
                                {video.completed && (
                                  <Badge variant="secondary" className="text-green-600">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>

                          {course.completedVideos === course.totalVideos && (
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
          userName={userName || 'المتدرب'}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default Index;
