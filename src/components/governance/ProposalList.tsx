import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'funding', label: 'Funding' },
  { value: 'governance', label: 'Governance' },
  { value: 'events', label: 'Events' },
  { value: 'other', label: 'Other' }
];
const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'passed', label: 'Passed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'executed', label: 'Executed' }
];

export function ProposalList({ proposals, onSelect }: {
  proposals: { id: string; title: string; category: string; status: string; votes: number }[];
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const filtered = proposals.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category) &&
    (!status || p.status === status)
  );
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Input placeholder="Search proposals..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={category} onChange={e => setCategory(e.target.value)} options={CATEGORIES} />
        <Select value={status} onChange={e => setStatus(e.target.value)} options={STATUSES} />
      </div>
      <div className="grid gap-3">
        {filtered.map(p => (
          <Card key={p.id} className="cursor-pointer" onClick={() => onSelect(p.id)}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {CATEGORIES.find(c => c.value === p.category)?.label} &middot; {STATUSES.find(s => s.value === p.status)?.label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${p.status === 'active' ? 'bg-blue-500/10 text-blue-500' : p.status === 'passed' ? 'bg-green-500/10 text-green-500' : p.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>{p.status}</span>
                <span className="text-xs">{p.votes} votes</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-600 dark:text-gray-400 py-8">No proposals found.</div>}
      </div>
    </div>
  );
} 