"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
//var cardBack = "http://tinyurl.com/kqzzmbr";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var count = 0;
var trueCount = 0;
var cardsLeft = 312;
var advantage = -0.5;
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
var $handChips = $(".handChips");
var $bankChips = $(".bankChips");
var $bankTotal = $(".bankTotal");
var $count = $(".count");
var $trueCount = $(".trueCount");
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
var cardPlace = document.createElement("audio");
cardPlace.setAttribute("src", "sounds/cardPlace1.wav");

var cardPackage = document.createElement("audio");
cardPackage.setAttribute("src", "sounds/cardOpenPackage2.wav");

var buttonClick = document.createElement("audio");
buttonClick.setAttribute("src", "sounds/click1.wav");

var winWav = document.createElement("audio");
winWav.setAttribute("src", "sounds/chipsHandle5.wav");

var loseWav = document.createElement("audio");
loseWav.setAttribute("src", "sounds/cardShove3.wav");

//populate bank amount on page load
$bankTotal.text("Bank: " + bank);
countChips("bank");

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
      getJSON(newDeckURL, function (data) {
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
    person: "player" //,
    // storeImg: true
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player" //,
    // storeImg: true,
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
  getJSON(cardURL, function (data, cb) {
    var html;
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class='cardImage' src='" + options.image + "'>", $("." + options.person).append(html), game.hiddenCard = cardImage(data)) : (html = "<img class='cardImage' src='" + cardImage(data) + "'>", $("." + options.person).append(html));
    options.person === "dealer" ? (game.dealerHand.push(data.cards[0].value), checkTotal("dealer"), console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal)) : (game.playerHand.push(data.cards[0].value), checkTotal("player"), console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal));
    checkVictory();
    updateCount(data.cards[0].value);
    // options.storeImg && game.splitCardImages.push(cardImage(data));
    typeof options.callback === "function" && options.callback();
  });
  cardsLeft--;
}

function hit() {
  console.log("hit");
  drawCard({
    person: "player",
    callback: function callback() {
      if (isDoubledDown && !game.winner) {
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
    game.dealerTotal > game.playerTotal ? (game.winner = "dealer", announce("YOU LOSE"), console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal), gameEnd()) : (game.winner = "player", announce("YOU WIN"), console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal), gameEnd());
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

  hand.forEach(function (card) {
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
  var textColor = "white";
  if (total === 21) {
    textColor = "lime";
  } else if (total > 21) {
    textColor = "red";
  }

  person === "dealer" ? (game.dealerTotal = total, $dealerTotal.text(game.dealerTotal), $dealerTotal.css("color", textColor)) : (game.playerTotal = total, $playerTotal.text(game.playerTotal), $playerTotal.css("color", textColor));
}

function checkVictory() {
  if (game.dealerHand.length >= 2 && game.playerHand.length >= 2) {
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
  }

  game.winner && gameEnd();
}

function gameEnd() {
  if (game.winner === "player") {
    bank += game.wager * 2;
    console.log("giving player " + game.wager * 2 + ". Bank at " + bank);
  } else if (game.winner === "push") {
    bank += game.wager;
    console.log("returning " + game.wager + " to player. Bank at " + bank);
  }
  $bankTotal.text("Bank: " + bank);
  betChangeAllowed = true;
  isPlayersTurn = true;
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
  console.log("flip");
  var $flipped = $(".dealer .cardImage").first();
  $flipped.remove();
  var html = "<img src='" + game.hiddenCard + "' class='cardImage'>";
  $dealer.prepend(html);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  getTrueCount();
  getAdvantage();
  setNeedle();
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
  $trueCount.empty();
  $trueCount.append("<p>True Count: " + trueCount + "</p>");
}

function getTrueCount() {
  var decksLeft = cardsLeft / 52;
  trueCount = (count / decksLeft).toPrecision(2);
}

function getAdvantage() {
  advantage = trueCount * 0.5 - 0.5;
}

function setNeedle() {
  var num = advantage * 36;
  $(".gauge-needle").css("transform", "rotate(" + num + "deg)");
}

function bet(amt) {
  if (bank >= amt) {
    game.wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips("bank");
    countChips("hand");
    $(".currentWager").text("Current Wager: " + game.wager);
    console.log("betting " + amt);
    console.log("wager at " + game.wager);
  } else {
    console.log("Insufficient funds.");
  }
}

function countChips(location) {
  var amt = location === "bank" ? bank : game.wager;
  var num100s = Math.floor(amt / 100);
  var num50s = Math.floor((amt - num100s * 100) / 50);
  var num25s = Math.floor((amt - num100s * 100 - num50s * 50) / 25);
  var num10s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25) / 10);
  var num5s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10) / 5);
  var num1s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5) / 1);
  var num05s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5 - num1s * 1) / 0.5);
  // game.playerChips = {
  //   "num100s": num100s,
  //   "num50s": num50s,
  //   "num25s": num25s,
  //   "num10s": num10s,
  //   "num5s": num5s,
  //   "num1s": num1s,
  //   "num05s": num05s
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
  for (var i = 0; i < num05s; i++) {
    html += "<img src='images/chip-05.png'>";
  };
  if (location === "bank") {
    $bankChips.html(html);
    $(".bankChips img").each(function (i, c) {
      $(c).css("top", -5 * i);
    });
  } else if (location === "hand") {
    $handChips.html(html);
    $(".handChips img").each(function (i, c) {
      $(c).css("top", -5 * i);
    });
  }
}

