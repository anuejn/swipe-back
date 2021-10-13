// This script is responsible for implementing the functionality of
// going back/forward in the navigation history when the user scrolls
// the page left/right using the touchpad.
// Each horizontal scroll event is intercepted and if the total motion
// within a given time is greather than a threshold, the code triggers
// a history.back() or .forward()
// Settings are handled by the background script bg.js.

async function main() {
  let lastContainer = null;
  let lastContainerPosition = 0;
  const containerMoved = element => {
    const scroller = getScrollableParent(element);
    const toReturn = (lastContainer === scroller) && (lastContainerPosition !== scroller.scrollLeft);

    lastContainer = scroller;
    lastContainerPosition = scroller.scrollLeft;
    return toReturn;
  };

  let acc = 0;
  let dir = 0;
  let timeout = null;
  window.addEventListener('wheel', async e => {
    if (e.deltaY || !e.deltaX) {
      acc = -100;
      return;
    };

    if (containerMoved(e.target)) {
      acc = -100;
      return;
    }

    acc += Math.abs(e.deltaX);
    const thisDir = Math.sign(e.deltaX);
    if (dir != thisDir) {
      acc = 0;
      setTransform(0, true)
      dir = thisDir;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      acc = 0
      setTransform(0, true)
    }, 250);

    let thresholdMove = 100;

    if (acc >= thresholdMove) {
      setTransform((acc - thresholdMove) / (window.innerWidth - thresholdMove) * 100 * -dir)
    }

    if (acc >= window.innerWidth * 0.75) {
      if (dir > 0) {
        window.history.forward()
      } else {
        window.history.back()
      }
    }
  });
}

main();


function setTransform(value, slow = false) {
  if (slow) {
    document.documentElement.style.transition = 'transform 0.5s'
  } else {
    document.documentElement.style.transition = ''
  }
  document.documentElement.style.transform = `translateX(${value}%)`
  document.documentElement.style.overflowX = 'hidden';
}

function isScrollable(element) {
  const hasScrollableContent = element.scrollWidth > element.clientWidth;

  const overflowX = window.getComputedStyle(element).overflowX;
  const isScrollable = overflowX !== 'visible' && overflowX !== 'hidden';

  return hasScrollableContent && isScrollable && element.clientHeight !== 0;
};
function getScrollableParent(element) {
  if (!element || element === document.documentElement || isScrollable(element)) {
    return element;
  } else {
    return getScrollableParent(element.parentNode);
  }
};