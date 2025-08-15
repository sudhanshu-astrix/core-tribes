import { useState } from 'react';
import { Shield, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  isDefault?: boolean;
  isSystem?: boolean;
}

interface CommunityRolesProps {
  roles: Role[];
  permissions: Permission[];
  onRoleCreate: (role: Omit<Role, 'id' | 'memberCount'>) => void;
  onRoleUpdate: (roleId: string, updates: Partial<Role>) => void;
  onRoleDelete: (roleId: string) => void;
}

const SYSTEM_ROLES = ['admin', 'moderator', 'member'];

export function CommunityRoles({
  roles,
  permissions,
  onRoleCreate,
  onRoleUpdate,
  onRoleDelete
}: CommunityRolesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleCreateRole = () => {
    if (!newRole.name) return;

    onRoleCreate({
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions
    });

    // Reset form
    setNewRole({
      name: '',
      description: '',
      permissions: []
    });
    setShowCreateForm(false);
  };

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionId);
    const newPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    onRoleUpdate(roleId, { permissions: newPermissions });
  };

  return (
    <div className="space-y-6">
      {/* Create Role Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Create Role Form */}
      {showCreateForm && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Role</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Role Name"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />

              <Input
                label="Description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2">
                  {permissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-2 bg-lightCard dark:bg-darkCard rounded"
                    >
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {permission.description}
                        </div>
                      </div>
                      <Switch
                        checked={newRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          setNewRole(prev => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, permission.id]
                              : prev.permissions.filter(p => p !== permission.id)
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateRole}
                  disabled={!newRole.name}
                >
                  Create Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map(role => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      {role.isSystem && (
                        <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                          System Role
                        </span>
                      )}
                      {role.isDefault && (
                        <span className="px-2 py-1 bg-[#BBF10A] text-black rounded-full text-xs">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {role.memberCount} members
                    </p>
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRoleUpdate(role.id, { isDefault: !role.isDefault })}
                      >
                        {role.isDefault ? 'Remove Default' : 'Set as Default'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error"
                        onClick={() => onRoleDelete(role.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-2 bg-lightCard dark:bg-darkCard rounded"
                    >
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {permission.description}
                        </div>
                      </div>
                      <Switch
                        checked={role.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionToggle(role.id, permission.id)}
                        disabled={role.isSystem && SYSTEM_ROLES.includes(role.name.toLowerCase())}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 