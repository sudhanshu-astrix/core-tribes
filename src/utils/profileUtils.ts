import { ProfileData } from '@/services/ProfileContract';

// IPFS Gateway URLs (you can use any IPFS gateway)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

// Default IPFS gateway
const DEFAULT_IPFS_GATEWAY = IPFS_GATEWAYS[0];

/**
 * Convert profile data to metadata JSON format
 */
export function createProfileMetadata(profileData: ProfileData) {
  return {
    name: `${profileData.displayName} (@${profileData.username})`,
    description: profileData.bio || 'No bio provided',
    image: profileData.avatar || '',
    banner_image: profileData.bannerImage || '',
    external_url: `https://tribes.app/profile/${profileData.username}`,
    attributes: [
      {
        trait_type: 'Username',
        value: profileData.username,
      },
      {
        trait_type: 'Display Name',
        value: profileData.displayName,
      },
      {
        trait_type: 'Bio',
        value: profileData.bio || 'No bio',
      },
      {
        trait_type: 'Social Links',
        value: Object.keys(profileData.socialLinks).filter(
          key => profileData.socialLinks[key as keyof typeof profileData.socialLinks]
        ).length,
      },
    ],
    properties: {
      social_links: profileData.socialLinks,
      created_at: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

/**
 * Upload metadata to IPFS
 * Note: This is a placeholder. In a real implementation, you would use IPFS SDK or API
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    // Convert metadata to JSON string
    const metadataJson = JSON.stringify(metadata, null, 2);
    
    // In a real implementation, you would:
    // 1. Use IPFS SDK (like ipfs-http-client) to upload the JSON
    // 2. Or use a service like Pinata, Infura IPFS, or Web3.Storage
    // 3. Return the IPFS hash
    
    // For now, we'll simulate the upload
    console.log('Uploading metadata to IPFS:', metadataJson);
    
    // Simulate IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock IPFS hash (in real implementation, this would be the actual hash)
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('Metadata uploaded to IPFS with hash:', mockHash);
    return mockHash;
  } catch (error) {
    console.error('Failed to upload metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Create metadata URI from IPFS hash
 */
export function createMetadataURI(ipfsHash: string): string {
  return `ipfs://${ipfsHash}`;
}

/**
 * Resolve metadata URI to full URL
 */
export function resolveMetadataURI(metadataURI: string): string {
  if (metadataURI.startsWith('ipfs://')) {
    const hash = metadataURI.replace('ipfs://', '');
    return `${DEFAULT_IPFS_GATEWAY}${hash}`;
  }
  return metadataURI;
}

/**
 * Fetch metadata from URI
 */
export async function fetchMetadata(metadataURI: string): Promise<any> {
  try {
    const url = resolveMetadataURI(metadataURI);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    throw error;
  }
}

/**
 * Validate profile data before creating metadata
 */
export function validateProfileData(profileData: ProfileData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate username
  if (!profileData.username || profileData.username.trim() === '') {
    errors.push('Username is required');
  } else if (profileData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Validate display name
  if (!profileData.displayName || profileData.displayName.trim() === '') {
    errors.push('Display name is required');
  }

  // Validate bio length
  if (profileData.bio && profileData.bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }

  // Validate social links
  const socialLinks = profileData.socialLinks;
  for (const [platform, url] of Object.entries(socialLinks)) {
    if (url && !isValidURL(url)) {
      errors.push(`${platform} URL is invalid`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format profile data for display
 */
export function formatProfileData(metadata: any): ProfileData {
  return {
    username: metadata.attributes?.find((attr: any) => attr.trait_type === 'Username')?.value || '',
    displayName: metadata.attributes?.find((attr: any) => attr.trait_type === 'Display Name')?.value || '',
    bio: metadata.attributes?.find((attr: any) => attr.trait_type === 'Bio')?.value || '',
    avatar: metadata.image || '',
    bannerImage: metadata.banner_image || '',
    socialLinks: metadata.properties?.social_links || {
      github: '',
      twitter: '',
      linkedin: '',
      website: '',
      instagram: '',
      youtube: '',
    },
  };
}

/**
 * Create a complete profile creation workflow
 */
export async function createProfileWorkflow(profileData: ProfileData): Promise<{ metadataURI: string; tokenId?: number }> {
  try {
    // Validate profile data
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
    }

    // Create metadata
    const metadata = createProfileMetadata(profileData);
    console.log('Created metadata:', metadata);

    // Upload to IPFS
    const ipfsHash = await uploadMetadataToIPFS(metadata);
    console.log('Uploaded to IPFS:', ipfsHash);

    // Create metadata URI
    const metadataURI = createMetadataURI(ipfsHash);
    console.log('Created metadata URI:', metadataURI);

    return { metadataURI };
  } catch (error) {
    console.error('Profile creation workflow failed:', error);
    throw error;
  }
}

/**
 * Update profile workflow
 */
export async function updateProfileWorkflow(
  tokenId: number,
  profileData: ProfileData
): Promise<{ metadataURI: string }> {
  try {
    // Validate profile data
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
    }

    // Create updated metadata
    const metadata = createProfileMetadata(profileData);
    console.log('Created updated metadata:', metadata);

    // Upload to IPFS
    const ipfsHash = await uploadMetadataToIPFS(metadata);
    console.log('Uploaded updated metadata to IPFS:', ipfsHash);

    // Create metadata URI
    const metadataURI = createMetadataURI(ipfsHash);
    console.log('Created updated metadata URI:', metadataURI);

    return { metadataURI };
  } catch (error) {
    console.error('Profile update workflow failed:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSGatewayURL(hash: string, gatewayIndex: number = 0): string {
  const gateway = IPFS_GATEWAYS[gatewayIndex] || DEFAULT_IPFS_GATEWAY;
  return `${gateway}${hash}`;
}

/**
 * Try multiple IPFS gateways to fetch content
 */
export async function fetchFromIPFS(hash: string): Promise<any> {
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      const url = getIPFSGatewayURL(hash, i);
      const response = await fetch(url);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${i}:`, error);
      continue;
    }
  }
  
  throw new Error('Failed to fetch from all IPFS gateways');
} 