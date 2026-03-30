'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type MediaStatus = 'pending' | 'approved' | 'scheduled' | 'published';
type MediaType = 'content' | 'paid' | 'broadcast';
type ViewMode = 'grid' | 'list' | 'kanban';
type ActiveFilter = 'all' | 'content' | 'paid' | 'broadcast';

interface MediaItem {
  id: string;
  type: MediaType;
  status: MediaStatus;
  platform: string | null;
  content_format: string | null;
  title: string | null;
  body: string | null;
  hashtags: string | null;
  media_url: string | null;
  ad_phase: string | null;
  daily_budget: number | null;
  cta: string | null;
  email_subject: string | null;
  sequence_position: number | null;
  playbook_slug: string | null;
  calendar_day: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  recipient_count: number | null;
  targeting: string | null;
  assigned_agent: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMeta(item: MediaItem): string {
  const parts: string[] = [];
  if (item.playbook_slug) parts.push(item.playbook_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  if (item.calendar_day) parts.push(formatDate(item.calendar_day));
  return parts.join(' · ');
}

function typeLabel(type: MediaType): string {
  if (type === 'paid') return 'AD';
  if (type === 'broadcast') return 'EMAIL';
  return 'CONTENT';
}

// ─── Tile Visual ─────────────────────────────────────────────────────────────

function TileVisual({ item }: { item: MediaItem }) {
  const fmt = item.content_format;
  const type = item.type;

  if (type === 'content' && fmt === 'reel') {
    return (
      <div style={styles.tileVisual}>
        <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
        <span style={styles.typeBadge}>{typeLabel(type)}</span>
        <div style={styles.playCircle} />
      </div>
    );
  }

  if (type === 'content' && fmt === 'carousel') {
    return (
      <div style={styles.tileVisual}>
        <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
        <span style={styles.typeBadge}>{typeLabel(type)}</span>
        <div style={styles.carouselGrid}>
          {[0,1,2,3].map(i => <div key={i} style={styles.carouselCell} />)}
        </div>
      </div>
    );
  }

  if (type === 'content' && fmt === 'story') {
    return (
      <div style={styles.tileVisual}>
        <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
        <span style={styles.typeBadge}>{typeLabel(type)}</span>
        <div style={styles.phoneOutline} />
      </div>
    );
  }

  if (type === 'broadcast') {
    return (
      <div style={styles.tileVisual}>
        <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
        <span style={styles.typeBadge}>{typeLabel(type)}</span>
        <div style={styles.emailPreview}>
          <div style={styles.emailLine} />
          <div style={{ ...styles.emailLine, width: '70%' }} />
          <div style={{ ...styles.emailLine, width: '55%' }} />
        </div>
      </div>
    );
  }

  if (type === 'paid') {
    return (
      <div style={styles.tileVisual}>
        <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
        <span style={styles.typeBadge}>{typeLabel(type)}</span>
        <span style={styles.adPhaseLabel}>{item.ad_phase || 'Ad'}</span>
      </div>
    );
  }

  return (
    <div style={styles.tileVisual}>
      <span style={item.platform ? styles.platformBadge : { display: 'none' }}>{item.platform}</span>
      <span style={styles.typeBadge}>{typeLabel(type)}</span>
      <div style={styles.uploadCircle}>Upload media</div>
    </div>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

function ApproveModal({ item, onClose, onApprove }: {
  item: MediaItem;
  onClose: () => void;
  onApprove: (id: string, scheduleAt?: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'calendar' | 'manual'>('calendar');
  const [scheduleAt, setScheduleAt] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await onApprove(item.id, mode === 'manual' ? scheduleAt : undefined);
    setLoading(false);
    onClose();
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Approve</h2>
        <div style={styles.modalOptions}>
          <div
            style={{ ...styles.modalOptionCard, ...(mode === 'calendar' ? styles.modalOptionCardActive : {}) }}
            onClick={() => setMode('calendar')}
          >
            <div style={styles.modalOptionTitle}>Follow content calendar</div>
            <div style={styles.modalOptionDesc}>Auto-schedule at the next available slot</div>
          </div>
          <div
            style={{ ...styles.modalOptionCard, ...(mode === 'manual' ? styles.modalOptionCardActive : {}) }}
            onClick={() => setMode('manual')}
          >
            <div style={styles.modalOptionTitle}>Schedule manually</div>
            <div style={styles.modalOptionDesc}>Pick a specific date and time</div>
            {mode === 'manual' && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={e => setScheduleAt(e.target.value)}
                style={styles.dateInput}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
        </div>
        <button
          style={{ ...styles.btnBlack, width: '100%', marginTop: 16 }}
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? 'Approving...' : 'Confirm Approval'}
        </button>
        <div style={styles.cancelLink} onClick={onClose}>Cancel</div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose, onSave }: {
  item: MediaItem;
  onClose: () => void;
  onSave: (id: string, fields: Partial<MediaItem>) => Promise<void>;
}) {
  const [tab, setTab] = useState<'edit' | 'revision'>('edit');
  const [editTitle, setEditTitle] = useState(item.title || '');
  const [editBody, setEditBody] = useState(item.body || '');
  const [editHashtags, setEditHashtags] = useState(item.hashtags || '');
  const [revisionText, setRevisionText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await onSave(item.id, { title: editTitle, body: editBody, hashtags: editHashtags });
    setLoading(false);
    onClose();
  }

  async function handleRevision() {
    setLoading(true);
    // In production this would trigger a revision workflow
    console.log('Revision requested:', revisionText);
    setLoading(false);
    onClose();
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Edit</h2>
        <div style={styles.tabRow}>
          <span
            style={{ ...styles.tab, ...(tab === 'edit' ? styles.tabActive : {}) }}
            onClick={() => setTab('edit')}
          >Edit myself</span>
          <span
            style={{ ...styles.tab, ...(tab === 'revision' ? styles.tabActive : {}) }}
            onClick={() => setTab('revision')}
          >Request revision</span>
        </div>

        {tab === 'edit' && (
          <div style={{ marginTop: 20 }}>
            <label style={styles.fieldLabel}>Title</label>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={styles.textInput}
              placeholder="Title"
            />
            <label style={styles.fieldLabel}>Body</label>
            <textarea
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              style={{ ...styles.textInput, ...styles.textarea }}
              placeholder="Content body..."
            />
            <label style={styles.fieldLabel}>Hashtags</label>
            <input
              value={editHashtags}
              onChange={e => setEditHashtags(e.target.value)}
              style={styles.textInput}
              placeholder="#hashtag1 #hashtag2"
            />
            <button
              style={{ ...styles.btnBlack, width: '100%', marginTop: 16 }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}

        {tab === 'revision' && (
          <div style={{ marginTop: 20 }}>
            <p style={styles.revisionDesc}>
              Describe what needs to change. Arty will revise and resubmit for your approval.
            </p>
            <textarea
              value={revisionText}
              onChange={e => setRevisionText(e.target.value)}
              style={{ ...styles.textInput, ...styles.textarea, height: 120 }}
              placeholder="e.g. Make the hook stronger, use a question format..."
            />
            <button
              style={{ ...styles.btnGold, width: '100%', marginTop: 16 }}
              onClick={handleRevision}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send revision'}
            </button>
          </div>
        )}

        <div style={styles.cancelLink} onClick={onClose}>Cancel</div>
      </div>
    </div>
  );
}

// ─── Tile Card ────────────────────────────────────────────────────────────────

function TileCard({ item, onApprove, onEdit }: {
  item: MediaItem;
  onApprove: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
}) {
  return (
    <div style={styles.tileCard}>
      <TileVisual item={item} />
      <div style={styles.tileBody}>
        <div style={styles.tileTitle}>{item.title}</div>
        <div style={styles.tileMeta}>{formatMeta(item)}</div>
        <div style={styles.tileActions}>
          <button style={styles.btnApprove} onClick={() => onApprove(item)}>Approve</button>
          <button style={styles.btnEdit} onClick={() => onEdit(item)}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ListRow({ item, onApprove, onEdit }: {
  item: MediaItem;
  onApprove: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
}) {
  return (
    <div style={styles.listRow}>
      <div style={styles.listThumb}>
        {item.type === 'paid' && <span style={styles.listThumbAd}>{item.ad_phase ? item.ad_phase.slice(0, 2) : 'AD'}</span>}
        {item.type === 'broadcast' && <span style={styles.listThumbLines}>___</span>}
        {item.type === 'content' && <span style={styles.listThumbPlay}>&#9654;</span>}
      </div>
      <div style={styles.listInfo}>
        <div style={styles.listTitle}>{item.title}</div>
        <div style={styles.listMeta}>{item.platform} · {typeLabel(item.type)} · {formatDate(item.calendar_day)}</div>
      </div>
      <div style={styles.listActions}>
        <button style={styles.btnApproveSmall} onClick={() => onApprove(item)}>Approve</button>
        <button style={styles.btnEditSmall} onClick={() => onEdit(item)}>Edit</button>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ status, items, onApprove, onEdit, onDrop }: {
  status: MediaStatus;
  items: MediaItem[];
  onApprove: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onDrop: (id: string, newStatus: MediaStatus) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const labels: Record<MediaStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    scheduled: 'Scheduled',
    published: 'Published',
  };

  return (
    <div
      style={{ ...styles.kanbanCol, ...(dragOver ? styles.kanbanColDragOver : {}) }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDrop(id, status);
      }}
    >
      <div style={styles.kanbanHeader}>
        <span style={styles.kanbanLabel}>{labels[status]}</span>
        <span style={styles.kanbanCount}>{items.length}</span>
      </div>
      {items.map(item => (
        <div
          key={item.id}
          draggable
          onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
          style={styles.kanbanCard}
        >
          <div style={styles.kanbanCardType}>{typeLabel(item.type)} · {item.platform}</div>
          <div style={styles.kanbanCardTitle}>{item.title}</div>
          <div style={styles.kanbanCardMeta}>{formatDate(item.calendar_day)}</div>
          <div style={styles.tileActions}>
            {status === 'pending' && (
              <button style={styles.btnApproveSmall} onClick={() => onApprove(item)}>Approve</button>
            )}
            <button style={styles.btnEditSmall} onClick={() => onEdit(item)}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [approveItem, setApproveItem] = useState<MediaItem | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('inbox-view-mode') as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

  const setView = (v: ViewMode) => {
    setViewMode(v);
    localStorage.setItem('inbox-view-mode', v);
  };

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/media-items');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Filtered items
  const filterMap: Record<ActiveFilter, MediaType | null> = {
    all: null,
    content: 'content',
    paid: 'paid',
    broadcast: 'broadcast',
  };

  const filtered = activeFilter === 'all'
    ? items
    : items.filter(i => i.type === filterMap[activeFilter]);

  const pendingCount = items.filter(i => i.status === 'pending').length;

  // Patch status
  async function patchItem(id: string, fields: { status?: MediaStatus; title?: string; body?: string; hashtags?: string }) {
    await fetch('/api/media-items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    });
    await fetchItems();
  }

  async function handleApprove(id: string, _scheduleAt?: string) {
    await patchItem(id, { status: 'approved' });
  }

  async function handleSave(id: string, fields: Partial<MediaItem>) {
    await patchItem(id, {
      title: fields.title ?? undefined,
      body: fields.body ?? undefined,
      hashtags: fields.hashtags ?? undefined,
    });
  }

  async function handleApproveAll() {
    const pendingFiltered = filtered.filter(i => i.status === 'pending');
    await Promise.all(pendingFiltered.map(i => patchItem(i.id, { status: 'approved' })));
  }

  async function handleKanbanDrop(id: string, newStatus: MediaStatus) {
    await patchItem(id, { status: newStatus });
  }

  const kanbanStatuses: MediaStatus[] = ['pending', 'approved', 'scheduled', 'published'];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerManage}>MANAGE</div>
        <h1 style={styles.headerTitle}>Inbox</h1>
        <div style={styles.headerSub}>
          <span style={styles.headerCount}>{pendingCount} item{pendingCount !== 1 ? 's' : ''} need your approval</span>
          <span style={styles.headerDesc}>AI created these. Review, approve, or edit.</span>
        </div>
      </div>

      {/* Controls row */}
      <div style={styles.controlRow}>
        {/* Filter pills */}
        <div style={styles.pillGroup}>
          {(['all', 'content', 'paid', 'broadcast'] as ActiveFilter[]).map(f => (
            <button
              key={f}
              style={{ ...styles.pill, ...(activeFilter === f ? styles.pillActive : {}) }}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'broadcast' ? 'Emails' : f.charAt(0).toUpperCase() + f.slice(1) + (f === 'paid' ? 's' : '')}
            </button>
          ))}
        </div>

        <div style={styles.controlRight}>
          {/* View toggle */}
          <div style={styles.viewToggle}>
            {(['grid', 'list', 'kanban'] as ViewMode[]).map(v => (
              <button
                key={v}
                style={{ ...styles.viewBtn, ...(viewMode === v ? styles.viewBtnActive : {}) }}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button style={styles.btnApproveAll} onClick={handleApproveAll}>Approve all</button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div style={styles.grid}>
              {filtered.map(item => (
                <TileCard
                  key={item.id}
                  item={item}
                  onApprove={setApproveItem}
                  onEdit={setEditItem}
                />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div style={styles.listView}>
              {filtered.map(item => (
                <ListRow
                  key={item.id}
                  item={item}
                  onApprove={setApproveItem}
                  onEdit={setEditItem}
                />
              ))}
            </div>
          )}

          {viewMode === 'kanban' && (
            <div style={styles.kanbanBoard}>
              {kanbanStatuses.map(status => (
                <KanbanColumn
                  key={status}
                  status={status}
                  items={items.filter(i => i.status === status && (activeFilter === 'all' || i.type === filterMap[activeFilter]))}
                  onApprove={setApproveItem}
                  onEdit={setEditItem}
                  onDrop={handleKanbanDrop}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={styles.emptyState}>No items in this view.</div>
          )}
        </>
      )}

      {/* Modals */}
      {approveItem && (
        <ApproveModal
          item={approveItem}
          onClose={() => setApproveItem(null)}
          onApprove={handleApprove}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: 'Montserrat, sans-serif',
    background: '#fff',
    minHeight: '100vh',
    padding: '40px 48px',
    color: '#111',
  },
  header: {
    marginBottom: 32,
  },
  headerManage: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 800,
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  headerSub: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111',
  },
  headerDesc: {
    fontSize: 13,
    color: '#888',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
    flexWrap: 'wrap',
  },
  pillGroup: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  pill: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid #e0e0e0',
    background: '#fff',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    color: '#555',
    transition: 'all 0.15s',
  },
  pillActive: {
    background: '#111',
    color: '#fff',
    borderColor: '#111',
  },
  controlRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  viewBtn: {
    padding: '6px 14px',
    border: 'none',
    background: '#fff',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    color: '#555',
    borderRight: '1px solid #e0e0e0',
  },
  viewBtnActive: {
    background: '#f5f5f5',
    color: '#111',
    fontWeight: 700,
  },
  btnApproveAll: {
    padding: '7px 16px',
    border: '1px solid #111',
    background: '#fff',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    color: '#111',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  tileCard: {
    border: '1px solid #e8e8e8',
    borderRadius: 10,
    overflow: 'hidden',
    background: '#fff',
  },
  tileVisual: {
    height: 140,
    background: '#f5f5f5',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#888',
    background: 'rgba(255,255,255,0.85)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#666',
    background: '#ececec',
    padding: '2px 6px',
    borderRadius: 4,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid #aaa',
  },
  carouselGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 4,
  },
  carouselCell: {
    width: 28,
    height: 28,
    background: '#ddd',
    borderRadius: 3,
  },
  phoneOutline: {
    width: 32,
    height: 54,
    border: '2px solid #aaa',
    borderRadius: 6,
  },
  emailPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '60%',
  },
  emailLine: {
    height: 8,
    background: '#ddd',
    borderRadius: 4,
    width: '100%',
  },
  adPhaseLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  uploadCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: '1.5px dashed #bbb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    color: '#aaa',
    textAlign: 'center',
    padding: 8,
  },
  tileBody: {
    padding: '12px 14px 14px',
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 4,
    lineHeight: 1.35,
    color: '#111',
  },
  tileMeta: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  tileActions: {
    display: 'flex',
    gap: 8,
  },
  btnApprove: {
    flex: 1,
    padding: '7px 0',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  btnEdit: {
    flex: 1,
    padding: '7px 0',
    background: '#fff',
    color: '#444',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  // List view
  listView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    border: '1px solid #eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: 14,
    background: '#fff',
    borderBottom: '1px solid #f0f0f0',
  },
  listThumb: {
    width: 44,
    height: 44,
    background: '#f5f5f5',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 11,
    color: '#888',
    fontWeight: 600,
  },
  listThumbAd: { fontSize: 10, fontWeight: 700, color: '#666' },
  listThumbLines: { fontSize: 16, color: '#ccc', letterSpacing: -1 },
  listThumbPlay: { fontSize: 14, color: '#888' },
  listInfo: { flex: 1, minWidth: 0 },
  listTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listMeta: { fontSize: 11, color: '#999', marginTop: 2 },
  listActions: { display: 'flex', gap: 6, flexShrink: 0 },
  btnApproveSmall: {
    padding: '5px 12px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  btnEditSmall: {
    padding: '5px 12px',
    background: '#fff',
    color: '#444',
    border: '1px solid #ddd',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  // Kanban
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    alignItems: 'start',
  },
  kanbanCol: {
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: 10,
    padding: 14,
    minHeight: 200,
    transition: 'background 0.15s',
  },
  kanbanColDragOver: {
    background: '#f0f4ff',
    borderColor: '#aac',
  },
  kanbanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kanbanLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#555',
  },
  kanbanCount: {
    fontSize: 11,
    fontWeight: 700,
    color: '#999',
    background: '#e8e8e8',
    borderRadius: 10,
    padding: '1px 7px',
  },
  kanbanCard: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
    cursor: 'grab',
  },
  kanbanCardType: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#aaa',
    marginBottom: 4,
  },
  kanbanCardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#111',
    lineHeight: 1.35,
    marginBottom: 4,
  },
  kanbanCardMeta: {
    fontSize: 10,
    color: '#bbb',
    marginBottom: 8,
  },
  // Modals
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: '32px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 800,
    margin: '0 0 20px 0',
    color: '#111',
  },
  modalOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  modalOptionCard: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  modalOptionCardActive: {
    borderColor: '#111',
    background: '#fafafa',
  },
  modalOptionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111',
    marginBottom: 3,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#888',
  },
  cancelLink: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
    cursor: 'pointer',
  },
  btnBlack: {
    padding: '11px 0',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  btnGold: {
    padding: '11px 0',
    background: '#DAA520',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
  },
  dateInput: {
    marginTop: 10,
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'Montserrat, sans-serif',
    boxSizing: 'border-box',
  },
  // Edit modal
  tabRow: {
    display: 'flex',
    gap: 20,
    borderBottom: '1px solid #eee',
    marginBottom: 4,
  },
  tab: {
    paddingBottom: 10,
    fontSize: 13,
    fontWeight: 600,
    color: '#aaa',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#111',
    borderBottomColor: '#111',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 4,
    marginTop: 14,
  },
  textInput: {
    width: '100%',
    padding: '9px 11px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'Montserrat, sans-serif',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    height: 90,
    resize: 'vertical',
  },
  revisionDesc: {
    fontSize: 13,
    color: '#666',
    margin: '0 0 4px 0',
    lineHeight: 1.5,
  },
  // Misc
  loading: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    padding: 60,
  },
  emptyState: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 13,
    padding: 60,
  },
};
