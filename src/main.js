var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var cardBack = "http://tinyurl.com/kqzzmbr";

var game;
var deckId = "";
var count = 0;
var bank = 500;
var betAmt = 25;
var betChangeAllowed = true;
// var splitAllowed = false;
var isFirstTurn = true;
var isPlayersTurn = true;
var isDoubledDown = false;
// var isSplit = false;
// var gameHand = "";

//buttons
// var $split = $(".split");
var $doubleDown = $(".doubleDown");
var $newGame = $(".newGame");
var $hit = $(".hit");
var $stay = $(".stay");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip10 = $(".chip10");
var $chip25 = $(".chip25");
var $chip50 = $(".chip50");
var $chip100 = $(".chip100");

//info divs
var $bankChips = $(".bankChips");
var $bankTotal = $(".bankTotal");
var $count = $(".count");
var $announce = $(".announce");
var $announceText = $(".announce p");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");
// var $playerSplit = $(".playerSplit");
// var $hand1 = $(".hand1");
// var $hand2 = $(".hand2");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");
// var $hand1Total = $(".hand1Total");
// var $hand2Total = $(".hand2Total");

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

//populate bank amount on page load
$bankTotal.text("Bank: " + bank);
countChips();

//button click listeners
$("button").click(function () {
  buttonClick.load();
  buttonClick.play();
});

// $split.click(split);

// $(".giveSplitHand").click(function () {
//   game.playerHand = ["KING", "JACK"];
//   checkSplit();
// });

$doubleDown.click(function () {
  $doubleDown.attr("disabled", true);
  bet(betAmt);
  console.log("double down");
  isDoubledDown = true;
  hit();
});

$newGame.click(newGame);

$hit.click(hit);

$stay.click(function () {
  console.log("stay");
  stay();
});

//chip click listeners
$chip1.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "selectedBet");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 1;
  }
});
$chip5.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "selectedBet");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 5;
  }
});
$chip10.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "selectedBet");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 10;
  }
});
$chip25.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "selectedBet");
    $chip50.attr("id", "");
    $chip100.attr("id", "");
    betAmt = 25;
  }
});
$chip50.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "selectedBet");
    $chip100.attr("id", "");
    betAmt = 50;
  }
});
$chip100.click(function () {
  if (betChangeAllowed) {
    $chip1.attr("id", "");
    $chip5.attr("id", "");
    $chip10.attr("id", "");
    $chip25.attr("id", "");
    $chip50.attr("id", "");
    $chip100.attr("id", "selectedBet");
    betAmt = 100;
  }
});

//game object
function Game() {
  this.hiddenCard = "";
  this.dealerHand = [];
  this.playerHand = [];
  this.dealerTotal = 0;
  this.playerTotal = 0;
  // this.splitCardImages = [];
  // this.splitHand1 = [];
  // this.splitHand2 = [];
  // this.splitHand1Total = 0;
  // this.splitHand2Total = 0;
  this.wager = 0;
  this.winner = "";
  // this.playerChips = {};
}

function newGame() {
  game = new Game();
  bet(betAmt);
  deal();
}

function deal() {
  isFirstTurn = true;
  if (bank >= betAmt) {
    clearTable();
    $newGame.attr("disabled", true);
    $hit.attr("disabled", false);
    $stay.attr("disabled", false);
    $doubleDown.attr("disabled", false);
    $doubleDown.attr("id", "");
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
    betChangeAllowed = false;
  }
}

function draw4() {
  drawCard({
    person: "dealer",
    image: cardBack
  });
  drawCard({
    person: "player",
    storeImg: true
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player",
    storeImg: true//,
    // callback: checkSplit
  });
}

// function checkSplit() {
//   var checkSplitArr = game.playerHand.map(function(card) {
//   if (card === "KING" || card === "QUEEN" || card === "JACK") {
//       return 10;
//     } else if (!isNaN(card)) {
//       return Number(card);
//     } else if (card === "ACE") {
//       return 1;
//     }
//   });
//   if (checkSplitArr[0] === checkSplitArr[1]) {
//     splitAllowed = true;
//     $split.attr("disabled", false);
//   }
// }

// function split () {
//   game.splitHand1.push(game.playerHand[0]);
//   game.splitHand2.push(game.playerHand[1]);
//   isSplit = true;
//   $split.attr("disabled", true);
//   $player.addClass("hidden");
//   $playerTotal.addClass("hidden");
//   $playerSplit.removeClass("hidden");
//   $hand1.html(`<img class='cardImage' src='${game.splitCardImages[0]}'>`);
//   $hand2.html(`<img class='cardImage' src='${game.splitCardImages[1]}'>`);
//   checkSplitTotal("hand1");
//   checkSplitTotal("hand2");
//   gameHand = "hand1";
//   highlight("hand1");
// }

// function highlight(hand) {
//   hand === "hand1" ? (
//     $hand1.addClass("highlighted"),
//     $hand2.removeClass("highlighted")
//   ) : (
//     $hand2.addClass("highlighted"),
//     $hand1.removeClass("highlighted")
//   );
// }

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
    // options.storeImg && game.splitCardImages.push(cardImage(data));
    typeof options.callback === 'function' && options.callback();
  });
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player",
    callback: function () { if (isDoubledDown && !game.winner) {
      stay();
      }
    }
  });
  if (isFirstTurn) {
    isFirstTurn = false;
    $doubleDown.attr("disabled", true);
  }
}

