export const PROFILE_ID_KEY = "workout-profile-id";

export function getStoredProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROFILE_ID_KEY);
}

export function setStoredProfileId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_ID_KEY, id);
}

export function clearStoredProfileId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_ID_KEY);
}
