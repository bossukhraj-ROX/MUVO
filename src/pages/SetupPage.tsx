import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Chrome as Home, Calendar, Notebook, Check } from 'lucide-react';
import { useProject } from '../lib/projectContext';
import './SetupPage.css';

export default function SetupPage() {
  const navigate = useNavigate();
  const { startProject } = useProject();
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');
  const [tenancyNotes, setTenancyNotes] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please give your project a nickname.');
      return;
    }
    startProject(nickname.trim(), address.trim(), moveOutDate, tenancyNotes.trim());
    navigate('/app');
  }

  return (
    <div className="setup-page">
      <nav className="setup-nav">
        <div className="container-wide">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </nav>

      <div className="container-narrow">
        <div className="setup-content animate-fade-up">
          <p className="section-eyebrow">Start a project</p>
          <h1 className="display-lg setup-title">Set up your evidence pack</h1>
          <p className="text-body-lg setup-sub">
            No account needed. Everything stays in your browser. You can edit these details later.
          </p>

          <form onSubmit={handleSubmit} className="setup-form">
            <div className="field-group">
              <label className="label" htmlFor="nickname">
                <Home size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Property nickname *
              </label>
              <input
                id="nickname"
                className="input"
                type="text"
                placeholder="e.g. Flat 4B — Elm Street"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setError(''); }}
                maxLength={80}
                autoFocus
              />
              {error && <span className="field-error">{error}</span>}
            </div>

            <div className="field-group">
              <label className="label" htmlFor="address">
                <Home size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Address <span className="label-optional">(optional)</span>
              </label>
              <input
                id="address"
                className="input"
                type="text"
                placeholder="Street, city, postcode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="field-group">
              <label className="label" htmlFor="moveOutDate">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Move-out date <span className="label-optional">(optional)</span>
              </label>
              <input
                id="moveOutDate"
                className="input"
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="label" htmlFor="tenancyNotes">
                <Notebook size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Tenancy notes <span className="label-optional">(optional)</span>
              </label>
              <textarea
                id="tenancyNotes"
                className="textarea"
                placeholder="e.g. Original inventory dated 1 Dec 2024 noted minor scuffs in hallway."
                value={tenancyNotes}
                onChange={(e) => setTenancyNotes(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div className="setup-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                Start inspection
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>
          </form>

          <div className="setup-tips">
            <Check size={16} />
            <span className="text-sm">You can add rooms, photos and deductions once your project is created.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
