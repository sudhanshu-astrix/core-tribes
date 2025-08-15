import React from 'react';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';

interface Vote {
  id: string;
  proposalTitle: string;
  vote: 'For' | 'Against' | 'Abstain';
  votingPower: number;
  timestamp: Date;
}

interface VotingHistoryProps {
  votes: Vote[];
}

export function VotingHistory({ votes }: VotingHistoryProps) {
  const getVoteColor = (vote: Vote['vote']) => {
    switch (vote) {
      case 'For':
        return 'text-green-500';
      case 'Against':
        return 'text-red-500';
      default:
        return 'text-[#BBF10A]';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Voting History
      </h3>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Header>Proposal</Table.Header>
            <Table.Header>Vote</Table.Header>
            <Table.Header>Voting Power</Table.Header>
            <Table.Header>Date</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {votes.map((vote) => (
            <Table.Row key={vote.id}>
              <Table.Cell className="font-medium">
                {vote.proposalTitle}
              </Table.Cell>
              <Table.Cell className={getVoteColor(vote.vote)}>
                {vote.vote}
              </Table.Cell>
              <Table.Cell>
                {vote.votingPower.toLocaleString()} TRIX
              </Table.Cell>
              <Table.Cell>
                {vote.timestamp.toLocaleDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
} 