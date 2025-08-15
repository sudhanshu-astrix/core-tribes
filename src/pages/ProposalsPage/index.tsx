import React, { useState } from 'react';
import { useUserRole } from './hooks/useUserRole';
import { ProposalList } from './ProposalList';
import { GovernancePanel } from './GovernancePanel';

export default function ProposalsPage() {
  const [viewGov, setViewGov] = useState(false);
  const { isAdmin } = useUserRole();

  if (viewGov && isAdmin) {
    return <GovernancePanel onBack={() => setViewGov(false)} />;
  }

  return (
    <ProposalList 
      onOpenGovernance={() => setViewGov(true)} 
      showGovernanceButton={isAdmin} 
    />
  );
} 