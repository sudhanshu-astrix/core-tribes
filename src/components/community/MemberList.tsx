import { useState, useEffect } from 'react';
import { Users, User, Crown, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { tribeContractService } from '../../services/TribeContract';

interface MemberListProps {
  tribeId: number;
  tribeAdmin: string;
  memberCount: number;
}

interface Member {
  address: string;
  status: number; // 0: NONE, 1: ACTIVE, 2: PENDING, 3: BANNED
  isAdmin: boolean;
}

export function MemberList({ tribeId, tribeAdmin, memberCount }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize tribe contract service
        await tribeContractService.initialize();

        // For now, we'll create a simple list with the admin
        // In a real implementation, you would need to:
        // 1. Listen to contract events for member joins/leaves
        // 2. Store member addresses in a database
        // 3. Or implement a view function in the contract to get all members
        
        const memberList: Member[] = [];
        
        // Add admin as first member
        memberList.push({
          address: tribeAdmin,
          status: 1, // ACTIVE
          isAdmin: true
        });

        // Note: This is a simplified implementation
        // In production, you would fetch all actual members from the contract
        // For now, we'll show just the admin and a placeholder for other members
        if (memberCount > 1) {
          // Add placeholder for other members
          for (let i = 1; i < Math.min(memberCount, 10); i++) {
            memberList.push({
              address: `0x${'0'.repeat(40)}`, // Placeholder address
              status: 1, // ACTIVE
              isAdmin: false
            });
          }
        }

        setMembers(memberList);
      } catch (err) {
        console.error('Failed to load members:', err);
        setError('Failed to load tribe members');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [tribeId, tribeAdmin, memberCount]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'None';
      case 1: return 'Active';
      case 2: return 'Pending';
      case 3: return 'Banned';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'text-green-500';
      case 2: return 'text-[#BBF10A]';
      case 3: return 'text-red-500';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    if (address === `0x${'0'.repeat(40)}`) {
      return 'Member (address not available)';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="w-8 h-8 animate-pulse mx-auto mb-2 text-[#BBF10A]" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading members...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-[#BBF10A]" />
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Tribe Members
          </h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {memberCount} total members
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No members found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-lightCard/50 dark:bg-darkCard/50 rounded-lg border border-lightCard/50 dark:border-darkCard/50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BBF10A] to-[#BBF10A]/70 flex items-center justify-center">
                  {member.isAdmin ? (
                    <Crown className="w-4 h-4 text-black" />
                  ) : (
                    <User className="w-4 h-4 text-black" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-black dark:text-white">
                      {formatAddress(member.address)}
                    </span>
                    {member.isAdmin && (
                      <span className="px-2 py-1 bg-[#BBF10A]/10 text-[#BBF10A] text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className={getStatusColor(member.status)}>
                      {getStatusText(member.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              {member.isAdmin && (
                <Shield className="w-4 h-4 text-[#BBF10A]" />
              )}
            </div>
          ))}
        </div>
      )}

      {memberCount > members.length && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {members.length} of {memberCount} members
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Note: Full member list requires contract event listening implementation
          </p>
        </div>
      )}
    </Card>
  );
} 