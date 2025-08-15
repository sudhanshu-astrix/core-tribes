import { useState } from 'react';
import { useUserRole } from '../ProposalsPage/hooks/useUserRole';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Accordion } from '../../components/ui/Accordion';
import { Table } from '../../components/ui/Table';

interface GovernanceSettingsProps {
  onSave: (settings: GovernanceSettings) => void;
}

export interface GovernanceSettings {
  minVoteTokens: number;
  votingPeriod: number;
  quorum: number;
  allowDelegation: boolean;
  allowVotingPower: boolean;
  roles: {
    admin: string[];
    moderator: string[];
  };
}

export function GovernanceSettings({ onSave }: GovernanceSettingsProps) {
  // const { isAdmin } = useUserRole();
  const isAdmin = true; // Always true for testing
  const [settings, setSettings] = useState<GovernanceSettings>({
    minVoteTokens: 100,
    votingPeriod: 7,
    quorum: 20,
    allowDelegation: true,
    allowVotingPower: true,
    roles: {
      admin: [],
      moderator: []
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState('');

  const handleSave = () => {
    onSave(settings);
    setIsEditing(false);
  };

  const handleAddRole = (roleType: 'admin' | 'moderator') => {
    if (newRole && !settings.roles[roleType].includes(newRole)) {
      setSettings(prev => ({
        ...prev,
        roles: {
          ...prev.roles,
          [roleType]: [...prev.roles[roleType], newRole]
        }
      }));
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleType: 'admin' | 'moderator', address: string) => {
    setSettings(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleType]: prev.roles[roleType].filter(addr => addr !== address)
      }
    }));
  };

  // Always show settings for testing
  // if (!isAdmin) {
  //   return (
  //     <div className="p-6">
  //       <p className="text-gray-500">You don't have permission to view governance settings.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Governance Settings</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        )}
      </div>

      <Accordion>
        <Accordion.Item title="Voting Parameters">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Vote Tokens
              </label>
              <Input
                type="number"
                value={settings.minVoteTokens}
                onChange={(e) => setSettings(prev => ({ ...prev, minVoteTokens: Number(e.target.value) }))}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Voting Period (days)
              </label>
              <Input
                type="number"
                value={settings.votingPeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, votingPeriod: Number(e.target.value) }))}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quorum (%)
              </label>
              <Input
                type="number"
                value={settings.quorum}
                onChange={(e) => setSettings(prev => ({ ...prev, quorum: Number(e.target.value) }))}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </Accordion.Item>

        <Accordion.Item title="Voting Features">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Allow Vote Delegation
              </label>
              <Switch
                checked={settings.allowDelegation}
                onChange={(checked) => setSettings(prev => ({ ...prev, allowDelegation: checked }))}
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable Voting Power
              </label>
              <Switch
                checked={settings.allowVotingPower}
                onChange={(checked) => setSettings(prev => ({ ...prev, allowVotingPower: checked }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Accordion.Item>

        <Accordion.Item title="Role Management">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Admins</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Enter wallet address"
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddRole('admin')}
                    disabled={!isEditing}
                  >
                    Add
                  </Button>
                </div>
                <Table>
                  <Table.Body>
                    {settings.roles.admin.map((address) => (
                      <Table.Row key={address}>
                        <Table.Cell>{address}</Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveRole('admin', address)}
                            disabled={!isEditing}
                          >
                            Remove
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Moderators</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Enter wallet address"
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddRole('moderator')}
                    disabled={!isEditing}
                  >
                    Add
                  </Button>
                </div>
                <Table>
                  <Table.Body>
                    {settings.roles.moderator.map((address) => (
                      <Table.Row key={address}>
                        <Table.Cell>{address}</Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveRole('moderator', address)}
                            disabled={!isEditing}
                          >
                            Remove
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  );
} 