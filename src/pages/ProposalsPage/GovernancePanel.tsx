import React, { useState } from 'react';
import { useGovernanceSettings } from './hooks/useGovernanceSettings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Accordion } from '../../components/ui/Accordion';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface GovernancePanelProps {
  onBack: () => void;
}

export function GovernancePanel({ onBack }: GovernancePanelProps) {
  const {
    settings,
    isLoading,
    error,
    updateVotingParams,
    updateRoles,
    updateContractConfig,
    resetToDefaults,
    archiveAllProposals,
    deleteGovernanceSettings
  } = useGovernanceSettings();

  const [votingParams, setVotingParams] = useState(settings?.votingParams);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (isLoading) return <div>Loading governance settings...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!settings) return <div>No governance settings found</div>;

  const handleVotingParamsChange = (field: keyof typeof settings.votingParams, value: number) => {
    setVotingParams(prev => ({ ...prev!, [field]: value }));
  };

  const handleSaveVotingParams = async () => {
    await updateVotingParams(votingParams!);
  };

  const handleAddAdmin = async () => {
    if (!newAdminAddress) return;
    const newRoles = [...settings.roles, { address: newAdminAddress, role: 'admin' }];
    await updateRoles(newRoles);
    setNewAdminAddress('');
  };

  const handleRemoveAdmin = async (address: string) => {
    const newRoles = settings.roles.filter(r => r.address !== address);
    await updateRoles(newRoles);
  };

  const handleResetConfirm = async () => {
    if (showResetConfirm) {
      await resetToDefaults();
      setShowResetConfirm(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (showArchiveConfirm) {
      await archiveAllProposals();
      setShowArchiveConfirm(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm && deleteConfirmText === 'DELETE-GOV') {
      await deleteGovernanceSettings();
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back to Proposals
        </Button>
        <h1 className="text-2xl font-bold">Governance Settings</h1>
      </div>

      <Accordion>
        <Accordion.Item title="Voting Parameters">
          <div className="space-y-4 p-4">
            <div>
              <Input
                type="number"
                label="Quorum Percentage"
                value={votingParams?.quorumPercentage}
                onChange={e => handleVotingParamsChange('quorumPercentage', Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>
            <div>
              <Select
                label="Voting Duration"
                value={votingParams?.votingDuration}
                onChange={e => handleVotingParamsChange('votingDuration', Number(e.target.value))}
                options={[
                  { value: 1, label: '1 day' },
                  { value: 3, label: '3 days' },
                  { value: 7, label: '7 days' }
                ]}
              />
            </div>
            <div>
              <Input
                type="number"
                label="Execution Delay (hours)"
                value={votingParams?.executionDelay}
                onChange={e => handleVotingParamsChange('executionDelay', Number(e.target.value))}
                min={0}
              />
            </div>
            <Button onClick={handleSaveVotingParams}>Save Changes</Button>
          </div>
        </Accordion.Item>

        <Accordion.Item title="Role & Permission Management">
          <div className="space-y-4 p-4">
            <Table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.roles.map(role => (
                  <tr key={role.address}>
                    <td>{role.address}</td>
                    <td>{role.role}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveAdmin(role.address)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="flex gap-2">
              <Input
                value={newAdminAddress}
                onChange={e => setNewAdminAddress(e.target.value)}
                placeholder="Enter admin address"
              />
              <Button onClick={handleAddAdmin}>Add Admin</Button>
            </div>
          </div>
        </Accordion.Item>

        <Accordion.Item title="Contract Configuration">
          <div className="space-y-4 p-4">
            <Input
              label="Governance Contract Address"
              value={settings.contractConfig.governanceAddress}
              readOnly
            />
            <Input
              label="Timelock Address"
              value={settings.contractConfig.timelockAddress}
              readOnly
            />
            <Input
              label="Treasury Address"
              value={settings.contractConfig.treasuryAddress}
              readOnly
            />
          </div>
        </Accordion.Item>

        <Accordion.Item title="Analytics & Logs">
          <div className="space-y-4 p-4">
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded">
              {/* Simple bar chart implementation */}
              <div className="flex h-full items-end gap-2 p-4">
                {settings.analyticsData.voterTurnout.map((data, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500"
                    style={{ height: `${data.percentage}%` }}
                    title={`${data.month}: ${data.percentage}%`}
                  />
                ))}
              </div>
            </div>
            <Table>
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Vote Count</th>
                  <th>Turnout %</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {settings.analyticsData.proposalStats.map(stat => (
                  <tr key={stat.id}>
                    <td>{stat.id}</td>
                    <td>{stat.voteCount}</td>
                    <td>{stat.turnout}%</td>
                    <td>{stat.result}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button onClick={() => {
              const csv = [
                ['Proposal ID', 'Vote Count', 'Turnout %', 'Result'],
                ...settings.analyticsData.proposalStats.map(stat => [
                  stat.id,
                  stat.voteCount,
                  stat.turnout,
                  stat.result
                ])
              ].map(row => row.join(',')).join('\n');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'proposal-stats.csv';
              a.click();
            }}>
              Download CSV
            </Button>
          </div>
        </Accordion.Item>

        <Accordion.Item title="Danger Zone">
          <div className="space-y-4 p-4">
            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowArchiveConfirm(true)}
            >
              Archive All Proposals
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Governance Settings
            </Button>
          </div>
        </Accordion.Item>
      </Accordion>

      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Confirm Reset"
      >
        <div className="space-y-4">
          <p>Are you sure you want to reset all governance settings to defaults?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleResetConfirm}
            >
              Reset
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        title="Confirm Archive"
      >
        <div className="space-y-4">
          <p>Are you sure you want to archive all proposals? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowArchiveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleArchiveConfirm}
            >
              Archive All
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>This action will permanently delete all governance settings. Type "DELETE-GOV" to confirm.</p>
          <Input
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE-GOV"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmText !== 'DELETE-GOV'}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 