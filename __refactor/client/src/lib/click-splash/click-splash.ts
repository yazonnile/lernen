import './click-splash.css';

const clickSplash: UseFunction = buttonNode => {
  const onMouseDown = (e: MouseEvent) => {
    const splash = document.createElement('span');
    splash.className = 'splash';

    const rect = buttonNode.getBoundingClientRect();
    splash.style.cssText = `left: ${e.pageX - rect.left - window.scrollX}px; top: ${e.pageY - rect.top - window.scrollY}px`;
    setTimeout(() => splash.parentNode && splash.parentNode.removeChild(splash), 750);
    buttonNode.appendChild(splash);
  };

  buttonNode.addEventListener('mousedown', onMouseDown);

  return {
    destroy() {
      buttonNode.removeEventListener('mousedown', onMouseDown);
    }
  }
};

export default clickSplash;
