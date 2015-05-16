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
$newGame.click(newGame);
$hit.click(hit);
$stay.click(stay);

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
  drawCard("dealer", cardBack);
  drawCard("player");
  drawCard("dealer");
  drawCard("player");
}

function drawCard(person, image) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function(data, cb) {
    if (image) {
      var html = "<img class='cardImage' src='" + image + "'>";
      $("." + person).append(html);
      game.hiddenCard = data.cards[0].image;
    } else {
      var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
      $("." + person).append(html);
    }
    if (person === "dealer") {
      game.dealerHand.push(data.cards[0].value);
      checkDealerTotal();
      console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal);
    } else if (person === "player") {
      game.playerHand.push(data.cards[0].value);
      checkPlayerTotal();
      console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal);
    }
    checkVictory();
    updateCount(data.cards[0].value);
  });
}

function checkPlayerTotal() {
  game.playerTotal = 0;
  game.playerHand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      game.playerTotal += 10;
    } else if (!isNaN(card)) {
      game.playerTotal += Number(card);
    }
  });
  game.playerHand.forEach(function(card) {
    if (card === "ACE") {
      if (game.playerTotal <= 10) {
        game.playerTotal += 11;
      } else {
        game.playerTotal += 1;
      }
    }
  });
}

function checkDealerTotal() {
  game.dealerTotal = 0;
  game.dealerHand.forEach(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      game.dealerTotal += 10;
    } else if (!isNaN(card)) {
      game.dealerTotal += Number(card);
    }
  });
  game.dealerHand.forEach(function(card) {
    if (card === "ACE") {
      if (game.dealerTotal <= 10) {
        game.dealerTotal += 11;
      } else {
        game.dealerTotal += 1;
      }
    }
  });
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
    updateScore();
    gameEnd();
  }
}

function gameEnd() {
  $winner.empty();
  $winner.append("<p>" + _.capitalize(game.winner) + " wins</p>");
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
  drawCard("player");
}

function stay() {
  console.log("stay");
  flipCard();
  if (game.winner === "" && game.dealerTotal < 17) {
    drawCard("dealer");
  } else {
    game.dealerTotal >= game.playerTotal ?
      (game.winner = "dealer", score -= 1, console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal)) :
      (game.winner = "player", score += 1, console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal));
    gameEnd();
  }
}

function flipCard() {
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
