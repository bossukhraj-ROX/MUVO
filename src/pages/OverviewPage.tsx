import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, PoundSterling, Mail, FileText, ArrowRight, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Camera } from 'lucide-react';
import { useProject } from '../lib/projectContext';
import { countItems, countRoomItems, formatGBP, getIncompleteItems, getAllPhotoIds } from '../lib/utils';
import { DEDUCTION_LABELS } from '../types';
import './OverviewPage.css';

export default function OverviewPage() {
  const { project, photos } = useProject();
  const navigate = useNavigate();

  if (!project) return null;

  const stats = countItems(project.rooms);
  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const incomplete = getIncompleteItems(project.rooms);
  const totalDeductions = project.deductions.reduce((s, d) => s + d.amountPence, 0);
  const disputedDeductions = project.deductions
    .filter((d) => d.status === 'disputed')
    .reduce((s, d) => s + d.amountPence, 0);
  const photoCount = getAllPhotoIds(project.rooms).length;

  const cards = [
    {
      icon: ClipboardCheck,
      title: 'Inspection',
      stat: `${stats.completed}/${stats.total}`,
      label: 'items checked',
      progress: completionPct,
      onClick: () => navigate('/app/inspection'),
    },
    {
      icon: Camera,
      title: 'Photos',
      stat: String(photoCount),
      label: 'photos attached',
      onClick: () => navigate('/app/inspection'),
    },
    {
      icon: PoundSterling,
      title: 'Deductions',
      stat: formatGBP(totalDeductions),
      label: `${project.deductions.length} records`,
      sub: `${formatGBP(disputedDeductions)} disputed`,
      onClick: () => navigate('/app/deductions'),
    },
    {
      icon: Mail,
      title: 'Email drafts',
      stat: '4',
      label: 'templates ready',
      onClick: () => navigate('/app/emails'),
    },
  ];

  return (
    <div className="overview">
      <div className="overview-header">
        <div>
          <h1 className="display-lg overview-title">{project.nickname || 'Your project'}</h1>
          {project.address && <p className="text-body overview-address">{project.address}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/report')}>
          <FileText size={16} />
          View report
        </button>
      </div>

      {/* Progress bar */}
      <div className="overview-progress card">
        <div className="overview-progress-header">
          <span className="overview-progress-label">Inspection progress</span>
          <span className="overview-progress-pct">{completionPct}%</span>
        </div>
        <div className="overview-progress-bar">
          <div className="overview-progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="overview-progress-stats">
          <span><CheckCircle2 size={14} /> {stats.completed} checked</span>
          <span><AlertCircle size={14} /> {stats.remaining} remaining</span>
          <span> {stats.total} total</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="overview-cards">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.title} className="overview-card card" onClick={card.onClick}>
              <div className="overview-card-icon">
                <Icon size={20} />
              </div>
              <div className="overview-card-body">
                <span className="overview-card-title">{card.title}</span>
                <span className="overview-card-stat">{card.stat}</span>
                <span className="overview-card-label">{card.label}</span>
                {card.sub && <span className="overview-card-sub">{card.sub}</span>}
              </div>
              {card.progress !== undefined && (
                <div className="overview-card-progress">
                  <div className="overview-card-progress-bar">
                    <div className="overview-card-progress-fill" style={{ width: `${card.progress}%` }} />
                  </div>
                </div>
              )}
              <ArrowRight size={18} className="overview-card-arrow" />
            </button>
          );
        })}
      </div>

      {/* Incomplete items */}
      {incomplete.length > 0 && (
        <div className="overview-incomplete card">
          <div className="overview-incomplete-header">
            <AlertCircle size={20} className="text-warn" />
            <h2 className="display-sm">Still to check</h2>
            <span className="badge badge-warn">{incomplete.length} items</span>
          </div>
          <div className="overview-incomplete-list">
            {incomplete.slice(0, 12).map((item, i) => (
              <div key={i} className="overview-incomplete-item">
                <span className="overview-incomplete-room">{item.roomName}</span>
                <span className="overview-incomplete-sep">—</span>
                <span className="overview-incomplete-label">{item.itemLabel}</span>
              </div>
            ))}
            {incomplete.length > 12 && (
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/inspection')}>
                View all {incomplete.length} items
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent deductions */}
      {project.deductions.length > 0 && (
        <div className="overview-deductions card">
          <div className="overview-deductions-header">
            <PoundSterling size={20} className="text-success" />
            <h2 className="display-sm">Deduction records</h2>
          </div>
          <div className="overview-deductions-list">
            {project.deductions.slice(0, 5).map((d) => (
              <div key={d.id} className="overview-deduction-item">
                <div className="overview-deduction-info">
                  <span className="overview-deduction-desc">{d.description}</span>
                  <span className={`badge ${d.status === 'disputed' ? 'badge-error' : d.status === 'resolved' ? 'badge-good' : d.status === 'awaiting' ? 'badge-warn' : 'badge-neutral'}`}>
                    {DEDUCTION_LABELS[d.status]}
                  </span>
                </div>
                <span className="overview-deduction-amount">{formatGBP(d.amountPence)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rooms quick view */}
      <div className="overview-rooms">
        <h2 className="display-sm overview-section-title">Rooms</h2>
        <div className="overview-rooms-grid">
          {project.rooms.map((room) => {
            const r = countRoomItems(room);
            const pct = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
            return (
              <button
                key={room.id}
                className="overview-room-card card"
                onClick={() => navigate(`/app/inspection/${room.id}`)}
              >
                <span className="overview-room-name">{room.name}</span>
                <span className="overview-room-count text-sm">{r.completed}/{r.total} checked</span>
                <div className="overview-room-progress">
                  <div className="overview-room-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
