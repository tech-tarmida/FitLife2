import React, { useState, useEffect } from 'react';
import {
  Plus, FileText, Trash2, Edit3, Check, X, Clock, Upload,
  File, Image, Music, FileCode, Download, AlertCircle, FileJson, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Note, NoteAttachment } from '../lib/supabase';
import { uploadFile, formatFileSize, downloadFile, deleteFile } from '../lib/fileStorage';

type Props = { onNavigate: (page: string) => void };

const FILE_ICONS: Record<string, { icon: typeof File; color: string }> = {
  'image/jpeg': { icon: Image, color: 'text-blue-400' },
  'image/png': { icon: Image, color: 'text-blue-400' },
  'image/gif': { icon: Image, color: 'text-blue-400' },
  'image/webp': { icon: Image, color: 'text-blue-400' },
  'audio/mpeg': { icon: Music, color: 'text-purple-400' },
  'audio/wav': { icon: Music, color: 'text-purple-400' },
  'application/pdf': { icon: FileCode, color: 'text-red-400' },
  'video/mp4': { icon: Music, color: 'text-green-400' },
  'text/plain': { icon: FileText, color: 'text-dark-400' },
};

function NoteForm({ note, onClose, onSaved }: {
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: note?.title || 'Workout Note',
    content: note?.content || '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      supabase
        .from('note_attachments')
        .select('*')
        .eq('note_id', note.id)
        .then(({ data }) => setAttachments(data || []));
    }
  }, [note]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = async () => {
    if (!user || !note || files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      try {
        const result = await uploadFile(file, user.id);

        if (result?.error) {
          alert(`Upload failed: ${result.error.message}`);
          continue;
        }

        if (result?.path) {
          await supabase.from('note_attachments').insert({
            note_id: note.id,
            user_id: user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || 'application/octet-stream',
            storage_path: result.path,
          });
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setFiles([]);
    setUploading(false);
    onSaved();
  };

  const deleteAttachment = async (attachmentId: string, storagePath: string) => {
    await deleteFile(storagePath);
    await supabase.from('note_attachments').delete().eq('id', attachmentId);
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const downloadAttachment = async (attachment: NoteAttachment) => {
    const blob = await downloadFile(attachment.storage_path);
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (note) {
      await supabase.from('notes').update({
        ...form,
        updated_at: new Date().toISOString(),
      }).eq('id', note.id);
    } else {
      await supabase.from('notes').insert({
        user_id: user.id,
        ...form,
      });
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-fade-in overflow-y-auto">
      <div className="card w-full max-w-2xl animate-slide-up my-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-white">{note ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
              className="input-field"
              placeholder="Note title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4}
              className="input-field resize-none"
              placeholder="Write your workout notes here..."
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Attachments</label>
            <div className="flex gap-2 mb-3">
              <input
                type="file"
                id="file-input"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary-500/20 bg-primary-500/5 text-primary-400 cursor-pointer hover:bg-primary-500/10 transition-colors text-sm font-medium"
              >
                <Upload size={14} />
                Choose Files
              </label>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={uploading}
                  className="btn-primary py-1.5 px-3 text-sm"
                >
                  {uploading ? '...' : `Upload ${files.length} file(s)`}
                </button>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-1 mb-3">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-dark-900/50 rounded-xl text-sm">
                    <span className="text-dark-400 truncate">{f.name}</span>
                    <span className="text-xs text-dark-500">{formatFileSize(f.size)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Existing Attachments */}
            {attachments.length > 0 && (
              <div>
                <p className="text-xs text-dark-400 mb-2 font-medium">Attached files ({attachments.length})</p>
                <div className="space-y-1">
                  {attachments.map(att => {
                    const Icon = FILE_ICONS[att.file_type]?.icon || File;
                    const color = FILE_ICONS[att.file_type]?.color || 'text-dark-400';
                    return (
                      <div key={att.id} className="flex items-center justify-between p-2 bg-dark-900/50 rounded-xl text-sm hover:bg-dark-900/70 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon size={14} className={color} />
                          <span className="text-dark-400 truncate">{att.file_name}</span>
                          <span className="text-xs text-dark-500 flex-shrink-0">({formatFileSize(att.file_size)})</span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => downloadAttachment(att)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAttachment(att.id, att.storage_path)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
              {note ? 'Update' : 'Create'} Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotesPage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note? This action cannot be undone.')) return;
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-3 sm:px-6 max-w-4xl mx-auto mobile-section">
      {(showForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onClose={() => { setShowForm(false); setEditingNote(null); }}
          onSaved={fetchNotes}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 animate-fade-in gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Notes</h1>
          <p className="text-dark-400 text-xs sm:text-sm mt-1">Keep detailed notes about your workouts with file attachments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
        >
          <Plus size={14} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 animate-slide-up">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input-field w-full"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="card text-center py-12 animate-fade-in">
          <FileText size={40} className="text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 mb-2 text-sm">No notes yet</p>
          <p className="text-dark-500 text-xs mb-4">Create your first note to track your fitness journey</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-xs sm:text-sm"
          >
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
          {filteredNotes.map((note, i) => (
            <div
              key={note.id}
              className="card-hover group overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold text-white flex-1 pr-2 line-clamp-2">{note.title}</h3>
                <button
                  onClick={() => setEditingNote(note)}
                  className="text-dark-400 hover:text-primary-400 transition-colors flex-shrink-0 p-1"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <p className="text-dark-400 text-xs sm:text-sm line-clamp-2 mb-2">{note.content || 'No content'}</p>

              <div className="flex items-center gap-1 text-xs text-dark-500 mb-3">
                <Clock size={10} />
                <span className="text-xs">
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setEditingNote(note)}
                  className="flex-1 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-lg text-primary-400 text-xs font-medium transition-all duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
