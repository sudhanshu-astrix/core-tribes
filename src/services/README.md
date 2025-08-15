# TribeContract Service

This service provides a comprehensive interface for interacting with the TribeController smart contract. It handles all tribe-related operations including creation, joining, management, and more.

## Features

- **Tribe Creation**: Create new tribes with configurable join types and requirements
- **Member Management**: Join, approve, reject, and ban members
- **Invite System**: Create and manage invite codes for private tribes
- **NFT Gating**: Support for NFT-based access control
- **Tribe Merging**: Request and execute tribe mergers
- **Comprehensive Queries**: Get tribe details, member counts, and status

## Installation

The service is already integrated into the project. Make sure you have the following dependencies:

```bash
npm install ethers
```

## Quick Start

### Basic Usage

```typescript
import { tribeContractService, JoinType, NFTType } from '../services/TribeContract';

// Initialize the service
await tribeContractService.initialize();

// Create a new tribe
const result = await tribeContractService.createTribe({
  name: "My Tribe",
  metadata: JSON.stringify({ description: "A great tribe" }),
  admins: ["0x..."],
  joinType: JoinType.Public,
  entryFee: 0,
  nftRequirements: []
});

console.log(`Tribe created with ID: ${result.tribeId}`);
```

### Using the React Hook

```typescript
import { useTribeContract } from '../hooks/useTribeContract';

function MyComponent() {
  const { createTribe, isLoading, error, JoinType } = useTribeContract();

  const handleCreateTribe = async () => {
    try {
      const result = await createTribe({
        name: "My Tribe",
        metadata: JSON.stringify({ description: "A great tribe" }),
        admins: ["0x..."],
        joinType: JoinType.Public,
        entryFee: 0,
        nftRequirements: []
      });
      console.log(`Tribe created: ${result.tribeId}`);
    } catch (error) {
      console.error('Failed to create tribe:', error);
    }
  };

  return (
    <button onClick={handleCreateTribe} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Tribe'}
    </button>
  );
}
```

## API Reference

### Core Methods

#### `initialize(): Promise<void>`
Initialize the contract service. Must be called before using other methods.

#### `createTribe(params: CreateTribeParams): Promise<CreateTribeResult>`
Create a new tribe on the blockchain.

**Parameters:**
- `name`: Tribe name
- `metadata`: JSON stringified metadata
- `admins`: Array of admin addresses
- `joinType`: Join type (0: Public, 1: InviteOnly, 2: Whitelist, 3: NFTGated)
- `entryFee`: Entry fee in wei
- `nftRequirements`: Array of NFT requirements

**Returns:**
- `tribeId`: The created tribe's ID
- `transactionHash`: Transaction hash

#### `joinTribe(tribeId: number): Promise<string>`
Join a public tribe.

#### `joinTribeWithCode(tribeId: number, inviteCode: string): Promise<string>`
Join a tribe using an invite code.

#### `requestToJoinTribe(tribeId: number, entryFee?: number): Promise<string>`
Request to join a private tribe (may require approval).

### Query Methods

#### `getTribeDetails(tribeId: number): Promise<any>`
Get comprehensive tribe details.

#### `getTribeExists(tribeId: number): Promise<boolean>`
Check if a tribe exists.

#### `getUserTribes(userAddress: string): Promise<number[]>`
Get all tribes a user is a member of.

#### `isMember(tribeId: number, memberAddress: string): Promise<boolean>`
Check if an address is a member of a tribe.

#### `getMemberCount(tribeId: number): Promise<number>`
Get the total member count of a tribe.

### Admin Methods

#### `approveMember(tribeId: number, memberAddress: string): Promise<string>`
Approve a pending member request.

#### `rejectMember(tribeId: number, memberAddress: string): Promise<string>`
Reject a pending member request.

#### `banMember(tribeId: number, memberAddress: string): Promise<string>`
Ban a member from the tribe.

### Invite Code Management

#### `createInviteCode(tribeId: number, code: string, maxUses: number, expiryTime: number): Promise<string>`
Create an invite code for a tribe.

#### `getInviteCodeStatus(tribeId: number, code: string): Promise<{valid: boolean, remainingUses: number}>`
Check the status of an invite code.

#### `revokeInviteCode(tribeId: number, code: string): Promise<string>`
Revoke an invite code.

