import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: string, decimals = 18): string {
  if (!balance) return "0";
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return num.toFixed(4);
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
}

export function getNetworkName(chainId: number): string {
  const networks = {
    1: "Ethereum",
    50: "XDC Network",
    137: "Polygon",
    56: "BNB Smart Chain",
  };
  return networks[chainId as keyof typeof networks] || `Chain ${chainId}`;
}

export function formatCompactNumber(num: number): string {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function isDateInFuture(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now();
}

export function formatCurrency(amount: number | string, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}