// Deal specific cards for testing purposes
$(".testDeal").click(function () {
  game = new Game();
  bet(betAmt);
  isFirstTurn = true;
  betChangeAllowed = false;
  if (bank >= betAmt) {
    clearTable();
    $newGame.attr("disabled", true);
    $hit.attr("disabled", false);
    $stay.attr("disabled", false);
    $doubleDown.attr("disabled", false);
    $doubleDown.attr("id", "");
    cardPackage.load();
    cardPackage.play();
    getJSON(newDeckURL, function (data) {
      deckId = data.deck_id;
    });
  }
  var dealer1Value = $(".dealer1Value").val();
  var dealer2Value = $(".dealer2Value").val();
  var player1Value = $(".player1Value").val();
  var player2Value = $(".player2Value").val();
  var dealer1Suit = $(".dealer1Suit").val();
  var dealer2Suit = $(".dealer2Suit").val();
  var player1Suit = $(".player1Suit").val();
  var player2Suit = $(".player2Suit").val();
  var dealer1 = "../images/cards/" + dealer1Value + "_of_" + dealer1Suit.toLowerCase() + ".svg";
  var dealer2 = "../images/cards/" + dealer2Value + "_of_" + dealer2Suit.toLowerCase() + ".svg";
  var player1 = "../images/cards/" + player1Value + "_of_" + player1Suit.toLowerCase() + ".svg";
  var player2 = "../images/cards/" + player2Value + "_of_" + player2Suit.toLowerCase() + ".svg";
  game.dealerHand = [dealer1Value, dealer2Value];
  game.playerHand = [player1Value, player2Value];
  game.hiddenCard = dealer1;
  $dealer.append("<img src='" + cardBack + "' class='cardImage'>");
  $dealer.append("<img src='" + dealer2 + "' class='cardImage'>");
  $player.append("<img src='" + player1 + "' class='cardImage'>");
  $player.append("<img src='" + player2 + "' class='cardImage'>");
  checkTotal("dealer");
  checkTotal("player");
  checkVictory();
});

$(".dealerGiveCard").click(function () {
  giveCard("dealer");
});

$(".playerGiveCard").click(function () {
  giveCard("player");
});

