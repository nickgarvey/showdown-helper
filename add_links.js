'use strict';


function add_picon_links(room_div) {
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
}

function show_notification_on_end(room_div, mutation_records) {
  // TODO enable this
  return;
  console.log(is_user_live_battle(room_div));
  for (const record of mutation_records) {
    for (const node of record.addedNodes) {
      if (document.hidden && node.innerText.match(/.*won the battle!/)) {
        if (is_user_live_battle(room_div)) {
          chrome.runtime.sendMessage(
            {'notification': 'Battle complete!'}
          );
        }
      }
    }
  }
}

function observe_room(room_div) {
  (new MutationObserver(() => add_picon_links(room_div)))
      .observe(
        room_div.querySelector('.battle'),
        {childList: true, subtree: true}
      );

  (new MutationObserver(
    (records) => show_notification_on_battle_end(room_div, records))
  )
      .observe(
        room_div.querySelector('.battle-log'),
        {childList: true, subtree: true}
      );
}

function add_room_observers(mutation_records) {
  for (const mutation_record of mutation_records) {
    if (mutation_record.addedNodes === null) {
      continue;
    }

    for (const node of mutation_record.addedNodes) {
      if (node.nodeName === "DIV" && node.id.match(/room-battle-.*/)) {
        observe_room(node);
      }
    }
  }
}

// Returns true if the battle is currently one the user participates in
function is_user_live_battle(room_div) {
  return !room_div.querySelector("button[name='instantReplay']");
}

// This script is run before the document is created, to make sure all of our
// listeners trigger when the corresponding DOM elements are created.
// So, we listen to the body element being created, and attach once it is.
new MutationObserver((mutation_records, observer) => {
  for (const mutation_record of mutation_records) {
    if (mutation_record.addedNodes === null) {
      continue;
    }
    for (const node of mutation_record.addedNodes) {
      if (node.nodeName === "BODY") {
        (new MutationObserver(add_room_observers))
          .observe(node, {childList: true});
        // Once we've started observing the body nothing else to do
        observer.disconnect();
        return;
      }
    }

  }
}).observe(document.documentElement, {childList: true});
