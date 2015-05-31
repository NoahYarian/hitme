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
var isFlipped = false;
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
  flipCard();
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
  bet(betAmt) && deal();
}

function deal() {
  isFirstTurn = true;
  isFlipped = false;
  betChangeAllowed = false;
  clearTable();
  $newGame.attr("disabled", true);
  $hit.attr("disabled", false);
  $stay.attr("disabled", false);
  $doubleDown.attr("disabled", false);
  $doubleDown.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 20) {
    getJSON(newDeckURL, function (data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
      count = 0;
      trueCount = 0;
      cardsLeft = 312;
      advantage = -0.5;
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
    if (options.person === "dealer") {
      if (options.image) {
        game.dealerHand.unshift(data.cards[0].value);
      } else {
        game.dealerHand.push(data.cards[0].value);
        updateCount(data.cards[0].value);
      }
      checkTotal("dealer");
      console.log("dealer's hand - " + game.dealerHand + " **** dealer is at " + game.dealerTotal);
    } else if (options.person === "player") {
      game.playerHand.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal("player");
      console.log("player's hand - " + game.playerHand + " **** player is at " + game.playerTotal);
    }
    checkVictory();
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
  !isFlipped && flipCard();
  betChangeAllowed = true;
  isPlayersTurn = true;
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
  console.log("------------table cleared------------");
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
  isFlipped = true;
  var $flipped = $(".dealer .cardImage").first();
  $flipped.remove();
  var html = "<img src='" + game.hiddenCard + "' class='cardImage'>";
  $dealer.prepend(html);
  updateCount(game.dealerHand[0]);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
    console.log("" + card + " --> count -1 --> " + count);
  } else if (card < 7) {
    count += 1;
    console.log("" + card + " --> count +1 --> " + count);
  } else if (card >= 7 && card <= 9) {
    console.log("" + card + " --> count +0 --> " + count);
  }
  getTrueCount();
  getAdvantage();
  setNeedle();
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
  $trueCount.empty();
  $trueCount.append("<p>True Count: " + trueCount.toPrecision(2) + "</p>");
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
    return true;
  } else {
    console.log("Insufficient funds.");
    return false;
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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDbEUsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVGLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDekcsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLEdBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FBVXRILE1BQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEMsUUFBSSxJQUFJLGlDQUFpQyxDQUFDO0dBQzNDLENBQUM7QUFDRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdB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LFNBQVMsQ0FBQyxFQUMvQixVQUFVLENBQUMsUUFBUSxDQUFDLEVBQ3BCLE9BQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQzVELEFBQUMsQ0FBQTtBQUNELGNBQVksRUFBRSxDQUFDO0NBQ2hCOzs7QUFHRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ3hCLE1BQUksV0FBVyxHQUFHLDhCQUE4QixDQUFDOztBQUVqRCxNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2QyxTQUFPLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDMUIsUUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUNqRCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxNQUFNO0FBQ0wsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsQ0FBQyIsImZpbGUiOiJzcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBUEkgPSBcImh0dHA6Ly9kZWNrb2ZjYXJkc2FwaS5jb20vYXBpL1wiO1xudmFyIG5ld0RlY2tVUkwgPSBBUEkgKyBcInNodWZmbGUvP2RlY2tfY291bnQ9NlwiO1xuLy92YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly90aW55dXJsLmNvbS9rcXp6bWJyXCI7XG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzUyL0NhcmRfYmFja18xNi5zdmcvMjA5cHgtQ2FyZF9iYWNrXzE2LnN2Zy5wbmdcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBjb3VudCA9IDA7XG52YXIgdHJ1ZUNvdW50ID0gMDtcbnZhciBjYXJkc0xlZnQgPSAzMTI7XG52YXIgYWR2YW50YWdlID0gLS41O1xudmFyIGJhbmsgPSA1MDA7XG52YXIgYmV0QW10ID0gMjU7XG52YXIgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4vLyB2YXIgc3BsaXRBbGxvd2VkID0gZmFsc2U7XG52YXIgaXNGaXJzdFR1cm4gPSB0cnVlO1xudmFyIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xudmFyIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbnZhciBpc0ZsaXBwZWQgPSBmYWxzZTtcbi8vIHZhciBpc1NwbGl0ID0gZmFsc2U7XG4vLyB2YXIgZ2FtZUhhbmQgPSBcIlwiO1xuXG4vL2J1dHRvbnNcbi8vIHZhciAkc3BsaXQgPSAkKFwiLnNwbGl0XCIpO1xudmFyICRkb3VibGVEb3duID0gJChcIi5kb3VibGVEb3duXCIpO1xudmFyICRuZXdHYW1lID0gJChcIi5uZXdHYW1lXCIpO1xudmFyICRoaXQgPSAkKFwiLmhpdFwiKTtcbnZhciAkc3RheSA9ICQoXCIuc3RheVwiKTtcblxuLy9jaGlwc1xudmFyICRjaGlwMSA9ICQoXCIuY2hpcDFcIik7XG52YXIgJGNoaXA1ID0gJChcIi5jaGlwNVwiKTtcbnZhciAkY2hpcDEwID0gJChcIi5jaGlwMTBcIik7XG52YXIgJGNoaXAyNSA9ICQoXCIuY2hpcDI1XCIpO1xudmFyICRjaGlwNTAgPSAkKFwiLmNoaXA1MFwiKTtcbnZhciAkY2hpcDEwMCA9ICQoXCIuY2hpcDEwMFwiKTtcblxuLy9pbmZvIGRpdnNcbnZhciAkaGFuZENoaXBzID0gJChcIi5oYW5kQ2hpcHNcIik7XG52YXIgJGJhbmtDaGlwcyA9ICQoXCIuYmFua0NoaXBzXCIpO1xudmFyICRiYW5rVG90YWwgPSAkKFwiLmJhbmtUb3RhbFwiKTtcbnZhciAkY291bnQgPSAkKFwiLmNvdW50XCIpO1xudmFyICR0cnVlQ291bnQgPSAkKFwiLnRydWVDb3VudFwiKTtcbnZhciAkYW5ub3VuY2UgPSAkKFwiLmFubm91bmNlXCIpO1xudmFyICRhbm5vdW5jZVRleHQgPSAkKFwiLmFubm91bmNlIHBcIik7XG5cbi8vY2FyZCBoYW5kIGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xuLy8gdmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG4vLyB2YXIgJGhhbmQxID0gJChcIi5oYW5kMVwiKTtcbi8vIHZhciAkaGFuZDIgPSAkKFwiLmhhbmQyXCIpO1xuXG4vL2hhbmQgdG90YWwgZGl2c1xudmFyICRkZWFsZXJUb3RhbCA9ICQoXCIuZGVhbGVyVG90YWxcIik7XG52YXIgJHBsYXllclRvdGFsID0gJChcIi5wbGF5ZXJUb3RhbFwiKTtcbi8vIHZhciAkaGFuZDFUb3RhbCA9ICQoXCIuaGFuZDFUb3RhbFwiKTtcbi8vIHZhciAkaGFuZDJUb3RhbCA9ICQoXCIuaGFuZDJUb3RhbFwiKTtcblxuLy9jcmVhdGUgYXVkaW8gZWxlbWVudHNcbnZhciBjYXJkUGxhY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBsYWNlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkUGxhY2UxLndhdicpO1xuXG52YXIgY2FyZFBhY2thZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBhY2thZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRPcGVuUGFja2FnZTIud2F2Jyk7XG5cbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xuXG52YXIgd2luV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbndpbldhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2hpcHNIYW5kbGU1LndhdicpO1xuXG52YXIgbG9zZVdhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5sb3NlV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkU2hvdmUzLndhdicpO1xuXG4vL3BvcHVsYXRlIGJhbmsgYW1vdW50IG9uIHBhZ2UgbG9hZFxuJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbmNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuXG4vL2J1dHRvbiBjbGljayBsaXN0ZW5lcnNcbiQoXCJidXR0b25cIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBidXR0b25DbGljay5sb2FkKCk7XG4gIGJ1dHRvbkNsaWNrLnBsYXkoKTtcbn0pO1xuXG4vLyAkc3BsaXQuY2xpY2soc3BsaXQpO1xuXG4vLyAkKFwiLmdpdmVTcGxpdEhhbmRcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnYW1lLnBsYXllckhhbmQgPSBbXCJLSU5HXCIsIFwiSkFDS1wiXTtcbi8vICAgY2hlY2tTcGxpdCgpO1xuLy8gfSk7XG5cbiRkb3VibGVEb3duLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBiZXQoYmV0QW10KTtcbiAgY29uc29sZS5sb2coXCJkb3VibGUgZG93blwiKTtcbiAgaXNEb3VibGVkRG93biA9IHRydWU7XG4gIGhpdCgpO1xufSk7XG5cbiRuZXdHYW1lLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBzdGF5KCk7XG59KTtcblxuJChcIi50b2dnbGVUZXN0UGFuZWxcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkKFwiZGl2LnRlc3RIYW5kXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbi8vY2hpcCBjbGljayBsaXN0ZW5lclxuJChcIi5jaGlwXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICQoXCIuY2hpcFwiKS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJCh0aGlzKS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICBiZXRBbXQgPSBOdW1iZXIoJCh0aGlzKS5hdHRyKFwiZGF0YS1pZFwiKSk7XG4gIH1cbn0pO1xuXG4vL2dhbWUgb2JqZWN0XG5mdW5jdGlvbiBHYW1lKCkge1xuICB0aGlzLmhpZGRlbkNhcmQgPSBcIlwiO1xuICB0aGlzLmRlYWxlckhhbmQgPSBbXTtcbiAgdGhpcy5wbGF5ZXJIYW5kID0gW107XG4gIHRoaXMuZGVhbGVyVG90YWwgPSAwO1xuICB0aGlzLnBsYXllclRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdENhcmRJbWFnZXMgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMiA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRIYW5kMlRvdGFsID0gMDtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgLy8gdGhpcy5wbGF5ZXJDaGlwcyA9IHt9O1xufVxuXG5mdW5jdGlvbiBuZXdHYW1lKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCkgJiYgZGVhbCgpO1xufVxuXG5mdW5jdGlvbiBkZWFsKCkge1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGlzRmxpcHBlZCA9IGZhbHNlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGNsZWFyVGFibGUoKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gIGlmIChkZWNrSWQgPT09IFwiXCIgfHwgY2FyZHNMZWZ0IDwgMjApIHtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIG5ldyBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICAgIGNvdW50ID0gMDtcbiAgICAgIHRydWVDb3VudCA9IDA7XG4gICAgICBjYXJkc0xlZnQgPSAzMTI7XG4gICAgICBhZHZhbnRhZ2UgPSAtLjU7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLy8sXG4gICAgLy8gc3RvcmVJbWc6IHRydWVcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIvLyxcbiAgICAvLyBzdG9yZUltZzogdHJ1ZSxcbiAgICAvLyBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbi8vICAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbi8vICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuLy8gICAgICAgcmV0dXJuIDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICByZXR1cm4gTnVtYmVyKGNhcmQpO1xuLy8gICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuLy8gICAgICAgcmV0dXJuIDE7XG4vLyAgICAgfVxuLy8gICB9KTtcbi8vICAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbi8vICAgICBzcGxpdEFsbG93ZWQgPSB0cnVlO1xuLy8gICAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuLy8gICB9XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHNwbGl0ICgpIHtcbi8vICAgZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbi8vICAgZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbi8vICAgaXNTcGxpdCA9IHRydWU7XG4vLyAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4vLyAgICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4vLyAgICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbi8vICAgJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuLy8gICAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbi8vICAgJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4vLyAgIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuLy8gICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbi8vICAgZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4vLyAgIGhpZ2hsaWdodChcImhhbmQxXCIpO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuLy8gICBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4vLyAgICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4vLyAgICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbi8vICAgKSA6IChcbi8vICAgICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbi8vICAgICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikucHJlcGVuZChodG1sKSxcbiAgICAgIGdhbWUuaGlkZGVuQ2FyZCA9IGNhcmRJbWFnZShkYXRhKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBjYXJkSW1hZ2UoZGF0YSkgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgaWYgKG9wdGlvbnMucGVyc29uID09PSBcImRlYWxlclwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbWFnZSkge1xuICAgICAgICBnYW1lLmRlYWxlckhhbmQudW5zaGlmdChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIGhhbmQgLSBcIiArIGdhbWUuZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZ2FtZS5kZWFsZXJUb3RhbCk7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnBlcnNvbiA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIGdhbWUucGxheWVySGFuZCArIFwiICoqKiogcGxheWVyIGlzIGF0IFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCk7XG4gICAgfVxuICAgIGNoZWNrVmljdG9yeSgpO1xuICAgIC8vIG9wdGlvbnMuc3RvcmVJbWcgJiYgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChjYXJkSW1hZ2UoZGF0YSkpO1xuICAgIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgfSk7XG4gIGNhcmRzTGVmdC0tO1xufVxuXG5mdW5jdGlvbiBoaXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiaGl0XCIpO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaXNEb3VibGVkRG93biAmJiAhZ2FtZS53aW5uZXIpIHtcbiAgICAgICAgc3RheSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChpc0ZpcnN0VHVybikge1xuICAgIGlzRmlyc3RUdXJuID0gZmFsc2U7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiZG91YmxlRG93bi1kaXNhYmxlZFwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgaXNQbGF5ZXJzVHVybiA9IGZhbHNlO1xuICAgIGRyYXdDYXJkKHtcbiAgICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICAgIGNhbGxiYWNrOiBzdGF5XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gZ2FtZS5wbGF5ZXJUb3RhbCkge1xuICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICBnYW1lRW5kKCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA8IDIyKSB7XG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA+IGdhbWUucGxheWVyVG90YWwgPyAoXG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gY2hlY2tTcGxpdFRvdGFsKGhhbmROdW0pIHtcbi8vICAgdmFyIHRvdGFsID0gMDtcbi8vICAgdmFyIGhhbmQgPSBoYW5kTnVtID09PSBcImhhbmQxXCIgPyBnYW1lLnNwbGl0SGFuZDEgOiBnYW1lLnNwbGl0SGFuZDI7XG4vLyAgIHZhciBhY2VzID0gMDtcblxuLy8gICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuLy8gICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbi8vICAgICAgIHRvdGFsICs9IDEwO1xuLy8gICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4vLyAgICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4vLyAgICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4vLyAgICAgICBhY2VzICs9IDE7XG4vLyAgICAgfVxuLy8gICB9KTtcblxuLy8gICBpZiAoYWNlcyA+IDApIHtcbi8vICAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcztcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuLy8gICAgIH1cbi8vICAgfVxuXG4vLyAgIGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IChcbi8vICAgICBnYW1lLnNwbGl0SGFuZDFUb3RhbCA9IHRvdGFsLFxuLy8gICAgICRoYW5kMVRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQxVG90YWwpXG4vLyAgICkgOiAoXG4vLyAgICAgZ2FtZS5zcGxpdEhhbmQyVG90YWwgPSB0b3RhbCxcbi8vICAgICAkaGFuZDJUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMlRvdGFsKVxuLy8gICApO1xuLy8gfVxuXG5mdW5jdGlvbiBjaGVja1RvdGFsKHBlcnNvbikge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IGdhbWUuZGVhbGVySGFuZCA6IGdhbWUucGxheWVySGFuZDtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0Q29sb3IgPSBcIndoaXRlXCJcbiAgaWYgKHRvdGFsID09PSAyMSkge1xuICAgIHRleHRDb2xvciA9IFwibGltZVwiO1xuICB9IGVsc2UgaWYgKHRvdGFsID4gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcInJlZFwiO1xuICB9XG5cbiAgcGVyc29uID09PSBcImRlYWxlclwiID8gKFxuICAgIGdhbWUuZGVhbGVyVG90YWwgPSB0b3RhbCxcbiAgICAkZGVhbGVyVG90YWwudGV4dChnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAkZGVhbGVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApIDogKFxuICAgIGdhbWUucGxheWVyVG90YWwgPSB0b3RhbCxcbiAgICAkcGxheWVyVG90YWwudGV4dChnYW1lLnBsYXllclRvdGFsKSxcbiAgICAkcGxheWVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApO1xufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoKSB7XG4gIGlmIChnYW1lLmRlYWxlckhhbmQubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA+PSAyKSB7XG4gICAgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGdhbWUud2FnZXIgKj0gMS4yNTtcbiAgICAgIGFubm91bmNlKFwiQkxBQ0tKQUNLIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBpc1BsYXllcnNUdXJuICYmIGdhbWUucGxheWVyVG90YWwgPCAyMSkge1xuICAgICAgLy9kbyBub3RoaW5nXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrLCBkb2luZyBub3RoaW5nLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCIyMSFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJCVVNUXCIpO1xuICAgIH1cbiAgfVxuXG4gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKGBnaXZpbmcgcGxheWVyICR7Z2FtZS53YWdlciAqIDJ9LiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICBiYW5rICs9IGdhbWUud2FnZXI7XG4gICAgY29uc29sZS5sb2coYHJldHVybmluZyAke2dhbWUud2FnZXJ9IHRvIHBsYXllci4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH1cbiAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgIWlzRmxpcHBlZCAmJiBmbGlwQ2FyZCgpO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbiAgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4gICRkZWFsZXJUb3RhbC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIC8vIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAvLyAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkZGVhbGVyLmVtcHR5KCk7XG4gICRwbGF5ZXIuZW1wdHkoKTtcbiAgJGRlYWxlclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuZW1wdHkoKTtcbiAgJGFubm91bmNlLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS10YWJsZSBjbGVhcmVkLS0tLS0tLS0tLS0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICBpc0ZsaXBwZWQgPSB0cnVlO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG4gIHVwZGF0ZUNvdW50KGdhbWUuZGVhbGVySGFuZFswXSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgLTEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkID49IDcgJiYgY2FyZCA8PSA5KSB7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICswIC0tPiAke2NvdW50fWApO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudC50b1ByZWNpc2lvbigyKSArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3NMZWZ0O1xufVxuXG5mdW5jdGlvbiBnZXRBZHZhbnRhZ2UoKSB7XG4gIGFkdmFudGFnZSA9ICh0cnVlQ291bnQgKiAuNSkgLSAuNTtcbn1cblxuZnVuY3Rpb24gc2V0TmVlZGxlKCkge1xuICB2YXIgbnVtID0gYWR2YW50YWdlICogMzY7XG4gICQoXCIuZ2F1Z2UtbmVlZGxlXCIpLmNzcyhcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArIG51bSArIFwiZGVnKVwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoXCJoYW5kXCIpO1xuICAgICQoXCIuY3VycmVudFdhZ2VyXCIpLnRleHQoXCJDdXJyZW50IFdhZ2VyOiBcIiArIGdhbWUud2FnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiYmV0dGluZyBcIiArIGFtdCk7XG4gICAgY29uc29sZS5sb2coXCJ3YWdlciBhdCBcIiArIGdhbWUud2FnZXIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiSW5zdWZmaWNpZW50IGZ1bmRzLlwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gY291bnRDaGlwcyhsb2NhdGlvbikge1xuICB2YXIgYW10ID0gbG9jYXRpb24gPT09IFwiYmFua1wiID8gYmFuayA6IGdhbWUud2FnZXI7XG4gIHZhciBudW0xMDBzID0gTWF0aC5mbG9vcihhbXQgLyAxMDApO1xuICB2YXIgbnVtNTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCkgLyA1MCk7XG4gIHZhciBudW0yNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTApIC8gMjUpO1xuICB2YXIgbnVtMTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUpIC8gMTApO1xuICAgdmFyIG51bTVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCkgLyA1KTtcbiAgIHZhciBudW0xcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUpIC8gMSk7XG4gIHZhciBudW0wNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1IC0gbnVtMXMgKiAxKSAvIC41KTtcbiAgLy8gZ2FtZS5wbGF5ZXJDaGlwcyA9IHtcbiAgLy8gICBcIm51bTEwMHNcIjogbnVtMTAwcyxcbiAgLy8gICBcIm51bTUwc1wiOiBudW01MHMsXG4gIC8vICAgXCJudW0yNXNcIjogbnVtMjVzLFxuICAvLyAgIFwibnVtMTBzXCI6IG51bTEwcyxcbiAgLy8gICBcIm51bTVzXCI6IG51bTVzLFxuICAvLyAgIFwibnVtMXNcIjogbnVtMXMsXG4gIC8vICAgXCJudW0wNXNcIjogbnVtMDVzXG4gIC8vIH07XG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG4gIGlmIChsb2NhdGlvbiA9PT0gXCJiYW5rXCIpIHtcbiAgICAkYmFua0NoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmJhbmtDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGxvY2F0aW9uID09PSBcImhhbmRcIikge1xuICAgICRoYW5kQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuaGFuZENoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gRGVhbCBzcGVjaWZpYyBjYXJkcyBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuXG5cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbn0pO1xuXG4kKCcuZGVhbGVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdkZWFsZXInKTtcbn0pO1xuXG4kKCcucGxheWVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdpdmVDYXJkKCdwbGF5ZXInKTtcbn0pO1xuXG5mdW5jdGlvbiBnaXZlQ2FyZChwZXJzb24pIHtcbiAgdmFyIGNhcmRWYWx1ZSA9ICQoJy5naXZlQ2FyZFZhbHVlJykudmFsKCk7XG4gIHZhciBjYXJkU3VpdCA9ICQoJy5naXZlQ2FyZFN1aXQnKS52YWwoKTtcbiAgdmFyIGNhcmRTcmMgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBwZXJzb24gPT09ICdkZWFsZXInID8gKFxuICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgnZGVhbGVyJyksXG4gICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApIDogKFxuICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gICAgY2hlY2tUb3RhbCgncGxheWVyJyksXG4gICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICApXG4gIGNoZWNrVmljdG9yeSgpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIl19