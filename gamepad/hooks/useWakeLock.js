import { useKeepAwake } from 'expo-keep-awake';

export default function useWakeLock() {
  useKeepAwake();
}