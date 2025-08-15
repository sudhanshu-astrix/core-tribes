import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { cn } from '../lib/utils';

type TokenType = 'fungible' | 'nft';

interface TokenForm {
  name: string;
  symbol: string;
  supply: string;
  tokenType: TokenType;
  description: string;
}

export function TokenStudioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    supply: '100000',
    tokenType: 'fungible',
    description: '',
  });
  
  const updateForm = (field: keyof TokenForm, value: string | TokenType) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleNextStep = () => {
    setCurrentStep(2);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate token creation
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Token created successfully!');
      // Reset form and go back to step 1
      setForm({
        name: '',
        symbol: '',
        supply: '100000',
        tokenType: 'fungible',
        description: '',
      });
      setCurrentStep(1);
    }, 2000);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
        Token Studio
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Create your own community token or NFT collection.
      </p>
      
      {/* Steps indicator */}
      <div className="flex items-center mb-6">
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${ 
          currentStep === 1 ? 'bg-[#BBF10A] text-darkBg' : 'bg-lightCard dark:bg-darkCard text-black dark:text-white' 
        }`}>
          1
        </div>
        <div className={`flex-grow h-1 mx-2 ${ 
          currentStep > 1 ? 'bg-[#BBF10A]' : 'bg-lightCard dark:bg-darkCard' 
        }`}></div>
        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${ 
          currentStep === 2 ? 'bg-[#BBF10A] text-darkBg' : 'bg-lightCard dark:bg-darkCard text-black dark:text-white' 
        }`}>
          2
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                Token Details
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Token Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tokenType"
                      checked={form.tokenType === 'fungible'}
                      onChange={() => updateForm('tokenType', 'fungible')}
                      className="mr-2 accent-[#BBF10A]"
                    />
                    <span className="text-black dark:text-white">Fungible Token</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tokenType"
                      checked={form.tokenType === 'nft'}
                      onChange={() => updateForm('tokenType', 'nft')}
                      className="mr-2 accent-[#BBF10A]"
                    />
                    <span className="text-black dark:text-white">NFT Collection</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Token Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="e.g., My Community Token"
                  className={cn(
                    'w-full p-2 rounded-md bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50',
                    !form.name && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!form.name || !form.symbol}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => updateForm('symbol', e.target.value)}
                  placeholder="e.g., MCT"
                  className={cn(
                    'w-full p-2 rounded-md bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50',
                    !form.symbol && 'opacity-50 cursor-not-allowed'
                  )}
                  maxLength={5}
                  disabled={!form.name || !form.symbol}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Short ticker symbol (max 5 characters)
                </p>
              </div>
              
              {form.tokenType === 'fungible' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Initial Supply
                  </label>
                  <input
                    type="number"
                    value={form.supply}
                    onChange={(e) => updateForm('supply', e.target.value)}
                    className={cn(
                      'w-full p-2 rounded-md bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50',
                      !form.supply && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={!form.supply}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe your token or collection..."
                  rows={3}
                  className={cn(
                    'w-full p-2 rounded-md bg-lightCard dark:bg-darkCard border border-lightCard/50 dark:border-darkCard/50 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50',
                    !form.description && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!form.description}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                Review & Confirm
              </h2>
              
              <div className="bg-lightCard dark:bg-darkCard rounded-lg p-4">
                <h3 className="font-medium text-black dark:text-white mb-3">
                  Token Details
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-black dark:text-white">
                      {form.tokenType === 'fungible' ? 'Fungible Token' : 'NFT Collection'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="text-black dark:text-white">{form.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                    <span className="text-black dark:text-white">{form.symbol}</span>
                  </div>
                  
                  {form.tokenType === 'fungible' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Initial Supply:</span>
                      <span className="text-black dark:text-white">{form.supply}</span>
                    </div>
                  )}
                  
                  {form.description && (
                    <div className="pt-2 border-t border-lightCard/30 dark:border-darkCard/30">
                      <span className="block text-gray-600 dark:text-gray-400 mb-1">Description:</span>
                      <p className="text-black dark:text-white text-sm">{form.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-lightCard/50 dark:bg-darkCard/50 rounded-lg p-4">
                <h3 className="font-medium text-black dark:text-white mb-2">
                  Network & Deployment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your token will be deployed to the Ethereum network. This will require gas fees to be paid.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  Estimated gas: ~0.01 ETH
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between p-6">
          {currentStep === 1 ? (
            <>
              <div></div> {/* Empty div for alignment */}
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={!form.name || !form.symbol}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handlePrevStep}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Creating Token...' : 'Create Token'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}