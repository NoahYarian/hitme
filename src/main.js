var API = "http://deckofcardsapi.com/api/";
var deckId;

//buttons
var $dealCards = $(".dealCards");
var $sameDeckDeal = $(".sameDeckDeal");
var $hit = $(".hit");
var $stay = $(".stay");
var $reset = $(".reset");

//scoreboard divs
var $score = $(".score");
var $count = $(".count");

//card hands
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
var score = 0;
var count = 0;

$dealCards.click(deal);
$sameDeckDeal.click(sameDeckDeal);
$hit.click(hit);
$stay.click(stay);
$reset.click(reset);

// deal a new hand from a new deck
function deal() {
  var shuffleURL = API + "shuffle/?deck_count=6";
  count = 0;
  reset();
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

// deal a new hand from the same deck
function sameDeckDeal() {
    reset();
    dealerCard();
    playerCard();
    dealerCard();
    playerCard();
}

function hit() {
  console.log("hit");
  playerCard();
  if (!winner && dealerTotalMin < 17) {
    dealerCard();
  } else {
    if (dealerTotalMax < 22) {
      console.log("dealer stays at " + dealerTotalMax);
    } else {
      console.log("dealer stays at " + dealerTotalMin);
    }
  }
}

function stay() {
  console.log("stay");
  var dealerTotalFinal = (dealerTotalMax < 22) ? dealerTotalMax : dealerTotalMin;
  var playerTotalFinal = (playerTotalMax < 22) ? playerTotalMax : playerTotalMin;

  if (dealerTotalMin < 17) {
    dealerCard();
  } else {
    dealerTotalFinal >= playerTotalFinal ?
      (winner = "dealer", score -= 1, console.log("dealer's " + dealerTotalFinal + "beats player's " + playerTotalFinal)) :
      (winner = "player", score += 1, console.log("player's " + playerTotalFinal + " beats dealer's " + dealerTotalFinal));
    checkGame();
  }
}

// deal dealer one card
function dealerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $dealer.append(html);

    dealerHandMax.push(convertCardMax(data.cards[0].value));
    dealerTotalMax = getTotal(dealerHandMax);
    dealerHandMin.push(convertCardMin(data.cards[0].value));
    dealerTotalMin = getTotal(dealerHandMin);

    if (dealerTotalMin === dealerTotalMax) {
      console.log("dealer's hand - " + dealerHandMax + " **** dealer is at " + dealerTotalMax);
    } else {
      console.log("dealer's hand - " + dealerHandMax + " or " + dealerHandMin + " **** dealer is at " + dealerTotalMax + " or " + dealerTotalMin);
    }

    whatsTheCount(convertCardMax(data.cards[0].value));
    checkGame();
  });
}

// deal player one card
function playerCard(){
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data) {
    var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
    $player.append(html);

    playerHandMax.push(convertCardMax(data.cards[0].value));
    playerTotalMax = getTotal(playerHandMax);
    playerHandMin.push(convertCardMin(data.cards[0].value));
    playerTotalMin = getTotal(playerHandMin);

    if (playerTotalMin === playerTotalMax) {
      console.log("player's hand - " + playerHandMax + " **** player is at " + playerTotalMax);
    } else {
      console.log("player's hand - " + playerHandMax + " or " + playerHandMin + " **** player is at " + playerTotalMax + " or " + playerTotalMin);
    }

    whatsTheCount(convertCardMax(data.cards[0].value));
    checkGame();
  });
}

// converts JSON string values in card hard arrays to numbers
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

// reduces card hand arrays to totals
function getTotal(hand) {
  var total = hand.reduce(function(prev, curr) {
    return prev + curr;
  });
  return total;
}

// looks for victory conditions and triggers game reset and scorekeeping
function checkGame() {
  if (dealerTotalMax === 21 || dealerTotalMin === 21) {
    console.log("Dealer has 21");
    winner = "dealer";
    score -= 1;
  } else if (dealerTotalMin > 21) {
    console.log("Dealer busts");
    winner = "player";
    score += 1;
  }

  if (playerTotalMax === 21 || playerTotalMin === 21) {
    console.log("Player has 21");
    winner = "player";
    score += 1;
  } else if (playerTotalMin > 21) {
    console.log("Player busts");
    winner = "dealer";
    score -= 1;
  }

  if (winner) {
    updateScore();
    reset();
  }
}

// adds 1 or subtracts 1 from scoreboard
function updateScore() {
  $score.empty();
  $score.append(score);
}

// clears card images and resets game values to initial
function reset() {
  $dealer.empty();
  $player.empty();
  dealerHandMax = [];
  playerHandMax = [];
  dealerHandMin = [];
  playerHandMin = [];
  dealerTotalMax = 0;
  playerTotalMax = 0;
  dealerTotalMin = 0;
  playerTotalMin = 0;
  winner = null;
  console.log("--reset--");
}

function whatsTheCount(num) {
  if (num < 7) {
    count += 1;
  } else if (num > 9) {
    count -= 1;
  }
  $count.empty();
  $count.append(count);

}


// JSON request function with JSONP proxy
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
