import { RootState, store } from '../store';

export function getToken(): string | undefined {
  try {
    const state: RootState = store.getState();
    return state.auth?.token;
  } catch (error) {
    console.error('Error getting token:', error);
    return undefined;
  }
}
