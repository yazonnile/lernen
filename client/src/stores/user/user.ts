import { writable } from 'svelte/store';

type User = {
  login: string;
  userId: number;
};

export default writable<User | null>(null);
