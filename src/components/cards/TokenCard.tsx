import { Token } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

interface TokenCardProps {
  token: Token;
  className?: string;
}

export function TokenCard({ token, className }: TokenCardProps) {
  const totalValue = token.price ? token.balance * token.price : null;
  
  return (
    <Card className={className}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-lightCard dark:bg-darkCard flex items-center justify-center">
            <img
              src={token.logo}
              alt={token.symbol}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
              }}
            />
          </div>
          
          <div>
            <span className="font-medium text-black dark:text-white">{token.name}</span>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              {token.type === 'fungible' ? (
                <>
                  <span className="uppercase">{token.symbol}</span>
                  {token.price && (
                    <>
                      <span>•</span>
                      <span>{formatCurrency(token.price)}</span>
                    </>
                  )}
                </>
              ) : (
                <span>NFT</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-mono font-medium text-black dark:text-white">
            {token.balance} {token.symbol}
          </div>
          {totalValue && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(totalValue)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}