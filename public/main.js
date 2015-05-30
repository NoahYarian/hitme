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
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
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
  $("div.testHand").toggleClass("hidden");
});

//chip click listener
$(".chip").click(function () {
  if (betChangeAllowed) {
    $(".chip").attr("id", "");
    $(this).attr("id", "selectedBet");
    betAmt = Number($(this).attr("data-id"));
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
    options.image ? (html = "<img class='cardImage' src='" + options.image + "'>", $("." + options.person).prepend(html), game.hiddenCard = cardImage(data)) : (html = "<img class='cardImage' src='" + cardImage(data) + "'>", $("." + options.person).append(html));
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
    $doubleDown.attr("id", "doubleDown-disabled");
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
  $doubleDown.attr("disabled", true);
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
  $dealer.prepend("<img src='" + cardBack + "' class='cardImage'>");
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
//# sourceMappingURL=data:application/json;base64,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QUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDcEQsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUNsRSxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDL0UsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUYsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUN6RyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksR0FBRSxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUFVdEgsTUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsT0FBSyxJ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Q0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUMvQixVQUFVLENBQUMsUUFBUSxDQUFDLEVBQ3BCLE9BQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQzVELElBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQy9CLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFDcEIsT0FBTyxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FDNUQsQUFBQyxDQUFBO0FBQ0QsY0FBWSxFQUFFLENBQUM7Q0FDaEI7OztBQUdELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDeEIsTUFBSSxXQUFXLEdBQUcsOEJBQThCLENBQUM7O0FBRWpELE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDbkMsU0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUMxQixRQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO0FBQ2pELFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDO0dBQ0gsQ0FBQztBQUNGLFNBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNoQixDQUFDIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD02XCI7XG4vL3ZhciBjYXJkQmFjayA9IFwiaHR0cDovL3Rpbnl1cmwuY29tL2txenptYnJcIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTIvQ2FyZF9iYWNrXzE2LnN2Zy8yMDlweC1DYXJkX2JhY2tfMTYuc3ZnLnBuZ1wiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGNvdW50ID0gMDtcbnZhciB0cnVlQ291bnQgPSAwO1xudmFyIGNhcmRzTGVmdCA9IDMxMjtcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbnZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG52YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG52YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vYnV0dG9uc1xuLy8gdmFyICRzcGxpdCA9ICQoXCIuc3BsaXRcIik7XG52YXIgJGRvdWJsZURvd24gPSAkKFwiLmRvdWJsZURvd25cIik7XG52YXIgJG5ld0dhbWUgPSAkKFwiLm5ld0dhbWVcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xuXG4vL2NoaXBzXG52YXIgJGNoaXAxID0gJChcIi5jaGlwMVwiKTtcbnZhciAkY2hpcDUgPSAkKFwiLmNoaXA1XCIpO1xudmFyICRjaGlwMTAgPSAkKFwiLmNoaXAxMFwiKTtcbnZhciAkY2hpcDI1ID0gJChcIi5jaGlwMjVcIik7XG52YXIgJGNoaXA1MCA9ICQoXCIuY2hpcDUwXCIpO1xudmFyICRjaGlwMTAwID0gJChcIi5jaGlwMTAwXCIpO1xuXG4vL2luZm8gZGl2c1xudmFyICRoYW5kQ2hpcHMgPSAkKFwiLmhhbmRDaGlwc1wiKTtcbnZhciAkYmFua0NoaXBzID0gJChcIi5iYW5rQ2hpcHNcIik7XG52YXIgJGJhbmtUb3RhbCA9ICQoXCIuYmFua1RvdGFsXCIpO1xudmFyICRjb3VudCA9ICQoXCIuY291bnRcIik7XG52YXIgJHRydWVDb3VudCA9ICQoXCIudHJ1ZUNvdW50XCIpO1xudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcblxuLy9jYXJkIGhhbmQgZGl2c1xudmFyICRkZWFsZXIgPSAkKFwiLmRlYWxlclwiKTtcbnZhciAkcGxheWVyID0gJChcIi5wbGF5ZXJcIik7XG4vLyB2YXIgJHBsYXllclNwbGl0ID0gJChcIi5wbGF5ZXJTcGxpdFwiKTtcbi8vIHZhciAkaGFuZDEgPSAkKFwiLmhhbmQxXCIpO1xuLy8gdmFyICRoYW5kMiA9ICQoXCIuaGFuZDJcIik7XG5cbi8vaGFuZCB0b3RhbCBkaXZzXG52YXIgJGRlYWxlclRvdGFsID0gJChcIi5kZWFsZXJUb3RhbFwiKTtcbnZhciAkcGxheWVyVG90YWwgPSAkKFwiLnBsYXllclRvdGFsXCIpO1xuLy8gdmFyICRoYW5kMVRvdGFsID0gJChcIi5oYW5kMVRvdGFsXCIpO1xuLy8gdmFyICRoYW5kMlRvdGFsID0gJChcIi5oYW5kMlRvdGFsXCIpO1xuXG4vL2NyZWF0ZSBhdWRpbyBlbGVtZW50c1xudmFyIGNhcmRQbGFjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGxhY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRQbGFjZTEud2F2Jyk7XG5cbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcblxudmFyIGJ1dHRvbkNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJ1dHRvbkNsaWNrLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jbGljazEud2F2Jyk7XG5cbnZhciB3aW5XYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xud2luV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jaGlwc0hhbmRsZTUud2F2Jyk7XG5cbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbi8vICRzcGxpdC5jbGljayhzcGxpdCk7XG5cbi8vICQoXCIuZ2l2ZVNwbGl0SGFuZFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdhbWUucGxheWVySGFuZCA9IFtcIktJTkdcIiwgXCJKQUNLXCJdO1xuLy8gICBjaGVja1NwbGl0KCk7XG4vLyB9KTtcblxuJGRvdWJsZURvd24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGJldChiZXRBbXQpO1xuICBjb25zb2xlLmxvZyhcImRvdWJsZSBkb3duXCIpO1xuICBpc0RvdWJsZWREb3duID0gdHJ1ZTtcbiAgaGl0KCk7XG59KTtcblxuJG5ld0dhbWUuY2xpY2sobmV3R2FtZSk7XG5cbiRoaXQuY2xpY2soaGl0KTtcblxuJHN0YXkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIHN0YXkoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZVRlc3RQYW5lbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCJkaXYudGVzdEhhbmRcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuaGlkZGVuQ2FyZCA9IFwiXCI7XG4gIHRoaXMuZGVhbGVySGFuZCA9IFtdO1xuICB0aGlzLnBsYXllckhhbmQgPSBbXTtcbiAgdGhpcy5kZWFsZXJUb3RhbCA9IDA7XG4gIHRoaXMucGxheWVyVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0Q2FyZEltYWdlcyA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDEgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMVRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyVG90YWwgPSAwO1xuICB0aGlzLndhZ2VyID0gMDtcbiAgdGhpcy53aW5uZXIgPSBcIlwiO1xuICAvLyB0aGlzLnBsYXllckNoaXBzID0ge307XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgZGVhbCgpO1xufVxuXG5mdW5jdGlvbiBkZWFsKCkge1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBpZiAoZGVja0lkID09PSBcIlwiKSB7XG4gICAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgICAgZHJhdzQoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBjdXJyZW50IGRlY2tcIik7XG4gICAgICBkcmF3NCgpO1xuICAgIH1cbiAgICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLy8sXG4gICAgLy8gc3RvcmVJbWc6IHRydWVcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIvLyxcbiAgICAvLyBzdG9yZUltZzogdHJ1ZSxcbiAgICAvLyBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbi8vICAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuLy8gICAgICAgcmV0dXJuIDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgcmV0dXJuIDE7XG4vLyAgICAgfVxuLy8gICB9KTtcbi8vICAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbi8vICAgICBzcGxpdEFsbG93ZWQgPSB0cnVlO1xuLy8gICAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuLy8gICB9XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHNwbGl0ICgpIHtcbi8vICAgZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbi8vICAgZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbi8vICAgaXNTcGxpdCA9IHRydWU7XG4vLyAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4vLyAgICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbi8vICAgJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4vLyAgIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbi8vICAgZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4vLyAgIGhpZ2hsaWdodChcImhhbmQxXCIpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuLy8gICBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKSA6IChcbi8vICAgICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbi8vICAgICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikucHJlcGVuZChodG1sKSxcbiAgICAgIGdhbWUuaGlkZGVuQ2FyZCA9IGNhcmRJbWFnZShkYXRhKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBjYXJkSW1hZ2UoZGF0YSkgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgb3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgICBnYW1lLmRlYWxlckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKSxcbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIGhhbmQgLSBcIiArIGdhbWUuZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZ2FtZS5kZWFsZXJUb3RhbClcbiAgICApIDogKFxuICAgICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSksXG4gICAgICBjaGVja1RvdGFsKFwicGxheWVyXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBoYW5kIC0gXCIgKyBnYW1lLnBsYXllckhhbmQgKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIGdhbWUucGxheWVyVG90YWwpXG4gICAgKTtcbiAgICBjaGVja1ZpY3RvcnkoKTtcbiAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAvLyBvcHRpb25zLnN0b3JlSW1nICYmIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2goY2FyZEltYWdlKGRhdGEpKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGlzRG91YmxlZERvd24gJiYgIWdhbWUud2lubmVyKSB7XG4gICAgICAgIHN0YXkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoaXNGaXJzdFR1cm4pIHtcbiAgICBpc0ZpcnN0VHVybiA9IGZhbHNlO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcImRvdWJsZURvd24tZGlzYWJsZWRcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RheSgpIHtcbiAgZmxpcENhcmQoKTtcbiAgaWYgKCFnYW1lLndpbm5lciAmJiBnYW1lLmRlYWxlclRvdGFsIDwgMTcpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoaXRzXCIpO1xuICAgIGlzUGxheWVyc1R1cm4gPSBmYWxzZTtcbiAgICBkcmF3Q2FyZCh7XG4gICAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgICBjYWxsYmFjazogc3RheVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IGdhbWUucGxheWVyVG90YWwpIHtcbiAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgZ2FtZUVuZCgpO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPCAyMikge1xuICAgIGdhbWUuZGVhbGVyVG90YWwgPiBnYW1lLnBsYXllclRvdGFsID8gKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsICsgXCIgYmVhdHMgcGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICkgOiAoXG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCArIFwiIGJlYXRzIGRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIGNoZWNrU3BsaXRUb3RhbChoYW5kTnVtKSB7XG4vLyAgIHZhciB0b3RhbCA9IDA7XG4vLyAgIHZhciBoYW5kID0gaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gZ2FtZS5zcGxpdEhhbmQxIDogZ2FtZS5zcGxpdEhhbmQyO1xuLy8gICB2YXIgYWNlcyA9IDA7XG5cbi8vICAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4vLyAgICAgICB0b3RhbCArPSAxMDtcbi8vICAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuLy8gICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgYWNlcyArPSAxO1xuLy8gICAgIH1cbi8vICAgfSk7XG5cbi8vICAgaWYgKGFjZXMgPiAwKSB7XG4vLyAgICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbi8vICAgICAgIHRvdGFsICs9IGFjZXM7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbi8vICAgICB9XG4vLyAgIH1cblxuLy8gICBoYW5kTnVtID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgZ2FtZS5zcGxpdEhhbmQxVG90YWwgPSB0b3RhbCxcbi8vICAgICAkaGFuZDFUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMVRvdGFsKVxuLy8gICApIDogKFxuLy8gICAgIGdhbWUuc3BsaXRIYW5kMlRvdGFsID0gdG90YWwsXG4vLyAgICAgJGhhbmQyVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDJUb3RhbClcbi8vICAgKTtcbi8vIH1cblxuZnVuY3Rpb24gY2hlY2tUb3RhbChwZXJzb24pIHtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIGhhbmQgPSBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyBnYW1lLmRlYWxlckhhbmQgOiBnYW1lLnBsYXllckhhbmQ7XG4gIHZhciBhY2VzID0gMDtcblxuICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHRvdGFsICs9IDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBhY2VzICs9IDE7XG4gICAgfVxuICB9KTtcblxuICBpZiAoYWNlcyA+IDApIHtcbiAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuICAgICAgdG90YWwgKz0gYWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuICAgIH1cbiAgfVxuICB2YXIgdGV4dENvbG9yID0gXCJ3aGl0ZVwiXG4gIGlmICh0b3RhbCA9PT0gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcImxpbWVcIjtcbiAgfSBlbHNlIGlmICh0b3RhbCA+IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJyZWRcIjtcbiAgfVxuXG4gIHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICBnYW1lLmRlYWxlclRvdGFsID0gdG90YWwsXG4gICAgJGRlYWxlclRvdGFsLnRleHQoZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgJGRlYWxlclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllclRvdGFsID0gdG90YWwsXG4gICAgJHBsYXllclRvdGFsLnRleHQoZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgJHBsYXllclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KCkge1xuICBpZiAoZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA+PSAyICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPj0gMikge1xuICAgIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZG91YmxlIGJsYWNramFjayBwdXNoIVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgaXNQbGF5ZXJzVHVybiAmJiBnYW1lLnBsYXllclRvdGFsIDwgMjEpIHtcbiAgICAgIC8vZG8gbm90aGluZ1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFjaywgZG9pbmcgbm90aGluZy4uXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiMjEhXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiQlVTVFwiKTtcbiAgICB9XG4gIH1cblxuICBnYW1lLndpbm5lciAmJiBnYW1lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIGdhbWVFbmQoKSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgIGJhbmsgKz0gKGdhbWUud2FnZXIgKiAyKTtcbiAgICBjb25zb2xlLmxvZyhgZ2l2aW5nIHBsYXllciAke2dhbWUud2FnZXIgKiAyfS4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgYmFuayArPSBnYW1lLndhZ2VyO1xuICAgIGNvbnNvbGUubG9nKGByZXR1cm5pbmcgJHtnYW1lLndhZ2VyfSB0byBwbGF5ZXIuIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9XG4gICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuICBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgZmxpcENhcmQoKTtcbiAgJGRlYWxlclRvdGFsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgLy8gc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4gIC8vICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tdGFibGUgY2xlYXJlZC0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gIH1cbiAgZ2V0VHJ1ZUNvdW50KCk7XG4gIGdldEFkdmFudGFnZSgpO1xuICBzZXROZWVkbGUoKTtcbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbiAgJHRydWVDb3VudC5lbXB0eSgpO1xuICAkdHJ1ZUNvdW50LmFwcGVuZChcIjxwPlRydWUgQ291bnQ6IFwiICsgdHJ1ZUNvdW50ICsgXCI8L3A+XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlQ291bnQoKSB7XG4gIHZhciBkZWNrc0xlZnQgPSBjYXJkc0xlZnQgLyA1MjtcbiAgdHJ1ZUNvdW50ID0gKGNvdW50IC8gZGVja3NMZWZ0KS50b1ByZWNpc2lvbigyKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWR2YW50YWdlKCkge1xuICBhZHZhbnRhZ2UgPSAodHJ1ZUNvdW50ICogLjUpIC0gLjU7XG59XG5cbmZ1bmN0aW9uIHNldE5lZWRsZSgpIHtcbiAgdmFyIG51bSA9IGFkdmFudGFnZSAqIDM2O1xuICAkKFwiLmdhdWdlLW5lZWRsZVwiKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIgKyBudW0gKyBcImRlZylcIik7XG59XG5cbmZ1bmN0aW9uIGJldChhbXQpIHtcbiAgaWYgKGJhbmsgPj0gYW10KSB7XG4gICAgZ2FtZS53YWdlciArPSBhbXQ7XG4gICAgYmFuayAtPSBhbXQ7XG4gICAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgICBjb3VudENoaXBzKFwiYmFua1wiKTtcbiAgICBjb3VudENoaXBzKFwiaGFuZFwiKTtcbiAgICAkKFwiLmN1cnJlbnRXYWdlclwiKS50ZXh0KFwiQ3VycmVudCBXYWdlcjogXCIgKyBnYW1lLndhZ2VyKTtcbiAgICBjb25zb2xlLmxvZyhcImJldHRpbmcgXCIgKyBhbXQpO1xuICAgIGNvbnNvbGUubG9nKFwid2FnZXIgYXQgXCIgKyBnYW1lLndhZ2VyKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkluc3VmZmljaWVudCBmdW5kcy5cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gY291bnRDaGlwcyhsb2NhdGlvbikge1xuICB2YXIgYW10ID0gbG9jYXRpb24gPT09IFwiYmFua1wiID8gYmFuayA6IGdhbWUud2FnZXI7XG4gIHZhciBudW0xMDBzID0gTWF0aC5mbG9vcihhbXQgLyAxMDApO1xuICB2YXIgbnVtNTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCkgLyA1MCk7XG4gIHZhciBudW0yNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTApIC8gMjUpO1xuICB2YXIgbnVtMTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUpIC8gMTApO1xuICAgdmFyIG51bTVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCkgLyA1KTtcbiAgIHZhciBudW0xcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUpIC8gMSk7XG4gIHZhciBudW0wNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1IC0gbnVtMXMgKiAxKSAvIC41KTtcbiAgLy8gZ2FtZS5wbGF5ZXJDaGlwcyA9IHtcbiAgLy8gICBcIm51bTEwMHNcIjogbnVtMTAwcyxcbiAgLy8gICBcIm51bTUwc1wiOiBudW01MHMsXG4gIC8vICAgXCJudW0yNXNcIjogbnVtMjVzLFxuICAvLyAgIFwibnVtMTBzXCI6IG51bTEwcyxcbiAgLy8gICBcIm51bTVzXCI6IG51bTVzLFxuICAvLyAgIFwibnVtMXNcIjogbnVtMXMsXG4gIC8vICAgXCJudW0wNXNcIjogbnVtMDVzXG4gIC8vIH07XG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG4gIGlmIChsb2NhdGlvbiA9PT0gXCJiYW5rXCIpIHtcbiAgICAkYmFua0NoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmJhbmtDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGxvY2F0aW9uID09PSBcImhhbmRcIikge1xuICAgICRoYW5kQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuaGFuZENoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gRGVhbCBzcGVjaWZpYyBjYXJkcyBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuXG5cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbn0pO1xuXG4kKCcuZGVhbGVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdkZWFsZXInKTtcbn0pO1xuXG4kKCcucGxheWVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdwbGF5ZXInKTtcbn0pO1xuXG5mdW5jdGlvbiBnaXZlQ2FyZChwZXJzb24pIHtcbiAgdmFyIGNhcmRWYWx1ZSA9ICQoJy5naXZlQ2FyZFZhbHVlJykudmFsKCk7XG4gIHZhciBjYXJkU3VpdCA9ICQoJy5naXZlQ2FyZFN1aXQnKS52YWwoKTtcbiAgdmFyIGNhcmRTcmMgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBwZXJzb24gPT09ICdkZWFsZXInID8gKFxuICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgnZGVhbGVyJyksXG4gICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApIDogKFxuICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgncGxheWVyJyksXG4gICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApXG4gIGNoZWNrVmljdG9yeSgpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIl19