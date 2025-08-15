import { mockCommunityMembers } from '../data/mockData';
import type { Community, CommunityMember } from '../types';

// interface XPMultiplier {
//   action: keyof NonNullable<Community['pointsConfig']>;
//   consecutiveActions: number;
//   multiplier: number;
// }

export function calculateLevel(xp: number, levelTiers: NonNullable<Community['levelTiers']>): number {
  if (!levelTiers || levelTiers.length === 0) return 1;
  let currentLevel = 1;
  for (const tier of levelTiers) {
    if (xp >= tier.xpThreshold) {
      currentLevel = tier.level;
    } else {
      break;
    }
  }
  return currentLevel;
}

function calculateConsecutiveActions(member: CommunityMember, action: keyof NonNullable<Community['pointsConfig']>): number {
  if (!member.consecutiveActions) return 1;
  return member.consecutiveActions[action] || 1;
}

function calculateMultiplier(community: Community, action: keyof NonNullable<Community['pointsConfig']>, consecutiveActions: number): number {
  const multipliers = community.xpMultipliers || [];
  const actionMultiplier = multipliers.find(m => m.action === action && m.consecutiveActions === consecutiveActions);
  return actionMultiplier?.multiplier || 1;
}

function calculateBoostMultiplier(community: Community, action: keyof NonNullable<Community['pointsConfig']>): number {
  const now = new Date().getTime();
  const activeBoosts = (community.xpBoosts || []).filter(boost => {
    const startTime = new Date(boost.startTime).getTime();
    const endTime = new Date(boost.endTime).getTime();
    return boost.isActive && now >= startTime && now <= endTime && boost.actions.includes(action);
  });
  
  if (activeBoosts.length === 0) return 1;
  
  // If multiple boosts are active, use the highest multiplier
  return Math.max(...activeBoosts.map(boost => boost.multiplier));
}

export function awardXP(userId: string, communityId: string, action: keyof NonNullable<Community['pointsConfig']>) {
  const community: any = {}
  if (!community || !community.pointsConfig || !community.levelTiers) {
    return { success: false, reason: 'Community or config not found' };
  }
  const memberIdx = mockCommunityMembers.findIndex(m => m.userId === userId && m.communityId === communityId);
  if (memberIdx === -1) {
    return { success: false, reason: 'Member not found' };
  }
  const member = mockCommunityMembers[memberIdx];
  
  // Cooldown check
  const cooldown = community.xpCooldowns?.find(cd => cd.action === action)?.minutes;
  const lastAction = member.lastActionTimestamps?.[action];
  if (cooldown && lastAction) {
    const last = new Date(lastAction).getTime();
    const now = Date.now();
    if (now - last < cooldown * 60 * 1000) {
      return { success: false, reason: 'cooldown' };
    }
  }

  // Calculate consecutive actions and multiplier
  const consecutiveActions = calculateConsecutiveActions(member, action);
  const actionMultiplier = calculateMultiplier(community, action, consecutiveActions);
  
  // Calculate boost multiplier
  const boostMultiplier = calculateBoostMultiplier(community, action);
  
  // Award XP with both multipliers
  const baseXpAmount = community.pointsConfig[action] || 0;
  const xpAmount = Math.round(baseXpAmount * actionMultiplier * boostMultiplier);
  
  member.currentXp += xpAmount;
  
  // Update consecutive actions
  if (!member.consecutiveActions) member.consecutiveActions = {};
  member.consecutiveActions[action] = consecutiveActions + 1;
  
  // Update last action timestamp
  if (!member.lastActionTimestamps) member.lastActionTimestamps = {};
  member.lastActionTimestamps[action] = new Date().toISOString();
  
  // Track XP history
  if (!member || !member?.currentXp) member.xpHistory = [];
  member.xpHistory.push({
    timestamp: new Date().toISOString(),
    action,
    amount: xpAmount,
    baseAmount: baseXpAmount,
    actionMultiplier,
    boostMultiplier,
  });
  
  // Recalculate level
  member.currentLevel = calculateLevel(member.currentXp, community.levelTiers);
  
  // Save back to mockCommunityMembers
  mockCommunityMembers[memberIdx] = member;
  
  return { 
    success: true, 
    xpAwarded: xpAmount, 
    baseXp: baseXpAmount,
    actionMultiplier: actionMultiplier,
    boostMultiplier: boostMultiplier,
    consecutiveActions: consecutiveActions + 1,
    newLevel: member.currentLevel 
  };
} 