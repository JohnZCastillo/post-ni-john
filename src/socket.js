import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_WEB_AGENT + '/ws/Cow';

export const socket = io(URL, {
  autoConnect: false
});