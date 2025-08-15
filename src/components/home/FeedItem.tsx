import { FeedItem as FeedItemType } from '../../types';
import { PostCard } from '../cards/PostCard';
import { ProposalCard } from '../cards/ProposalCard';
import { EventCard } from '../cards/EventCard';

interface FeedItemProps {
  item: FeedItemType;
  className?: string;
}

export function FeedItem({ item, className }: FeedItemProps) {
  // Return null if item or item.data is missing
  if (!item || !item.data) {
    return null;
  }

  switch (item.type) {
    case 'post':
      return <PostCard post={item.data} className={className} />;
    case 'proposal':
      return <ProposalCard proposal={item.data} className={className} />;
    case 'event':
      return <EventCard event={item.data} className={className} />;
    default:
      return null;
  }
}