import { AppError } from './errors.js';

interface Participant {
  id: string;
  name: string;
}

interface Exclusion {
  participantA: string;
  participantB: string;
}

interface Assignment {
  giverId: string;
  receiverId: string;
}

/**
 * Validates that a valid assignment is possible given the exclusions
 */
export function validateExclusions(
  participants: Participant[],
  exclusions: Exclusion[]
): { valid: boolean; reason?: string } {
  if (participants.length < 2) {
    return { valid: false, reason: 'Need at least 2 participants' };
  }

  // Build exclusion map
  const exclusionMap = new Map<string, Set<string>>();

  for (const p of participants) {
    exclusionMap.set(p.id, new Set([p.id])); // Can't give to self
  }

  for (const exclusion of exclusions) {
    exclusionMap.get(exclusion.participantA)?.add(exclusion.participantB);
    exclusionMap.get(exclusion.participantB)?.add(exclusion.participantA);
  }

  // Check if any participant has too many exclusions
  for (const [participantId, excluded] of exclusionMap) {
    const possibleReceivers = participants.length - excluded.size;
    if (possibleReceivers < 1) {
      const participant = participants.find(p => p.id === participantId);
      return {
        valid: false,
        reason: `${participant?.name || 'A participant'} has too many exclusions and cannot be assigned to anyone`,
      };
    }
  }

  // Try to find a valid assignment using backtracking
  const canAssign = tryAssignment(participants, exclusionMap);

  if (!canAssign) {
    return {
      valid: false,
      reason: 'The exclusion rules make it impossible to create valid assignments for everyone',
    };
  }

  return { valid: true };
}

/**
 * Attempts to find a valid assignment using backtracking
 */
function tryAssignment(
  participants: Participant[],
  exclusionMap: Map<string, Set<string>>
): boolean {
  const n = participants.length;
  const assignment: number[] = new Array(n).fill(-1);
  const used: boolean[] = new Array(n).fill(false);

  function backtrack(giverIndex: number): boolean {
    if (giverIndex === n) {
      return true; // All assigned
    }

    const giver = participants[giverIndex];
    const excluded = exclusionMap.get(giver!.id) || new Set();

    for (let receiverIndex = 0; receiverIndex < n; receiverIndex++) {
      const receiver = participants[receiverIndex];

      if (used[receiverIndex]) continue;
      if (excluded.has(receiver!.id)) continue;

      assignment[giverIndex] = receiverIndex;
      used[receiverIndex] = true;

      if (backtrack(giverIndex + 1)) {
        return true;
      }

      assignment[giverIndex] = -1;
      used[receiverIndex] = false;
    }

    return false;
  }

  return backtrack(0);
}

/**
 * Draw names for Secret Santa exchange
 * Uses a randomized derangement algorithm with exclusion constraints
 */
export function drawNames(
  participants: Participant[],
  exclusions: Exclusion[]
): Assignment[] {
  // First validate
  const validation = validateExclusions(participants, exclusions);
  if (!validation.valid) {
    throw AppError.badRequest(validation.reason || 'Invalid exclusions');
  }

  // Build exclusion map
  const exclusionMap = new Map<string, Set<string>>();

  for (const p of participants) {
    exclusionMap.set(p.id, new Set([p.id])); // Can't give to self
  }

  for (const exclusion of exclusions) {
    exclusionMap.get(exclusion.participantA)?.add(exclusion.participantB);
    exclusionMap.get(exclusion.participantB)?.add(exclusion.participantA);
  }

  // Try multiple times with random shuffling
  const maxAttempts = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    const assignments = tryRandomAssignment(shuffled, exclusionMap);
    if (assignments) {
      return assignments;
    }
  }

  // Fallback to deterministic backtracking
  const assignments = deterministicAssignment(participants, exclusionMap);
  if (assignments) {
    return assignments;
  }

  throw AppError.internal('Failed to generate valid assignments');
}

/**
 * Try to create assignments with random assignment
 */
function tryRandomAssignment(
  participants: Participant[],
  exclusionMap: Map<string, Set<string>>
): Assignment[] | null {
  const n = participants.length;
  const available = [...participants];
  const assignments: Assignment[] = [];

  for (const giver of participants) {
    const excluded = exclusionMap.get(giver.id) || new Set();

    // Find valid receivers
    const validReceivers = available.filter(r => !excluded.has(r.id));

    if (validReceivers.length === 0) {
      return null; // Failed
    }

    // Pick random receiver
    const receiverIndex = Math.floor(Math.random() * validReceivers.length);
    const receiver = validReceivers[receiverIndex];

    if (!receiver) return null;

    assignments.push({
      giverId: giver.id,
      receiverId: receiver.id,
    });

    // Remove receiver from available
    const availableIndex = available.findIndex(p => p.id === receiver.id);
    if (availableIndex >= 0) {
      available.splice(availableIndex, 1);
    }
  }

  return assignments;
}

/**
 * Deterministic backtracking assignment
 */
function deterministicAssignment(
  participants: Participant[],
  exclusionMap: Map<string, Set<string>>
): Assignment[] | null {
  const n = participants.length;
  const assignment: number[] = new Array(n).fill(-1);
  const used: boolean[] = new Array(n).fill(false);

  function backtrack(giverIndex: number): boolean {
    if (giverIndex === n) {
      return true;
    }

    const giver = participants[giverIndex];
    if (!giver) return false;

    const excluded = exclusionMap.get(giver.id) || new Set();

    // Randomize receiver order for variety
    const receiverIndices = Array.from({ length: n }, (_, i) => i)
      .sort(() => Math.random() - 0.5);

    for (const receiverIndex of receiverIndices) {
      const receiver = participants[receiverIndex];
      if (!receiver) continue;

      if (used[receiverIndex]) continue;
      if (excluded.has(receiver.id)) continue;

      assignment[giverIndex] = receiverIndex;
      used[receiverIndex] = true;

      if (backtrack(giverIndex + 1)) {
        return true;
      }

      assignment[giverIndex] = -1;
      used[receiverIndex] = false;
    }

    return false;
  }

  if (!backtrack(0)) {
    return null;
  }

  return participants.map((giver, giverIndex) => ({
    giverId: giver.id,
    receiverId: participants[assignment[giverIndex]!]!.id,
  }));
}
