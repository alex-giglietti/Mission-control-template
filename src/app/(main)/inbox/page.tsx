'use client';

import { useState, useEffect } from 'react';

type MediaItem = {
  id: string;
  type: string;
  status: string;
  platform?: string;
  content_format?: string;
  title?: string;
  body?: string;
  hashtags?: string;
  ad_phase?: string;
  created_at: string;
};

export default function InboxPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [approveModal, setApproveModal] = useState<MediaItem | null>(null);
  const [editModal, setEditModal] = useState<MediaItem | null>(null);
  const [editTab, setEditTab] = useState<'edit' | 'revision'>('edit');

  useEffect(() => {
    fetch('/api/media-items')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]));
    const saved = localStorage.getItem('inbox_view') as 'grid' | 'list' | 'kanban';
    if (saved) setView(saved);
  }, []);

  const setViewSaved = (v: 'grid' | 'list' | 'kanban') => {
    setView(v);
    localStorage.setItem('inbox_view', v);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/media-items', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setApproveModal(null);
  };

  const filtered = filter === 'all' ? items : items.filter(i =>
    filter === 'content' ? i.type === 'content' :
    filter === 'ads' ? i.type === 'paid' :
    filter === 'emails' ? i.type === 'broadcast' : true
  );
  const pending = items.filter(i => i.status === 'pending').length;

  const Visual = ({ item }: { item: MediaItem }) => (
    <div className="h-36 bg-gray-50 flex items-center justify-center relative rounded-t-lg overflow-hidden">
      {item.content_format === 'reel' && <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center"><div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-400 ml-1" /></div>}
      {item.content_format === 'carousel' && <div className="grid grid-cols-2 gap-1">{[0,1,2,3].map(i => <div key={i} className="w-7 h-7 bg-gray-200 rounded" />)}</div>}
      {item.content_format === 'story' && <div className="w-10 h-16 border-2 border-gray-300 rounded-lg" />}
      {item.type === 'broadcast' && <div className="space-y-1 px-4 w-full">{[0,1,2].map(i => <div key={i} className="h-2 bg-gray-200 rounded" style={{ width: i === 2 ? '60%' : '100%' }} />)}</div>}
      {item.type === 'paid' && <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.ad_phase || 'Ad'}</span>}
      {!item.content_format && !item.type && <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center"><span className="text-xs text-gray-400">Upload</span></div>}
    </div>
  );

  const TileCard = ({ item }: { item: MediaItem }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="relative">
        <Visual item={item} />
        <span className="absolute top-2 left-2 text-gray-400" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.platform}</span>
        <span className="absolute top-2 right-2 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded" style={{ fontSize: 8, textTransform: 'uppercase' }}>{item.content_format || item.type}</span>
      </div>
      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm truncate">{item.title || 'Untitled'}</div>
        <div className="text-gray-400 text-xs mt-0.5">{item.type} · {item.created_at?.slice(0, 10)}</div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setApproveModal(item)} className="flex-1 bg-black text-white text-xs py-1.5 rounded font-medium">Approve</button>
          <button onClick={() => { setEditModal(item); setEditTab('edit'); }} className="flex-1 border border-gray-300 text-gray-700 text-xs py-1.5 rounded font-medium">Edit</button>
        </div>
      </div>
    </div>
  );

  const kanbanCols = ['pending', 'approved', 'scheduled', 'published'];

  return (
    <div className="p-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="text-gray-400 mb-1" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>MANAGE</div>
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        {pending > 0 && <div className="text-gray-600 mt-1 text-sm">{pending} items need your approval</div>}
        <div className="text-gray-400 text-sm mt-0.5">AI created these. Review, approve, or edit.</div>
      </div>

      {/* Filter + view row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', 'content', 'ads', 'emails'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filter === f ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['grid', 'list', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setViewSaved(v)} className={`px-3 py-1.5 text-xs font-medium ${view === v ? 'bg-black text-white' : 'bg-white text-gray-600'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => filtered.forEach(i => i.status === 'pending' && updateStatus(i.id, 'approved'))} className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium">
            Approve all
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(item => <TileCard key={item.id} item={item} />)}
          {filtered.length === 0 && <div className="col-span-3 text-center text-gray-400 py-16 text-sm">No items</div>}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{item.title || 'Untitled'}</div>
                <div className="text-xs text-gray-400">{item.platform} · {item.type} · {item.created_at?.slice(0, 10)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setApproveModal(item)} className="bg-black text-white text-xs px-3 py-1.5 rounded font-medium">Approve</button>
                <button onClick={() => { setEditModal(item); setEditTab('edit'); }} className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded font-medium">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {kanbanCols.map(col => {
            const colItems = filtered.filter(i => i.status === col);
            return (
              <div key={col} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 font-medium" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{col}</span>
                  <span className="text-gray-400 text-xs">{colItems.length}</span>
                </div>
                <div className="space-y-2">
                  {colItems.map(item => <TileCard key={item.id} item={item} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Approve</h2>
            <div className="space-y-3">
              <button onClick={() => updateStatus(approveModal.id, 'approved')} className="w-full border-2 border-gray-200 rounded-lg p-4 text-left hover:border-black transition-colors">
                <div className="font-medium text-sm text-gray-900">Follow content calendar</div>
                <div className="text-xs text-gray-500 mt-0.5">Auto-schedule at next available slot</div>
              </button>
              <button onClick={() => updateStatus(approveModal.id, 'scheduled')} className="w-full border-2 border-gray-200 rounded-lg p-4 text-left hover:border-black transition-colors">
                <div className="font-medium text-sm text-gray-900">Schedule manually</div>
                <div className="text-xs text-gray-500 mt-0.5">Pick a date and time</div>
              </button>
            </div>
            <button onClick={() => setApproveModal(null)} className="block w-full text-center text-gray-400 text-xs mt-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[480px] shadow-xl">
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {(['edit', 'revision'] as const).map(t => (
                <button key={t} onClick={() => setEditTab(t)} className={`pb-3 text-sm font-medium border-b-2 -mb-px ${editTab === t ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>
                  {t === 'edit' ? 'Edit myself' : 'Request revision'}
                </button>
              ))}
            </div>
            {editTab === 'edit' ? (
              <div className="space-y-4">
                <textarea defaultValue={editModal.body || ''} className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:border-black" placeholder="Edit copy..." />
                <input defaultValue={editModal.hashtags || ''} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-black" placeholder="Hashtags..." />
                <button className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium">Save changes</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Tell the AI what to change</p>
                <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:border-black" placeholder="e.g. Make it more casual, shorter, add a CTA..." />
                <button className="w-full py-2.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#DAA520' }}>Send revision</button>
              </div>
            )}
            <button onClick={() => setEditModal(null)} className="block w-full text-center text-gray-400 text-xs mt-4">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
