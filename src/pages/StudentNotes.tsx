import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, PageSpinner } from '../components/UI';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Folder, Tag, Pin, Lock, Trash2, Edit, 
  Image, Mic, CheckSquare, Bold, Italic, List, Pencil,
  Save, X, ChevronDown, MoreVertical, Share2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  handwriting?: string;
}

interface FolderData {
  id: string;
  name: string;
  color: string;
}

const fetchOpts: RequestInit = { credentials: 'include' };

const FOLDERS: FolderData[] = [
  { id: 'all', name: 'All Notes', color: '#6366f1' },
  { id: 'personal', name: 'Personal', color: '#ec4899' },
  { id: 'study', name: 'Study', color: '#22c55e' },
  { id: 'ideas', name: 'Ideas', color: '#f59e0b' },
];

export const StudentNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([]);
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadNotes = () => {
    setLoading(true);
    fetch('/api/students/me/notes', fetchOpts)
      .then(res => res.json())
      .then(data => {
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const folder = searchParams.get('folder');
    if (query) {
      setSearchQuery(query);
    }
    if (folder && FOLDERS.some((f) => f.id === folder)) {
      setSelectedFolder(folder);
    }
  }, [searchParams]);

  const filterHint = searchParams.get('topic') || searchParams.get('query') || '';

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  const handleNewNote = () => {
    setShowNewNote(true);
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditing(true);
    setShowDrawing(false);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditing(false);
    setShowNewNote(false);
    setShowDrawing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    
    const noteData = {
      title: editTitle,
      content: editContent,
      folder: selectedFolder === 'all' ? 'personal' : selectedFolder,
      handwriting: showDrawing ? JSON.stringify(drawingPoints) : undefined,
    };

    try {
      if (selectedNote) {
        await fetch(`/api/students/me/notes/${selectedNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });
      } else {
        await fetch('/api/students/me/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });
      }
      loadNotes();
      setEditing(false);
      setShowNewNote(false);
      setDrawingPoints([]);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await fetch(`/api/students/me/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      loadNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await fetch(`/api/students/me/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      loadNotes();
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showDrawing) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDrawingPoints([point]);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !showDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDrawingPoints(prev => [...prev, point]);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handleEndDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingPoints([]);
  };

  if (loading) return <PageSpinner label="Loading notes..." />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-600">
            Notes
          </p>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            My Notes
          </h1>
          <p className="font-bold text-gray-600 mt-1">
            Create, organize, and collaborate on notes
          </p>
          {filterHint && (
            <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
              Showing notes related to “{filterHint}”
            </div>
          )}
        </div>
        <Button variant="primary" className="bg-violet-600" onClick={handleNewNote}>
          <Plus size={18} /> New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 neo-border font-bold"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            {FOLDERS.map(folder => (
              <button
                key={folder.id}
                className={cn(
                  "w-full text-left p-3 font-bold flex items-center gap-2 transition",
                  selectedFolder === folder.id 
                    ? "bg-black text-white" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <Folder size={18} style={{ color: folder.color }} />
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                <Pin size={12} /> Pinned
              </p>
              {pinnedNotes.map(note => (
                <Card 
                  key={note.id} 
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition",
                    selectedNote?.id === note.id && "ring-2 ring-violet-500"
                  )}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black">{note.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{note.content}</p>
                    </div>
                    <button 
                      onClick={e => { e.stopPropagation(); handleTogglePin(note); }}
                      className="text-amber-500"
                    >
                      <Pin size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {unpinnedNotes.map(note => (
            <Card 
              key={note.id} 
              className={cn(
                "p-4 cursor-pointer hover:bg-gray-50 transition",
                selectedNote?.id === note.id && "ring-2 ring-violet-500"
              )}
              onClick={() => handleSelectNote(note)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black">{note.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{note.content}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={e => { e.stopPropagation(); handleTogglePin(note); }}
                    className="text-gray-400 hover:text-amber-500"
                  >
                    <Pin size={16} />
                  </button>
                  <button 
                    onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {filteredNotes.length === 0 && (
            <Card className="p-12 text-center text-gray-500">
              <p className="font-bold">No notes yet</p>
              <p className="text-sm">Create your first note to get started</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {(selectedNote || showNewNote) && (
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-lg">
                  {showNewNote ? 'New Note' : editing ? 'Edit Note' : selectedNote?.title}
                </h3>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="primary" className="py-1 px-2 bg-violet-600" onClick={handleSave}>
                        <Save size={16} />
                      </Button>
                      <Button className="py-1 px-2" onClick={() => { setEditing(false); setShowNewNote(false); setShowDrawing(false); }}>
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <Button className="py-1 px-2" onClick={() => setEditing(true)}>
                      <Edit size={16} />
                    </Button>
                  )}
                </div>
              </div>

              {editing && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full px-3 py-2 neo-border font-bold"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                  
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      className={cn("p-2 neo-border", showDrawing ? "bg-violet-100" : "bg-white")}
                      onClick={() => setShowDrawing(!showDrawing)}
                      title="Draw"
                    >
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="Bold">
                      <Bold size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="Italic">
                      <Italic size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="List">
                      <List size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="Checklist">
                      <CheckSquare size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="Image">
                      <Image size={16} />
                    </button>
                    <button className="p-2 neo-border bg-white" title="Audio">
                      <Mic size={16} />
                    </button>
                  </div>

                  {showDrawing && (
                    <div className="space-y-2">
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={200}
                        className="neo-border bg-white cursor-crosshair"
                        onMouseDown={handleStartDraw}
                        onMouseMove={handleDraw}
                        onMouseUp={handleEndDraw}
                        onMouseLeave={handleEndDraw}
                      />
                      <button 
                        className="text-xs font-bold text-gray-500"
                        onClick={clearCanvas}
                      >
                        Clear Drawing
                      </button>
                    </div>
                  )}

                  <textarea
                    placeholder="Start typing..."
                    className="w-full px-3 py-2 neo-border font-bold min-h-[150px]"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                </div>
              )}

              {!editing && selectedNote && (
                <div className="space-y-2">
                  <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                  {selectedNote.handwriting && (
                    <div className="mt-4 p-2 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500">Handwritten Notes</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card className="p-4 bg-violet-50 border-violet-300">
            <h4 className="font-black flex items-center gap-2 mb-2">
              <Lock size={16} /> Security
            </h4>
            <p className="text-sm font-bold text-gray-600">
              Lock sensitive notes with password or biometrics
            </p>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-300">
            <h4 className="font-black flex items-center gap-2 mb-2">
              <Share2 size={16} /> Collaboration
            </h4>
            <p className="text-sm font-bold text-gray-600">
              Share notes with teachers or parents
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};