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
var $winner = $(".winner");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");

//button click listeners
$("button").on("click", function () {
  $(".buttonClick").trigger("load");
  $(".buttonClick").trigger("play");
});
$newGame.on("click", newGame);
$hit.on("click", hit);
$stay.on("click", stay);

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
  $(".cardPackage").trigger("load");
  $(".cardPackage").trigger("play");
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
    $(".cardPlace").trigger("load");
    $(".cardPlace").trigger("play");
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

function cardImage(data) {
  var cardValue = data.cards[0].value;
  var cardSuit = data.cards[0].suit;
  var filename = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  return filename;
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
  } else if (game.dealerTotal > 21) {
    console.log("dealer busts");
    game.winner = "player";
    score += 1;
  }

  if (game.playerTotal === 21) {
    console.log("player has 21");
    game.winner = "player";
    score += 1;
  } else if (game.playerTotal > 21) {
    console.log("player busts");
    game.winner = "dealer";
    score -= 1;
  }

  if (game.winner !== "") {
    flipCard();
    updateScore();
    gameEnd();
  }
}

function gameEnd() {
  $winner.empty();
  if (game.winner === "push") {
    $winner.append("<p>Push</p>");
  } else if (game.winner === "dealer") {
    $(".lose").trigger("load");
    $(".lose").trigger("play");
    $winner.append("<p>Dealer wins</p>");
  } else if (game.winner === "player") {
    $(".win").trigger("load");
    $(".win").trigger("play");
    $winner.append("<p>Player wins</p>");
  }
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
}

function clearTable() {
  $dealer.empty();
  $player.empty();
  $winner.empty();
  console.log("--table cleared--");
}

function hit() {
  console.log("hit");
  $(".buttonClick").trigger("load");
  $(".buttonClick").trigger("play");
  drawCard({
    person: "player"
  });
}

function stay() {
  console.log("stay");
  flipCard();
  if (game.winner === "" && game.dealerTotal < 17) {
    drawCard({
      person: "dealer",
      callback: stay
    });
  } else if (game.dealerTotal === game.playerTotal) {
    game.winner = "push";
    console.log("push");
    gameEnd();
  } else if (game.dealerTotal < 22) {
    game.dealerTotal > game.playerTotal ?
      (game.winner = "dealer", score -= 1, console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal)) :
      (game.winner = "player", score += 1, console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal));
    gameEnd();
  }
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
