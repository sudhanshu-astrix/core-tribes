import { motion } from 'framer-motion';
import { Users, Lock, Globe, Crown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { formatCompactNumber } from '../../lib/utils';
import { tribeContractService, JoinType, MemberStatusEnum } from '../../services/TribeContract';
import { useWalletStore } from '../../store/walletStore';
import { TribeDetails } from '../../services/TribeContract';

interface TribeCardProps {
  tribe: TribeDetails;
  tribeId: number;
  className?: string;
}

export function TribeCard({ tribe, tribeId, className }: TribeCardProps) {
  const { address } = useWalletStore();
  const [isMember, setIsMember] = useState(false);
  const [memberStatus, setMemberStatus] = useState<number>(MemberStatusEnum.NONE);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Parse metadata to get additional tribe info
  const parseMetadata = (metadata: string) => {
    try {
      return JSON.parse(metadata);
    } catch {
      return {
        description: 'No description available',
        logo: 'https://via.placeholder.com/150x150?text=Tribe',
        banner: '',
        category: 'General',
        guidelines: '',
        tags: []
      };
    }
  };

  const metadata = parseMetadata(tribe.metadata);

  // Check user's membership status
  useEffect(() => {
    const checkMembership = async () => {
      if (!address) return;
      
      try {
        setIsLoading(true);
        const member = await tribeContractService.isMember(tribeId, address);
        const status = await tribeContractService.getMemberStatus(tribeId, address);
        
        setIsMember(member);
        setMemberStatus(Number(status));
      } catch (error) {
        console.error('Failed to check membership:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkMembership();
  }, [address, tribeId]);

  // Handle join actions
  const handleJoin = async () => {
    if (!address) {
      alert('Please connect your wallet to join a tribe');
      return;
    }

    try {
      setIsJoining(true);
      
      if (tribe.joinType === JoinType.Public) {
        // Direct join for public tribes
        await tribeContractService.joinTribe(tribeId);
      } else {
        // Request to join for private tribes
        await tribeContractService.requestToJoinTribe(tribeId, tribe.entryFee);
      }
      
      // Refresh membership status
      const member = await tribeContractService.isMember(tribeId, address);
      const status = await tribeContractService.getMemberStatus(tribeId, address);
      
      setIsMember(member);
      setMemberStatus(Number(status));
      
      alert(tribe.joinType === JoinType.Public ? 'Successfully joined tribe!' : 'Join request submitted!');
    } catch (error) {
      console.error('Failed to join tribe:', error);
      alert('Failed to join tribe. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Get join type display info
  const getJoinTypeInfo = () => {
    switch (tribe.joinType) {
      case JoinType.Public:
        return { icon: Globe, label: 'Public', color: 'text-green-600' };
      case JoinType.InviteOnly:
        return { icon: Lock, label: 'Invite Only', color: 'text-[#BBF10A]' };
      case JoinType.Whitelist:
        return { icon: Crown, label: 'Whitelist', color: 'text-blue-600' };
      case JoinType.NFTGated:
        return { icon: Lock, label: 'NFT Gated', color: 'text-purple-600' };
      case JoinType.MultiNFT:
        return { icon: Lock, label: 'Multi NFT', color: 'text-purple-600' };
      case JoinType.AnyNFT:
        return { icon: Lock, label: 'Any NFT', color: 'text-purple-600' };
      case JoinType.InviteCode:
        return { icon: Lock, label: 'Invite Code', color: 'text-orange-600' };
      default:
        return { icon: Globe, label: 'Unknown', color: 'text-gray-600' };
    }
  };

  // Get action button text and state
  const getActionButton = () => {
    if (isLoading) {
      return {
        text: 'Loading...',
        disabled: true,
        icon: Loader2,
        variant: 'outline' as const
      };
    }

    if (isMember) {
      return {
        text: 'Joined',
        disabled: true,
        icon: null,
        variant: 'outline' as const
      };
    }

    if (memberStatus === MemberStatusEnum.PENDING) {
      return {
        text: 'Request Pending',
        disabled: true,
        icon: Loader2,
        variant: 'outline' as const
      };
    }

    if (memberStatus === MemberStatusEnum.BANNED) {
      return {
        text: 'Banned',
        disabled: true,
        icon: null,
        variant: 'outline' as const
      };
    }

    if (tribe.joinType === JoinType.Public) {
      return {
        text: isJoining ? 'Joining...' : 'Join',
        disabled: isJoining,
        icon: isJoining ? Loader2 : null,
        variant: 'primary' as const
      };
    } else {
      return {
        text: isRequesting ? 'Requesting...' : 'Request to Join',
        disabled: isRequesting,
        icon: isRequesting ? Loader2 : null,
        variant: 'primary' as const
      };
    }
  };

  const joinTypeInfo = getJoinTypeInfo();
  const actionButton = getActionButton();

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 500 }}>
      <Link to={`/community/${tribeId}`} className="block group focus:outline-none">
        <Card className={className + ' group-hover:shadow-lg cursor-pointer transition-shadow'}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar
                src={metadata.logo}
                alt={tribe.name}
                size="xl"
                className="mb-3"
                fallback={tribe.name}
              />
              <h3 className="font-semibold text-black dark:text-white">
                {tribe.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <Users className="h-3 w-3" />
                <span>{formatCompactNumber(tribe.memberCount)} members</span>
                <span>•</span>
                <joinTypeInfo.icon className={`h-3 w-3 ${joinTypeInfo.color}`} />
                <span className={joinTypeInfo.color}>{joinTypeInfo.label}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {metadata.description}
            </p>

            {tribe.entryFee > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Entry Fee: {tribe.entryFee / 10**18} XDC
              </div>
            )}
            
            <Button
              variant={actionButton.variant}
              size="sm"
              className="w-full"
              disabled={actionButton.disabled}
              onClick={e => { 
                e.preventDefault(); 
                if (!actionButton.disabled && !isMember) {
                  handleJoin();
                }
              }}
            >
              {actionButton.icon && <actionButton.icon className="w-4 h-4 mr-2 animate-spin" />}
              {actionButton.text}
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 