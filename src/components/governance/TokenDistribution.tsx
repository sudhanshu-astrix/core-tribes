import React from 'react';
import { Card } from '../ui/Card';

interface TokenHolder {
  address: string;
  name: string;
  balance: number;
  percentage: number;
}

interface TokenDistributionProps {
  holders: TokenHolder[];
  totalSupply: number;
}

export function TokenDistribution({ holders, totalSupply }: TokenDistributionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Token Distribution
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total Supply: {totalSupply.toLocaleString()} TRIX
          </span>
        </div>

        <div className="space-y-4">
          {holders.map((holder) => (
            <div key={holder.address} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black dark:text-white">
                    {holder.name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({holder.address.slice(0, 6)}...{holder.address.slice(-4)})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-black dark:text-white">
                    {holder.balance.toLocaleString()} TRIX
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {holder.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-lightCard dark:bg-darkCard rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${holder.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 