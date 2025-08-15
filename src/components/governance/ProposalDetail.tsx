import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

export function ProposalDetail({ proposal }: { proposal: {
  id: string;
  title: string;
  content?: string;
  category: string;
  status: string;
  options?: { id: string; label: string; votes: number }[];
  mechanism?: 'single' | 'multiple' | 'quadratic';
  analytics?: { totalVotes: number; participation: number };
  discussion?: { id: string; user: string; content: string; createdAt: string }[];
} }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [comments, setComments] = useState(proposal.discussion || []);
  const [comment, setComment] = useState('');
  const { title, content, category, status, options = [], mechanism = 'single', analytics = { totalVotes: 0, participation: 0 } } = proposal;
  const handleVote = () => {
    alert(`Voted: ${selected.join(', ')}`);
  };
  const handleComment = () => {
    if (comment.trim()) {
      setComments([...comments, { id: Date.now().toString(), user: 'you', content: comment, createdAt: new Date().toISOString() }]);
      setComment('');
    }
  };
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500">{category}</span>
          <span className={`px-2 py-1 rounded ${status === 'active' ? 'bg-blue-500/10 text-blue-500' : status === 'passed' ? 'bg-green-500/10 text-green-500' : status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>{status}</span>
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        {content && <div className="text-gray-600 dark:text-gray-400 mb-2">{content}</div>}
        {options.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold mb-1">Vote</div>
            <div className="flex gap-2">
              {options.map(opt => (
                <Button
                  key={opt.id}
                  variant={selected.includes(opt.id) ? 'primary' : 'outline'}
                  onClick={() => {
                    if (mechanism === 'single') setSelected([opt.id]);
                    else if (mechanism === 'multiple') setSelected(selected.includes(opt.id) ? selected.filter(id => id !== opt.id) : [...selected, opt.id]);
                    else if (mechanism === 'quadratic') setSelected([opt.id]);
                  }}
                >
                  {opt.label} <span className="ml-1 text-xs">({opt.votes})</span>
                </Button>
              ))}
            </div>
            <Button className="mt-2" variant="primary" onClick={handleVote} disabled={selected.length === 0}>Submit Vote</Button>
          </div>
        )}
        <div className="flex gap-4 text-xs mb-2">
          <span>Total Votes: {analytics.totalVotes}</span>
          <span>Participation: {analytics.participation}%</span>
        </div>
        <div>
          <div className="font-semibold mb-1">Discussion</div>
          <div className="space-y-2 mb-2">
            {comments.map(c => (
              <div key={c.id} className="p-2 bg-lightCard dark:bg-darkCard rounded">
                <span className="font-medium mr-2">{c.user}:</span>
                <span>{c.content}</span>
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." rows={2} />
            <Button onClick={handleComment} disabled={!comment.trim()}>Post</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 