import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Check, X, Users, Loader2, Crown } from 'lucide-react';
import { tribeContractService, MemberStatusEnum } from '../../services/TribeContract';
import { useWalletStore } from '../../store/walletStore';
import { TribeDetails } from '../../services/TribeContract';

interface TribeAdminPanelProps {
  tribe: TribeDetails;
  tribeId: number;
}

interface PendingRequest {
  address: string;
  status: number;
  requestTime?: string;
}

export function TribeAdminPanel({ tribe, tribeId }: TribeAdminPanelProps) {
  const { address } = useWalletStore();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Check if current user is the tribe owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!address) return;
      
      try {
        const admin = await tribeContractService.getTribeAdmin(tribeId);
        setIsOwner(admin.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error('Failed to check ownership:', error);
      }
    };

    checkOwnership();
  }, [address, tribeId]);

  // Load pending requests
  const loadPendingRequests = async () => {
    if (!isOwner) return;
    
    try {
      setLoading(true);
      
      // For now, we'll simulate pending requests since the contract doesn't have a direct way to get all pending members
      // In a real implementation, you would need to track this in the frontend or have a backend service
      const mockPendingRequests: PendingRequest[] = [
        // This would be populated from contract events or a backend service
      ];
      
      setPendingRequests(mockPendingRequests);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, [isOwner]);

  // Handle approve member
  const handleApproveMember = async (memberAddress: string) => {
    if (!isOwner) return;
    
    try {
      setProcessingRequest(memberAddress);
      await tribeContractService.approveMember(tribeId, memberAddress);
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.address !== memberAddress));
      
      alert('Member approved successfully!');
    } catch (error) {
      console.error('Failed to approve member:', error);
      alert('Failed to approve member. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle reject member
  const handleRejectMember = async (memberAddress: string) => {
    if (!isOwner) return;
    
    try {
      setProcessingRequest(memberAddress);
      await tribeContractService.rejectMember(tribeId, memberAddress);
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.address !== memberAddress));
      
      alert('Member rejected successfully!');
    } catch (error) {
      console.error('Failed to reject member:', error);
      alert('Failed to reject member. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle ban member
  const handleBanMember = async (memberAddress: string) => {
    if (!isOwner) return;
    
    if (!confirm('Are you sure you want to ban this member? This action cannot be undone.')) {
      return;
    }
    
    try {
      setProcessingRequest(memberAddress);
      await tribeContractService.banMember(tribeId, memberAddress);
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.address !== memberAddress));
      
      alert('Member banned successfully!');
    } catch (error) {
      console.error('Failed to ban member:', error);
      alert('Failed to ban member. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  if (!isOwner) {
    return null; // Don't show admin panel if user is not the owner
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-[#BBF10A]" />
          Tribe Administration
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage tribe membership and settings
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tribe Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white">
                {tribe.memberCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Members
              </div>
            </div>
            <div className="text-center">
                              <div className="text-2xl font-bold text-[#BBF10A]">
                {pendingRequests.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pending Requests
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white">
                {tribe.whitelist.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Whitelisted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white">
                {tribe.entryFee > 0 ? `${tribe.entryFee / 10**18} XDC` : 'Free'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Entry Fee
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
              Pending Join Requests
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.address}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src=""
                        alt={request.address}
                        size="sm"
                        fallback={request.address.slice(0, 6)}
                      />
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">
                          {request.address.slice(0, 6)}...{request.address.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Requested {request.requestTime || 'recently'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => handleApproveMember(request.address)}
                        disabled={processingRequest === request.address}
                      >
                        {processingRequest === request.address ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleRejectMember(request.address)}
                        disabled={processingRequest === request.address}
                      >
                        {processingRequest === request.address ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPendingRequests}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement tribe settings modal
                alert('Tribe settings coming soon!');
              }}
            >
              Tribe Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement invite code management
                alert('Invite code management coming soon!');
              }}
            >
              Manage Invites
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 