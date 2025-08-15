import { ethers } from 'ethers';
import ContentManagerABI from '../abis/ContentManager.json';
import { contractsConfig } from '../config/contracts.config';
import { networksConfig } from '../config/networks.config';

export enum PostType {
  TEXT = 0,
  MEDIA = 1,
  POLL = 2,
  QUIZ = 3,
  COLLECTIBLE_ANNOUNCEMENT = 4
}

export interface Post {
  author: string;
  contentURI: string;
  timestamp: number;
  isActive: boolean;
  postType: PostType;
}

export interface PollDetails {
  postId: number;
  tribeId?: number; // Optional for backward compatibility
  options: string[];
  voteCounts: number[];
  votersPerOption: string[][];
  endTime: number;
  isActive: boolean;
  creator: string;
}

export interface QuizParticipant {
  participant: string;
  score: number;
  completed: boolean;
}

export interface QuizDetails {
  postId: number;
  tribeId?: number; // Optional for backward compatibility
  questions: string[];
  answerHashes: string[];
  pointsPerQuestion: number;
  endTime: number;
  isActive: boolean;
  creator: string;
  participants: QuizParticipant[];
}

export interface PollOption {
  text: string;
  image?: string;
  type: 'text' | 'image';
}

export interface QuizQuestion {
  question: string;
  answer: string;
}

