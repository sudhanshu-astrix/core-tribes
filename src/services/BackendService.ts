import { getToken } from '../utlils/utliFunctions';
import axios from 'axios';

// const TRIBES_BACKEND_URL="http://localhost:8003";
// const UPLOADER_URI="http://localhost:8002";
const TRIBES_BACKEND_URL="https://tribes-backend-hdgxhahaawgkdree.centralindia-01.azurewebsites.net"
const UPLOADER_URI="https://tribes-upload-gdfra4fkdmgjhugt.centralindia-01.azurewebsites.net"

export const config = () => {
  let token = getToken("authToken");
  let referredDomain = getToken("referred-domain");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "referred-domain": referredDomain,
      "ngrok-skip-browser-warning": "69420",
    },
  };
};
export const getProfileByAddress = async (address: string) => {
  try{
    const {data} = await axios.get(`${TRIBES_BACKEND_URL}/profile/address/${address}`);
    if (data?.success){
      return data;
    }else {
      return false;
    }
  }catch(err: unknown){
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}

interface CreateProfileResponse {
  success: boolean;
  token?: string;
  user?: any; // User data from backend
  message?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  user?: any; // Updated user data from backend
  message?: string;
}

interface CreateTribeResponse {
  success: boolean;
  tribe?: any; // Tribe data from backend
  message?: string;
}

export const createProfile = async (profileData: {
  username: string;
  displayName: string;
  address: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  isVerified: string;
  nftTokenId: number;
  profileHash: string;
}): Promise<CreateProfileResponse> => {
  try {
    const { data } = await axios.post(
      `${TRIBES_BACKEND_URL}/profile/create`,
      profileData,
      config()
    );
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}

export const createTribe = async (tribeData: {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  logo: string;
  banner: string;
  guidelines: string;
  tags: string[];
  creatorAddress: string;
  tribeId: number;
  tribeHash: string;
  joinType: number;
  nftRequirements: Array<{
    nftContract: string;
    nftType: number;
    isMandatory: boolean;
    minAmount: number;
    tokenIds: number[];
  }>;
}): Promise<CreateTribeResponse> => {
  try {
    const { data } = await axios.post(
      `${TRIBES_BACKEND_URL}/tribe/create`,
      tribeData,
    );
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}

export const uploadFiles = async (
  formdata: any,
  uploadType: string,
  folderName: string | null
) => {
  try {
    const header = config();
    const { data } = await axios.post(
      `${UPLOADER_URI}/upload/${uploadType}`,
      formdata,
      header
    );
    return data;
  } catch (err) {
    return err;
  }
};

export const getUserPointsByAddress = async (address: string) => {
  try{
    const {data} = await axios.get(`${TRIBES_BACKEND_URL}/profile/points-logs/${address}`);
    return data;
  }catch(err){
    return err;
  }
}

export const cryptoExchangeRate = async (token: string) => {
  try{
    const {data} = await axios.get(`https://api.beta.fastforex.io/fetch-one?from=${token}&to=USD`, {
      headers: {
        "Authorization": `Bearer 5603ac484c-415e324f69-szew6e`
      }
    })
    console.log(data);
    return data;
  }catch(err: any){
    throw new Error(err?.message);
  }
}

export const updateProfile = async (profileData: {
  username: string;
  displayName: string;
  address: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  nftTokenId: number;
  profileHash: string;
}, userId: string): Promise<UpdateProfileResponse> => {
  try {
    const { data } = await axios.patch(
      `${TRIBES_BACKEND_URL}/profile/update/${userId}`,
      profileData,
      config()
    );
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}
