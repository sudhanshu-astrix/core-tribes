import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const DEFAULTS = {
  quorum: 20,
  threshold: 50,
  votingPeriod: 3,
  minProposalDeposit: 100
};

export function GovernanceSettings({ onSave }: { onSave: (params: any) => void }) {
  const [params, setParams] = useState(DEFAULTS);
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Input label="Quorum (%)" type="number" value={params.quorum} onChange={e => setParams(p => ({ ...p, quorum: Number(e.target.value) }))} />
        <Input label="Threshold (%)" type="number" value={params.threshold} onChange={e => setParams(p => ({ ...p, threshold: Number(e.target.value) }))} />
        <Input label="Voting Period (days)" type="number" value={params.votingPeriod} onChange={e => setParams(p => ({ ...p, votingPeriod: Number(e.target.value) }))} />
        <Input label="Min Proposal Deposit" type="number" value={params.minProposalDeposit} onChange={e => setParams(p => ({ ...p, minProposalDeposit: Number(e.target.value) }))} />
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => onSave(params)}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
} 