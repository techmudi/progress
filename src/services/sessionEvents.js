let unauthorizedHandler = null;
let unauthorizedNotified = false;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
  unauthorizedNotified = false;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export function notifyUnauthorized(error) {
  if (unauthorizedNotified) return;

  unauthorizedNotified = true;
  unauthorizedHandler?.(error);
}

export function resetUnauthorizedNotification() {
  unauthorizedNotified = false;
}
