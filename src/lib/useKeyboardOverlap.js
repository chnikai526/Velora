import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

// How many points of the view behind `viewRef` the software keyboard covers.
// Returns [overlap, remeasure] — pass `remeasure` as that view's onLayout.
//
// KeyboardAvoidingView measures its frame relative to its parent, which is
// wrong inside an iOS page sheet (the sheet starts ~50pt below the top of the
// screen, so the pinned Save button ended up half under the keyboard), and on
// Android it depended on the window resizing, which edge-to-edge no longer
// does. Comparing the view's real on-screen bottom with the keyboard's top is
// correct in both cases: if the window did resize, the overlap is simply 0.
export default function useKeyboardOverlap(viewRef) {
  const keyboardTop = useRef(null);
  const [overlap, setOverlap] = useState(0);

  const remeasure = useCallback(() => {
    const top = keyboardTop.current;
    const node = viewRef.current;
    if (top === null || !node?.measureInWindow) {
      setOverlap(0);
      return;
    }
    node.measureInWindow((_x, y, _width, height) => {
      setOverlap(Math.max(0, Math.round(y + height - top)));
    });
  }, [viewRef]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const animate = (event) => {
      if (Platform.OS === 'ios' && event?.duration) {
        LayoutAnimation.configureNext({ duration: event.duration, update: { type: LayoutAnimation.Types.keyboard } });
      }
    };
    const show = Keyboard.addListener(showEvent, (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      animate(event);
      remeasure();
    });
    const hide = Keyboard.addListener(hideEvent, (event) => {
      keyboardTop.current = null;
      animate(event);
      setOverlap(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [remeasure]);

  // Re-measuring on layout too means a window that resizes after the
  // keyboard event lands corrects the overlap back to 0 instead of padding
  // twice.
  return [overlap, remeasure];
}
