var API = "http://deckofcardsapi.com/api/";
var deckId;

var $dealCards = $(".dealCards");
var $hit = $(".hit");
var $stay = $(".stay");
var $dealerCard = $(".dealerCard");
var $playerCard = $(".playerCard");
var $checkScore = $(".checkScore");
var $dealer = $(".dealer");
var $player = $(".player");

var dealerHandMax = [];
var playerHandMax = [];
var dealerHandMin = [];
var playerHandMin = [];
var dealerTotalMax;
var playerTotalMax;
var dealerTotalMin;
var playerTotalMin;

var winner;

$dealCards.click(deal);
$hit.click(hit);
$stay.click(stay);
$dealerCard.click(dealerCard);
$playerCard.click(playerCard);
$checkScore.click(checkScore);

function deal() {
  var shuffleURL = API + "shuffle/?deck_count=6";
  console.log("shuffleURL = " + shuffleURL);
  getJSON(shuffleURL, function(data) {
    deckId = data.deck_id;
    console.log("deckId = " + deckId);
    dealerCard();
    playerCard();
    dealerCard();
    playerCard();
  });
}

function hit() {
  console.log("hit");
  playerCard();
  if (!winner && dealerTotalMin < 17) {
    dealerCard();
  }
}

function stay() {
  console.log("stay");
  var dealerTotalFinal = (dealerTotalMax < 22) ? dealerTotalMax : dealerTotalMin;
  var playerTotalFinal = (playerTotalMax < 22) ? playerTotalMax : playerTotalMin;

  if (dealerTotalMin < 17) {
    dealerCard();
  } else {
    winner = (dealerTotalFinal > playerTotalFinal) ? "dealer" : "player";
  }
}

function dealerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $dealer.append(html);

    dealerHandMax.push(convertCardMax(data.cards[0].value));
    dealerTotalMax = getTotal(dealerHandMax);
    console.log("dealerHandMax = " + dealerHandMax);
    console.log("dealerTotalMax = " + dealerTotalMax);

    dealerHandMin.push(convertCardMin(data.cards[0].value));
    dealerTotalMin = getTotal(dealerHandMin);
    console.log("dealerHandMin = " + dealerHandMin);
    console.log("dealerTotalMin = " + dealerTotalMin);

    checkGame();
  });
}

function playerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $player.append(html);

    playerHandMax.push(convertCardMax(data.cards[0].value));
    playerTotalMax = getTotal(playerHandMax);
    console.log("playerHandMax = " + playerHandMax);
    console.log("playerTotalMax = " + playerTotalMax);

    playerHandMin.push(convertCardMin(data.cards[0].value));
    playerTotalMin = getTotal(playerHandMin);
    console.log("playerHandMin = " + playerHandMin);
    console.log("playerTotalMin = " + playerTotalMin);

    checkGame();
  });
}

function convertCardMax(value) {
  if (value === "ACE") {
    return 11;
  } else if (isNaN(value)) {
    return 10;
  } else {
    return Number(value);
  }
}

function convertCardMin(value) {
  if (value === "ACE") {
    return 1;
  } else if (isNaN(value)) {
    return 10;
  } else {
    return Number(value);
  }
}

function getTotal(hand) {
  var total = hand.reduce(function(prev, curr) {
    return prev + curr;
  });
  return total;
}

function checkGame() {
  if (dealerTotalMax === 21 || dealerTotalMin === 21) {
    alert("Dealer has 21");
    winner = "dealer";
  } else if (dealerTotalMin > 21) {
    alert("Dealer busts");
    winner = "player";
  }

  if (playerTotalMax === 21 || playerTotalMin === 21) {
    alert("Player has 21");
    winner = "player";
  } else if (playerTotalMin > 21) {
    alert("Player busts");
    winner = "dealer";
  }

  if (winner) {
    alert("game over");
  }
}

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
