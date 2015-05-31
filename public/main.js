"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
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
// var isFirstTurn = true;
// var isPlayersTurn = true;
// var isDoubledDown = false;
// var isFlipped = false;
// var isSplit = false;
// var gameHand = "";

//game buttons
var $deal = $(".deal");
var $hit = $(".hit");
var $stay = $(".stay");
var $doubleDown = $(".doubleDown");
var $splitButton = $(".splitButton");
var $split1Button = $(".split1Button");
var $split2Button = $(".split2Button");

//chips
var $chip1 = $(".chip1");
var $chip5 = $(".chip5");
var $chip10 = $(".chip10");
var $chip25 = $(".chip25");
var $chip50 = $(".chip50");
var $chip100 = $(".chip100");

//info divs
var $count = $(".count");
var $trueCount = $(".trueCount");

// Chip stacks
var $bankChips = $(".bankChips");
var $playerChips = $(".playerChips");
var $split1Chips = $(".split1Chips");
var $split2Chips = $(".split2Chips");
var $split1aChips = $(".split1aChips");
var $split1bChips = $(".split1bChips");
var $split2aChips = $(".split2aChips");
var $split2bChips = $(".split2bChips");

// Chip totals
var $bankTotal = $(".bankTotal");
var $playerWager = $(".playerWager");
var $split1Wager = $(".split1Wager");
var $split2Wager = $(".split2Wager");
var $split1aWager = $(".split1aWager");
var $split1bWager = $(".split1bWager");
var $split2aWager = $(".split2aWager");
var $split2bWager = $(".split2bWager");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");
var $split1 = $(".split1");
var $split2 = $(".split2");
var $split1a = $(".split1a");
var $split1b = $(".split1b");
var $split2a = $(".split2a");
var $split2b = $(".split2b");

//card split divs
var $playerSplit = $(".playerSplit");
var $playerSplit1 = $(".playerSplit1");
var $playerSplit2 = $(".playerSplit2");

//hand total divs
var $dealerTotal = $(".dealerTotal");
var $playerTotal = $(".playerTotal");
var $split1Total = $(".split1Total");
var $split2Total = $(".split2Total");
var $split1aTotal = $(".split1aTotal");
var $split1bTotal = $(".split1bTotal");
var $split2aTotal = $(".split2aTotal");
var $split2bTotal = $(".split2bTotal");

// win - lose - push - blackjack announce divs and text
var $announce = $(".announce");
var $announceText = $(".announce p");
var $announce1 = $(".announce1");
var $announceText1 = $(".announce1 p");
var $announce2 = $(".announce2");
var $announceText2 = $(".announce2 p");
var $announce1a = $(".announce1a");
var $announceText1a = $(".announce1a p");
var $announce1b = $(".announce1b");
var $announceText1b = $(".announce1b p");
var $announce2a = $(".announce2a");
var $announceText2a = $(".announce2a p");
var $announce2b = $(".announce2b");
var $announceText2b = $(".announce2b p");

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

$deal.click(newGame);

$hit.click(hit);

$stay.click(function () {
  console.log("stay");
  flipCard();
  stay();
});

$splitButton.click(split);
$split1Button.click(split);
$split2Button.click(split);

$doubleDown.click(function () {
  $doubleDown.attr("disabled", true);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  bet(betAmt);
  console.log("double down");
  isDoubledDown = true;
  hit();
});

$(".toggleCountInfo").click(function () {
  $(".countInfo").toggleClass("hidden");
});

$(".toggleTestPanel").click(function () {
  $(".testPanel").toggleClass("hidden");
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
  // this.hiddenCard = "";
  // this.dealerHand = [];
  // this.playerHand = [];
  // this.dealerTotal = 0;
  // this.playerTotal = 0;
  // this.wager = 0;
  // this.winner = "";

  // this.splitCardImages = []; //fix this idea
  // this.split1Hand = [];
  // this.split2Hand = [];
  // this.split1aHand = [];
  // this.split1bHand = [];
  // this.split2aHand = [];
  // this.split2bHand = [];
  // this.split1Total = 0;
  // this.split2Total = 0;
  // this.split1aTotal = 0;
  // this.split1bTotal = 0;
  // this.split2aTotal = 0;
  // this.split2bTotal = 0;
  // this.splitHand1 = [];
  // this.splitHand2 = [];
  // this.splitHand1Total = 0;
  // this.splitHand2Total = 0;
  this.dealer = new Hand();
  this.player = new Hand();
  this.split1 = new Hand();
  this.split2 = new Hand();
  this.split1a = new Hand();
  this.split1b = new Hand();
  this.split2a = new Hand();
  this.split2b = new Hand();
  this.isFlipped = false;
  this.isPlayersTurn = true;
}

function Hand() {
  this.cardValues = [];
  this.cardImages = [];
  this.total = 0;
  this.winner = "";
  this.wager = 0;
  this.canSplit = false;
  this.isSplit = false;
  this.canDouble = true;
  this.isDoubled = false;
  this.isCurrentTurn = false;
}

function newGame() {
  game = new Game();
  bet("player", betAmt) && deal();
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
    person: "player",
    storeImg: true
  });
  drawCard({
    person: "dealer"
  });
  drawCard({
    person: "player",
    storeImg: true,
    callback: checkSplit
  });
}

function checkSplit() {
  var checkSplitArr = game.playerHand.map(function (card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      return 10;
    } else if (!isNaN(card)) {
      return Number(card);
    } else if (card === "ACE") {
      return 1;
    }
  });
  if (checkSplitArr[0] === checkSplitArr[1]) {
    splitAllowed = true;
    $split.attr("disabled", false);
  }
}

function split() {
  game.splitHand1.push(game.playerHand[0]);
  game.splitHand2.push(game.playerHand[1]);
  isSplit = true;
  $split.attr("disabled", true);
  $player.addClass("hidden");
  $playerTotal.addClass("hidden");
  $playerSplit.removeClass("hidden");
  $hand1.html("<img class='cardImage' src='" + game.splitCardImages[0] + "'>");
  $hand2.html("<img class='cardImage' src='" + game.splitCardImages[1] + "'>");
  checkSplitTotal("hand1");
  checkSplitTotal("hand2");
  gameHand = "hand1";
  highlight("hand1");
}

function highlight(hand) {
  hand === "hand1" ? ($hand1.addClass("highlighted"), $hand2.removeClass("highlighted")) : ($hand2.addClass("highlighted"), $hand1.removeClass("highlighted"));
}

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
    options.storeImg && game.splitCardImages.push(cardImage(data));
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

function checkSplitTotal(handNum) {
  var total = 0;
  var hand = handNum === "hand1" ? game.splitHand1 : game.splitHand2;
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

  handNum === "hand1" ? (game.splitHand1Total = total, $hand1Total.text(game.splitHand1Total)) : (game.splitHand2Total = total, $hand2Total.text(game.splitHand2Total));
}

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
  splitAllowed = false;
  $split.attr("disabled", true);
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

function bet(hand, amt) {
  if (bank >= amt) {
    game[hand].wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips("bank");
    countChips(hand);
    $("." + hand + "Wager").text(game[hand].wager);
    console.log("betting " + amt + " on " + hand);
    console.log("" + hand + " wager at " + game[hand].wager);
    return true;
  } else {
    console.log("Insufficient funds.");
    return false;
  }
}

