'use strict';

const ELEMENT_NODE = 1;

function* yield_added_nodes(mutation_records) {
  for (const mutation_record of mutation_records) {
    if (mutation_record.addedNodes === null) {
      continue;
    }

    for (const node of mutation_record.addedNodes) {
      yield node;
    }
  }
}

// It's difficult to tell if a room tracks a live battle, a replay, or an
// observed battle. This class watchs the room to see if the user is ever
// presented with the option to attack. If so, it's considered a live room, even
// if the battle has now ended.
class LiveBattleDiscoverer {
  constructor(room_div) {
    this.is_live = false;
    (new MutationObserver((records, observer) => {
      for (const node of yield_added_nodes(records)) {
        if (node.nodeName === "DIV" && node.querySelector(".whatdo")) {
          this.is_live = true;
          observer.disconnect();
        }
      }
    })).observe(room_div, {childList: true, subtree: true});
  }

  battleEnd() {
    this.is_live = false;
  }
}

function title_to_url(title) {
  const pokemon = title
    .replace(/ \((active|fainted)\)/, '') // trim any (active), (fainted)
    .replace(/.*\((.*)\)/, "$1"); // whatever is in () is the actual pokemon
  return "https://www.smogon.com/dex/sm/pokemon/" + pokemon;
}

function add_picon_links(room_div) {
  const picons = document.querySelectorAll(".teamicons > .picon");
  for (const picon of picons) {
    if (picon.title === "Not revealed") {
      continue;
    }

    picon.onclick = () => window.open(title_to_url(picon.title));
    picon.style.cursor = "pointer";
  }
}

function show_end_battle_notif(discoverer, mutation_records, observer) {
  for (const node of yield_added_nodes(mutation_records)) {
    if (
      discoverer.is_live &&
      node.innerText.match(/.*won the battle!/)
    ) {
      chrome.runtime.sendMessage(
        {
          'type': 'notification',
          'title': 'Battle complete!',
          'message': node.innerText,
        }
      );
      observer.disconnect();
      discoverer.battleEnd();
      break;
    }
  }
}

function observe_room(room_div) {
  const discoverer = new LiveBattleDiscoverer(room_div);
  (new MutationObserver(() => add_picon_links(room_div)))
      .observe(
        room_div.querySelector('.battle'),
        {childList: true, subtree: true}
      );

  (new MutationObserver(
    (records, observer) => show_end_battle_notif(discoverer, records, observer))
  )
      .observe(
        room_div.querySelector('.battle-log'),
        {childList: true, subtree: true}
      );
}

function add_room_observers(mutation_records) {
  for (const node of yield_added_nodes(mutation_records)) {
    if (node.nodeName === "DIV" && node.id.match(/room-battle-.*/)) {
      observe_room(node);
    }
  }
}

function export_tooltip(tooltip) {
  console.log(tooltip.innerText);
}

function handle_body_update(body_div, mutation_records) {
  for (const node of yield_added_nodes(mutation_records)) {
    if (node.nodeType === ELEMENT_NODE && node.id === "tooltipwrapper") {
      const tooltip = node.querySelector('.tooltip');
      if (tooltip === null) {
        continue;
      }
      export_tooltip(tooltip);
    }
  }
}

// This script is run before the document is created, to make sure all of our
// listeners trigger when the corresponding DOM elements are created.
// So, we listen to the body element being created, and attach once it is.
new MutationObserver((mutation_records, observer) => {
  for (const node of yield_added_nodes(mutation_records)) {
    if (node.nodeName === "BODY") {
      (new MutationObserver(add_room_observers))
        .observe(node, {childList: true});
      (new MutationObserver((records) => handle_body_update(node, records)))
          .observe(node, {childList: true});
      // Once we've started observing the body nothing else to do
      observer.disconnect();
      return;
    }
  }
}).observe(document.documentElement, {childList: true});
