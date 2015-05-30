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

  if (count >= 20) {
    $count.addClass("hot");
  } else if (count > -20 && count < 20) {
    $count.removeClass("hot cold");
  } else if (count <= -20) {
    $count.addClass("cold");
  }
}

function getTrueCount() {
  var decksLeft = cardsLeft / 52;
  trueCount = count / decksLeft;
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
//# sourceMappingURL=data:application/json;base64,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QUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFVBQU0sR0FBRyxFQUFFLENBQUM7R0FDYjtDQUNGLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN4QixNQUFJLGdCQUFnQixFQUFFO0FBQ3BCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFVBQU0sR0FBRyxFQUFFLENBQUM7R0FDYjtDQUNGLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN4QixNQUFJLGdCQUFnQixFQUFFO0FBQ3BCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxJQUFJ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QUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDO0dBQ0gsQ0FBQztBQUNGLFNBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNoQixDQUFDIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD02XCI7XG4vL3ZhciBjYXJkQmFjayA9IFwiaHR0cDovL3Rpbnl1cmwuY29tL2txenptYnJcIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTIvQ2FyZF9iYWNrXzE2LnN2Zy8yMDlweC1DYXJkX2JhY2tfMTYuc3ZnLnBuZ1wiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGNvdW50ID0gMDtcbnZhciB0cnVlQ291bnQgPSAwO1xudmFyIGNhcmRzTGVmdCA9IDMxMjtcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbnZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG52YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG52YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vYnV0dG9uc1xuLy8gdmFyICRzcGxpdCA9ICQoXCIuc3BsaXRcIik7XG52YXIgJGRvdWJsZURvd24gPSAkKFwiLmRvdWJsZURvd25cIik7XG52YXIgJG5ld0dhbWUgPSAkKFwiLm5ld0dhbWVcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xuXG4vL2NoaXBzXG52YXIgJGNoaXAxID0gJChcIi5jaGlwMVwiKTtcbnZhciAkY2hpcDUgPSAkKFwiLmNoaXA1XCIpO1xudmFyICRjaGlwMTAgPSAkKFwiLmNoaXAxMFwiKTtcbnZhciAkY2hpcDI1ID0gJChcIi5jaGlwMjVcIik7XG52YXIgJGNoaXA1MCA9ICQoXCIuY2hpcDUwXCIpO1xudmFyICRjaGlwMTAwID0gJChcIi5jaGlwMTAwXCIpO1xuXG4vL2luZm8gZGl2c1xudmFyICRoYW5kQ2hpcHMgPSAkKFwiLmhhbmRDaGlwc1wiKTtcbnZhciAkYmFua0NoaXBzID0gJChcIi5iYW5rQ2hpcHNcIik7XG52YXIgJGJhbmtUb3RhbCA9ICQoXCIuYmFua1RvdGFsXCIpO1xudmFyICRjb3VudCA9ICQoXCIuY291bnRcIik7XG52YXIgJHRydWVDb3VudCA9ICQoXCIudHJ1ZUNvdW50XCIpO1xudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcblxuLy9jYXJkIGhhbmQgZGl2c1xudmFyICRkZWFsZXIgPSAkKFwiLmRlYWxlclwiKTtcbnZhciAkcGxheWVyID0gJChcIi5wbGF5ZXJcIik7XG4vLyB2YXIgJHBsYXllclNwbGl0ID0gJChcIi5wbGF5ZXJTcGxpdFwiKTtcbi8vIHZhciAkaGFuZDEgPSAkKFwiLmhhbmQxXCIpO1xuLy8gdmFyICRoYW5kMiA9ICQoXCIuaGFuZDJcIik7XG5cbi8vaGFuZCB0b3RhbCBkaXZzXG52YXIgJGRlYWxlclRvdGFsID0gJChcIi5kZWFsZXJUb3RhbFwiKTtcbnZhciAkcGxheWVyVG90YWwgPSAkKFwiLnBsYXllclRvdGFsXCIpO1xuLy8gdmFyICRoYW5kMVRvdGFsID0gJChcIi5oYW5kMVRvdGFsXCIpO1xuLy8gdmFyICRoYW5kMlRvdGFsID0gJChcIi5oYW5kMlRvdGFsXCIpO1xuXG4vL2NyZWF0ZSBhdWRpbyBlbGVtZW50c1xudmFyIGNhcmRQbGFjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGxhY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRQbGFjZTEud2F2Jyk7XG5cbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcblxudmFyIGJ1dHRvbkNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJ1dHRvbkNsaWNrLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jbGljazEud2F2Jyk7XG5cbnZhciB3aW5XYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xud2luV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jaGlwc0hhbmRsZTUud2F2Jyk7XG5cbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbi8vICRzcGxpdC5jbGljayhzcGxpdCk7XG5cbi8vICQoXCIuZ2l2ZVNwbGl0SGFuZFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdhbWUucGxheWVySGFuZCA9IFtcIktJTkdcIiwgXCJKQUNLXCJdO1xuLy8gICBjaGVja1NwbGl0KCk7XG4vLyB9KTtcblxuJGRvdWJsZURvd24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGJldChiZXRBbXQpO1xuICBjb25zb2xlLmxvZyhcImRvdWJsZSBkb3duXCIpO1xuICBpc0RvdWJsZWREb3duID0gdHJ1ZTtcbiAgaGl0KCk7XG59KTtcblxuJG5ld0dhbWUuY2xpY2sobmV3R2FtZSk7XG5cbiRoaXQuY2xpY2soaGl0KTtcblxuJHN0YXkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIHN0YXkoKTtcbn0pO1xuXG4vL2NoaXAgY2xpY2sgbGlzdGVuZXJzXG4kY2hpcDEuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSAxO1xuICB9XG59KTtcbiRjaGlwNS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDU7XG4gIH1cbn0pO1xuJGNoaXAxMC5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDEwO1xuICB9XG59KTtcbiRjaGlwMjUuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSAyNTtcbiAgfVxufSk7XG4kY2hpcDUwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gNTA7XG4gIH1cbn0pO1xuJGNoaXAxMDAuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICBiZXRBbXQgPSAxMDA7XG4gIH1cbn0pO1xuXG4vL2dhbWUgb2JqZWN0XG5mdW5jdGlvbiBHYW1lKCkge1xuICB0aGlzLmhpZGRlbkNhcmQgPSBcIlwiO1xuICB0aGlzLmRlYWxlckhhbmQgPSBbXTtcbiAgdGhpcy5wbGF5ZXJIYW5kID0gW107XG4gIHRoaXMuZGVhbGVyVG90YWwgPSAwO1xuICB0aGlzLnBsYXllclRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdENhcmRJbWFnZXMgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMiA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRIYW5kMlRvdGFsID0gMDtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgLy8gdGhpcy5wbGF5ZXJDaGlwcyA9IHt9O1xufVxuXG5mdW5jdGlvbiBuZXdHYW1lKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCk7XG4gIGRlYWwoKTtcbn1cblxuZnVuY3Rpb24gZGVhbCgpIHtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBpZiAoYmFuayA+PSBiZXRBbXQpIHtcbiAgICBjbGVhclRhYmxlKCk7XG4gICAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gICAgaWYgKGRlY2tJZCA9PT0gXCJcIikge1xuICAgICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gbmV3IGRlY2tcIik7XG4gICAgICAgIGRyYXc0KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICB9XG4gICAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXc0KCkge1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIi8vLFxuICAgIC8vIHN0b3JlSW1nOiB0cnVlXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLy8sXG4gICAgLy8gc3RvcmVJbWc6IHRydWUsXG4gICAgLy8gY2FsbGJhY2s6IGNoZWNrU3BsaXRcbiAgfSk7XG59XG5cbi8vIGZ1bmN0aW9uIGNoZWNrU3BsaXQoKSB7XG4vLyAgIHZhciBjaGVja1NwbGl0QXJyID0gZ2FtZS5wbGF5ZXJIYW5kLm1hcChmdW5jdGlvbihjYXJkKSB7XG4vLyAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbi8vICAgICAgIHJldHVybiAxMDtcbi8vICAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuLy8gICAgICAgcmV0dXJuIE51bWJlcihjYXJkKTtcbi8vICAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbi8vICAgICAgIHJldHVybiAxO1xuLy8gICAgIH1cbi8vICAgfSk7XG4vLyAgIGlmIChjaGVja1NwbGl0QXJyWzBdID09PSBjaGVja1NwbGl0QXJyWzFdKSB7XG4vLyAgICAgc3BsaXRBbGxvd2VkID0gdHJ1ZTtcbi8vICAgICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbi8vICAgfVxuLy8gfVxuXG4vLyBmdW5jdGlvbiBzcGxpdCAoKSB7XG4vLyAgIGdhbWUuc3BsaXRIYW5kMS5wdXNoKGdhbWUucGxheWVySGFuZFswXSk7XG4vLyAgIGdhbWUuc3BsaXRIYW5kMi5wdXNoKGdhbWUucGxheWVySGFuZFsxXSk7XG4vLyAgIGlzU3BsaXQgPSB0cnVlO1xuLy8gICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuLy8gICAkcGxheWVyLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkcGxheWVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJTcGxpdC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJGhhbmQxLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzBdfSc+YCk7XG4vLyAgICRoYW5kMi5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1sxXX0nPmApO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMVwiKTtcbi8vICAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDJcIik7XG4vLyAgIGdhbWVIYW5kID0gXCJoYW5kMVwiO1xuLy8gICBoaWdobGlnaHQoXCJoYW5kMVwiKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gaGlnaGxpZ2h0KGhhbmQpIHtcbi8vICAgaGFuZCA9PT0gXCJoYW5kMVwiID8gKFxuLy8gICAgICRoYW5kMS5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuLy8gICAgICRoYW5kMi5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4vLyAgICkgOiAoXG4vLyAgICAgJGhhbmQyLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQxLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKTtcbi8vIH1cblxuZnVuY3Rpb24gZHJhd0NhcmQob3B0aW9ucykge1xuICB2YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIGdldEpTT04oY2FyZFVSTCwgZnVuY3Rpb24oZGF0YSwgY2IpIHtcbiAgICB2YXIgaHRtbDtcbiAgICBjYXJkUGxhY2UubG9hZCgpO1xuICAgIGNhcmRQbGFjZS5wbGF5KCk7XG4gICAgb3B0aW9ucy5pbWFnZSA/IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIG9wdGlvbnMuaW1hZ2UgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKSxcbiAgICAgIGdhbWUuaGlkZGVuQ2FyZCA9IGNhcmRJbWFnZShkYXRhKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBjYXJkSW1hZ2UoZGF0YSkgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgb3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgICBnYW1lLmRlYWxlckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIGhhbmQgLSBcIiArIGdhbWUuZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZ2FtZS5kZWFsZXJUb3RhbClcbiAgICApIDogKFxuICAgICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSksXG4gICAgICBjaGVja1RvdGFsKFwicGxheWVyXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBoYW5kIC0gXCIgKyBnYW1lLnBsYXllckhhbmQgKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIGdhbWUucGxheWVyVG90YWwpXG4gICAgKTtcbiAgICBjaGVja1ZpY3RvcnkoKTtcbiAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAvLyBvcHRpb25zLnN0b3JlSW1nICYmIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2goY2FyZEltYWdlKGRhdGEpKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkgeyBpZiAoaXNEb3VibGVkRG93biAmJiAhZ2FtZS53aW5uZXIpIHtcbiAgICAgIHN0YXkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoaXNGaXJzdFR1cm4pIHtcbiAgICBpc0ZpcnN0VHVybiA9IGZhbHNlO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBmbGlwQ2FyZCgpO1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgaXNQbGF5ZXJzVHVybiA9IGZhbHNlO1xuICAgIGRyYXdDYXJkKHtcbiAgICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICAgIGNhbGxiYWNrOiBzdGF5XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gZ2FtZS5wbGF5ZXJUb3RhbCkge1xuICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICBnYW1lRW5kKCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA8IDIyKSB7XG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA+IGdhbWUucGxheWVyVG90YWwgPyAoXG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdFRvdGFsKGhhbmROdW0pIHtcbi8vICAgdmFyIHRvdGFsID0gMDtcbi8vICAgdmFyIGhhbmQgPSBoYW5kTnVtID09PSBcImhhbmQxXCIgPyBnYW1lLnNwbGl0SGFuZDEgOiBnYW1lLnNwbGl0SGFuZDI7XG4vLyAgIHZhciBhY2VzID0gMDtcblxuLy8gICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuLy8gICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbi8vICAgICAgIHRvdGFsICs9IDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4vLyAgICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4vLyAgICAgICBhY2VzICs9IDE7XG4vLyAgICAgfVxuLy8gICB9KTtcblxuLy8gICBpZiAoYWNlcyA+IDApIHtcbi8vICAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcztcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IChcbi8vICAgICBnYW1lLnNwbGl0SGFuZDFUb3RhbCA9IHRvdGFsLFxuLy8gICAgICRoYW5kMVRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQxVG90YWwpXG4vLyAgICkgOiAoXG4vLyAgICAgZ2FtZS5zcGxpdEhhbmQyVG90YWwgPSB0b3RhbCxcbi8vICAgICAkaGFuZDJUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMlRvdGFsKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBjaGVja1RvdGFsKHBlcnNvbikge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IGdhbWUuZGVhbGVySGFuZCA6IGdhbWUucGxheWVySGFuZDtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0Q29sb3IgPSBcIndoaXRlXCJcbiAgaWYgKHRvdGFsID09PSAyMSkge1xuICAgIHRleHRDb2xvciA9IFwibGltZVwiO1xuICB9IGVsc2UgaWYgKHRvdGFsID4gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcInJlZFwiO1xuICB9XG5cbiAgcGVyc29uID09PSBcImRlYWxlclwiID8gKFxuICAgIGdhbWUuZGVhbGVyVG90YWwgPSB0b3RhbCxcbiAgICAkZGVhbGVyVG90YWwudGV4dChnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAkZGVhbGVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApIDogKFxuICAgIGdhbWUucGxheWVyVG90YWwgPSB0b3RhbCxcbiAgICAkcGxheWVyVG90YWwudGV4dChnYW1lLnBsYXllclRvdGFsKSxcbiAgICAkcGxheWVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApO1xufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoKSB7XG4gIGlmIChnYW1lLmRlYWxlckhhbmQubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA+PSAyKSB7XG4gICAgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGdhbWUud2FnZXIgKj0gMS4yNTtcbiAgICAgIGFubm91bmNlKFwiQkxBQ0tKQUNLIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBpc1BsYXllcnNUdXJuICYmIGdhbWUucGxheWVyVG90YWwgPCAyMSkge1xuICAgICAgLy9kbyBub3RoaW5nXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrLCBkb2luZyBub3RoaW5nLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCIyMSFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJCVVNUXCIpO1xuICAgIH1cbiAgfVxuXG4gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKGBnaXZpbmcgcGxheWVyICR7Z2FtZS53YWdlciAqIDJ9LiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICBiYW5rICs9IGdhbWUud2FnZXI7XG4gICAgY29uc29sZS5sb2coYHJldHVybmluZyAke2dhbWUud2FnZXJ9IHRvIHBsYXllci4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH1cbiAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4gIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuICBmbGlwQ2FyZCgpO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiZG91YmxlRG93bi1oaWRkZW5cIik7XG4gIC8vIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAvLyAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkZGVhbGVyLmVtcHR5KCk7XG4gICRwbGF5ZXIuZW1wdHkoKTtcbiAgJGRlYWxlclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuZW1wdHkoKTtcbiAgJGFubm91bmNlLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLXRhYmxlIGNsZWFyZWQtLVwiKTtcbn1cblxuZnVuY3Rpb24gY2FyZEltYWdlKGRhdGEpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9IGRhdGEuY2FyZHNbMF0udmFsdWU7XG4gIHZhciBjYXJkU3VpdCA9IGRhdGEuY2FyZHNbMF0uc3VpdDtcbiAgdmFyIGZpbGVuYW1lID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgcmV0dXJuIGZpbGVuYW1lO1xufVxuXG5mdW5jdGlvbiBhbm5vdW5jZSh0ZXh0KSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJkZWFsZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcImxvc2VcIik7XG4gICAgbG9zZVdhdi5sb2FkKCk7XG4gICAgbG9zZVdhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJ3aW5cIik7XG4gICAgd2luV2F2LmxvYWQoKTtcbiAgICB3aW5XYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcInB1c2hcIik7XG4gIH1cbiAgJGFubm91bmNlVGV4dC50ZXh0KHRleHQpO1xufVxuXG5mdW5jdGlvbiBmbGlwQ2FyZCgpIHtcbiAgY29uc29sZS5sb2coJ2ZsaXAnKTtcbiAgdmFyICRmbGlwcGVkID0gJChcIi5kZWFsZXIgLmNhcmRJbWFnZVwiKS5maXJzdCgpO1xuICAkZmxpcHBlZC5yZW1vdmUoKTtcbiAgdmFyIGh0bWwgPSBgPGltZyBzcmM9JyR7Z2FtZS5oaWRkZW5DYXJkfScgY2xhc3M9J2NhcmRJbWFnZSc+YDtcbiAgJGRlYWxlci5wcmVwZW5kKGh0bWwpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb3VudChjYXJkKSB7XG4gIGlmIChpc05hTihOdW1iZXIoY2FyZCkpIHx8IGNhcmQgPT09IFwiMTBcIikge1xuICAgIGNvdW50IC09IDE7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudCArIFwiPC9wPlwiKTtcblxuICBpZiAoY291bnQgPj0gMjApIHtcbiAgICAkY291bnQuYWRkQ2xhc3MoXCJob3RcIik7XG4gIH0gZWxzZSBpZiAoY291bnQgPiAtMjAgJiYgY291bnQgPCAyMCkge1xuICAgICRjb3VudC5yZW1vdmVDbGFzcyhcImhvdCBjb2xkXCIpO1xuICB9IGVsc2UgaWYgKGNvdW50IDw9IC0yMCkge1xuICAgICRjb3VudC5hZGRDbGFzcyhcImNvbGRcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3NMZWZ0O1xufVxuXG5mdW5jdGlvbiBnZXRBZHZhbnRhZ2UoKSB7XG4gIGFkdmFudGFnZSA9ICh0cnVlQ291bnQgKiAuNSkgLSAuNTtcbn1cblxuZnVuY3Rpb24gc2V0TmVlZGxlKCkge1xuICB2YXIgbnVtID0gYWR2YW50YWdlICogMzY7XG4gICQoXCIuZ2F1Z2UtbmVlZGxlXCIpLmNzcyhcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArIG51bSArIFwiZGVnKVwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoXCJoYW5kXCIpO1xuICAgICQoXCIuY3VycmVudFdhZ2VyXCIpLnRleHQoXCJDdXJyZW50IFdhZ2VyOiBcIiArIGdhbWUud2FnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiYmV0dGluZyBcIiArIGFtdCk7XG4gICAgY29uc29sZS5sb2coXCJ3YWdlciBhdCBcIiArIGdhbWUud2FnZXIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiSW5zdWZmaWNpZW50IGZ1bmRzLlwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuICAvLyBnYW1lLnBsYXllckNoaXBzID0ge1xuICAvLyAgIFwibnVtMTAwc1wiOiBudW0xMDBzLFxuICAvLyAgIFwibnVtNTBzXCI6IG51bTUwcyxcbiAgLy8gICBcIm51bTI1c1wiOiBudW0yNXMsXG4gIC8vICAgXCJudW0xMHNcIjogbnVtMTBzLFxuICAvLyAgIFwibnVtNXNcIjogbnVtNXMsXG4gIC8vICAgXCJudW0xc1wiOiBudW0xcyxcbiAgLy8gICBcIm51bTA1c1wiOiBudW0wNXNcbiAgLy8gfTtcbiAgdmFyIGh0bWwgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMjVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTI1LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTFzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0wNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMDUucG5nJz5cIjtcbiAgfTtcbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobG9jYXRpb24gPT09IFwiaGFuZFwiKSB7XG4gICAgJGhhbmRDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5oYW5kQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBEZWFsIHNwZWNpZmljIGNhcmRzIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG4kKFwiLnRlc3REZWFsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpO1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgaWYgKGJhbmsgPj0gYmV0QW10KSB7XG4gICAgY2xlYXJUYWJsZSgpO1xuICAgICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gICAgY2FyZFBhY2thZ2UucGxheSgpO1xuICAgIGdldEpTT04obmV3RGVja1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgIH0pO1xuICB9XG4gIHZhciBkZWFsZXIxVmFsdWUgPSAkKFwiLmRlYWxlcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJWYWx1ZSA9ICQoXCIuZGVhbGVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVZhbHVlID0gJChcIi5wbGF5ZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyVmFsdWUgPSAkKFwiLnBsYXllcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjFTdWl0ID0gJChcIi5kZWFsZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJTdWl0ID0gJChcIi5kZWFsZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFTdWl0ID0gJChcIi5wbGF5ZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJTdWl0ID0gJChcIi5wbGF5ZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjFWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgZGVhbGVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMlZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIxVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjJWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBnYW1lLmRlYWxlckhhbmQgPSBbZGVhbGVyMVZhbHVlLCBkZWFsZXIyVmFsdWVdO1xuICBnYW1lLnBsYXllckhhbmQgPSBbcGxheWVyMVZhbHVlLCBwbGF5ZXIyVmFsdWVdO1xuICBnYW1lLmhpZGRlbkNhcmQgPSBkZWFsZXIxO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZEJhY2t9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2RlYWxlcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjF9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgY2hlY2tUb3RhbChcInBsYXllclwiKTtcbiAgY2hlY2tWaWN0b3J5KCk7XG59KTtcblxuJCgnLmRlYWxlckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICBnaXZlQ2FyZCgnZGVhbGVyJyk7XG59KTtcblxuJCgnLnBsYXllckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICBnaXZlQ2FyZCgncGxheWVyJyk7XG59KTtcblxuZnVuY3Rpb24gZ2l2ZUNhcmQocGVyc29uKSB7XG4gIHZhciBjYXJkVmFsdWUgPSAkKCcuZ2l2ZUNhcmRWYWx1ZScpLnZhbCgpO1xuICB2YXIgY2FyZFN1aXQgPSAkKCcuZ2l2ZUNhcmRTdWl0JykudmFsKCk7XG4gIHZhciBjYXJkU3JjID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgcGVyc29uID09PSAnZGVhbGVyJyA/IChcbiAgICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAgIGNoZWNrVG90YWwoJ2RlYWxlcicpLFxuICAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAgIGNoZWNrVG90YWwoJ3BsYXllcicpLFxuICAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgKVxuICBjaGVja1ZpY3RvcnkoKTtcbn1cblxuLy8gSlNPTiByZXF1ZXN0IGZ1bmN0aW9uIHdpdGggSlNPTlAgcHJveHlcbmZ1bmN0aW9uIGdldEpTT04odXJsLCBjYikge1xuICB2YXIgSlNPTlBfUFJPWFkgPSAnaHR0cHM6Ly9qc29ucC5hZmVsZC5tZS8/dXJsPSc7XG4gIC8vIFRISVMgV0lMTCBBREQgVEhFIENST1NTIE9SSUdJTiBIRUFERVJTXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgSlNPTlBfUFJPWFkgKyB1cmwpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiJdfQ==