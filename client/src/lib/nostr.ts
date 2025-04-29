import * as nip19 from "nostr-tools/nip19";
import { generateSecretKey, getPublicKey, nip04 } from "nostr-tools";

/**
 * Generates a new Nostr key pair.
 * @returns {Object} An object with `npub` and `nsec` (Bech32-encoded keys).
 */
export function generateKeyPair() {
  // Generate a new secret key (private key)
  const sk = generateSecretKey();
  
  // Encode the secret key to nsec (Bech32 format)
  const nsec = nip19.nsecEncode(sk);
  
  // Derive the public key from the secret key
  const pk = getPublicKey(sk);
  
  // Encode the public key to npub (Bech32 format)
  const npub = nip19.npubEncode(pk);
  
  return { npub, nsec };
}

/**
 * Validates a Nostr key pair (npub and nsec).
 * @param {string} npub - Bech32-encoded public key.
 * @param {string} nsec - Bech32-encoded private key.
 * @returns {boolean} True if the keys match; false otherwise.
 */
export function verifyKeyPair(npub: string, nsec: string): boolean {
  try {
    // Decode private key from Bech32
    const { type: secType, data: secData } = nip19.decode(nsec);
    if (secType !== 'nsec') return false;
    
    // Derive public key from private key
    const derivedPk = getPublicKey(secData);
    
    // Decode public key from Bech32
    const { type: pubType, data: pubData } = nip19.decode(npub);
    if (pubType !== 'npub') return false;
    
    // Check if derived public key matches the provided public key
    return derivedPk === pubData;
  } catch (error) {
    console.error('Error verifying key pair:', error);
    return false;
  }
}

/**
 * Convert hex public key to npub format
 * @param {string} hexPubKey - Hex-encoded public key
 * @returns {string} Bech32-encoded npub
 */
export function hexToNpub(hexPubKey: string): string {
  return nip19.npubEncode(hexPubKey);
}

/**
 * Convert npub to hex format
 * @param {string} npub - Bech32-encoded public key
 * @returns {string} Hex-encoded public key
 */
export function npubToHex(npub: string): string {
  try {
    const { type, data } = nip19.decode(npub);
    if (type !== 'npub') {
      throw new Error('Not a valid npub');
    }
    return data as string;
  } catch (error) {
    console.error('Error converting npub to hex:', error);
    throw error;
  }
}

/**
 * Checks if browser has Nostr extension support (NIP-07)
 * @returns {boolean} True if a Nostr extension is available
 */
export function hasNostrExtension(): boolean {
  return typeof window !== 'undefined' && 'nostr' in window;
}

/**
 * Get public key from Nostr extension (NIP-07)
 * @returns {Promise<string>} Promise that resolves to the npub
 */
export async function getNostrExtensionPublicKey(): Promise<string> {
  if (!hasNostrExtension()) {
    throw new Error('No Nostr extension detected');
  }
  
  try {
    // @ts-ignore - window.nostr is added by the extension
    const pubKey = await window.nostr.getPublicKey();
    return hexToNpub(pubKey);
  } catch (error) {
    console.error('Error getting public key from extension:', error);
    throw error;
  }
}

/**
 * NIP-04 encrypt/decrypt for future usage
 */
export async function encrypt(privkey: string, pubkey: string, text: string): Promise<string> {
  return nip04.encrypt(privkey, pubkey, text);
}

export async function decrypt(privkey: string, pubkey: string, ciphertext: string): Promise<string> {
  return nip04.decrypt(privkey, pubkey, ciphertext);
}