function countChips(location) {
  var amt = location === "bank" ? bank : game[location].wager;
  var num100s = Math.floor(amt / 100);
  var num50s = Math.floor((amt - num100s * 100) / 50);
  var num25s = Math.floor((amt - num100s * 100 - num50s * 50) / 25);
  var num10s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25) / 10);
  var num5s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10) / 5);
  var num1s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5) / 1);
  var num05s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5 - num1s * 1) / 0.5);

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
  } else {
    $("." + location + "Chips").html(html);
    $("." + location + "Chips img").each(function (i, c) {
      $(c).css("top", -5 * i);
    });
  }
}

/////////////
// TESTING //
/////////////

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
  game.splitCardImages.push(player1);
  game.splitCardImages.push(player2);
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
  checkSplit();
});

$(".giveCard").click(function () {
  giveCard($(this).attr("data-id"));
});

// $('.dealerGiveCard').click(function () {
//   giveCard('dealer');
// });

// $('.playerGiveCard').click(function () {
//   giveCard('player');
// });

function giveCard(hand) {
  var cardValue = $(".giveCardValue").val();
  var cardSuit = $(".giveCardSuit").val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";

  //This is maybe how it can look in the future:
  //game.hand[hand].push(cardValue);
  //checkTotal(hand);
  //$(hand).append(`<img src='${cardSrc}' class='cardImage'>`);

  if (person === "dealer") {
    game.dealerHand.push(cardValue);
    checkTotal("dealer");
    $dealer.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "player") {
    game.playerHand.push(cardValue);
    checkTotal("player");
    $player.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1") {
    game.split1Hand.push(cardValue);
    checkTotal("split1");
    $split1.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2") {
    game.split2Hand.push(cardValue);
    checkTotal("split2");
    $split2.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1a") {
    game.split1aHand.push(cardValue);
    checkTotal("split1a");
    $split1a.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split1b") {
    game.split1bHand.push(cardValue);
    checkTotal("split1b");
    $split1b.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2a") {
    game.split2aHand.push(cardValue);
    checkTotal("split2a");
    $split2a.append("<img src='" + cardSrc + "' class='cardImage'>");
  } else if (person === "split2b") {
    game.split2bHand.push(cardValue);
    checkTotal("split2b");
    $split2b.append("<img src='" + cardSrc + "' class='cardImage'>");
  }

  // person === 'dealer' ? (
  //   game.dealerHand.push(cardValue),
  //   checkTotal('dealer'),
  //   $dealer.append(`<img src='${cardSrc}' class='cardImage'>`)
  // ) : (
  //   game.playerHand.push(cardValue),
  //   checkTotal('player'),
  //   $player.append(`<img src='${cardSrc}' class='cardImage'>`)
  // )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxHQUFHLEdBQUcsZ0NBQWdDLENBQUM7QUFDM0MsSUFBSSxVQUFVLEdBQUcsR0FBRyxHQUFHLHVCQUF1QixDQUFDO0FBQy9DLElBQUksUUFBUSxHQUFHLHNHQUFzRyxDQUFDOztBQUV0SCxJQUFJLElBQUksQ0FBQztBQUNULElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3BCLElBQUksU0FBUyxHQUFHLENBQUMsR0FBRSxDQUFDO0FBQ3BCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUNmLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7Ozs7Ozs7OztBQVU1QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0FBRzdCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7OztBQUdqQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDakMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0IsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM3QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUc3QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNuQyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25DLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHekMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoRCxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsV0FBVyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztBQUMvRCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7O0FBR3JELFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR25CLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUM1QixhQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsYUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3BCLENBQUMsQ0FBQzs7QUFFSCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVyQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoQixLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDdEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixVQUFRLEVBQUUsQ0FBQztBQUNYLE1BQUksRUFBRSxDQUFDO0NBQ1IsQ0FBQyxDQUFDOztBQUVILFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUzQixXQUFXLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDNUIsYUFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsT0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsS0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ1osU0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQixlQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLEtBQUcsRUFBRSxDQUFDO0NBQ1AsQ0FBQyxDQUFDOztBQUVILENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3RDLEdBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdkMsQ0FBQyxDQUFDOztBQUVILENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3RDLEdBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdkMsQ0FBQyxDQUFDOzs7QUFHSCxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVc7QUFDMUIsTUFBSSxnQkFBZ0IsRUFBRTtBQUNwQixLQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQixLQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNsQyxVQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztHQUMxQztDQUNGLENBQUMsQ0FBQzs7O0FBR0gsU0FBUyxJQUFJLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJkLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN6QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN6QixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsTUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdkIsTUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Q0FDM0I7O0FBRUQsU0FBUyxJQUFJLEdBQUc7QUFDZCxNQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsTUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdkIsTUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7Q0FDNUI7O0FBRUQsU0FBUyxPQUFPLEdBQUc7QUFDakIsTUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsS0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztDQUNqQzs7QUFFRCxTQUFTLElBQUksR0FBRztBQUNkLGFBQVcsR0FBRyxJQUFJLENBQUM7QUFDbkIsV0FBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixrQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDekIsWUFBVSxFQUFFLENBQUM7QUFDYixVQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoQyxNQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixPQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5QixhQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwQyxhQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQixhQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsYUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLE1BQUksTUFBTSxLQUFLLEVBQUUsSUFBSSxTQUFTLEdBQUcsRUFBRSxFQUFFO0FBQ25DLFdBQU8sQ0FBQyxVQUFVLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakMsWUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdEIsYUFBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQzNDLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxHQUFHLENBQUMsQ0FBQztBQUNWLGVBQVMsR0FBRyxDQUFDLENBQUM7QUFDZCxlQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLGVBQVMsR0FBRyxDQUFDLEdBQUUsQ0FBQztLQUNqQixDQUFDLENBQUM7R0FDSixNQUFNO0FBQ0wsV0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQy9DLFNBQUssRUFBRSxDQUFDO0dBQ1Q7Q0FDRjs7QUFFRCxTQUFTLEtBQUssR0FBRztBQUNmLFVBQVEsQ0FBQztBQUNQLFVBQU0sRUFBRSxRQUFRO0FBQ2hCLFNBQUssRUFBRSxRQUFRO0dBQ2hCLENBQUMsQ0FBQztBQUNILFVBQVEsQ0FBQztBQUNQLFVBQU0sRUFBRSxRQUFRO0FBQ2hCLFlBQVEsRUFBRSxJQUFJO0dBQ2YsQ0FBQyxDQUFDO0FBQ0gsVUFBUSxDQUFDO0FBQ1AsVUFBTSxFQUFFLFFBQVE7R0FDakIsQ0FBQyxDQUFDO0FBQ0gsVUFBUSxDQUFDO0FBQ1AsVUFBTSxFQUFFLFFBQVE7QUFDaEIsWUFBUSxFQUFFLElBQUk7QUFDZCxZQUFRLEVBQUUsVUFBVTtHQUNyQixDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLFVBQVUsR0FBRztBQUNwQixNQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUNyRCxRQUFJLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQzFELGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3JCLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQ3pCLGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekMsZ0JBQVksR0FBRyxJQUFJLENBQUM7QUFDcEIsVUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDaEM7Q0FDRjs7QUFFRCxTQUFTLEtBQUssR0FBSTtBQUNoQixNQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFNBQU8sR0FBRyxJQUFJLENBQUM7QUFDZixRQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzNCLGNBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsY0FBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuQyxRQUFNLENBQUMsSUFBSSxrQ0FBZ0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBSyxDQUFDO0FBQ3hFLFFBQU0sQ0FBQyxJQUFJLGtDQUFnQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFLLENBQUM7QUFDeEUsaUJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixpQkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pCLFVBQVEsR0FBRyxPQUFPLENBQUM7QUFDbkIsV0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3BCOztBQUVELFNBQVMsU0FBUyxDQUFDLElBQUksRUFBRTtBQUN2QixNQUFJLEtBQUssT0FBTyxJQUNkLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQzlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQ25DLElBQ0UsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FDbkMsQUFBQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ3pCLE1BQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLFdBQVcsQ0FBQztBQUNuRCxTQUFPLENBQUMsT0FBTyxFQUFFLFVBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNsQyxRQUFJLElBQUksQ0FBQztBQUNULGFBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQixhQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsV0FBTyxDQUFDLEtBQUssSUFDWCxJQUFJLEdBQUcsOEJBQThCLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQzVELENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQ25DLElBQ0UsSUFBSSxHQUFHLDhCQUE4QixHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQzlELENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDdEMsQUFBQyxDQUFDO0FBQ0YsUUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUMvQixVQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDakIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM5QyxNQUFNO0FBQ0wsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDbEM7QUFDRCxnQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLGFBQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDOUYsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQ3RDLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsaUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLGdCQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLHFCQUFxQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM5RjtBQUNELGdCQUFZLEVBQUUsQ0FBQztBQUNmLFdBQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0QsV0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDOUQsQ0FBQyxDQUFDO0FBQ0gsV0FBUyxFQUFFLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEdBQUcsR0FBRztBQUNiLFNBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkIsVUFBUSxDQUFDO0FBQ1AsVUFBTSxFQUFFLFFBQVE7QUFDaEIsWUFBUSxFQUFFLG9CQUFZO0FBQ3BCLFVBQUksYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNqQyxZQUFJLEVBQUUsQ0FBQztPQUNSO0tBQ0Y7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLFdBQVcsRUFBRTtBQUNmLGVBQVcsR0FBRyxLQUFLLENBQUM7QUFDcEIsZUFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsQ0FBQztHQUMvQztDQUNGOztBQUVELFNBQVMsSUFBSSxHQUFHO0FBQ2QsTUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUU7QUFDekMsV0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQixpQkFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixZQUFRLENBQUM7QUFDUCxZQUFNLEVBQUUsUUFBUTtBQUNoQixjQUFRLEVBQUUsSUFBSTtLQUNmLENBQUMsQ0FBQztHQUNKLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEQsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pCLFdBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsV0FBTyxFQUFFLENBQUM7R0FDWCxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUU7QUFDaEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFDdEIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbkYsT0FBTyxFQUFFLENBQ1gsSUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFDdEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbkYsT0FBTyxFQUFFLENBQ1gsQUFBQyxDQUFDO0dBQ0g7Q0FDRjs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxPQUFPLEVBQUU7QUFDaEMsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxJQUFJLEdBQUcsT0FBTyxLQUFLLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbkUsTUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDOztBQUViLE1BQUksQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDMUIsUUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUMxRCxXQUFLLElBQUksRUFBRSxDQUFDO0tBQ2IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFdBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsVUFBSSxJQUFJLENBQUMsQ0FBQztLQUNYO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNaLFFBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQzFCLFdBQUssSUFBSSxJQUFJLENBQUM7S0FDZixNQUFNO0FBQ0wsV0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7S0FDcEI7R0FDRjs7QUFFRCxTQUFPLEtBQUssT0FBTyxJQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssRUFDNUIsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQ3hDLElBQ0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLEVBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUN4QyxBQUFDLENBQUM7Q0FDSDs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxJQUFJLEdBQUcsTUFBTSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDbkUsTUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDOztBQUViLE1BQUksQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDMUIsUUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUMxRCxXQUFLLElBQUksRUFBRSxDQUFDO0tBQ2IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFdBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsVUFBSSxJQUFJLENBQUMsQ0FBQztLQUNYO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNaLFFBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQzFCLFdBQUssSUFBSSxJQUFJLENBQUM7S0FDZixNQUFNO0FBQ0wsV0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7S0FDcEI7R0FDRjs7QUFFRCxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUE7QUFDdkIsTUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ2hCLGFBQVMsR0FBRyxNQUFNLENBQUM7R0FDcEIsTUFBTSxJQUFJLEtBQUssR0FBRyxFQUFFLEVBQUU7QUFDckIsYUFBUyxHQUFHLEtBQUssQ0FBQztHQUNuQjs7QUFFRCxRQUFNLEtBQUssUUFBUSxJQUNqQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssRUFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQ25DLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUN0QyxJQUNFLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxFQUN4QixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbkMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQ3RDLEFBQUMsQ0FBQztDQUNIOztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUM5RCxRQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEgsYUFBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLGNBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNsQixNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssRUFBRSxFQUFFO0FBQzdGLGFBQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN2QixjQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDdEIsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNsRSxhQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDdkIsVUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDbkIsY0FBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLEVBQUUsRUFBRTtBQUM3RCxhQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLGNBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNsQixNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsRUFBRTtBQUM1RyxhQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDdEQsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssRUFBRSxFQUFFO0FBQ2xDLGFBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDdkIsY0FBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3RCLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsRUFBRTtBQUNoQyxhQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLGNBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyQixNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxFQUFFLEVBQUU7QUFDbEMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN2QixjQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakIsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFO0FBQ2hDLGFBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDdkIsY0FBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2xCO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztDQUMxQjs7QUFFRCxTQUFTLE9BQU8sR0FBRztBQUNqQixNQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzVCLFFBQUksSUFBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQUFBQyxDQUFDO0FBQ3pCLFdBQU8sQ0FBQyxHQUFHLG9CQUFrQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsa0JBQWEsSUFBSSxDQUFHLENBQUM7R0FDakUsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQ2pDLFFBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLGdCQUFjLElBQUksQ0FBQyxLQUFLLDRCQUF1QixJQUFJLENBQUcsQ0FBQztHQUNuRTtBQUNELFlBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLEdBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBQ3pCLGtCQUFnQixHQUFHLElBQUksQ0FBQztBQUN4QixlQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLGNBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsVUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsT0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsZUFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixhQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxjQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFFBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQy9COztBQUVELFNBQVMsVUFBVSxHQUFHO0FBQ3BCLFNBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQixTQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEIsY0FBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxjQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckIsV0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxTQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Q0FDdEQ7O0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3BDLE1BQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2xDLE1BQUksUUFBUSxHQUFHLGtCQUFrQixHQUFHLFNBQVMsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUN6RixTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsTUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM1QixhQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNmLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNoQixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDbkMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZCxVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDZixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDakMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1QjtBQUNELGVBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxRQUFRLEdBQUc7QUFDbEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixXQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9DLFVBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQixNQUFJLElBQUksa0JBQWdCLElBQUksQ0FBQyxVQUFVLHlCQUFzQixDQUFDO0FBQzlELFNBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsYUFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDekIsTUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUN4QyxTQUFLLElBQUksQ0FBQyxDQUFDO0FBQ1gsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLDBCQUFxQixLQUFLLENBQUcsQ0FBQztHQUNsRCxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNuQixTQUFLLElBQUksQ0FBQyxDQUFDO0FBQ1gsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLDBCQUFxQixLQUFLLENBQUcsQ0FBQztHQUNsRCxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLE1BQUksSUFBSSwwQkFBcUIsS0FBSyxDQUFHLENBQUM7R0FDbEQ7QUFDRCxjQUFZLEVBQUUsQ0FBQztBQUNmLGNBQVksRUFBRSxDQUFDO0FBQ2YsV0FBUyxFQUFFLENBQUM7QUFDWixRQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixRQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDN0MsWUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25CLFlBQVUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztDQUMxRTs7QUFFRCxTQUFTLFlBQVksR0FBRztBQUN0QixNQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFdBQVMsR0FBRyxLQUFLLEdBQUcsU0FBUyxDQUFDO0NBQy9COztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLFdBQVMsR0FBRyxBQUFDLFNBQVMsR0FBRyxHQUFFLEdBQUksR0FBRSxDQUFDO0NBQ25DOztBQUVELFNBQVMsU0FBUyxHQUFHO0FBQ25CLE1BQUksR0FBRyxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDekIsR0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztDQUMvRDs7QUFFRCxTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3RCLE1BQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNmLFFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDO0FBQ3hCLFFBQUksSUFBSSxHQUFHLENBQUM7QUFDWixjQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkIsY0FBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pCLEtBQUMsT0FBSyxJQUFJLFdBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLFdBQU8sQ0FBQyxHQUFHLGNBQVksR0FBRyxZQUFPLElBQUksQ0FBRyxDQUFDO0FBQ3pDLFdBQU8sQ0FBQyxHQUFHLE1BQUksSUFBSSxrQkFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFHLENBQUM7QUFDcEQsV0FBTyxJQUFJLENBQUM7R0FDYixNQUFNO0FBQ0wsV0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ25DLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7Q0FDRjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxRQUFRLEVBQUU7QUFDNUIsTUFBSSxHQUFHLEdBQUcsUUFBUSxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUNwRCxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2xFLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUMvRSxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUM1RixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pHLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxHQUFFLENBQUMsQ0FBQzs7QUFFdEgsTUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoQyxRQUFJLElBQUksaUNBQWlDLENBQUM7R0FDM0MsQ0FBQztBQUNGLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDL0IsUUFBSSxJQUFJLGdDQUFnQyxDQUFDO0dBQzFDLENBQUM7QUFDRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQy9CLFFBQUksSUFBSSxnQ0FBZ0MsQ0FBQztHQUMxQyxDQUFDO0FBQ0YsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMvQixRQUFJLElBQUksZ0NBQWdDLENBQUM7R0FDMUMsQ0FBQztBQUNGLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUIsUUFBSSxJQUFJLCtCQUErQixDQUFDO0dBQ3pDLENBQUM7QUFDRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlCLFFBQUksSUFBSSwrQkFBK0IsQ0FBQztHQUN6QyxDQUFDO0FBQ0YsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMvQixRQUFJLElBQUksZ0NBQWdDLENBQUM7R0FDMUMsQ0FBQzs7QUFFRixNQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7QUFDdkIsY0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixLQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RDLE9BQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3pCLENBQUMsQ0FBQztHQUNKLE1BQU07QUFDTCxLQUFDLE9BQUssUUFBUSxXQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLEtBQUMsT0FBSyxRQUFRLGVBQVksQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLE9BQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3pCLENBQUMsQ0FBQztHQUNKO0NBQ0Y7Ozs7OztBQU9ELENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUMvQixNQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixLQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDWixhQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGtCQUFnQixHQUFHLEtBQUssQ0FBQztBQUN6QixNQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDbEIsY0FBVSxFQUFFLENBQUM7QUFDYixZQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixTQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5QixlQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwQyxlQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQixlQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsZUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLFdBQU8sQ0FBQyxVQUFVLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakMsWUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdkIsQ0FBQyxDQUFDO0dBQ0o7QUFDRCxNQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUMsTUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzVDLE1BQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM1QyxNQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUMsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFDLE1BQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQyxNQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUMsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFDLE1BQUksT0FBTyxHQUFHLGtCQUFrQixHQUFHLFlBQVksR0FBRyxNQUFNLEdBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUM5RixNQUFJLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxZQUFZLEdBQUcsTUFBTSxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDOUYsTUFBSSxPQUFPLEdBQUcsa0JBQWtCLEdBQUcsWUFBWSxHQUFHLE1BQU0sR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQzlGLE1BQUksT0FBTyxHQUFHLGtCQUFrQixHQUFHLFlBQVksR0FBRyxNQUFNLEdBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUM5RixNQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQyxNQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQyxNQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQy9DLE1BQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDL0MsTUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDMUIsU0FBTyxDQUFDLE9BQU8sZ0JBQWMsUUFBUSwwQkFBdUIsQ0FBQztBQUM3RCxTQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0FBQzNELFNBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7QUFDM0QsU0FBTyxDQUFDLE1BQU0sZ0JBQWMsT0FBTywwQkFBdUIsQ0FBQztBQUMzRCxZQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsWUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLGNBQVksRUFBRSxDQUFDO0FBQ2YsWUFBVSxFQUFFLENBQUM7Q0FDZCxDQUFDLENBQUM7O0FBRUgsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFXO0FBQzlCLFVBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsQ0FBQyxDQUFBOzs7Ozs7Ozs7O0FBVUYsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLE1BQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFDLE1BQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN4QyxNQUFJLE9BQU8sR0FBRyxrQkFBa0IsR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUM7Ozs7Ozs7QUFPeEYsTUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdEOzs7Ozs7Ozs7OztBQVdELGNBQVksRUFBRSxDQUFDO0NBQ2hCOzs7QUFHRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ3hCLE1BQUksV0FBVyxHQUFHLDhCQUE4QixDQUFDOztBQUVqRCxNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2QyxTQUFPLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDMUIsUUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUNqRCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxNQUFNO0FBQ0wsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsQ0FBQyIsImZpbGUiOiJzcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBUEkgPSBcImh0dHA6Ly9kZWNrb2ZjYXJkc2FwaS5jb20vYXBpL1wiO1xudmFyIG5ld0RlY2tVUkwgPSBBUEkgKyBcInNodWZmbGUvP2RlY2tfY291bnQ9NlwiO1xudmFyIGNhcmRCYWNrID0gXCJodHRwOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNS81Mi9DYXJkX2JhY2tfMTYuc3ZnLzIwOXB4LUNhcmRfYmFja18xNi5zdmcucG5nXCI7XG5cbnZhciBnYW1lO1xudmFyIGRlY2tJZCA9IFwiXCI7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IDA7XG52YXIgY2FyZHNMZWZ0ID0gMzEyO1xudmFyIGFkdmFudGFnZSA9IC0uNTtcbnZhciBiYW5rID0gNTAwO1xudmFyIGJldEFtdCA9IDI1O1xudmFyIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuLy8gdmFyIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuLy8gdmFyIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbi8vIHZhciBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbi8vIHZhciBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4vLyB2YXIgaXNGbGlwcGVkID0gZmFsc2U7XG4vLyB2YXIgaXNTcGxpdCA9IGZhbHNlO1xuLy8gdmFyIGdhbWVIYW5kID0gXCJcIjtcblxuLy9nYW1lIGJ1dHRvbnNcbnZhciAkZGVhbCA9ICQoXCIuZGVhbFwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG52YXIgJGRvdWJsZURvd24gPSAkKFwiLmRvdWJsZURvd25cIik7XG52YXIgJHNwbGl0QnV0dG9uID0gJChcIi5zcGxpdEJ1dHRvblwiKTtcbnZhciAkc3BsaXQxQnV0dG9uID0gJChcIi5zcGxpdDFCdXR0b25cIik7XG52YXIgJHNwbGl0MkJ1dHRvbiA9ICQoXCIuc3BsaXQyQnV0dG9uXCIpO1xuXG4vL2NoaXBzXG52YXIgJGNoaXAxID0gJChcIi5jaGlwMVwiKTtcbnZhciAkY2hpcDUgPSAkKFwiLmNoaXA1XCIpO1xudmFyICRjaGlwMTAgPSAkKFwiLmNoaXAxMFwiKTtcbnZhciAkY2hpcDI1ID0gJChcIi5jaGlwMjVcIik7XG52YXIgJGNoaXA1MCA9ICQoXCIuY2hpcDUwXCIpO1xudmFyICRjaGlwMTAwID0gJChcIi5jaGlwMTAwXCIpO1xuXG4vL2luZm8gZGl2c1xudmFyICRjb3VudCA9ICQoXCIuY291bnRcIik7XG52YXIgJHRydWVDb3VudCA9ICQoXCIudHJ1ZUNvdW50XCIpO1xuXG4vLyBDaGlwIHN0YWNrc1xudmFyICRiYW5rQ2hpcHMgPSAkKFwiLmJhbmtDaGlwc1wiKTtcbnZhciAkcGxheWVyQ2hpcHMgPSAkKFwiLnBsYXllckNoaXBzXCIpO1xudmFyICRzcGxpdDFDaGlwcyA9ICQoXCIuc3BsaXQxQ2hpcHNcIik7XG52YXIgJHNwbGl0MkNoaXBzID0gJChcIi5zcGxpdDJDaGlwc1wiKTtcbnZhciAkc3BsaXQxYUNoaXBzID0gJChcIi5zcGxpdDFhQ2hpcHNcIik7XG52YXIgJHNwbGl0MWJDaGlwcyA9ICQoXCIuc3BsaXQxYkNoaXBzXCIpO1xudmFyICRzcGxpdDJhQ2hpcHMgPSAkKFwiLnNwbGl0MmFDaGlwc1wiKTtcbnZhciAkc3BsaXQyYkNoaXBzID0gJChcIi5zcGxpdDJiQ2hpcHNcIik7XG5cbi8vIENoaXAgdG90YWxzXG52YXIgJGJhbmtUb3RhbCA9ICQoXCIuYmFua1RvdGFsXCIpO1xudmFyICRwbGF5ZXJXYWdlciA9ICQoXCIucGxheWVyV2FnZXJcIik7XG52YXIgJHNwbGl0MVdhZ2VyID0gJChcIi5zcGxpdDFXYWdlclwiKTtcbnZhciAkc3BsaXQyV2FnZXIgPSAkKFwiLnNwbGl0MldhZ2VyXCIpO1xudmFyICRzcGxpdDFhV2FnZXIgPSAkKFwiLnNwbGl0MWFXYWdlclwiKTtcbnZhciAkc3BsaXQxYldhZ2VyID0gJChcIi5zcGxpdDFiV2FnZXJcIik7XG52YXIgJHNwbGl0MmFXYWdlciA9ICQoXCIuc3BsaXQyYVdhZ2VyXCIpO1xudmFyICRzcGxpdDJiV2FnZXIgPSAkKFwiLnNwbGl0MmJXYWdlclwiKTtcblxuLy9jYXJkIGhhbmQgZGl2c1xudmFyICRkZWFsZXIgPSAkKFwiLmRlYWxlclwiKTtcbnZhciAkcGxheWVyID0gJChcIi5wbGF5ZXJcIik7XG52YXIgJHNwbGl0MSA9ICQoXCIuc3BsaXQxXCIpO1xudmFyICRzcGxpdDIgPSAkKFwiLnNwbGl0MlwiKTtcbnZhciAkc3BsaXQxYSA9ICQoXCIuc3BsaXQxYVwiKTtcbnZhciAkc3BsaXQxYiA9ICQoXCIuc3BsaXQxYlwiKTtcbnZhciAkc3BsaXQyYSA9ICQoXCIuc3BsaXQyYVwiKTtcbnZhciAkc3BsaXQyYiA9ICQoXCIuc3BsaXQyYlwiKTtcblxuLy9jYXJkIHNwbGl0IGRpdnNcbnZhciAkcGxheWVyU3BsaXQgPSAkKFwiLnBsYXllclNwbGl0XCIpO1xudmFyICRwbGF5ZXJTcGxpdDEgPSAkKFwiLnBsYXllclNwbGl0MVwiKTtcbnZhciAkcGxheWVyU3BsaXQyID0gJChcIi5wbGF5ZXJTcGxpdDJcIik7XG5cbi8vaGFuZCB0b3RhbCBkaXZzXG52YXIgJGRlYWxlclRvdGFsID0gJChcIi5kZWFsZXJUb3RhbFwiKTtcbnZhciAkcGxheWVyVG90YWwgPSAkKFwiLnBsYXllclRvdGFsXCIpO1xudmFyICRzcGxpdDFUb3RhbCA9ICQoXCIuc3BsaXQxVG90YWxcIik7XG52YXIgJHNwbGl0MlRvdGFsID0gJChcIi5zcGxpdDJUb3RhbFwiKTtcbnZhciAkc3BsaXQxYVRvdGFsID0gJChcIi5zcGxpdDFhVG90YWxcIik7XG52YXIgJHNwbGl0MWJUb3RhbCA9ICQoXCIuc3BsaXQxYlRvdGFsXCIpO1xudmFyICRzcGxpdDJhVG90YWwgPSAkKFwiLnNwbGl0MmFUb3RhbFwiKTtcbnZhciAkc3BsaXQyYlRvdGFsID0gJChcIi5zcGxpdDJiVG90YWxcIik7XG5cbi8vIHdpbiAtIGxvc2UgLSBwdXNoIC0gYmxhY2tqYWNrIGFubm91bmNlIGRpdnMgYW5kIHRleHRcbnZhciAkYW5ub3VuY2UgPSAkKFwiLmFubm91bmNlXCIpO1xudmFyICRhbm5vdW5jZVRleHQgPSAkKFwiLmFubm91bmNlIHBcIik7XG52YXIgJGFubm91bmNlMSA9ICQoXCIuYW5ub3VuY2UxXCIpO1xudmFyICRhbm5vdW5jZVRleHQxID0gJChcIi5hbm5vdW5jZTEgcFwiKTtcbnZhciAkYW5ub3VuY2UyID0gJChcIi5hbm5vdW5jZTJcIik7XG52YXIgJGFubm91bmNlVGV4dDIgPSAkKFwiLmFubm91bmNlMiBwXCIpO1xudmFyICRhbm5vdW5jZTFhID0gJChcIi5hbm5vdW5jZTFhXCIpO1xudmFyICRhbm5vdW5jZVRleHQxYSA9ICQoXCIuYW5ub3VuY2UxYSBwXCIpO1xudmFyICRhbm5vdW5jZTFiID0gJChcIi5hbm5vdW5jZTFiXCIpO1xudmFyICRhbm5vdW5jZVRleHQxYiA9ICQoXCIuYW5ub3VuY2UxYiBwXCIpO1xudmFyICRhbm5vdW5jZTJhID0gJChcIi5hbm5vdW5jZTJhXCIpO1xudmFyICRhbm5vdW5jZVRleHQyYSA9ICQoXCIuYW5ub3VuY2UyYSBwXCIpO1xudmFyICRhbm5vdW5jZTJiID0gJChcIi5hbm5vdW5jZTJiXCIpO1xudmFyICRhbm5vdW5jZVRleHQyYiA9ICQoXCIuYW5ub3VuY2UyYiBwXCIpO1xuXG4vL2NyZWF0ZSBhdWRpbyBlbGVtZW50c1xudmFyIGNhcmRQbGFjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGxhY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRQbGFjZTEud2F2Jyk7XG52YXIgY2FyZFBhY2thZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBhY2thZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRPcGVuUGFja2FnZTIud2F2Jyk7XG52YXIgYnV0dG9uQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuYnV0dG9uQ2xpY2suc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NsaWNrMS53YXYnKTtcbnZhciB3aW5XYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xud2luV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jaGlwc0hhbmRsZTUud2F2Jyk7XG52YXIgbG9zZVdhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5sb3NlV2F2LnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkU2hvdmUzLndhdicpO1xuXG4vL3BvcHVsYXRlIGJhbmsgYW1vdW50IG9uIHBhZ2UgbG9hZFxuJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbmNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuXG4vL2J1dHRvbiBjbGljayBsaXN0ZW5lcnNcbiQoXCJidXR0b25cIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBidXR0b25DbGljay5sb2FkKCk7XG4gIGJ1dHRvbkNsaWNrLnBsYXkoKTtcbn0pO1xuXG4kZGVhbC5jbGljayhuZXdHYW1lKTtcblxuJGhpdC5jbGljayhoaXQpO1xuXG4kc3RheS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKFwic3RheVwiKTtcbiAgZmxpcENhcmQoKTtcbiAgc3RheSgpO1xufSk7XG5cbiRzcGxpdEJ1dHRvbi5jbGljayhzcGxpdCk7XG4kc3BsaXQxQnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDJCdXR0b24uY2xpY2soc3BsaXQpO1xuXG4kZG91YmxlRG93bi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZUNvdW50SW5mb1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIuY291bnRJbmZvXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi50ZXN0UGFuZWxcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIC8vIHRoaXMuaGlkZGVuQ2FyZCA9IFwiXCI7XG4gIC8vIHRoaXMuZGVhbGVySGFuZCA9IFtdO1xuICAvLyB0aGlzLnBsYXllckhhbmQgPSBbXTtcbiAgLy8gdGhpcy5kZWFsZXJUb3RhbCA9IDA7XG4gIC8vIHRoaXMucGxheWVyVG90YWwgPSAwO1xuICAvLyB0aGlzLndhZ2VyID0gMDtcbiAgLy8gdGhpcy53aW5uZXIgPSBcIlwiO1xuXG4gIC8vIHRoaXMuc3BsaXRDYXJkSW1hZ2VzID0gW107IC8vZml4IHRoaXMgaWRlYVxuICAvLyB0aGlzLnNwbGl0MUhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDJIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQxYUhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDFiSGFuZCA9IFtdO1xuICAvLyB0aGlzLnNwbGl0MmFIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQyYkhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXQyVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MWFUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXQxYlRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdDJhVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MmJUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXRIYW5kMSA9IFtdO1xuICAvLyB0aGlzLnNwbGl0SGFuZDIgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQxVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0SGFuZDJUb3RhbCA9IDA7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gSGFuZCgpIHtcbiAgdGhpcy5jYXJkVmFsdWVzID0gW107XG4gIHRoaXMuY2FyZEltYWdlcyA9IFtdO1xuICB0aGlzLnRvdGFsID0gMDtcbiAgdGhpcy53aW5uZXIgPSBcIlwiO1xuICB0aGlzLndhZ2VyID0gMDtcbiAgdGhpcy5jYW5TcGxpdCA9IGZhbHNlO1xuICB0aGlzLmlzU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5jYW5Eb3VibGUgPSB0cnVlO1xuICB0aGlzLmlzRG91YmxlZCA9IGZhbHNlO1xuICB0aGlzLmlzQ3VycmVudFR1cm4gPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbmV3R2FtZSgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChcInBsYXllclwiLCBiZXRBbXQpICYmIGRlYWwoKTtcbn1cblxuZnVuY3Rpb24gZGVhbCgpIHtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBpc0ZsaXBwZWQgPSBmYWxzZTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICBjbGVhclRhYmxlKCk7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgY2FyZFBhY2thZ2UucGxheSgpO1xuICBpZiAoZGVja0lkID09PSBcIlwiIHx8IGNhcmRzTGVmdCA8IDIwKSB7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgICBjb3VudCA9IDA7XG4gICAgICB0cnVlQ291bnQgPSAwO1xuICAgICAgY2FyZHNMZWZ0ID0gMzEyO1xuICAgICAgYWR2YW50YWdlID0gLS41O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIGN1cnJlbnQgZGVja1wiKTtcbiAgICBkcmF3NCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXc0KCkge1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBzdG9yZUltZzogdHJ1ZVxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJkZWFsZXJcIlxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBzdG9yZUltZzogdHJ1ZSxcbiAgICBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbiAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICByZXR1cm4gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHJldHVybiBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH0pO1xuICBpZiAoY2hlY2tTcGxpdEFyclswXSA9PT0gY2hlY2tTcGxpdEFyclsxXSkge1xuICAgIHNwbGl0QWxsb3dlZCA9IHRydWU7XG4gICAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXQgKCkge1xuICBnYW1lLnNwbGl0SGFuZDEucHVzaChnYW1lLnBsYXllckhhbmRbMF0pO1xuICBnYW1lLnNwbGl0SGFuZDIucHVzaChnYW1lLnBsYXllckhhbmRbMV0pO1xuICBpc1NwbGl0ID0gdHJ1ZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHBsYXllci5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJHBsYXllclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyU3BsaXQucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRoYW5kMS5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1swXX0nPmApO1xuICAkaGFuZDIuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMV19Jz5gKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDFcIik7XG4gIGNoZWNrU3BsaXRUb3RhbChcImhhbmQyXCIpO1xuICBnYW1lSGFuZCA9IFwiaGFuZDFcIjtcbiAgaGlnaGxpZ2h0KFwiaGFuZDFcIik7XG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChoYW5kKSB7XG4gIGhhbmQgPT09IFwiaGFuZDFcIiA/IChcbiAgICAkaGFuZDEuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgICAkaGFuZDIucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICApIDogKFxuICAgICRoYW5kMi5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMS5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdDYXJkKG9wdGlvbnMpIHtcbiAgdmFyIGNhcmRVUkwgPSBBUEkgKyBcImRyYXcvXCIgKyBkZWNrSWQgKyBcIi8/Y291bnQ9MVwiO1xuICBnZXRKU09OKGNhcmRVUkwsIGZ1bmN0aW9uKGRhdGEsIGNiKSB7XG4gICAgdmFyIGh0bWw7XG4gICAgY2FyZFBsYWNlLmxvYWQoKTtcbiAgICBjYXJkUGxhY2UucGxheSgpO1xuICAgIG9wdGlvbnMuaW1hZ2UgPyAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBvcHRpb25zLmltYWdlICsgXCInPlwiLFxuICAgICAgJChcIi5cIiArIG9wdGlvbnMucGVyc29uKS5wcmVwZW5kKGh0bWwpLFxuICAgICAgZ2FtZS5oaWRkZW5DYXJkID0gY2FyZEltYWdlKGRhdGEpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGNhcmRJbWFnZShkYXRhKSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBpZiAob3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIpIHtcbiAgICAgIGlmIChvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIGdhbWUuZGVhbGVySGFuZC51bnNoaWZ0KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfVxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5kZWFsZXJIYW5kICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBnYW1lLmRlYWxlclRvdGFsKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMucGVyc29uID09PSBcInBsYXllclwiKSB7XG4gICAgICBnYW1lLnBsYXllckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgY2hlY2tUb3RhbChcInBsYXllclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgaGFuZCAtIFwiICsgZ2FtZS5wbGF5ZXJIYW5kICsgXCIgKioqKiBwbGF5ZXIgaXMgYXQgXCIgKyBnYW1lLnBsYXllclRvdGFsKTtcbiAgICB9XG4gICAgY2hlY2tWaWN0b3J5KCk7XG4gICAgb3B0aW9ucy5zdG9yZUltZyAmJiBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKGNhcmRJbWFnZShkYXRhKSk7XG4gICAgdHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucy5jYWxsYmFjaygpO1xuICB9KTtcbiAgY2FyZHNMZWZ0LS07XG59XG5cbmZ1bmN0aW9uIGhpdCgpIHtcbiAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChpc0RvdWJsZWREb3duICYmICFnYW1lLndpbm5lcikge1xuICAgICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGlzRmlyc3RUdXJuKSB7XG4gICAgaXNGaXJzdFR1cm4gPSBmYWxzZTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJkb3VibGVEb3duLWRpc2FibGVkXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXkoKSB7XG4gIGlmICghZ2FtZS53aW5uZXIgJiYgZ2FtZS5kZWFsZXJUb3RhbCA8IDE3KSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGl0c1wiKTtcbiAgICBpc1BsYXllcnNUdXJuID0gZmFsc2U7XG4gICAgZHJhd0NhcmQoe1xuICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IHN0YXlcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4gICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgIGdhbWVFbmQoKTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbiAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApIDogKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwgKyBcIiBiZWF0cyBkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1NwbGl0VG90YWwoaGFuZE51bSkge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IGdhbWUuc3BsaXRIYW5kMSA6IGdhbWUuc3BsaXRIYW5kMjtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG5cbiAgaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gKFxuICAgIGdhbWUuc3BsaXRIYW5kMVRvdGFsID0gdG90YWwsXG4gICAgJGhhbmQxVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDFUb3RhbClcbiAgKSA6IChcbiAgICBnYW1lLnNwbGl0SGFuZDJUb3RhbCA9IHRvdGFsLFxuICAgICRoYW5kMlRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQyVG90YWwpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwocGVyc29uKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gcGVyc29uID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXJIYW5kIDogZ2FtZS5wbGF5ZXJIYW5kO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICB2YXIgdGV4dENvbG9yID0gXCJ3aGl0ZVwiXG4gIGlmICh0b3RhbCA9PT0gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcImxpbWVcIjtcbiAgfSBlbHNlIGlmICh0b3RhbCA+IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJyZWRcIjtcbiAgfVxuXG4gIHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICBnYW1lLmRlYWxlclRvdGFsID0gdG90YWwsXG4gICAgJGRlYWxlclRvdGFsLnRleHQoZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgJGRlYWxlclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllclRvdGFsID0gdG90YWwsXG4gICAgJHBsYXllclRvdGFsLnRleHQoZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgJHBsYXllclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KCkge1xuICBpZiAoZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA+PSAyICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPj0gMikge1xuICAgIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZG91YmxlIGJsYWNramFjayBwdXNoIVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVySGFuZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgaXNQbGF5ZXJzVHVybiAmJiBnYW1lLnBsYXllclRvdGFsIDwgMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2ssIGRvaW5nIG5vdGhpbmcuLlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgMjFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIjIxIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUucGxheWVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIkJVU1RcIik7XG4gICAgfVxuICB9XG5cbiAgZ2FtZS53aW5uZXIgJiYgZ2FtZUVuZCgpO1xufVxuXG5mdW5jdGlvbiBnYW1lRW5kKCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICBiYW5rICs9IChnYW1lLndhZ2VyICogMik7XG4gICAgY29uc29sZS5sb2coYGdpdmluZyBwbGF5ZXIgJHtnYW1lLndhZ2VyICogMn0uIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgIGJhbmsgKz0gZ2FtZS53YWdlcjtcbiAgICBjb25zb2xlLmxvZyhgcmV0dXJuaW5nICR7Z2FtZS53YWdlcn0gdG8gcGxheWVyLiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfVxuICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAhaXNGbGlwcGVkICYmIGZsaXBDYXJkKCk7XG4gIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuICBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgJGRlYWxlclRvdGFsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4gICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICRkZWFsZXIuZW1wdHkoKTtcbiAgJHBsYXllci5lbXB0eSgpO1xuICAkZGVhbGVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5lbXB0eSgpO1xuICAkYW5ub3VuY2UucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLXRhYmxlIGNsZWFyZWQtLS0tLS0tLS0tLS1cIik7XG59XG5cbmZ1bmN0aW9uIGNhcmRJbWFnZShkYXRhKSB7XG4gIHZhciBjYXJkVmFsdWUgPSBkYXRhLmNhcmRzWzBdLnZhbHVlO1xuICB2YXIgY2FyZFN1aXQgPSBkYXRhLmNhcmRzWzBdLnN1aXQ7XG4gIHZhciBmaWxlbmFtZSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHJldHVybiBmaWxlbmFtZTtcbn1cblxuZnVuY3Rpb24gYW5ub3VuY2UodGV4dCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwiZGVhbGVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJsb3NlXCIpO1xuICAgIGxvc2VXYXYubG9hZCgpO1xuICAgIGxvc2VXYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwid2luXCIpO1xuICAgIHdpbldhdi5sb2FkKCk7XG4gICAgd2luV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJwdXNoXCIpO1xuICB9XG4gICRhbm5vdW5jZVRleHQudGV4dCh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gZmxpcENhcmQoKSB7XG4gIGNvbnNvbGUubG9nKCdmbGlwJyk7XG4gIGlzRmxpcHBlZCA9IHRydWU7XG4gIHZhciAkZmxpcHBlZCA9ICQoXCIuZGVhbGVyIC5jYXJkSW1hZ2VcIikuZmlyc3QoKTtcbiAgJGZsaXBwZWQucmVtb3ZlKCk7XG4gIHZhciBodG1sID0gYDxpbWcgc3JjPScke2dhbWUuaGlkZGVuQ2FyZH0nIGNsYXNzPSdjYXJkSW1hZ2UnPmA7XG4gICRkZWFsZXIucHJlcGVuZChodG1sKTtcbiAgdXBkYXRlQ291bnQoZ2FtZS5kZWFsZXJIYW5kWzBdKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoY2FyZCkge1xuICBpZiAoaXNOYU4oTnVtYmVyKGNhcmQpKSB8fCBjYXJkID09PSBcIjEwXCIpIHtcbiAgICBjb3VudCAtPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCAtMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICsxIC0tPiAke2NvdW50fWApO1xuICB9IGVsc2UgaWYgKGNhcmQgPj0gNyAmJiBjYXJkIDw9IDkpIHtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgKzAgLS0+ICR7Y291bnR9YCk7XG4gIH1cbiAgZ2V0VHJ1ZUNvdW50KCk7XG4gIGdldEFkdmFudGFnZSgpO1xuICBzZXROZWVkbGUoKTtcbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbiAgJHRydWVDb3VudC5lbXB0eSgpO1xuICAkdHJ1ZUNvdW50LmFwcGVuZChcIjxwPlRydWUgQ291bnQ6IFwiICsgdHJ1ZUNvdW50LnRvUHJlY2lzaW9uKDIpICsgXCI8L3A+XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlQ291bnQoKSB7XG4gIHZhciBkZWNrc0xlZnQgPSBjYXJkc0xlZnQgLyA1MjtcbiAgdHJ1ZUNvdW50ID0gY291bnQgLyBkZWNrc0xlZnQ7XG59XG5cbmZ1bmN0aW9uIGdldEFkdmFudGFnZSgpIHtcbiAgYWR2YW50YWdlID0gKHRydWVDb3VudCAqIC41KSAtIC41O1xufVxuXG5mdW5jdGlvbiBzZXROZWVkbGUoKSB7XG4gIHZhciBudW0gPSBhZHZhbnRhZ2UgKiAzNjtcbiAgJChcIi5nYXVnZS1uZWVkbGVcIikuY3NzKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKFwiICsgbnVtICsgXCJkZWcpXCIpO1xufVxuXG5mdW5jdGlvbiBiZXQoaGFuZCwgYW10KSB7XG4gIGlmIChiYW5rID49IGFtdCkge1xuICAgIGdhbWVbaGFuZF0ud2FnZXIgKz0gYW10O1xuICAgIGJhbmsgLT0gYW10O1xuICAgICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICAgY291bnRDaGlwcyhcImJhbmtcIik7XG4gICAgY291bnRDaGlwcyhoYW5kKTtcbiAgICAkKGAuJHtoYW5kfVdhZ2VyYCkudGV4dChnYW1lW2hhbmRdLndhZ2VyKTtcbiAgICBjb25zb2xlLmxvZyhgYmV0dGluZyAke2FtdH0gb24gJHtoYW5kfWApO1xuICAgIGNvbnNvbGUubG9nKGAke2hhbmR9IHdhZ2VyIGF0ICR7Z2FtZVtoYW5kXS53YWdlcn1gKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkluc3VmZmljaWVudCBmdW5kcy5cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvdW50Q2hpcHMobG9jYXRpb24pIHtcbiAgdmFyIGFtdCA9IGxvY2F0aW9uID09PSBcImJhbmtcIiA/IGJhbmsgOiBnYW1lW2xvY2F0aW9uXS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuXG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG5cbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgJChgLiR7bG9jYXRpb259Q2hpcHNgKS5odG1sKGh0bWwpO1xuICAgICQoYC4ke2xvY2F0aW9ufUNoaXBzIGltZ2ApLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vXG4vLyBURVNUSU5HIC8vXG4vLy8vLy8vLy8vLy8vXG5cbiQoXCIudGVzdERlYWxcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCk7XG4gIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICBpZiAoYmFuayA+PSBiZXRBbXQpIHtcbiAgICBjbGVhclRhYmxlKCk7XG4gICAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgfSk7XG4gIH1cbiAgdmFyIGRlYWxlcjFWYWx1ZSA9ICQoXCIuZGVhbGVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlZhbHVlID0gJChcIi5kZWFsZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxVmFsdWUgPSAkKFwiLnBsYXllcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJWYWx1ZSA9ICQoXCIucGxheWVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMVN1aXQgPSAkKFwiLmRlYWxlcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlN1aXQgPSAkKFwiLmRlYWxlcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVN1aXQgPSAkKFwiLnBsYXllcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlN1aXQgPSAkKFwiLnBsYXllcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMVZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBkZWFsZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIyVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjFWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMlZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2gocGxheWVyMSk7XG4gIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2gocGxheWVyMik7XG4gIGdhbWUuZGVhbGVySGFuZCA9IFtkZWFsZXIxVmFsdWUsIGRlYWxlcjJWYWx1ZV07XG4gIGdhbWUucGxheWVySGFuZCA9IFtwbGF5ZXIxVmFsdWUsIHBsYXllcjJWYWx1ZV07XG4gIGdhbWUuaGlkZGVuQ2FyZCA9IGRlYWxlcjE7XG4gICRkZWFsZXIucHJlcGVuZChgPGltZyBzcmM9JyR7Y2FyZEJhY2t9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2RlYWxlcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjF9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgY2hlY2tUb3RhbChcInBsYXllclwiKTtcbiAgY2hlY2tWaWN0b3J5KCk7XG4gIGNoZWNrU3BsaXQoKTtcbn0pO1xuXG4kKFwiLmdpdmVDYXJkXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICBnaXZlQ2FyZCgkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbn0pXG5cbi8vICQoJy5kZWFsZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2l2ZUNhcmQoJ2RlYWxlcicpO1xuLy8gfSk7XG5cbi8vICQoJy5wbGF5ZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2l2ZUNhcmQoJ3BsYXllcicpO1xuLy8gfSk7XG5cbmZ1bmN0aW9uIGdpdmVDYXJkKGhhbmQpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9ICQoJy5naXZlQ2FyZFZhbHVlJykudmFsKCk7XG4gIHZhciBjYXJkU3VpdCA9ICQoJy5naXZlQ2FyZFN1aXQnKS52YWwoKTtcbiAgdmFyIGNhcmRTcmMgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuXG4gIC8vVGhpcyBpcyBtYXliZSBob3cgaXQgY2FuIGxvb2sgaW4gdGhlIGZ1dHVyZTpcbiAgLy9nYW1lLmhhbmRbaGFuZF0ucHVzaChjYXJkVmFsdWUpO1xuICAvL2NoZWNrVG90YWwoaGFuZCk7XG4gIC8vJChoYW5kKS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcblxuICBpZiAocGVyc29uID09PSAnZGVhbGVyJykge1xuICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnZGVhbGVyJyk7XG4gICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdwbGF5ZXInKSB7XG4gICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdwbGF5ZXInKTtcbiAgICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MScpIHtcbiAgICBnYW1lLnNwbGl0MUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MScpO1xuICAgICRzcGxpdDEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyJykge1xuICAgIGdhbWUuc3BsaXQySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyJyk7XG4gICAgJHNwbGl0Mi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDFhJykge1xuICAgIGdhbWUuc3BsaXQxYUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MWEnKTtcbiAgICAkc3BsaXQxYS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDFiJykge1xuICAgIGdhbWUuc3BsaXQxYkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MWInKTtcbiAgICAkc3BsaXQxYi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDJhJykge1xuICAgIGdhbWUuc3BsaXQyYUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MmEnKTtcbiAgICAkc3BsaXQyYS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDJiJykge1xuICAgIGdhbWUuc3BsaXQyYkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MmInKTtcbiAgICAkc3BsaXQyYi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfVxuXG4gIC8vIHBlcnNvbiA9PT0gJ2RlYWxlcicgPyAoXG4gIC8vICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgLy8gICBjaGVja1RvdGFsKCdkZWFsZXInKSxcbiAgLy8gICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gIC8vICkgOiAoXG4gIC8vICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgLy8gICBjaGVja1RvdGFsKCdwbGF5ZXInKSxcbiAgLy8gICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gIC8vIClcbiAgY2hlY2tWaWN0b3J5KCk7XG59XG5cbi8vIEpTT04gcmVxdWVzdCBmdW5jdGlvbiB3aXRoIEpTT05QIHByb3h5XG5mdW5jdGlvbiBnZXRKU09OKHVybCwgY2IpIHtcbiAgdmFyIEpTT05QX1BST1hZID0gJ2h0dHBzOi8vanNvbnAuYWZlbGQubWUvP3VybD0nO1xuICAvLyBUSElTIFdJTEwgQUREIFRIRSBDUk9TUyBPUklHSU4gSEVBREVSU1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIEpTT05QX1BST1hZICsgdXJsKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9O1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn07XG4iXX0=