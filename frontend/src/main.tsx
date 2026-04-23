import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type CvItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
};

type Profile = {
  fullName?: string;
  headline?: string;
  location?: string;
  summary?: string;
  email?: string;
  phone?: string;
  imageKey?: string;
};

const defaultApiUrl = localStorage.getItem('cv-api-url') ?? '';

function normalizeApiUrl(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

function App() {
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [profile, setProfile] = useState<Profile>({ fullName: 'Demo Candidate', headline: 'Cloud Engineer', summary: 'CV managed by a serverless CDK stack.' });
  const [items, setItems] = useState<CvItem[]>([]);
  const [draft, setDraft] = useState({ type: 'skill', title: '', subtitle: '', description: '' });
  const [message, setMessage] = useState('Paste the API URL output from CDK deploy to start.');

  const baseUrl = useMemo(() => (apiUrl ? normalizeApiUrl(apiUrl) : ''), [apiUrl]);

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!baseUrl) throw new Error('API URL is required');
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()) as T;
  }

  async function refresh() {
    if (!baseUrl) return;
    try {
      const [profileResponse, itemsResponse] = await Promise.all([
        request<Profile>('profile'),
        request<{ items: CvItem[] }>('items'),
      ]);
      setProfile(profileResponse);
      setItems(itemsResponse.items);
      setMessage('Loaded data from API Gateway → Lambda → DynamoDB.');
    } catch (error) {
      setMessage(`Could not load data: ${String(error)}`);
    }
  }

  useEffect(() => {
    refresh();
  }, [baseUrl]);

  async function saveApiUrl() {
    localStorage.setItem('cv-api-url', apiUrl);
    setMessage('API URL saved in browser local storage.');
    await refresh();
  }

  async function saveProfile() {
    const saved = await request<Profile>('profile', { method: 'PUT', body: JSON.stringify(profile) });
    setProfile(saved);
    setMessage('Profile saved via Lambda.');
  }

  async function addItem() {
    if (!draft.title) return setMessage('Item title is required.');
    const created = await request<CvItem>('items', { method: 'POST', body: JSON.stringify(draft) });
    setItems([created, ...items]);
    setDraft({ type: 'skill', title: '', subtitle: '', description: '' });
    setMessage(`Created ${created.type}: ${created.title}`);
  }

  async function deleteItem(id: string) {
    await request(`items/${id}`, { method: 'DELETE' });
    setItems(items.filter((item) => item.id !== id));
    setMessage('Deleted CV item.');
  }

  async function uploadImage(file: File) {
    const response = await request<{ uploadUrl: string; key: string }>('profile-image-url', {
      method: 'POST',
      body: JSON.stringify({ contentType: file.type, fileExtension: file.name.split('.').pop() }),
    });
    await fetch(response.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    setProfile({ ...profile, imageKey: response.key });
    setMessage(`Uploaded profile image to S3 key: ${response.key}. Save profile to persist the key.`);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">AWS CDK TypeScript Crash Course</p>
          <h1>CV Updater Demo</h1>
          <p>Frontend + API Gateway + Lambda + DynamoDB + S3, all managed as CDK code.</p>
        </div>
        <div className="status">{message}</div>
      </section>

      <section className="panel api-panel">
        <label>API URL from CDK output</label>
        <input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://abc123.execute-api.region.amazonaws.com/dev/" />
        <button onClick={saveApiUrl}>Save API URL</button>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Profile</h2>
          <input value={profile.fullName ?? ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="Full name" />
          <input value={profile.headline ?? ''} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="Headline" />
          <input value={profile.location ?? ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="Location" />
          <textarea value={profile.summary ?? ''} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} placeholder="Summary" />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          {profile.imageKey && <small>S3 image key: {profile.imageKey}</small>}
          <button onClick={saveProfile}>Save profile</button>
        </article>

        <article className="panel">
          <h2>Add CV item</h2>
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option value="skill">Skill</option>
            <option value="workHistory">Work history</option>
            <option value="education">Education</option>
            <option value="project">Project</option>
            <option value="certification">Certification</option>
          </select>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" />
          <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Subtitle" />
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
          <button onClick={addItem}>Add item</button>
        </article>
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>CV items</h2>
          <button onClick={refresh}>Refresh</button>
        </div>
        <div className="items">
          {items.map((item) => (
            <div key={item.id} className="item">
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.subtitle}</p>
              <p>{item.description}</p>
              <button onClick={() => deleteItem(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
