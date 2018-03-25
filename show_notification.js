'use strict';

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
});