class ContentManagerService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const network = await this.provider.getNetwork();
      const networkConfig = Object.values(networksConfig).find(
        config => config.chainId === Number(network.chainId)
      );

      if (!networkConfig) {
        throw new Error(`Unsupported network: ${network.chainId}`);
      }

      const contractAddress = contractsConfig.xdc.ContentManager;
      this.contract = new ethers.Contract(
        contractAddress,
        ContentManagerABI.abi,
        this.signer
      );

      console.log('ContentManager service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ContentManager service:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.contract || !this.signer) {
      throw new Error('ContentManager service not initialized. Call initialize() first.');
    }
  }

  // Create a new poll
  async createPoll(
    tribeId: number,
    contentURI: string,
    options: PollOption[],
    duration: number
  ): Promise<number> {
    this.ensureInitialized();

    try {
      // Convert PollOption[] to string[] for contract
      const optionStrings = options.map(option => 
        option.type === 'image' ? `${option.text}|${option.image}` : option.text
      );

      const tx = await this.contract!.createPoll(
        tribeId,
        contentURI,
        optionStrings,
        duration
      );

      const receipt = await tx.wait();
      
      // Find the PostCreated event
      const postCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'PostCreated';
        } catch {
          return false;
        }
      });

      if (postCreatedEvent) {
        const parsedLog = this.contract!.interface.parseLog(postCreatedEvent);
        if (parsedLog) {
          return parsedLog.args.postId;
        }
      }
      
      throw new Error('PostCreated event not found in transaction receipt');
    } catch (error) {
      console.error('Failed to create poll:', error);
      throw error;
    }
  }

  // Create a new quiz
  async createQuiz(
    tribeId: number,
    contentURI: string,
    questions: QuizQuestion[],
    pointsPerQuestion: number,
    duration: number
  ): Promise<number> {
    this.ensureInitialized();

    try {
      const questionStrings = questions.map(q => q.question);
      const answerHashes = questions.map(q => 
        ethers.keccak256(ethers.toUtf8Bytes(q.answer))
      );

      const tx = await this.contract!.createQuiz(
        tribeId,
        contentURI,
        questionStrings,
        answerHashes,
        pointsPerQuestion,
        duration
      );

      const receipt = await tx.wait();
      
      // Find the PostCreated event
      const postCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'PostCreated';
        } catch {
          return false;
        }
      });

      if (postCreatedEvent) {
        const parsedLog = this.contract!.interface.parseLog(postCreatedEvent);
        if (parsedLog) {
          return parsedLog.args.postId;
        }
      }
      
      throw new Error('PostCreated event not found in transaction receipt');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw error;
    }
  }

  // Submit poll vote
  async submitPollVote(tribeId: number, postId: number, optionIndex: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.submitPollVote(tribeId, postId, optionIndex);
      await tx.wait();
    } catch (error) {
      console.error('Failed to submit poll vote:', error);
      throw error;
    }
  }

  // Submit quiz answers
  async submitQuizAnswers(tribeId: number, postId: number, answers: string[]): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.submitQuizAnswers(tribeId, postId, answers);
      await tx.wait();
    } catch (error) {
      console.error('Failed to submit quiz answers:', error);
      throw error;
    }
  }

  // Get poll options
  async getPollOptions(postId: number): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getPollOptions(postId);
    } catch (error) {
      console.error('Failed to get poll options:', error);
      return [];
    }
  }

  // Get poll votes for all options
  async getAllPollVotes(postId: number): Promise<number[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getAllPollVotes(postId);
    } catch (error) {
      console.error('Failed to get poll votes:', error);
      return [];
    }
  }

  // Get quiz questions
  async getQuizQuestions(postId: number): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getQuizQuestions(postId);
    } catch (error) {
      console.error('Failed to get quiz questions:', error);
      return [];
    }
  }

  // Get quiz result for a user
  async getQuizResult(postId: number, user: string): Promise<{ score: number; completed: boolean }> {
    this.ensureInitialized();

    try {
      const result = await this.contract!.getQuizResult(postId, user);
      return {
        score: Number(result.score),
        completed: result.completed
      };
    } catch (error) {
      console.error('Failed to get quiz result:', error);
      return { score: 0, completed: false };
    }
  }

  // Get quiz participants
  async getQuizParticipants(postId: number): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await this.contract!.getQuizParticipants(postId);
    } catch (error) {
      console.error('Failed to get quiz participants:', error);
      return [];
    }
  }

  // Get tribe content (polls and quizzes)
  async getTribeContent(tribeId: number): Promise<{ pollPostIds: number[]; quizPostIds: number[] }> {
    this.ensureInitialized();

    try {
      const result = await this.contract!.getTribeContent(tribeId);
      return {
        pollPostIds: result.pollPostIds.map((id: any) => Number(id)),
        quizPostIds: result.quizPostIds.map((id: any) => Number(id))
      };
    } catch (error) {
      console.error('Failed to get tribe content:', error);
      return { pollPostIds: [], quizPostIds: [] };
    }
  }

  // Get detailed poll information for a tribe
  async getTribePollDetails(tribeId: number): Promise<PollDetails[]> {
    this.ensureInitialized();

    try {
      const pollDetails = await this.contract!.getTribePollDetails(tribeId);
      return pollDetails.map((poll: any) => ({
        postId: Number(poll.postId),
        tribeId: tribeId, // Include the tribe ID
        options: poll.options,
        voteCounts: poll.voteCounts.map((count: any) => Number(count)),
        votersPerOption: poll.votersPerOption,
        endTime: Number(poll.endTime),
        isActive: poll.isActive,
        creator: poll.creator
      }));
    } catch (error) {
      console.error('Failed to get tribe poll details:', error);
      return [];
    }
  }

  // Get detailed quiz information for a tribe
  async getTribeQuizDetails(tribeId: number): Promise<QuizDetails[]> {
    this.ensureInitialized();

    try {
      const quizDetails = await this.contract!.getTribeQuizDetails(tribeId);
      return quizDetails.map((quiz: any) => ({
        postId: Number(quiz.postId),
        tribeId: tribeId, // Include the tribe ID
        questions: quiz.questions,
        answerHashes: quiz.answerHashes,
        pointsPerQuestion: Number(quiz.pointsPerQuestion),
        endTime: Number(quiz.endTime),
        isActive: quiz.isActive,
        creator: quiz.creator,
        participants: quiz.participants.map((participant: any) => ({
          participant: participant.participant,
          score: Number(participant.score),
          completed: participant.completed
        }))
      }));
    } catch (error) {
      console.error('Failed to get tribe quiz details:', error);
      return [];
    }
  }

  // Get poll creator
  async getPollCreator(postId: number): Promise<string> {
    this.ensureInitialized();

    try {
      return await this.contract!.getPollCreator(postId);
    } catch (error) {
      console.error('Failed to get poll creator:', error);
      return '';
    }
  }

  // Get quiz creator
  async getQuizCreator(postId: number): Promise<string> {
    this.ensureInitialized();

    try {
      return await this.contract!.getQuizCreator(postId);
    } catch (error) {
      console.error('Failed to get quiz creator:', error);
      return '';
    }
  }

  // Check if user has voted in a poll
  async hasVotedInPoll(postId: number, user: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      // This would need to be implemented in the contract
      // For now, we'll check if the user is in any of the votersPerOption arrays
      const pollDetails = await this.getTribePollDetails(0); // We'll need to find the tribe ID
      const poll = pollDetails.find(p => p.postId === postId);
      if (poll) {
        return poll.votersPerOption.some(voters => voters.includes(user));
      }
      return false;
    } catch (error) {
      console.error('Failed to check if user has voted:', error);
      return false;
    }
  }

  // Delete a post
  async deletePost(tribeId: number, postId: number): Promise<void> {
    this.ensureInitialized();

    try {
      const tx = await this.contract!.deletePost(tribeId, postId);
      await tx.wait();
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }
}

export const contentManagerService = new ContentManagerService(); 