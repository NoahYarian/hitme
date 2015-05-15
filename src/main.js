var API = "http://deckofcardsapi.com/api/",
  $dealer1 = $(".dealer1"),
  $dealer2 = $(".dealer2"),
  $player1 = $(".player1"),
  $player2 = $(".player2"),
  deckId,
  $getDeck = $(".getDeck"),
  $dealCards = $(".dealCards"),
  $hit = $(".hit"),
  $stay = $(".stay"),
  dealerHand = [],
  playerHand = [];

$getDeck.click(sixDecks);
$dealCards.click(dealFour);


function sixDecks() {
  var shuffleURL = API + "shuffle/?deck_count=6";
  console.log("shuffleURL = " + shuffleURL);
  getJSON(shuffleURL, function(data) {
    deckId = data.deck_id;
    console.log(deckId);
  });
};

function dealFour() {
  var draw4URL = API + "/draw/" + deckId + "/?count=4";
  console.log("draw4URL = " + draw4URL);
  getJSON(draw4URL, function(data) {
    $dealer1.attr("src", data.cards[0].image);
    $player1.attr("src", data.cards[1].image);
    $dealer2.attr("src", data.cards[2].image);
    $player2.attr("src", data.cards[3].image);
    dealerHand.push(data.cards[0].value + " " + data.cards[0].suit);
    playerHand.push(data.cards[1].value + " " + data.cards[1].suit);
    dealerHand.push(data.cards[2].value + " " + data.cards[2].suit);
    playerHand.push(data.cards[3].value + " " + data.cards[3].suit);
  });
}

function hit() {


// Scott's cross-origin fix
function getJSON(url, cb) {
  var JSONP_PROXY = 'https://jsonp.afeld.me/?url='
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', JSONP_PROXY + url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    }
  };
  request.send();
}
