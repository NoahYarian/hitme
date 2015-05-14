var API = "http://deckofcardsapi.com/api/";

function getDeck(decks) {
  var shuffleURL = API + "shuffle/?deck_count=" + decks;
  $.get(shuffleURL, dealTwo);
}


