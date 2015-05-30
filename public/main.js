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

$(".toggleTestPanel").click(function () {
  console.log("click");
  $("div.testHand").toggleClass("hidden");
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLENBQUM7R0FDSCxDQUFDO0FBQ0YsU0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hCLENBQUMiLCJmaWxlIjoic3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBJID0gXCJodHRwOi8vZGVja29mY2FyZHNhcGkuY29tL2FwaS9cIjtcbnZhciBuZXdEZWNrVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbi8vdmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdGlueXVybC5jb20va3F6em1iclwiO1xudmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNS81Mi9DYXJkX2JhY2tfMTYuc3ZnLzIwOXB4LUNhcmRfYmFja18xNi5zdmcucG5nXCI7XG5cbnZhciBnYW1lO1xudmFyIGRlY2tJZCA9IFwiXCI7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IDA7XG52YXIgY2FyZHNMZWZ0ID0gMzEyO1xudmFyIGFkdmFudGFnZSA9IC0uNTtcbnZhciBiYW5rID0gNTAwO1xudmFyIGJldEFtdCA9IDI1O1xudmFyIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuLy8gdmFyIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xudmFyIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbnZhciBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbnZhciBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4vLyB2YXIgaXNTcGxpdCA9IGZhbHNlO1xuLy8gdmFyIGdhbWVIYW5kID0gXCJcIjtcblxuLy9idXR0b25zXG4vLyB2YXIgJHNwbGl0ID0gJChcIi5zcGxpdFwiKTtcbnZhciAkZG91YmxlRG93biA9ICQoXCIuZG91YmxlRG93blwiKTtcbnZhciAkbmV3R2FtZSA9ICQoXCIubmV3R2FtZVwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGhhbmRDaGlwcyA9ICQoXCIuaGFuZENoaXBzXCIpO1xudmFyICRiYW5rQ2hpcHMgPSAkKFwiLmJhbmtDaGlwc1wiKTtcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG52YXIgJGFubm91bmNlID0gJChcIi5hbm5vdW5jZVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0ID0gJChcIi5hbm5vdW5jZSBwXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlciA9ICQoXCIuZGVhbGVyXCIpO1xudmFyICRwbGF5ZXIgPSAkKFwiLnBsYXllclwiKTtcbi8vIHZhciAkcGxheWVyU3BsaXQgPSAkKFwiLnBsYXllclNwbGl0XCIpO1xuLy8gdmFyICRoYW5kMSA9ICQoXCIuaGFuZDFcIik7XG4vLyB2YXIgJGhhbmQyID0gJChcIi5oYW5kMlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG4vLyB2YXIgJGhhbmQxVG90YWwgPSAkKFwiLmhhbmQxVG90YWxcIik7XG4vLyB2YXIgJGhhbmQyVG90YWwgPSAkKFwiLmhhbmQyVG90YWxcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcblxudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xuXG52YXIgYnV0dG9uQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYnV0dG9uQ2xpY2suc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NsaWNrMS53YXYnKTtcblxudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcblxudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9wb3B1bGF0ZSBiYW5rIGFtb3VudCBvbiBwYWdlIGxvYWRcbiRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG5jb3VudENoaXBzKFwiYmFua1wiKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgYnV0dG9uQ2xpY2subG9hZCgpO1xuICBidXR0b25DbGljay5wbGF5KCk7XG59KTtcblxuLy8gJHNwbGl0LmNsaWNrKHNwbGl0KTtcblxuLy8gJChcIi5naXZlU3BsaXRIYW5kXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2FtZS5wbGF5ZXJIYW5kID0gW1wiS0lOR1wiLCBcIkpBQ0tcIl07XG4vLyAgIGNoZWNrU3BsaXQoKTtcbi8vIH0pO1xuXG4kZG91YmxlRG93bi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kbmV3R2FtZS5jbGljayhuZXdHYW1lKTtcblxuJGhpdC5jbGljayhoaXQpO1xuXG4kc3RheS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKFwic3RheVwiKTtcbiAgc3RheSgpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJjbGlja1wiKTtcbiAgJChcImRpdi50ZXN0SGFuZFwiKS50b2dnbGVDbGFzcyhcImhpZGRlblwiKTtcbn0pO1xuXG4vL2NoaXAgY2xpY2sgbGlzdGVuZXJzXG4kY2hpcDEuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMjUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSAxO1xuICB9XG59KTtcbiRjaGlwNS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDU7XG4gIH1cbn0pO1xuJGNoaXAxMC5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJGNoaXAxLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMDAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGJldEFtdCA9IDEwO1xuICB9XG59KTtcbiRjaGlwMjUuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgICRjaGlwNTAuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwMTAwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBiZXRBbXQgPSAyNTtcbiAgfVxufSk7XG4kY2hpcDUwLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkY2hpcDEuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICRjaGlwNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAxMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXAyNS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1MC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgYmV0QW10ID0gNTA7XG4gIH1cbn0pO1xuJGNoaXAxMDAuY2xpY2soZnVuY3Rpb24gKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICRjaGlwMS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJGNoaXA1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDI1LmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDUwLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkY2hpcDEwMC5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICBiZXRBbXQgPSAxMDA7XG4gIH1cbn0pO1xuXG4vL2dhbWUgb2JqZWN0XG5mdW5jdGlvbiBHYW1lKCkge1xuICB0aGlzLmhpZGRlbkNhcmQgPSBcIlwiO1xuICB0aGlzLmRlYWxlckhhbmQgPSBbXTtcbiAgdGhpcy5wbGF5ZXJIYW5kID0gW107XG4gIHRoaXMuZGVhbGVyVG90YWwgPSAwO1xuICB0aGlzLnBsYXllclRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdENhcmRJbWFnZXMgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMiA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRIYW5kMlRvdGFsID0gMDtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgLy8gdGhpcy5wbGF5ZXJDaGlwcyA9IHt9O1xufVxuXG5mdW5jdGlvbiBuZXdHYW1lKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCk7XG4gIGRlYWwoKTtcbn1cblxuZnVuY3Rpb24gZGVhbCgpIHtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBpZiAoYmFuayA+PSBiZXRBbXQpIHtcbiAgICBjbGVhclRhYmxlKCk7XG4gICAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gICAgaWYgKGRlY2tJZCA9PT0gXCJcIikge1xuICAgICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gbmV3IGRlY2tcIik7XG4gICAgICAgIGRyYXc0KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICB9XG4gICAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXc0KCkge1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIi8vLFxuICAgIC8vIHN0b3JlSW1nOiB0cnVlXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLy8sXG4gICAgLy8gc3RvcmVJbWc6IHRydWUsXG4gICAgLy8gY2FsbGJhY2s6IGNoZWNrU3BsaXRcbiAgfSk7XG59XG5cbi8vIGZ1bmN0aW9uIGNoZWNrU3BsaXQoKSB7XG4vLyAgIHZhciBjaGVja1NwbGl0QXJyID0gZ2FtZS5wbGF5ZXJIYW5kLm1hcChmdW5jdGlvbihjYXJkKSB7XG4vLyAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbi8vICAgICAgIHJldHVybiAxMDtcbi8vICAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuLy8gICAgICAgcmV0dXJuIE51bWJlcihjYXJkKTtcbi8vICAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbi8vICAgICAgIHJldHVybiAxO1xuLy8gICAgIH1cbi8vICAgfSk7XG4vLyAgIGlmIChjaGVja1NwbGl0QXJyWzBdID09PSBjaGVja1NwbGl0QXJyWzFdKSB7XG4vLyAgICAgc3BsaXRBbGxvd2VkID0gdHJ1ZTtcbi8vICAgICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbi8vICAgfVxuLy8gfVxuXG4vLyBmdW5jdGlvbiBzcGxpdCAoKSB7XG4vLyAgIGdhbWUuc3BsaXRIYW5kMS5wdXNoKGdhbWUucGxheWVySGFuZFswXSk7XG4vLyAgIGdhbWUuc3BsaXRIYW5kMi5wdXNoKGdhbWUucGxheWVySGFuZFsxXSk7XG4vLyAgIGlzU3BsaXQgPSB0cnVlO1xuLy8gICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuLy8gICAkcGxheWVyLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkcGxheWVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJTcGxpdC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJGhhbmQxLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzBdfSc+YCk7XG4vLyAgICRoYW5kMi5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1sxXX0nPmApO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMVwiKTtcbi8vICAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDJcIik7XG4vLyAgIGdhbWVIYW5kID0gXCJoYW5kMVwiO1xuLy8gICBoaWdobGlnaHQoXCJoYW5kMVwiKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gaGlnaGxpZ2h0KGhhbmQpIHtcbi8vICAgaGFuZCA9PT0gXCJoYW5kMVwiID8gKFxuLy8gICAgICRoYW5kMS5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuLy8gICAgICRoYW5kMi5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4vLyAgICkgOiAoXG4vLyAgICAgJGhhbmQyLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQxLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKTtcbi8vIH1cblxuZnVuY3Rpb24gZHJhd0NhcmQob3B0aW9ucykge1xuICB2YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIGdldEpTT04oY2FyZFVSTCwgZnVuY3Rpb24oZGF0YSwgY2IpIHtcbiAgICB2YXIgaHRtbDtcbiAgICBjYXJkUGxhY2UubG9hZCgpO1xuICAgIGNhcmRQbGFjZS5wbGF5KCk7XG4gICAgb3B0aW9ucy5pbWFnZSA/IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIG9wdGlvbnMuaW1hZ2UgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKSxcbiAgICAgIGdhbWUuaGlkZGVuQ2FyZCA9IGNhcmRJbWFnZShkYXRhKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBjYXJkSW1hZ2UoZGF0YSkgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgb3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgICBnYW1lLmRlYWxlckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIGhhbmQgLSBcIiArIGdhbWUuZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZ2FtZS5kZWFsZXJUb3RhbClcbiAgICApIDogKFxuICAgICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSksXG4gICAgICBjaGVja1RvdGFsKFwicGxheWVyXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBoYW5kIC0gXCIgKyBnYW1lLnBsYXllckhhbmQgKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIGdhbWUucGxheWVyVG90YWwpXG4gICAgKTtcbiAgICBjaGVja1ZpY3RvcnkoKTtcbiAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAvLyBvcHRpb25zLnN0b3JlSW1nICYmIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2goY2FyZEltYWdlKGRhdGEpKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkgeyBpZiAoaXNEb3VibGVkRG93biAmJiAhZ2FtZS53aW5uZXIpIHtcbiAgICAgIHN0YXkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoaXNGaXJzdFR1cm4pIHtcbiAgICBpc0ZpcnN0VHVybiA9IGZhbHNlO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBmbGlwQ2FyZCgpO1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgaXNQbGF5ZXJzVHVybiA9IGZhbHNlO1xuICAgIGRyYXdDYXJkKHtcbiAgICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICAgIGNhbGxiYWNrOiBzdGF5XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gZ2FtZS5wbGF5ZXJUb3RhbCkge1xuICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICBnYW1lRW5kKCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA8IDIyKSB7XG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA+IGdhbWUucGxheWVyVG90YWwgPyAoXG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdFRvdGFsKGhhbmROdW0pIHtcbi8vICAgdmFyIHRvdGFsID0gMDtcbi8vICAgdmFyIGhhbmQgPSBoYW5kTnVtID09PSBcImhhbmQxXCIgPyBnYW1lLnNwbGl0SGFuZDEgOiBnYW1lLnNwbGl0SGFuZDI7XG4vLyAgIHZhciBhY2VzID0gMDtcblxuLy8gICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuLy8gICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbi8vICAgICAgIHRvdGFsICs9IDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4vLyAgICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4vLyAgICAgICBhY2VzICs9IDE7XG4vLyAgICAgfVxuLy8gICB9KTtcblxuLy8gICBpZiAoYWNlcyA+IDApIHtcbi8vICAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcztcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IChcbi8vICAgICBnYW1lLnNwbGl0SGFuZDFUb3RhbCA9IHRvdGFsLFxuLy8gICAgICRoYW5kMVRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQxVG90YWwpXG4vLyAgICkgOiAoXG4vLyAgICAgZ2FtZS5zcGxpdEhhbmQyVG90YWwgPSB0b3RhbCxcbi8vICAgICAkaGFuZDJUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMlRvdGFsKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBjaGVja1RvdGFsKHBlcnNvbikge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IGdhbWUuZGVhbGVySGFuZCA6IGdhbWUucGxheWVySGFuZDtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0Q29sb3IgPSBcIndoaXRlXCJcbiAgaWYgKHRvdGFsID09PSAyMSkge1xuICAgIHRleHRDb2xvciA9IFwibGltZVwiO1xuICB9IGVsc2UgaWYgKHRvdGFsID4gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcInJlZFwiO1xuICB9XG5cbiAgcGVyc29uID09PSBcImRlYWxlclwiID8gKFxuICAgIGdhbWUuZGVhbGVyVG90YWwgPSB0b3RhbCxcbiAgICAkZGVhbGVyVG90YWwudGV4dChnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAkZGVhbGVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApIDogKFxuICAgIGdhbWUucGxheWVyVG90YWwgPSB0b3RhbCxcbiAgICAkcGxheWVyVG90YWwudGV4dChnYW1lLnBsYXllclRvdGFsKSxcbiAgICAkcGxheWVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApO1xufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoKSB7XG4gIGlmIChnYW1lLmRlYWxlckhhbmQubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA+PSAyKSB7XG4gICAgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGdhbWUud2FnZXIgKj0gMS4yNTtcbiAgICAgIGFubm91bmNlKFwiQkxBQ0tKQUNLIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBpc1BsYXllcnNUdXJuICYmIGdhbWUucGxheWVyVG90YWwgPCAyMSkge1xuICAgICAgLy9kbyBub3RoaW5nXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrLCBkb2luZyBub3RoaW5nLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCIyMSFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJCVVNUXCIpO1xuICAgIH1cbiAgfVxuXG4gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKGBnaXZpbmcgcGxheWVyICR7Z2FtZS53YWdlciAqIDJ9LiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICBiYW5rICs9IGdhbWUud2FnZXI7XG4gICAgY29uc29sZS5sb2coYHJldHVybmluZyAke2dhbWUud2FnZXJ9IHRvIHBsYXllci4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH1cbiAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4gIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuICBmbGlwQ2FyZCgpO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiZG91YmxlRG93bi1oaWRkZW5cIik7XG4gIC8vIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAvLyAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkZGVhbGVyLmVtcHR5KCk7XG4gICRwbGF5ZXIuZW1wdHkoKTtcbiAgJGRlYWxlclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuZW1wdHkoKTtcbiAgJGFubm91bmNlLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLXRhYmxlIGNsZWFyZWQtLVwiKTtcbn1cblxuZnVuY3Rpb24gY2FyZEltYWdlKGRhdGEpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9IGRhdGEuY2FyZHNbMF0udmFsdWU7XG4gIHZhciBjYXJkU3VpdCA9IGRhdGEuY2FyZHNbMF0uc3VpdDtcbiAgdmFyIGZpbGVuYW1lID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgcmV0dXJuIGZpbGVuYW1lO1xufVxuXG5mdW5jdGlvbiBhbm5vdW5jZSh0ZXh0KSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJkZWFsZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcImxvc2VcIik7XG4gICAgbG9zZVdhdi5sb2FkKCk7XG4gICAgbG9zZVdhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJ3aW5cIik7XG4gICAgd2luV2F2LmxvYWQoKTtcbiAgICB3aW5XYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcInB1c2hcIik7XG4gIH1cbiAgJGFubm91bmNlVGV4dC50ZXh0KHRleHQpO1xufVxuXG5mdW5jdGlvbiBmbGlwQ2FyZCgpIHtcbiAgY29uc29sZS5sb2coJ2ZsaXAnKTtcbiAgdmFyICRmbGlwcGVkID0gJChcIi5kZWFsZXIgLmNhcmRJbWFnZVwiKS5maXJzdCgpO1xuICAkZmxpcHBlZC5yZW1vdmUoKTtcbiAgdmFyIGh0bWwgPSBgPGltZyBzcmM9JyR7Z2FtZS5oaWRkZW5DYXJkfScgY2xhc3M9J2NhcmRJbWFnZSc+YDtcbiAgJGRlYWxlci5wcmVwZW5kKGh0bWwpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb3VudChjYXJkKSB7XG4gIGlmIChpc05hTihOdW1iZXIoY2FyZCkpIHx8IGNhcmQgPT09IFwiMTBcIikge1xuICAgIGNvdW50IC09IDE7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudCArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IChjb3VudCAvIGRlY2tzTGVmdCkudG9QcmVjaXNpb24oMik7XG59XG5cbmZ1bmN0aW9uIGdldEFkdmFudGFnZSgpIHtcbiAgYWR2YW50YWdlID0gKHRydWVDb3VudCAqIC41KSAtIC41O1xufVxuXG5mdW5jdGlvbiBzZXROZWVkbGUoKSB7XG4gIHZhciBudW0gPSBhZHZhbnRhZ2UgKiAzNjtcbiAgJChcIi5nYXVnZS1uZWVkbGVcIikuY3NzKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKFwiICsgbnVtICsgXCJkZWcpXCIpO1xufVxuXG5mdW5jdGlvbiBiZXQoYW10KSB7XG4gIGlmIChiYW5rID49IGFtdCkge1xuICAgIGdhbWUud2FnZXIgKz0gYW10O1xuICAgIGJhbmsgLT0gYW10O1xuICAgICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICAgY291bnRDaGlwcyhcImJhbmtcIik7XG4gICAgY291bnRDaGlwcyhcImhhbmRcIik7XG4gICAgJChcIi5jdXJyZW50V2FnZXJcIikudGV4dChcIkN1cnJlbnQgV2FnZXI6IFwiICsgZ2FtZS53YWdlcik7XG4gICAgY29uc29sZS5sb2coXCJiZXR0aW5nIFwiICsgYW10KTtcbiAgICBjb25zb2xlLmxvZyhcIndhZ2VyIGF0IFwiICsgZ2FtZS53YWdlcik7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJJbnN1ZmZpY2llbnQgZnVuZHMuXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvdW50Q2hpcHMobG9jYXRpb24pIHtcbiAgdmFyIGFtdCA9IGxvY2F0aW9uID09PSBcImJhbmtcIiA/IGJhbmsgOiBnYW1lLndhZ2VyO1xuICB2YXIgbnVtMTAwcyA9IE1hdGguZmxvb3IoYW10IC8gMTAwKTtcbiAgdmFyIG51bTUwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDApIC8gNTApO1xuICB2YXIgbnVtMjVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwKSAvIDI1KTtcbiAgdmFyIG51bTEwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1KSAvIDEwKTtcbiAgIHZhciBudW01cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTApIC8gNSk7XG4gICB2YXIgbnVtMXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1KSAvIDEpO1xuICB2YXIgbnVtMDVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSAtIG51bTFzICogMSkgLyAuNSk7XG4gIC8vIGdhbWUucGxheWVyQ2hpcHMgPSB7XG4gIC8vICAgXCJudW0xMDBzXCI6IG51bTEwMHMsXG4gIC8vICAgXCJudW01MHNcIjogbnVtNTBzLFxuICAvLyAgIFwibnVtMjVzXCI6IG51bTI1cyxcbiAgLy8gICBcIm51bTEwc1wiOiBudW0xMHMsXG4gIC8vICAgXCJudW01c1wiOiBudW01cyxcbiAgLy8gICBcIm51bTFzXCI6IG51bTFzLFxuICAvLyAgIFwibnVtMDVzXCI6IG51bTA1c1xuICAvLyB9O1xuICB2YXIgaHRtbCA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTAwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMDAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01MHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0yNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMjUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTA1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0wNS5wbmcnPlwiO1xuICB9O1xuICBpZiAobG9jYXRpb24gPT09IFwiYmFua1wiKSB7XG4gICAgJGJhbmtDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5iYW5rQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChsb2NhdGlvbiA9PT0gXCJoYW5kXCIpIHtcbiAgICAkaGFuZENoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmhhbmRDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9XG59XG5cbi8vIERlYWwgc3BlY2lmaWMgY2FyZHMgZm9yIHRlc3RpbmcgcHVycG9zZXNcblxuXG5cbiQoXCIudGVzdERlYWxcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCk7XG4gIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICBpZiAoYmFuayA+PSBiZXRBbXQpIHtcbiAgICBjbGVhclRhYmxlKCk7XG4gICAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgfSk7XG4gIH1cbiAgdmFyIGRlYWxlcjFWYWx1ZSA9ICQoXCIuZGVhbGVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlZhbHVlID0gJChcIi5kZWFsZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxVmFsdWUgPSAkKFwiLnBsYXllcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJWYWx1ZSA9ICQoXCIucGxheWVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMVN1aXQgPSAkKFwiLmRlYWxlcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlN1aXQgPSAkKFwiLmRlYWxlcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVN1aXQgPSAkKFwiLnBsYXllcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlN1aXQgPSAkKFwiLnBsYXllcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMVZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBkZWFsZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIyVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjFWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMlZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIGdhbWUuZGVhbGVySGFuZCA9IFtkZWFsZXIxVmFsdWUsIGRlYWxlcjJWYWx1ZV07XG4gIGdhbWUucGxheWVySGFuZCA9IFtwbGF5ZXIxVmFsdWUsIHBsYXllcjJWYWx1ZV07XG4gIGdhbWUuaGlkZGVuQ2FyZCA9IGRlYWxlcjE7XG4gICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbn0pO1xuXG4kKCcuZGVhbGVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdkZWFsZXInKTtcbn0pO1xuXG4kKCcucGxheWVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdwbGF5ZXInKTtcbn0pO1xuXG5mdW5jdGlvbiBnaXZlQ2FyZChwZXJzb24pIHtcbiAgdmFyIGNhcmRWYWx1ZSA9ICQoJy5naXZlQ2FyZFZhbHVlJykudmFsKCk7XG4gIHZhciBjYXJkU3VpdCA9ICQoJy5naXZlQ2FyZFN1aXQnKS52YWwoKTtcbiAgdmFyIGNhcmRTcmMgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBwZXJzb24gPT09ICdkZWFsZXInID8gKFxuICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgnZGVhbGVyJyksXG4gICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApIDogKFxuICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgncGxheWVyJyksXG4gICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApXG4gIGNoZWNrVmljdG9yeSgpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIl19