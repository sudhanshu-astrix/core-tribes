import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { mockCommunityMembers, mockUser, mockUser2 } from '../../data/mockData';
import { getCommunityRoles, getMemberRoles, assignRole, removeRole, hasPermission } from '../../services/RoleService';
import type { Role } from '../../types';
import { CheckCircle, PlusCircle, Trash2 } from 'lucide-react';

interface RoleManagerProps {
  communityId: string;
  className?: string;
}

export function RoleManager({ communityId, className }: RoleManagerProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const roles = getCommunityRoles(communityId);
  const members = mockCommunityMembers.filter(m => m.communityId === communityId);
  const canManageRoles = hasPermission(mockUser.id, communityId, 'manage_roles');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to get user info
  const getUser = (userId: string) => {
    if (userId === mockUser.id) return mockUser;
    if (userId === mockUser2.id) return mockUser2;
    return { username: userId, avatar: undefined };
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    if (!canManageRoles) return;
    if (assignRole(userId, communityId, roleId, mockUser.id)) {
      setToast({ type: 'success', message: 'Role assigned successfully!' });
      setSelectedMember(null);
      setTimeout(() => setSelectedMember(userId), 0);
    } else {
      setToast({ type: 'error', message: 'Failed to assign role.' });
    }
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    if (!canManageRoles) return;
    if (!window.confirm('Are you sure you want to remove this role?')) return;
    if (removeRole(userId, communityId, roleId, mockUser.id)) {
      setToast({ type: 'success', message: 'Role removed successfully!' });
      setSelectedMember(null);
      setTimeout(() => setSelectedMember(userId), 0);
    } else {
      setToast({ type: 'error', message: 'Failed to remove role.' });
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">Role Management</h2>
        
        {!canManageRoles ? (
          <div className="text-gray-600 dark:text-gray-400">
            You don't have permission to manage roles.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Definitions */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Available Roles</h3>
              <div className="grid gap-2">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className="p-3 rounded-lg border border-lightCard/30 dark:border-darkCard/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="font-medium">{role.name}</span>
                      {role.isDefault && (
                        <span className="px-2 py-0.5 bg-lightCard dark:bg-darkCard rounded text-xs">
                          Default
                        </span>
                      )}
                      {role.levelRequired && (
                        <span className="px-2 py-0.5 bg-lightCard dark:bg-darkCard rounded text-xs">
                          Level {role.levelRequired}+
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
                        <span
                          key={permission}
                          className="px-2 py-0.5 bg-lightCard dark:bg-darkCard rounded text-xs"
                        >
                          {permission.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Members</h3>
              <div className="grid gap-4">
                {members.map(member => {
                  const user = getUser(member.userId);
                  const memberRoles = getMemberRoles(member.userId, communityId);
                  const isSelected = selectedMember === member.userId;
                  return (
                    <div
                      key={member.userId}
                      className={`rounded-lg border border-lightCard/20 dark:border-darkCard/20 bg-transparent p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm hover:shadow-lg transition-all duration-200 mb-2`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar src={user.avatar} fallback={user.username} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate text-black dark:text-white">{user.username}</span>
                            {member.userId === mockUser.id && (
                              <span className="ml-1 px-2 py-0.5 rounded bg-[#BBF10A] text-xs text-black font-semibold">You</span>
                            )}
                            {memberRoles.map(role => (
                              <span
                                key={role.id}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: role.color, color: '#fff' }}
                              >
                                {role.name}
                              </span>
                            ))}
                            <span className="ml-2 px-2 py-0.5 rounded bg-lightCard dark:bg-darkCard text-xs font-medium text-gray-600 dark:text-gray-400">
                              Level {member.currentLevel}
                            </span>
                            <span className="ml-1 px-2 py-0.5 rounded bg-lightCard dark:bg-darkCard text-xs font-medium text-gray-600 dark:text-gray-400">
                              {member.currentXp} XP
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <Button
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          className="rounded-full px-4"
                          onClick={() => setSelectedMember(isSelected ? null : member.userId)}
                        >
                          {isSelected ? 'Hide Roles' : 'Manage Roles'}
                        </Button>
                      </div>
                      {isSelected && (
                        <div className="w-full border-t border-lightCard/20 dark:border-darkCard/20 pt-4 mt-4 flex flex-col gap-3">
                          <div className="text-sm font-semibold text-black dark:text-white mb-1">Manage Roles</div>
                          <div className="flex flex-wrap gap-3 items-center">
                            {memberRoles.length === 0 && (
                              <span className="text-xs text-gray-600 dark:text-gray-400 italic">No roles assigned</span>
                            )}
                            {memberRoles.map(role => (
                              <div
                                key={role.id}
                                className="flex items-center gap-2 px-3 py-1 rounded-full"
                                style={{ backgroundColor: role.color, color: '#fff' }}
                              >
                                <span className="text-xs font-semibold">{role.name}</span>
                                <button
                                  className="ml-1 text-white hover:text-error/80 text-lg font-bold flex items-center"
                                  title="Remove role"
                                  onClick={() => handleRemoveRole(member.userId, role.id)}
                                  disabled={!canManageRoles}
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-3 items-center">
                            {roles
                              .filter(role => !memberRoles.find(r => r.id === role.id))
                              .map(role => (
                                <Button
                                  key={role.id}
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full flex items-center gap-1"
                                  onClick={() => handleAssignRole(member.userId, role.id)}
                                  disabled={!canManageRoles}
                                  leftIcon={<PlusCircle size={16} />}
                                >
                                  {role.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
               onClick={() => setToast(null)}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <Trash2 size={18} />}
            <span>{toast.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 