function giveCard(person) {
  var cardValue = $(".giveCardValue").val();
  var cardSuit = $(".giveCardSuit").val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  person === "dealer" ? (game.dealerHand.push(cardValue), checkTotal("dealer"), $dealer.append("<img src='" + cardSrc + "' class='cardImage'>")) : (game.playerHand.push(cardValue), checkTotal("player"), $player.append("<img src='" + cardSrc + "' class='cardImage'>"));
  checkVictory();
}

// JSON request function with JSONP proxy
function getJSON(url, cb) {
  var JSONP_PROXY = "https://jsonp.afeld.me/?url=";
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open("GET", JSONP_PROXY + url);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    };
  };
  request.send();
};
//# sourceMappingURL=data:application/json;base64,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QUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFVBQU0sR0FBRyxFQUFFLENBQUM7R0FDYjtDQUNGLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN4QixNQUFJLGdCQUFnQixFQUFFO0FBQ3BCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFVBQU0sR0FBRyxFQUFFLENBQUM7R0FDYjtDQUNGLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN4QixNQUFJLGdCQUFnQixFQUFFO0FBQ3BCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJ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QyxLQUFLLENBQUM7QUFDbEQsTUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDcEMsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDcEQsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUNsRSxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDL0UsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUYsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUN6RyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsS0FBSyxH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dHRwOi8vZGVja29mY2FyZHNhcGkuY29tL2FwaS9cIjtcbnZhciBuZXdEZWNrVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbi8vdmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdGlueXVybC5jb20va3F6em1iclwiO1xudmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNS81Mi9DYXJkX2JhY2tfMTYuc3ZnLzIwOXB4LUNhcmRfYmFja18xNi5zdmcucG5nXCI7XG5cbnZhciBnYW1lO1xudmFyIGRlY2tJZCA9IFwiXCI7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IDA7XG52YXIgY2FyZHNMZWZ0ID0gMzEyO1xudmFyIGFkdmFudGFnZSA9IC0uNTtcbnZhciBiYW5rID0gNTAwO1xudmFyIGJldEFtdCA9IDI1O1xudmFyIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuLy8gdmFyIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xudmFyIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbnZhciBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbnZhciBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4vLyB2YXIgaXNTcGxpdCA9IGZhbHNlO1xuLy8gdmFyIGdhbWVIYW5kID0gXCJcIjtcblxuLy9idXR0b25zXG4vLyB2YXIgJHNwbGl0ID0gJChcIi5zcGxpdFwiKTtcbnZhciAkZG91YmxlRG93biA9ICQoXCIuZG91YmxlRG93blwiKTtcbnZhciAkbmV3R2FtZSA9ICQoXCIubmV3R2FtZVwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGhhbmRDaGlwcyA9ICQoXCIuaGFuZENoaXBzXCIpO1xudmFyICRiYW5rQ2hpcHMgPSAkKFwiLmJhbmtDaGlwc1wiKTtcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG52YXIgJGFubm91bmNlID0gJChcIi5hbm5vdW5jZVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0ID0gJChcIi5hbm5vdW5jZSBwXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlciA9ICQoXCIuZGVhbGVyXCIpO1xudmFyICRwbGF5ZXIgPSAkKFwiLnBsYXllclwiKTtcbi8vIHZhciAkcGxheWVyU3BsaXQgPSAkKFwiLnBsYXllclNwbGl0XCIpO1xuLy8gdmFyICRoYW5kMSA9ICQoXCIuaGFuZDFcIik7XG4vLyB2YXIgJGhhbmQyID0gJChcIi5oYW5kMlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG4vLyB2YXIgJGhhbmQxVG90YWwgPSAkKFwiLmhhbmQxVG90YWxcIik7XG4vLyB2YXIgJGhhbmQyVG90YWwgPSAkKFwiLmhhbmQyVG90YWxcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcblxudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xuXG52YXIgYnV0dG9uQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYnV0dG9uQ2xpY2suc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NsaWNrMS53YXYnKTtcblxudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcblxudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9wb3B1bGF0ZSBiYW5rIGFtb3VudCBvbiBwYWdlIGxvYWRcbiRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG5jb3VudENoaXBzKFwiYmFua1wiKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgYnV0dG9uQ2xpY2subG9hZCgpO1xuICBidXR0b25DbGljay5wbGF5KCk7XG59KTtcblxuLy8gJHNwbGl0LmNsaWNrKHNwbGl0KTtcblxuLy8gJChcIi5naXZlU3BsaXRIYW5kXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2FtZS5wbGF5ZXJIYW5kID0gW1wiS0lOR1wiLCBcIkpBQ0tcIl07XG4vLyAgIGNoZWNrU3BsaXQoKTtcbi8vIH0pO1xuXG4kZG91YmxlRG93bi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kbmV3R2FtZS5jbGljayhuZXdHYW1lKTtcblxuJGhpdC5jbGljayhoaXQpO1xuXG4kc3RheS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKFwic3RheVwiKTtcbiAgc3RheSgpO1xufSk7XG5cbi8vY2hpcCBjbGljayBsaXN0ZW5lcnNcbiRjaGlwMS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDE7XG4gIH1cbn0pO1xuJGNoaXA1LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gNTtcbiAgfVxufSk7XG4kY2hpcDEwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gMTA7XG4gIH1cbn0pO1xuJGNoaXAyNS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDI1O1xuICB9XG59KTtcbiRjaGlwNTAuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSA1MDtcbiAgfVxufSk7XG4kY2hpcDEwMC5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IDEwMDtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuaGlkZGVuQ2FyZCA9IFwiXCI7XG4gIHRoaXMuZGVhbGVySGFuZCA9IFtdO1xuICB0aGlzLnBsYXllckhhbmQgPSBbXTtcbiAgdGhpcy5kZWFsZXJUb3RhbCA9IDA7XG4gIHRoaXMucGxheWVyVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0Q2FyZEltYWdlcyA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDEgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMVRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyVG90YWwgPSAwO1xuICB0aGlzLndhZ2VyID0gMDtcbiAgdGhpcy53aW5uZXIgPSBcIlwiO1xuICAvLyB0aGlzLnBsYXllckNoaXBzID0ge307XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgZGVhbCgpO1xufVxuXG5mdW5jdGlvbiBkZWFsKCkge1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBpZiAoZGVja0lkID09PSBcIlwiKSB7XG4gICAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgICAgZHJhdzQoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBjdXJyZW50IGRlY2tcIik7XG4gICAgICBkcmF3NCgpO1xuICAgIH1cbiAgICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLy8sXG4gICAgLy8gc3RvcmVJbWc6IHRydWVcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIvLyxcbiAgICAvLyBzdG9yZUltZzogdHJ1ZSxcbiAgICAvLyBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbi8vICAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuLy8gICAgICAgcmV0dXJuIDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgcmV0dXJuIDE7XG4vLyAgICAgfVxuLy8gICB9KTtcbi8vICAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbi8vICAgICBzcGxpdEFsbG93ZWQgPSB0cnVlO1xuLy8gICAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuLy8gICB9XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHNwbGl0ICgpIHtcbi8vICAgZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbi8vICAgZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbi8vICAgaXNTcGxpdCA9IHRydWU7XG4vLyAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4vLyAgICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbi8vICAgJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4vLyAgIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbi8vICAgZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4vLyAgIGhpZ2hsaWdodChcImhhbmQxXCIpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuLy8gICBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKSA6IChcbi8vICAgICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbi8vICAgICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpLFxuICAgICAgZ2FtZS5oaWRkZW5DYXJkID0gY2FyZEltYWdlKGRhdGEpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGNhcmRJbWFnZShkYXRhKSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBvcHRpb25zLnBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpLFxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5kZWFsZXJIYW5kICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBnYW1lLmRlYWxlclRvdGFsKVxuICAgICkgOiAoXG4gICAgICBnYW1lLnBsYXllckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJwbGF5ZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIGdhbWUucGxheWVySGFuZCArIFwiICoqKiogcGxheWVyIGlzIGF0IFwiICsgZ2FtZS5wbGF5ZXJUb3RhbClcbiAgICApO1xuICAgIGNoZWNrVmljdG9yeSgpO1xuICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgIC8vIG9wdGlvbnMuc3RvcmVJbWcgJiYgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChjYXJkSW1hZ2UoZGF0YSkpO1xuICAgIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgfSk7XG4gIGNhcmRzTGVmdC0tO1xufVxuXG5mdW5jdGlvbiBoaXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiaGl0XCIpO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7IGlmIChpc0RvdWJsZWREb3duICYmICFnYW1lLndpbm5lcikge1xuICAgICAgc3RheSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChpc0ZpcnN0VHVybikge1xuICAgIGlzRmlyc3RUdXJuID0gZmFsc2U7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXkoKSB7XG4gIGZsaXBDYXJkKCk7XG4gIGlmICghZ2FtZS53aW5uZXIgJiYgZ2FtZS5kZWFsZXJUb3RhbCA8IDE3KSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGl0c1wiKTtcbiAgICBpc1BsYXllcnNUdXJuID0gZmFsc2U7XG4gICAgZHJhd0NhcmQoe1xuICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IHN0YXlcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4gICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgIGdhbWVFbmQoKTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbiAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApIDogKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwgKyBcIiBiZWF0cyBkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKTtcbiAgfVxufVxuXG4vLyBmdW5jdGlvbiBjaGVja1NwbGl0VG90YWwoaGFuZE51bSkge1xuLy8gICB2YXIgdG90YWwgPSAwO1xuLy8gICB2YXIgaGFuZCA9IGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IGdhbWUuc3BsaXRIYW5kMSA6IGdhbWUuc3BsaXRIYW5kMjtcbi8vICAgdmFyIGFjZXMgPSAwO1xuXG4vLyAgIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4vLyAgICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuLy8gICAgICAgdG90YWwgKz0gMTA7XG4vLyAgICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbi8vICAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbi8vICAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbi8vICAgICAgIGFjZXMgKz0gMTtcbi8vICAgICB9XG4vLyAgIH0pO1xuXG4vLyAgIGlmIChhY2VzID4gMCkge1xuLy8gICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4vLyAgICAgICB0b3RhbCArPSBhY2VzO1xuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4vLyAgICAgfVxuLy8gICB9XG5cbi8vICAgaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gKFxuLy8gICAgIGdhbWUuc3BsaXRIYW5kMVRvdGFsID0gdG90YWwsXG4vLyAgICAgJGhhbmQxVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDFUb3RhbClcbi8vICAgKSA6IChcbi8vICAgICBnYW1lLnNwbGl0SGFuZDJUb3RhbCA9IHRvdGFsLFxuLy8gICAgICRoYW5kMlRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQyVG90YWwpXG4vLyAgICk7XG4vLyB9XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwocGVyc29uKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gcGVyc29uID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXJIYW5kIDogZ2FtZS5wbGF5ZXJIYW5kO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cbiAgdmFyIHRleHRDb2xvciA9IFwid2hpdGVcIlxuICBpZiAodG90YWwgPT09IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJsaW1lXCI7XG4gIH0gZWxzZSBpZiAodG90YWwgPiAyMSkge1xuICAgIHRleHRDb2xvciA9IFwicmVkXCI7XG4gIH1cblxuICBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA9IHRvdGFsLFxuICAgICRkZWFsZXJUb3RhbC50ZXh0KGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICRkZWFsZXJUb3RhbC5jc3MoXCJjb2xvclwiLCB0ZXh0Q29sb3IpXG4gICkgOiAoXG4gICAgZ2FtZS5wbGF5ZXJUb3RhbCA9IHRvdGFsLFxuICAgICRwbGF5ZXJUb3RhbC50ZXh0KGdhbWUucGxheWVyVG90YWwpLFxuICAgICRwbGF5ZXJUb3RhbC5jc3MoXCJjb2xvclwiLCB0ZXh0Q29sb3IpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVmljdG9yeSgpIHtcbiAgaWYgKGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPj0gMiAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID49IDIpIHtcbiAgICBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRvdWJsZSBibGFja2phY2sgcHVzaCFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgZ2FtZS53YWdlciAqPSAxLjI1O1xuICAgICAgYW5ub3VuY2UoXCJCTEFDS0pBQ0shXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGlzUGxheWVyc1R1cm4gJiYgZ2FtZS5wbGF5ZXJUb3RhbCA8IDIxKSB7XG4gICAgICAvL2RvIG5vdGhpbmdcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2ssIGRvaW5nIG5vdGhpbmcuLlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIjIxIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIkJVU1RcIik7XG4gICAgfVxuICB9XG5cbiAgZ2FtZS53aW5uZXIgJiYgZ2FtZUVuZCgpO1xufVxuXG5mdW5jdGlvbiBnYW1lRW5kKCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICBiYW5rICs9IChnYW1lLndhZ2VyICogMik7XG4gICAgY29uc29sZS5sb2coYGdpdmluZyBwbGF5ZXIgJHtnYW1lLndhZ2VyICogMn0uIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgIGJhbmsgKz0gZ2FtZS53YWdlcjtcbiAgICBjb25zb2xlLmxvZyhgcmV0dXJuaW5nICR7Z2FtZS53YWdlcn0gdG8gcGxheWVyLiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfVxuICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbiAgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4gIGZsaXBDYXJkKCk7XG4gICRkZWFsZXJUb3RhbC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJkb3VibGVEb3duLWhpZGRlblwiKTtcbiAgLy8gc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4gIC8vICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tdGFibGUgY2xlYXJlZC0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gIH1cbiAgZ2V0VHJ1ZUNvdW50KCk7XG4gIGdldEFkdmFudGFnZSgpO1xuICBzZXROZWVkbGUoKTtcbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbiAgJHRydWVDb3VudC5lbXB0eSgpO1xuICAkdHJ1ZUNvdW50LmFwcGVuZChcIjxwPlRydWUgQ291bnQ6IFwiICsgdHJ1ZUNvdW50ICsgXCI8L3A+XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlQ291bnQoKSB7XG4gIHZhciBkZWNrc0xlZnQgPSBjYXJkc0xlZnQgLyA1MjtcbiAgdHJ1ZUNvdW50ID0gKGNvdW50IC8gZGVja3NMZWZ0KS50b1ByZWNpc2lvbigyKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWR2YW50YWdlKCkge1xuICBhZHZhbnRhZ2UgPSAodHJ1ZUNvdW50ICogLjUpIC0gLjU7XG59XG5cbmZ1bmN0aW9uIHNldE5lZWRsZSgpIHtcbiAgdmFyIG51bSA9IGFkdmFudGFnZSAqIDM2O1xuICAkKFwiLmdhdWdlLW5lZWRsZVwiKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIgKyBudW0gKyBcImRlZylcIik7XG59XG5cbmZ1bmN0aW9uIGJldChhbXQpIHtcbiAgaWYgKGJhbmsgPj0gYW10KSB7XG4gICAgZ2FtZS53YWdlciArPSBhbXQ7XG4gICAgYmFuayAtPSBhbXQ7XG4gICAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgICBjb3VudENoaXBzKFwiYmFua1wiKTtcbiAgICBjb3VudENoaXBzKFwiaGFuZFwiKTtcbiAgICAkKFwiLmN1cnJlbnRXYWdlclwiKS50ZXh0KFwiQ3VycmVudCBXYWdlcjogXCIgKyBnYW1lLndhZ2VyKTtcbiAgICBjb25zb2xlLmxvZyhcImJldHRpbmcgXCIgKyBhbXQpO1xuICAgIGNvbnNvbGUubG9nKFwid2FnZXIgYXQgXCIgKyBnYW1lLndhZ2VyKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkluc3VmZmljaWVudCBmdW5kcy5cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY291bnRDaGlwcyhsb2NhdGlvbikge1xuICB2YXIgYW10ID0gbG9jYXRpb24gPT09IFwiYmFua1wiID8gYmFuayA6IGdhbWUud2FnZXI7XG4gIHZhciBudW0xMDBzID0gTWF0aC5mbG9vcihhbXQgLyAxMDApO1xuICB2YXIgbnVtNTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCkgLyA1MCk7XG4gIHZhciBudW0yNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTApIC8gMjUpO1xuICB2YXIgbnVtMTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUpIC8gMTApO1xuICAgdmFyIG51bTVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCkgLyA1KTtcbiAgIHZhciBudW0xcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUpIC8gMSk7XG4gIHZhciBudW0wNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1IC0gbnVtMXMgKiAxKSAvIC41KTtcbiAgLy8gZ2FtZS5wbGF5ZXJDaGlwcyA9IHtcbiAgLy8gICBcIm51bTEwMHNcIjogbnVtMTAwcyxcbiAgLy8gICBcIm51bTUwc1wiOiBudW01MHMsXG4gIC8vICAgXCJudW0yNXNcIjogbnVtMjVzLFxuICAvLyAgIFwibnVtMTBzXCI6IG51bTEwcyxcbiAgLy8gICBcIm51bTVzXCI6IG51bTVzLFxuICAvLyAgIFwibnVtMXNcIjogbnVtMXMsXG4gIC8vICAgXCJudW0wNXNcIjogbnVtMDVzXG4gIC8vIH07XG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG4gIGlmIChsb2NhdGlvbiA9PT0gXCJiYW5rXCIpIHtcbiAgICAkYmFua0NoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmJhbmtDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGxvY2F0aW9uID09PSBcImhhbmRcIikge1xuICAgICRoYW5kQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuaGFuZENoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gRGVhbCBzcGVjaWZpYyBjYXJkcyBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRCYWNrfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtkZWFsZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIxfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gIGNoZWNrVmljdG9yeSgpO1xufSk7XG5cbiQoJy5kZWFsZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZ2l2ZUNhcmQoJ2RlYWxlcicpO1xufSk7XG5cbiQoJy5wbGF5ZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZ2l2ZUNhcmQoJ3BsYXllcicpO1xufSk7XG5cbmZ1bmN0aW9uIGdpdmVDYXJkKHBlcnNvbikge1xuICB2YXIgY2FyZFZhbHVlID0gJCgnLmdpdmVDYXJkVmFsdWUnKS52YWwoKTtcbiAgdmFyIGNhcmRTdWl0ID0gJCgnLmdpdmVDYXJkU3VpdCcpLnZhbCgpO1xuICB2YXIgY2FyZFNyYyA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHBlcnNvbiA9PT0gJ2RlYWxlcicgPyAoXG4gICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgICBjaGVja1RvdGFsKCdkZWFsZXInKSxcbiAgICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gICkgOiAoXG4gICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgICBjaGVja1RvdGFsKCdwbGF5ZXInKSxcbiAgICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gIClcbiAgY2hlY2tWaWN0b3J5KCk7XG59XG5cbi8vIEpTT04gcmVxdWVzdCBmdW5jdGlvbiB3aXRoIEpTT05QIHByb3h5XG5mdW5jdGlvbiBnZXRKU09OKHVybCwgY2IpIHtcbiAgdmFyIEpTT05QX1BST1hZID0gJ2h0dHBzOi8vanNvbnAuYWZlbGQubWUvP3VybD0nO1xuICAvLyBUSElTIFdJTEwgQUREIFRIRSBDUk9TUyBPUklHSU4gSEVBREVSU1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIEpTT05QX1BST1hZICsgdXJsKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9O1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn07XG4iXX0=