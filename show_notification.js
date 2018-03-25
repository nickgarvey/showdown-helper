'use strict';

chrome.runtime.onMessage.addListener((request) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    message: request.message,
    title: request.title
  });
});
