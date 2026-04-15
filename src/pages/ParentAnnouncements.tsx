import React, { useEffect, useState } from 'react';
import { Card, Button, Tag } from '../components/UI';
import { Bell, Calendar, Search, ChevronRight, User, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface Announcement {

  id: string;
  title: string;
  content: string;
  date: string;
  type: 'general' | 'urgent' | 'event';
  author: string;

}

export const ParentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/parents/me/announcements', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch announcements');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching announcements:', err);
        setLoading(false);
      });
  }, []);

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading announcements...</div>;

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">School Announcements</h1>
          <p className="font-bold text-gray-600">Stay updated with the latest news and events from the school.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="primary" className="bg-purple-400 hover:bg-purple-500 flex items-center gap-2">
            <Bell size={18} /> Notifications Settings
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search announcements..."
            className="w-full pl-12 pr-4 py-3 neo-border font-bold focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-6">
        {filteredAnnouncements.map(announcement => (
          <Card key={announcement.id} className={cn(
            "p-8 space-y-6 transition-all",
            announcement.type === 'urgent' ? "bg-red-50 border-red-400" :
              announcement.type === 'event' ? "bg-blue-50 border-blue-400" : "bg-white"
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 neo-border rounded-full",
                  announcement.type === 'urgent' ? "bg-red-100" :
                    announcement.type === 'event' ? "bg-blue-100" : "bg-gray-100"
                )}>
                  {announcement.type === 'urgent' ? <Bell size={24} className="text-red-600" /> :
                    announcement.type === 'event' ? <Calendar size={24} className="text-blue-600" /> : <Bell size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black">{announcement.title}</h3>
                    <Tag color={
                      announcement.type === 'urgent' ? '#f87171' :
                        announcement.type === 'event' ? '#3b82f6' : '#ddd'
                    }>
                      {announcement.type}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black text-gray-500 uppercase mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {announcement.date}</span>
                    <span className="flex items-center gap-1"><User size={14} /> {announcement.author}</span>
                  </div>
                </div>
              </div>
              <Button className="text-xs py-1 flex items-center gap-2">
                Read More <ChevronRight size={14} />
              </Button>
            </div>

            <p className="font-bold text-gray-700 leading-relaxed">
              {announcement.content}
            </p>

            <div className="flex items-center gap-4 pt-4 border-t-2 border-black">
              <Button className="text-xs py-1 bg-white flex items-center gap-2">
                <Heart size={14} /> Acknowledge
              </Button>
              <Button className="text-xs py-1 bg-white flex items-center gap-2">
                Reply to School
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <p className="font-black text-gray-500 text-xl">No announcements found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
