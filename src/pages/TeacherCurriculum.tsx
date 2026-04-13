import React, { useEffect, useState } from 'react';
import { Card, Button, Tag } from '../components/UI';
import { BookOpen, Plus, Search, Edit2, Trash2, ChevronRight, FileText, Video, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface Material {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive';
}

interface Topic {
  id: string;
  title: string;
  description: string;
  materials: Material[];
}

export const TeacherCurriculum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const res = await fetch('/api/teachers/me/curriculum', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch curriculum');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTopics(data);
        }
      } catch (err) {
        console.error('Error fetching curriculum:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCurriculum();
  }, []);

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading curriculum...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Curriculum Management</h1>
          <p className="font-bold text-gray-600">Plan and manage topics, materials, and quizzes for your classes.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus size={20} /> Add New Topic
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search topics..." 
            className="w-full pl-12 pr-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-6">
        {filteredTopics.map(topic => (
          <Card key={topic.id} className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 neo-border bg-blue-100 flex items-center justify-center text-xl font-black">
                  {topic.title[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{topic.title}</h3>
                  <p className="font-bold text-gray-600">{topic.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="p-2 bg-yellow-100 text-yellow-700 border-yellow-400">
                  <Edit2 size={18} />
                </Button>
                <Button className="p-2 bg-red-100 text-red-700 border-red-400">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(topic.materials || []).map(material => (
                <div key={material.id} className="flex items-center gap-3 p-3 neo-border bg-gray-50">
                  <div className={cn(
                    "p-2 neo-border rounded-full",
                    material.type === 'video' ? "bg-red-100" : material.type === 'reading' ? "bg-blue-100" : "bg-purple-100"
                  )}>
                    {material.type === 'video' ? <Video size={16} /> : material.type === 'reading' ? <FileText size={16} /> : <Play size={16} />}
                  </div>
                  <span className="font-bold text-sm truncate">{material.title}</span>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 p-3 neo-border border-dashed border-gray-400 hover:bg-gray-100 transition-all font-black text-sm text-gray-500">
                <Plus size={16} /> Add Material
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <div className="flex items-center gap-4">
                <Tag color="#a855f7">Quiz: Q_{topic.id}</Tag>
                <span className="text-xs font-black text-gray-500 uppercase">10 Questions</span>
              </div>
              <Button className="text-xs py-1 flex items-center gap-2">
                Manage Quiz <ChevronRight size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="font-black text-gray-500 text-xl">No topics found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
