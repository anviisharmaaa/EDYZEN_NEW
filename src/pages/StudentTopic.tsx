import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag } from '../components/UI';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Play, Video, ChevronRight, Folder } from 'lucide-react';
import { cn } from '../lib/utils';

interface Material {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive';
  url: string;
  completed: boolean;
}

interface SubTopic {
  id: string;
  title: string;
  description: string;
  materials: Material[];
  completed: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  subTopics: SubTopic[];
}

export const StudentTopic = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/topics/${topicId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch topic');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setTopic(data);
          if (data.subTopics?.length > 0) {
            setExpandedSubtopics(new Set([data.subTopics[0].id]));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching topic:', err);
        setLoading(false);
      });
  }, [topicId]);

  const toggleSubtopic = (id: string) => {
    setExpandedSubtopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSubtopicProgress = (subtopic: SubTopic) => {
    if (!subtopic.materials?.length) return 0;
    const completed = subtopic.materials.filter(m => m.completed).length;
    return Math.round((completed / subtopic.materials.length) * 100);
  };

  const getTopicProgress = () => {
    if (!topic?.subTopics?.length) return 0;
    const totalMaterials = topic.subTopics.reduce((acc, st) => acc + (st.materials?.length || 0), 0);
    const completedMaterials = topic.subTopics.reduce((acc, st) => {
      return acc + (st.materials?.filter(m => m.completed).length || 0);
    }, 0);
    return totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;
  };

  if (loading) return <div className="p-8">Loading topic...</div>;
  if (!topic) return <div className="p-8">Topic not found.</div>;

  const topicProgress = getTopicProgress();

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-4xl font-black">{topic.title}</h1>
          <p className="font-bold text-gray-600">{topic.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Folder /> Subtopics
          </h2>
          
          {topic.subTopics?.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No subtopics available yet.
            </Card>
          ) : (
            <div className="space-y-4">
              {topic.subTopics?.map((subtopic) => {
                const isExpanded = expandedSubtopics.has(subtopic.id);
                const progress = getSubtopicProgress(subtopic);
                const completedCount = subtopic.materials?.filter(m => m.completed).length || 0;
                const totalCount = subtopic.materials?.length || 0;

                return (
                  <Card key={subtopic.id} className="overflow-hidden">
                    <button
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
                      onClick={() => toggleSubtopic(subtopic.id)}
                    >
                      <div className="flex items-center gap-4">
                        <ChevronRight 
                          className={cn("transition-transform", isExpanded && "rotate-90")} 
                          size={20} 
                        />
                        <div>
                          <h3 className="font-black">{subtopic.title}</h3>
                          <p className="text-sm text-gray-500">{subtopic.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-500">
                          {completedCount}/{totalCount}
                        </span>
                        <div className="w-24 h-2 neo-border bg-white overflow-hidden rounded">
                          <div 
                            className="h-full bg-black" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && subtopic.materials && subtopic.materials.length > 0 && (
                      <div className="border-t p-4 space-y-3 bg-gray-50">
                        {subtopic.materials.map(material => (
                          <Card key={material.id} className={cn(
                            "flex items-center justify-between p-3 transition-all",
                            material.completed ? "bg-green-50 opacity-80" : "bg-white"
                          )}>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 neo-border rounded-full",
                                material.type === 'video' ? "bg-red-100" : material.type === 'reading' ? "bg-blue-100" : "bg-purple-100"
                              )}>
                                {material.type === 'video' ? <Video size={16} /> : material.type === 'reading' ? <FileText size={16} /> : <Play size={16} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">{material.title}</h4>
                                <p className="text-xs font-black uppercase text-gray-500">{material.type}</p>
                              </div>
                            </div>
                            <div>
                              {material.completed ? (
                                <CheckCircle className="text-green-600" size={20} />
                              ) : (
                                <Button variant="primary" className="text-xs py-1">Start</Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-yellow-50 border-yellow-400 sticky top-4">
            <h3 className="text-xl font-black mb-4">Topic Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between font-black text-sm">
                <span>Overall Progress</span>
                <span>{topicProgress}%</span>
              </div>
              <div className="h-4 neo-border bg-white overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${topicProgress}%` }} />
              </div>
              <p className="text-xs font-bold text-gray-600 italic">
                Complete all materials to unlock the topic quiz!
              </p>
            </div>
          </Card>

          <Card className="bg-purple-50 border-purple-400">
            <h3 className="text-xl font-black mb-4">Topic Quiz</h3>
            <p className="text-sm font-bold text-gray-600 mb-6">
              Ready to test your knowledge on {topic.title}?
            </p>
            <Button 
              variant="primary" 
              className="w-full bg-purple-400 hover:bg-purple-500"
              disabled={topicProgress < 100}
              onClick={() => navigate(`/student/quiz/q_${topic.id}`)}
            >
              Take Quiz
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};