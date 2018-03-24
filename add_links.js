'use strict';

const callback = () => {
  const picons = document.querySelectorAll(".teamicons > .picon");
  for (const picon of picons) {
    if (picon.title === "Not revealed") {
      continue;
    }

    // trim any (active), (fainted), etc. from the end
    const pokemon = picon.title.replace(/\(.*\)/, '');
    const url = "https://www.smogon.com/dex/sm/pokemon/" + pokemon;
    picon.onclick = () => window.open(url);
    picon.style.cursor = "pointer";
  }
};
callback();

// the battle screen is constantly redrawing itself entirely, so keep attaching
// listeners every time it redraws anything
const observer = new MutationObserver(callback);
observer.observe(
  document.querySelector(".inner"),
  {childList: true, subtree: true}
);