function stay() {
  flipCard();
  if (!game.winner && game.dealerTotal < 17) {
    console.log("dealer hits");
    isPlayersTurn = false;
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
      console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal),
      gameEnd()
    ) : (
      game.winner = "player",
      announce("YOU WIN"),
      console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal),
      gameEnd()
    );
  }
}

// function checkSplitTotal(handNum) {
//   var total = 0;
//   var hand = handNum === "hand1" ? game.splitHand1 : game.splitHand2;
//   var aces = 0;

//   hand.forEach(function(card) {
//     if (card === "KING" || card === "QUEEN" || card === "JACK") {
//       total += 10;
//     } else if (!isNaN(card)) {
//       total += Number(card);
//     } else if (card === "ACE") {
//       aces += 1;
//     }
//   });

//   if (aces > 0) {
//     if (total + aces + 10 > 21) {
//       total += aces;
//     } else {
//       total += aces + 10;
//     }
//   }

//   handNum === "hand1" ? (
//     game.splitHand1Total = total,
//     $hand1Total.text(game.splitHand1Total)
//   ) : (
//     game.splitHand2Total = total,
//     $hand2Total.text(game.splitHand2Total)
//   );
// }

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
  if (game.dealerTotal === 21 && game.dealerHand.length === 2 && game.playerTotal === 21 && game.playerHand.length === 2) {
    console.log("double blackjack push!");
    game.winner = "push";
    announce("PUSH");
  } else if (game.dealerTotal === 21 && game.dealerHand.length === 2 && game.playerTotal === 21) {
    console.log("dealer has blackjack");
    game.winner = "dealer";
    announce("YOU LOSE");
  } else if (game.playerTotal === 21 && game.playerHand.length === 2) {
    console.log("player has blackjack");
    game.winner = "player";
    game.wager *= 1.25;
    announce("BLACKJACK!");
  } else if (game.dealerTotal === 21 && game.playerTotal === 21) {
    console.log("push");
    game.winner = "push";
    announce("PUSH");
  } else if (game.dealerTotal === 21 && game.dealerHand.length === 2 && isPlayersTurn && game.playerTotal < 21) {
    //do nothing
    console.log("dealer has blackjack, doing nothing..");
  } else if (game.dealerTotal === 21) {
    console.log("dealer has 21");
    game.winner = "dealer";
    announce("YOU LOSE");
  } else if (game.dealerTotal > 21) {
    console.log("dealer busts");
    game.winner = "player";
    announce("YOU WIN");
  } else if (game.playerTotal === 21) {
    console.log("player has 21");
    game.winner = "player";
    announce("21!");
  } else if (game.playerTotal > 21) {
    console.log("player busts");
    game.winner = "dealer";
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
    console.log("returning player's " + game.wager);
  }
  $bankTotal.text("Bank: " + bank);
  betChangeAllowed = true;
  flipCard();
  $dealerTotal.removeClass("hidden");
  $newGame.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  isDoubledDown = false;
  $doubleDown.attr("id", "doubleDown-hidden");
  // splitAllowed = false;
  // $split.attr("disabled", true);
}

function clearTable() {
  isFirstTurn = true;
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

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");

  if (count >= 20) {
    $count.addClass("hot");
  } else if (count > -20 && count < 20) {
    $count.removeClass("hot cold");
  } else if (count <= -20) {
    $count.addClass("cold");
  }
}

function bet(amt) {
  if (bank >= amt) {
    game.wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips();
    $(".currentWager").text("Current Wager: " + game.wager);
    console.log("betting " + amt);
    console.log("wager at " + game.wager);
  } else {
    console.log("Insufficient funds.");
  }
}

function countChips() {
  var num100s = Math.floor(bank / 100);
  var num50s = Math.floor((bank - num100s * 100) / 50);
  var num25s = Math.floor((bank - num100s * 100 - num50s * 50) / 25);
  var num10s = Math.floor((bank - num100s * 100 - num50s * 50 - num25s * 25) / 10);
   var num5s = Math.floor((bank - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10) / 5);
   var num1s = Math.floor((bank - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5) / 1);
  // game.playerChips = {
  //   "num100s": num100s,
  //   "num50s": num50s,
  //   "num25s": num25s,
  //   "num10s": num10s,
  //   "num5s": num5s,
  //   "num1s": num1s
  // };
  var html = "";
  for (var i = 0; i < num100s; i++) {
    html += "<img src='images/chip-100.png'>";
  };
  for (var i = 0; i < num50s; i++) {
    html += "<img src='images/chip-50.png'>";
  };
  for (var i = 0; i < num25s; i++) {
    html += "<img src='images/chip-25.png'>";
  };
  for (var i = 0; i < num10s; i++) {
    html += "<img src='images/chip-10.png'>";
  };
  for (var i = 0; i < num5s; i++) {
    html += "<img src='images/chip-5.png'>";
  };
  for (var i = 0; i < num1s; i++) {
    html += "<img src='images/chip-1.png'>";
  };
  $bankChips.html(html);
  $('.bankChips img').each(function(i, c) {
    $(c).css('top', -5 * i);
  });
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
    };
  };
  request.send();
};
