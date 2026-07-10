import { Ref, ref } from "vue";

//barcode inputs
export type InputSource = 'keyboard' | 'barcode'

export interface InputEventInfo {
  source: InputSource
  value: string
}

const globalListeners: Ref<Set<() => void>> = ref(new Set())

export function useAsyncBarcodeReader() {

  const inputThresholdMs = 100;
  const totalDurationThreshold = 200;

  let inputBuffer = '';
  let inputStartTime = 0;
  let timer: number | null = null;
  let isActive = true;

  const listeners: ((event: InputEventInfo) => void)[] = [];

  function reset() {
    inputBuffer = '';
    inputStartTime = 0;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function handleKeydown(e: KeyboardEvent) {

    if (!isActive) return;

    const now = Date.now();

    if (!inputStartTime) {
      inputStartTime = now;
    }

    if (e.key === 'Enter') {
      const duration = now - inputStartTime;

      if (duration < totalDurationThreshold && inputBuffer.length > 0) {
        e.preventDefault()
        listeners.forEach(fn => fn({ source: 'barcode', value: inputBuffer }));
      }

      reset();
      return;
    }

    if (e.key.length === 1) {
      inputBuffer += e.key;
    }

    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      const duration = Date.now() - inputStartTime;

      if (duration < totalDurationThreshold && inputBuffer.length > 0) {
        listeners.forEach(fn => fn({ source: 'barcode', value: inputBuffer }));
      }

      reset();
    }, inputThresholdMs * 2);
  }

  window.addEventListener('keydown', handleKeydown);

  // Manual cleanup for this instance
  function cleanup() {
    if (!isActive) return;
    isActive = false;
    reset();
    window.removeEventListener('keydown', handleKeydown);
    globalListeners.value.delete(cleanup);
  }

  // Add to global set for cleanupAll()
  globalListeners.value.add(cleanup);

  async function* generator(): AsyncGenerator<InputEventInfo> {
    try {
      while (isActive) {
        const value: InputEventInfo = await new Promise(resolve => {
          const handler = (event: InputEventInfo) => {
            listeners.splice(listeners.indexOf(handler), 1);
            resolve(event);
          };
          listeners.push(handler);
        });

        yield value;
      }
    } finally {
      cleanup(); // automatic cleanup on exit
    }
  }

  return {
    generator: generator(),
    cleanAll: useCleanupAllBarcodeListeners,
    cleanup,
  };
}

// ✅ Global cleanup function
function useCleanupAllBarcodeListeners() {
  for (const cleanup of globalListeners.value) {
    cleanup()
  }
  globalListeners.value.clear();
}