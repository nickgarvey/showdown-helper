'use strict';

chrome.pageAction.onClicked.addListener(function(tab) {
  console.log(tab);
})

chrome.tabs.onUpdated.addListener(function(e) {
  console.log(e);
});
