import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2,
  Check,
  X
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isDefault: boolean;
  hierarchy: number;
  memberCount: number;
}

interface EnhancedRoleManagerProps {
  community: {
    id: string;
    roles: Role[];
  };
  onRoleCreate: (role: Omit<Role, 'id' | 'memberCount'>) => void;
  onRoleUpdate: (roleId: string, updates: Partial<Role>) => void;
  onRoleDelete: (roleId: string) => void;
  onRoleAssign: (roleId: string, userId: string) => void;
  onRoleRemove: (roleId: string, userId: string) => void;
}

const PERMISSION_GROUPS = {
  content: {
    label: 'Content Management',
    permissions: [
      { id: 'create_post', label: 'Create Posts' },
      { id: 'edit_post', label: 'Edit Posts' },
      { id: 'delete_post', label: 'Delete Posts' },
      { id: 'create_event', label: 'Create Events' },
      { id: 'edit_event', label: 'Edit Events' },
      { id: 'delete_event', label: 'Delete Events' },
      { id: 'create_proposal', label: 'Create Proposals' },
      { id: 'edit_proposal', label: 'Edit Proposals' },
      { id: 'delete_proposal', label: 'Delete Proposals' }
    ]
  },
  moderation: {
    label: 'Moderation',
    permissions: [
      { id: 'moderate_posts', label: 'Moderate Posts' },
      { id: 'moderate_comments', label: 'Moderate Comments' },
      { id: 'moderate_events', label: 'Moderate Events' },
      { id: 'moderate_proposals', label: 'Moderate Proposals' },
      { id: 'warn_members', label: 'Warn Members' },
      { id: 'ban_members', label: 'Ban Members' }
    ]
  },
  management: {
    label: 'Community Management',
    permissions: [
      { id: 'manage_roles', label: 'Manage Roles' },
      { id: 'manage_settings', label: 'Manage Settings' },
      { id: 'manage_members', label: 'Manage Members' },
      { id: 'view_analytics', label: 'View Analytics' },
      { id: 'manage_token_gates', label: 'Manage Token Gates' },
      { id: 'manage_verification', label: 'Manage Verification' }
    ]
  }
};

const COLORS = [
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
  { value: '#FFA500', label: 'Orange' },
  { value: '#800080', label: 'Purple' }
];

export function EnhancedRoleManager({
  community,
  onRoleCreate,
  onRoleUpdate,
  onRoleDelete,
  onRoleAssign,
  onRoleRemove
}: EnhancedRoleManagerProps) {
  const [activeTab, setActiveTab] = useState('roles');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: COLORS[0].value,
    permissions: [] as string[],
    isDefault: false,
    hierarchy: 0
  });

  const handleCreateRole = () => {
    onRoleCreate(newRole);
    setNewRole({
      name: '',
      description: '',
      color: COLORS[0].value,
      permissions: [],
      isDefault: false,
      hierarchy: 0
    });
    setShowCreateForm(false);
  };

  const handleUpdateRole = () => {
    if (editingRole) {
      onRoleUpdate(editingRole.id, {
        name: editingRole.name,
        description: editingRole.description,
        color: editingRole.color,
        permissions: editingRole.permissions,
        isDefault: editingRole.isDefault,
        hierarchy: editingRole.hierarchy
      });
      setEditingRole(null);
    }
  };

  const handlePermissionToggle = (permissionId: string, isChecked: boolean) => {
    if (editingRole) {
      setEditingRole(prev => ({
        ...prev!,
        permissions: isChecked
          ? [...prev!.permissions, permissionId]
          : prev!.permissions.filter(p => p !== permissionId)
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: isChecked
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
          <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="space-y-6">
            {/* Role List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {community.roles.map(role => (
                <Card key={role.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {!role.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRoleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {role.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {role.memberCount} members
                      </span>
                      {role.isDefault && (
                        <span className="px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-xs">
                          Default
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create Role Card */}
              {!showCreateForm && (
                <Card
                  className="border-dashed cursor-pointer hover:border-[#BBF10A]"
                  onClick={() => setShowCreateForm(true)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <Plus className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Create New Role
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Create/Edit Role Form */}
            {(showCreateForm || editingRole) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Role Name"
                      value={editingRole?.name || newRole.name}
                      onChange={(e) => editingRole
                        ? setEditingRole(prev => ({ ...prev!, name: e.target.value }))
                        : setNewRole(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter role name"
                    />

                    <Textarea
                      label="Description"
                      value={editingRole?.description || newRole.description}
                      onChange={(e) => editingRole
                        ? setEditingRole(prev => ({ ...prev!, description: e.target.value }))
                        : setNewRole(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Enter role description"
                    />

                    <Select
                      label="Role Color"
                      value={editingRole?.color || newRole.color}
                      onChange={(e) => editingRole
                        ? setEditingRole(prev => ({ ...prev!, color: e.target.value }))
                        : setNewRole(prev => ({ ...prev, color: e.target.value }))
                      }
                      options={COLORS}
                    />

                    <div className="space-y-4">
                      <h4 className="font-medium">Permissions</h4>
                      {Object.entries(PERMISSION_GROUPS).map(([group, { label, permissions }]) => (
                        <div key={group} className="space-y-2">
                          <h5 className="text-sm font-medium">{label}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissions.map(permission => (
                              <div
                                key={permission.id}
                                className="flex items-center gap-2"
                              >
                                <Switch
                                  id={permission.id}
                                  checked={
                                    editingRole
                                      ? editingRole.permissions.includes(permission.id)
                                      : newRole.permissions.includes(permission.id)
                                  }
                                  onCheckedChange={(checked) =>
                                    handlePermissionToggle(permission.id, checked)
                                  }
                                />
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm"
                                >
                                  {permission.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="isDefault"
                        checked={editingRole?.isDefault || newRole.isDefault}
                        onCheckedChange={(checked) => editingRole
                          ? setEditingRole(prev => ({ ...prev!, isDefault: checked }))
                          : setNewRole(prev => ({ ...prev, isDefault: checked }))
                        }
                      />
                      <label htmlFor="isDefault" className="text-sm">
                        Set as default role for new members
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingRole(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={editingRole ? handleUpdateRole : handleCreateRole}
                      >
                        {editingRole ? 'Update Role' : 'Create Role'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Role Assignments</h3>
              {/* Role assignment interface will be implemented here */}
              <div className="text-center text-gray-600 dark:text-gray-400">
                Role assignment interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Role Hierarchy</h3>
              {/* Role hierarchy interface will be implemented here */}
              <div className="text-center text-gray-600 dark:text-gray-400">
                Role hierarchy interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 