const useSwipe: UseFunction = (node, { onSwipe } = {}) => {
  let startX;
  let startY;
  let startTime;
  let endX;
  let endY;
  let endTime;

  const checkSwipe = () => {
    const dX = startX - endX;
    const absX = Math.abs(dX);
    const dY = startY - endY;
    const absY = Math.abs(dY);
    const dTime = endTime - startTime;

    if (absY < absX && absX > 100 && dTime < 300) {
      onSwipe(dX < 0 ? -1 : 1);
    }

    startX = startY = startTime = endX = endY = endTime = null;
  };

  const onStart = (e: TouchEvent) => {
    const { touches } = e;

    if (touches.length > 1) {
      return;
    }

    const touch = touches[0];
    startX = touch.pageX;
    startY = touch.pageY;
    startTime = Date.now();
  };

  const onEnd = (e: TouchEvent) => {
    if (!startX) {
      return;
    }

    const { changedTouches } = e;
    const touch = changedTouches[0];
    endX = touch.pageX;
    endY = touch.pageY;
    endTime = Date.now();
    checkSwipe();
  };

  node.addEventListener('touchstart', onStart);
  node.addEventListener('touchend', onEnd);

  return {
    destroy() {
      node.removeEventListener('touchstart', onStart);
      node.removeEventListener('touchend', onEnd);
    }
  }
};

export default useSwipe;
