'use strict';

function handle_notification(request) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    message: request.message,
    title: request.title
  });
}

function is_pokemon_tooltip(tooltip_text) {
  return tooltip_text.match(/.*L[0-9]+(.|\n)*Abil.*/) !== null;
}

function handle_tooltip(request) {
  console.log(is_pokemon_tooltip(request.contents), request.contents);
}

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case 'notification':
      handle_notification(request);
      break;
    case 'tooltip':
      handle_tooltip(request);
      break;
  }
});
