var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://tinyurl.com/kqzzmbr";

var game;
var deckId = "";
var score = 0;
var count = 0;

//buttons
var $newGame = $(".newGame");
var $hit = $(".hit");
var $stay = $(".stay");

//scoreboard divs
var $score = $(".score");
var $count = $(".count");
var $announce = $(".announce")
var $announceText = $(".announce p")

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");

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
$newGame.on("click", newGame);
$hit.on("click", hit);
$stay.on("click", function () {
  console.log("stay");
  stay();
});

//game object
function Game() {
  this.hiddenCard = "";
  this.dealerHand = [];
  this.playerHand = [];
  this.dealerTotal = 0;
  this.playerTotal = 0;
  this.winner = "";
}

function newGame() {
  game = new Game();
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
  if (game.winner === "" && game.dealerTotal < 17) {
    console.log("dealer hits");
    drawCard({
      person: "dealer",
      callback: stay
    });
  } else if (game.dealerTotal === game.playerTotal) {
    game.winner = "push";
    announce("PUSH");
    console.log("push");
  } else if (game.dealerTotal < 22) {
    game.dealerTotal > game.playerTotal ? (
      game.winner = "dealer",
      announce("YOU LOSE"),
      score -= 1,
      console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal)
    ) : (
      game.winner = "player",
      announce("YOU WIN"),
      score += 1,
      console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal)
    );
  }
  gameEnd();
}

function checkTotal(person) {
  var total = 0;
  var hand = person === "dealer" ? game.dealerHand : game.playerHand;
  hand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      total += 10;
    } else if (!isNaN(card)) {
      total += Number(card);
    }
  });
  hand.forEach(function(card) {
    if (card === "ACE") {
      if (total <= 10) {
        total += 11;
      } else {
        total += 1;
      }
    }
  });
  person === "dealer" ? game.dealerTotal = total : game.playerTotal = total;
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
  }

  if (game.playerTotal === 21) {
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

  if (game.winner !== "") {
    flipCard();
    gameEnd();
  }
}

function gameEnd() {
  updateScore();
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
}

function clearTable() {
  $dealer.empty();
  $player.empty();
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
  var $flipped = $(".dealer .cardImage");
  $flipped.first().attr("src", game.hiddenCard);
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
