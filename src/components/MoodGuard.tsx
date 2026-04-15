import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, MoodIcon, Button } from '../components/UI';

export const MoodGuard = ({ children }: { children: React.ReactNode }) => {

  const { user } = useAuth();
  const [hasMood, setHasMood] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      fetch('/api/students/me/mood/today', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (!data) {
            setHasMood(false);
            setShowModal(true);
          }
        })
        .catch(() => {
          setLoading(false);
          setHasMood(true);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    try {
      await fetch('/api/mood-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mood: selectedMood, context: 'daily' }),
      });
      setHasMood(true);
      setShowModal(false);
    } catch (e) {
      setHasMood(true);
      setShowModal(false);
    }
  };

  if (loading) {
    return <>{children}</>;
  }

  if (user?.role === 'student' && !hasMood && showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-sm w-full text-center">
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>How are you feeling?</h2>
          <p className="text-sm font-bold mb-6" style={{ color: 'var(--text-muted)' }}>This helps your teacher understand how you're feeling.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {['ok', 'tired', 'stressed', 'very stressed'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className="neo-button flex flex-col items-center gap-2"
                style={selectedMood === m ? { backgroundColor: 'var(--accent-blue)', color: '#fff', borderColor: 'var(--accent-blue)' } : {}}
              >
                <MoodIcon mood={m} size="md" />
                <span className="capitalize text-xs font-bold">{m}</span>
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedMood}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
