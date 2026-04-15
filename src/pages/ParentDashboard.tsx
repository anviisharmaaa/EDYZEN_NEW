import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, MoodIcon, Tag } from '../components/UI';
import { Users, Heart, Bell, TrendingUp, BookOpen, Clock, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ChildSummary {
  id: string;
  name: string;
  mood: string;
  progress: number;
  lastActivity: string;
}

export const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch('/api/parents/me/children')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch children');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setChildren(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching parent dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Hello, {user?.name}!</h1>
          <p className="font-bold text-gray-600 uppercase tracking-widest">Parent Dashboard Overview</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="primary"
            className="bg-purple-400 hover:bg-purple-500 flex items-center gap-2"
            onClick={() => navigate('/parent/announcements')}
          >
            <Bell size={18} /> Announcements
          </Button>
          <Button variant="primary" className="bg-green-400 hover:bg-green-500 flex items-center gap-2">
            <Heart size={18} /> Support Resources
          </Button>
          <Button
            variant="primary"
            className="bg-blue-400 hover:bg-blue-500 flex items-center gap-2"
            onClick={() => navigate('/parent/calendar')}
          >
            <CalendarIcon size={18} /> Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Users /> Your Children
          </h2>
          <div className="space-y-6">
            {children.map(child => (
              <Card key={child.id} className="p-8 hover:translate-x-2 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 neo-border bg-gray-100 flex items-center justify-center text-3xl font-black">
                      {child.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{child.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MoodIcon mood={child.mood} size="sm" />
                        <span className="font-bold text-gray-600 capitalize">{child.mood} today</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs w-full space-y-2">
                    <div className="flex justify-between font-black text-sm">
                      <span>Overall Progress</span>
                      <span>{child.progress}%</span>
                    </div>
                    <div className="h-4 neo-border bg-gray-100 overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${child.progress}%` }} />
                    </div>
                  </div>

                  <Link to={`/parent/child?childId=${child.id}`}>
                    <Button variant="primary" className="flex items-center gap-2">
                      View Details <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t-2 border-black pt-6">
                  <div className="flex items-center gap-3">
                    <BookOpen size={20} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500">Last Topic</p>
                      <p className="font-bold text-sm">Quadratic Equations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-green-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500">Avg Accuracy</p>
                      <p className="font-bold text-sm">82%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-purple-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500">Last Active</p>
                      <p className="font-bold text-sm">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Bell /> School Announcements
          </h2>
          <div className="space-y-4">
            <Card
              className="p-4 space-y-2 border-blue-400 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigate('/parent/announcements?id=1')}
            >
              <p className="text-xs font-black text-blue-600 uppercase">March 28, 2026</p>
              <h3 className="font-black">Parent-Teacher Meeting</h3>
              <p className="text-sm font-bold text-gray-600">The next parent-teacher meeting is scheduled for April 5th. Please book your slot.</p>
              <Button className="text-xs py-1 w-full mt-2">Book Slot</Button>
            </Card>
            <Card
              className="p-4 space-y-2 border-green-400 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => navigate('/parent/announcements?id=2')}
            >
              <p className="text-xs font-black text-green-600 uppercase">March 25, 2026</p>
              <h3 className="font-black">Spring Break Schedule</h3>
              <p className="text-sm font-bold text-gray-600">Spring break starts from April 10th. View the revised schedule.</p>
              <Button className="text-xs py-1 w-full mt-2">View Schedule</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
