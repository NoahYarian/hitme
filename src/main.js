var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://tinyurl.com/kqzzmbr";

var game;
var deckId = "";
var score = 0;
var count = 0;
var bank = 500;
var initialWager = 0;
var betAmt = 10;

//buttons
var $bet = $(".bet");
var $newGame = $(".newGame");
var $hit = $(".hit");
var $stay = $(".stay");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip25 = $(".chip25");
var $chip100 = $(".chip100");

//scoreboard divs
var $bank = $(".bank");
var $score = $(".score");
var $count = $(".count");
var $announce = $(".announce")
var $announceText = $(".announce p")

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");

//create audio elements
var cardPlace = document.createElement('audio');
cardPlace.setAttribute('src', 'sounds/cardPlace1.wav');

var cardPackage = document.createElement('audio');
cardPackage.setAttribute('src', 'sounds/cardOpenPackage2.wav');

var buttonClick = document.createElement('audio');
buttonClick.setAttribute('src', 'sounds/click1.wav');

var winWav = document.createElement('audio');
winWav.setAttribute('src', 'sounds/chipsHandle5.wav');

var loseWav = document.createElement('audio');
loseWav.setAttribute('src', 'sounds/cardShove3.wav');

//button click listeners
$("button").on("click", function () {
  buttonClick.load();
  buttonClick.play();
});
$bet.click(function () {
  bet(betAmt);
  $bet.attr("disabled", true);
});
$newGame.on("click", newGame);
$hit.on("click", hit);
$stay.on("click", function () {
  console.log("stay");
  stay();
});

//chip click listeners
$chip1.click(function () {
  $chip1.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip25.attr("id", "");
  $chip100.attr("id", "");
});

$chip5.click(function () {
  $chip5.attr("id", "selectedBet");
  $chip1.attr("id", "");
  $chip25.attr("id", "");
  $chip100.attr("id", "");
});

$chip25.click(function () {
  $chip25.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip1.attr("id", "");
  $chip100.attr("id", "");
});

$chip100.click(function () {
  $chip100.attr("id", "selectedBet");
  $chip5.attr("id", "");
  $chip25.attr("id", "");
  $chip1.attr("id", "");
});

//game object
function Game() {
  this.hiddenCard = "";
  this.dealerHand = [];
  this.playerHand = [];
  this.dealerTotal = 0;
  this.playerTotal = 0;
  this.wager = 0;
  this.winner = "";
}

function newGame() {
  game = new Game();
  bet(betAmt);
  deal();
}

function deal() {
  clearTable();
  $newGame.attr("disabled", true);
  $hit.attr("disabled", false);
  $stay.attr("disabled", false);
  cardPackage.load();
  cardPackage.play();
  if (deckId === "") {
    getJSON(newDeckURL, function(data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
    });
  } else {
    console.log("About to deal from current deck");
    draw4();
  }
}

function draw4() {
  drawCard({
    person: "dealer",
    image: cardBack
  });
  drawCard({
    person: "player"
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player"
  });
}

function drawCard(options) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (
      html = "<img class='cardImage' src='" + options.image + "'>",
      $("." + options.person).append(html),
      game.hiddenCard = cardImage(data)
    ) : (
      html = "<img class='cardImage' src='" + cardImage(data) + "'>",
      $("." + options.person).append(html)
    );
    options.person === "dealer" ? (
      game.dealerHand.push(data.cards[0].value),
      checkTotal("dealer"),
      console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal)
    ) : (
      game.playerHand.push(data.cards[0].value),
      checkTotal("player"),
      console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal)
    );
    $bet.attr("disabled", false);
    $bet.attr("id", "");
    checkVictory();
    updateCount(data.cards[0].value);
    typeof options.callback === 'function' && options.callback();
  });
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player"
  });
}

function stay() {
  flipCard();
  if (!game.winner && game.dealerTotal < 17) {
    console.log("dealer hits");
    drawCard({
      person: "dealer",
      callback: stay
    });
  } else if (game.dealerTotal === game.playerTotal) {
    game.winner = "push";
    announce("PUSH");
    console.log("push");
    gameEnd();
  } else if (game.dealerTotal < 22) {
    game.dealerTotal > game.playerTotal ? (
      game.winner = "dealer",
      announce("YOU LOSE"),
      score -= 1,
      console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal),
      gameEnd()
    ) : (
      game.winner = "player",
      announce("YOU WIN"),
      score += 1,
      console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal),
      gameEnd()
    );
  }
}

function checkTotal(person) {
  var total = 0;
  var hand = person === "dealer" ? game.dealerHand : game.playerHand;
  var aces = 0;

  hand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      total += 10;
    } else if (!isNaN(card)) {
      total += Number(card);
    } else if (card === "ACE") {
      aces += 1;
    }
  });

  if (aces > 0) {
    if (total + aces + 10 > 21) {
      total += aces;
    } else {
      total += aces + 10;
    }
  }

  person === "dealer" ? (
    game.dealerTotal = total,
    $dealerTotal.text(game.dealerTotal)
  ) : (
    game.playerTotal = total,
    $playerTotal.text(game.playerTotal)
  );
}

function checkVictory() {
  if (game.dealerTotal === 21) {
    console.log("dealer has 21");
    game.winner = "dealer";
    score -= 1;
    announce("YOU LOSE");
  } else if (game.dealerTotal > 21) {
    console.log("dealer busts");
    game.winner = "player";
    score += 1;
    announce("YOU WIN");
  } else if (game.playerTotal === 21) {
    console.log("player has 21");
    game.winner = "player";
    score += 1;
    announce("21!");
  } else if (game.playerTotal > 21) {
    console.log("player busts");
    game.winner = "dealer";
    score -= 1;
    announce("BUST");
  }

  game.winner && gameEnd();
}

function gameEnd() {
  if (game.winner === "player") {
    bank += (game.wager * 2);
    console.log("giving player " + (game.wager * 2));
  } else if (game.winner === "push") {
    bank += game.wager;
    console.log("giving player " + game.wager);
  }
  $bank.text("Bank: " + bank);
  flipCard();
  updateScore();
  $dealerTotal.removeClass("hidden");
  $bet.attr("id", "bet-hidden");
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
}

function clearTable() {
  $dealer.empty();
  $player.empty();
  $dealerTotal.addClass("hidden");
  $playerTotal.empty();
  $announce.removeClass("win lose push");
  console.log("--table cleared--");
}

function cardImage(data) {
  var cardValue = data.cards[0].value;
  var cardSuit = data.cards[0].suit;
  var filename = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  return filename;
}

function announce(text) {
  if (game.winner === "dealer") {
    $announce.addClass("lose");
    loseWav.load();
    loseWav.play();
  } else if (game.winner === "player") {
    $announce.addClass("win");
    winWav.load();
    winWav.play();
  } else if (game.winner === "push") {
    $announce.addClass("push");
  }
  $announceText.text(text);
}

function flipCard() {
  var $flipped = $(".dealer .cardImage").first();
  $flipped.attr("src", game.hiddenCard);
}

function updateScore() {
  $score.empty();
  $score.append("<p>Score: " + score + "</p>");
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
}

function bet(amt) {
  game.wager += amt;
  bank -= amt;
  $bank.text("Bank: " + bank);
  $(".currentWager").text("Current Wager: " + game.wager);
  console.log("betting " + amt);
  console.log("wager at " + game.wager);
}

// JSON request function with JSONP proxy
function getJSON(url, cb) {
  var JSONP_PROXY = 'https://jsonp.afeld.me/?url=';
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', JSONP_PROXY + url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    }
  };
  request.send();
}
