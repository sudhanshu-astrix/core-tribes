import { mockCommunities, mockCommunityMembers } from '../data/mockData';
import type { Community, CommunityMember, Permission, Role } from '../types';

export function getCommunityRoles(communityId: string): Role[] {
  const community = mockCommunities.find(c => c.id === communityId);
  return community?.roles || [];
}

export function getMemberRoles(userId: string, communityId: string): Role[] {
  const community = mockCommunities.find(c => c.id === communityId);
  const member = mockCommunityMembers.find(m => m.userId === userId && m.communityId === communityId);
  
  if (!community?.roles || !member?.roles) return [];
  
  return community.roles.filter(role => member.roles?.includes(role.id));
}

export function hasPermission(userId: string, communityId: string, permission: Permission): boolean {
  const memberRoles = getMemberRoles(userId, communityId);
  return memberRoles.some(role => role.permissions.includes(permission));
}

export function assignRole(userId: string, communityId: string, roleId: string, assignedBy: string): boolean {
  const community = mockCommunities.find(c => c.id === communityId);
  const member = mockCommunityMembers.find(m => m.userId === userId && m.communityId === communityId);
  
  if (!community || !member) return false;
  
  // Check if the role exists
  const role = community.roles?.find(r => r.id === roleId);
  if (!role) return false;
  
  // Check if the assigner has permission
  if (!hasPermission(assignedBy, communityId, 'manage_roles')) return false;
  
  // Initialize roles array if it doesn't exist
  if (!member.roles) member.roles = [];
  
  // Add role if not already assigned
  if (!member.roles.includes(roleId)) {
    member.roles.push(roleId);
    
    // Add to community's memberRoles
    if (!community.memberRoles) community.memberRoles = [];
    community.memberRoles.push({
      roleId,
      userId,
      assignedBy,
      assignedAt: new Date().toISOString()
    });
  }
  
  return true;
}

export function removeRole(userId: string, communityId: string, roleId: string, removedBy: string): boolean {
  const community = mockCommunities.find(c => c.id === communityId);
  const member = mockCommunityMembers.find(m => m.userId === userId && m.communityId === communityId);
  
  if (!community || !member || !member.roles) return false;
  
  // Check if the remover has permission
  if (!hasPermission(removedBy, communityId, 'manage_roles')) return false;
  
  // Remove role
  member.roles = member.roles.filter(id => id !== roleId);
  
  // Remove from community's memberRoles
  if (community.memberRoles) {
    community.memberRoles = community.memberRoles.filter(
      mr => !(mr.userId === userId && mr.roleId === roleId)
    );
  }
  
  return true;
}

export function getDefaultRole(communityId: string): Role | undefined {
  const community = mockCommunities.find(c => c.id === communityId);
  return community?.roles?.find(r => r.isDefault);
}

export function getRoleForLevel(communityId: string, level: number): Role | undefined {
  const community = mockCommunities.find(c => c.id === communityId);
  return community?.roles?.find(r => r.levelRequired === level);
} 