### Tribe Management

#### `updateTribe(tribeId: number, newMetadata: string, updatedWhitelist: string[]): Promise<string>`
Update tribe metadata and whitelist.

#### `updateTribeConfig(tribeId: number, joinType: number, entryFee: number, nftRequirements: NFTRequirement[]): Promise<string>`
Update tribe configuration.

### Merge Operations

#### `requestMerge(sourceTribeId: number, targetTribeId: number): Promise<string>`
Request to merge two tribes.

#### `approveMerge(mergeRequestId: number): Promise<string>`
Approve a merge request.

#### `cancelMerge(mergeRequestId: number): Promise<string>`
Cancel a merge request.

#### `executeMerge(mergeRequestId: number): Promise<string>`
Execute an approved merge.

## Enums

### JoinType
```typescript
enum JoinType {
  Public = 0,      // Anyone can join
  InviteOnly = 1,  // Requires invite code
  Whitelist = 2,   // Admin approval required
  NFTGated = 3     // Requires specific NFTs
}
```

### NFTType
```typescript
enum NFTType {
  ERC721 = 0,   // ERC721 tokens
  ERC1155 = 1,  // ERC1155 tokens
  ERC20 = 2     // ERC20 tokens
}
```

## Types

### CreateTribeParams
```typescript
interface CreateTribeParams {
  name: string;
  metadata: string; // JSON stringified metadata
  admins: string[]; // Array of admin addresses
  joinType: number; // JoinType enum value
  entryFee: number; // Entry fee in wei
  nftRequirements: NFTRequirement[];
}
```

### NFTRequirement
```typescript
interface NFTRequirement {
  nftContract: string;
  nftType: number; // NFTType enum value
  isMandatory: boolean;
  minAmount: number;
  tokenIds: number[];
}
```

### CreateTribeResult
```typescript
interface CreateTribeResult {
  tribeId: number;
  transactionHash: string;
}
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  await tribeContractService.initialize();
  const result = await tribeContractService.createTribe(params);
} catch (error) {
  console.error('Contract error:', error.message);
  // Handle specific error types
  if (error.message.includes('MetaMask')) {
    // Handle MetaMask errors
  } else if (error.message.includes('network')) {
    // Handle network errors
  }
}
```

## Network Support

The service automatically detects the network and uses the appropriate contract address:

- **XDC Mainnet** (Chain ID: 50)
- **XDC Testnet** (Chain ID: 51)

## Integration with Backend

The service is designed to work with the backend API. After successful blockchain operations, you can call the corresponding API endpoints:

```typescript
// 1. Create tribe on blockchain
const contractResult = await tribeContractService.createTribe(contractParams);

// 2. Call backend API with blockchain data
const apiResult = await createTribe({
  ...tribeData,
  tribeId: contractResult.tribeId,
  tribeHash: contractResult.transactionHash
});
```

## Best Practices

1. **Always initialize** the service before use
2. **Handle errors gracefully** with try-catch blocks
3. **Use the React hook** for component integration
4. **Validate parameters** before calling contract methods
5. **Check network connectivity** before operations
6. **Use proper gas estimation** for transactions
7. **Store transaction hashes** for reference

## Examples

### Creating a Public Tribe
```typescript
const params = {
  name: "Public Community",
  metadata: JSON.stringify({
    description: "An open community for everyone",
    category: "general"
  }),
  admins: [userAddress],
  joinType: JoinType.Public,
  entryFee: 0,
  nftRequirements: []
};

const result = await tribeContractService.createTribe(params);
```

### Creating an NFT-Gated Tribe
```typescript
const params = {
  name: "NFT Holders Only",
  metadata: JSON.stringify({
    description: "Exclusive community for NFT holders"
  }),
  admins: [userAddress],
  joinType: JoinType.NFTGated,
  entryFee: 0,
  nftRequirements: [{
    nftContract: "0x...",
    nftType: NFTType.ERC721,
    isMandatory: true,
    minAmount: 1,
    tokenIds: [1, 2, 3]
  }]
};

const result = await tribeContractService.createTribe(params);
```

### Creating Invite Codes
```typescript
const expiryTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
await tribeContractService.createInviteCode(tribeId, "WELCOME2024", 10, expiryTime);
```

This service provides a complete solution for tribe management on the blockchain with a clean, type-safe API. 