import { Alert, Platform } from 'react-native';

// Two-button confirmation. React Native Web's Alert.alert is a no-op, which
// made every "Delete?" / "Log out?" prompt silently do nothing in the
// browser, so the web build falls back to the browser's own confirm dialog.
export const confirmAction = ({ title, message, confirmLabel = 'OK', destructive = false, onConfirm }) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm([title, message].filter(Boolean).join('\n\n'))) onConfirm?.();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

// One-button notice that also works on web.
export const showNotice = (title, message) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert([title, message].filter(Boolean).join('\n\n'));
    return;
  }
  Alert.alert(title, message);
};
