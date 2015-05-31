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
  var amt = location === "bank" ? bank : game.wager;
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
  } else if (location === "hand") {
    $handChips.html(html);
    $(".handChips img").each(function (i, c) {
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
//# sourceMappingURL=data:application/json;base64,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UyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUN4QixNQUFJLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQzs7QUFFakQsTUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNuQyxTQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDdkMsU0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQzFCLFFBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7QUFDakQsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsTUFBTTtBQUNMLFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLENBQUM7R0FDSCxDQUFDO0FBQ0YsU0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hCLENBQUMiLCJmaWxlIjoic3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBJID0gXCJodHRwOi8vZGVja29mY2FyZHNhcGkuY29tL2FwaS9cIjtcbnZhciBuZXdEZWNrVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTIvQ2FyZF9iYWNrXzE2LnN2Zy8yMDlweC1DYXJkX2JhY2tfMTYuc3ZnLnBuZ1wiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGNvdW50ID0gMDtcbnZhciB0cnVlQ291bnQgPSAwO1xudmFyIGNhcmRzTGVmdCA9IDMxMjtcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbi8vIHZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG4vLyB2YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4vLyB2YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzRmxpcHBlZCA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vZ2FtZSBidXR0b25zXG52YXIgJGRlYWwgPSAkKFwiLmRlYWxcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xudmFyICRkb3VibGVEb3duID0gJChcIi5kb3VibGVEb3duXCIpO1xudmFyICRzcGxpdEJ1dHRvbiA9ICQoXCIuc3BsaXRCdXR0b25cIik7XG52YXIgJHNwbGl0MUJ1dHRvbiA9ICQoXCIuc3BsaXQxQnV0dG9uXCIpO1xudmFyICRzcGxpdDJCdXR0b24gPSAkKFwiLnNwbGl0MkJ1dHRvblwiKTtcblxuLy9jaGlwc1xudmFyICRjaGlwMSA9ICQoXCIuY2hpcDFcIik7XG52YXIgJGNoaXA1ID0gJChcIi5jaGlwNVwiKTtcbnZhciAkY2hpcDEwID0gJChcIi5jaGlwMTBcIik7XG52YXIgJGNoaXAyNSA9ICQoXCIuY2hpcDI1XCIpO1xudmFyICRjaGlwNTAgPSAkKFwiLmNoaXA1MFwiKTtcbnZhciAkY2hpcDEwMCA9ICQoXCIuY2hpcDEwMFwiKTtcblxuLy9pbmZvIGRpdnNcbnZhciAkY291bnQgPSAkKFwiLmNvdW50XCIpO1xudmFyICR0cnVlQ291bnQgPSAkKFwiLnRydWVDb3VudFwiKTtcblxuLy8gQ2hpcCBzdGFja3NcbnZhciAkYmFua0NoaXBzID0gJChcIi5iYW5rQ2hpcHNcIik7XG52YXIgJHBsYXllckNoaXBzID0gJChcIi5wbGF5ZXJDaGlwc1wiKTtcbnZhciAkc3BsaXQxQ2hpcHMgPSAkKFwiLnNwbGl0MUNoaXBzXCIpO1xudmFyICRzcGxpdDJDaGlwcyA9ICQoXCIuc3BsaXQyQ2hpcHNcIik7XG52YXIgJHNwbGl0MWFDaGlwcyA9ICQoXCIuc3BsaXQxYUNoaXBzXCIpO1xudmFyICRzcGxpdDFiQ2hpcHMgPSAkKFwiLnNwbGl0MWJDaGlwc1wiKTtcbnZhciAkc3BsaXQyYUNoaXBzID0gJChcIi5zcGxpdDJhQ2hpcHNcIik7XG52YXIgJHNwbGl0MmJDaGlwcyA9ICQoXCIuc3BsaXQyYkNoaXBzXCIpO1xuXG4vLyBDaGlwIHRvdGFsc1xudmFyICRiYW5rVG90YWwgPSAkKFwiLmJhbmtUb3RhbFwiKTtcbnZhciAkcGxheWVyV2FnZXIgPSAkKFwiLnBsYXllcldhZ2VyXCIpO1xudmFyICRzcGxpdDFXYWdlciA9ICQoXCIuc3BsaXQxV2FnZXJcIik7XG52YXIgJHNwbGl0MldhZ2VyID0gJChcIi5zcGxpdDJXYWdlclwiKTtcbnZhciAkc3BsaXQxYVdhZ2VyID0gJChcIi5zcGxpdDFhV2FnZXJcIik7XG52YXIgJHNwbGl0MWJXYWdlciA9ICQoXCIuc3BsaXQxYldhZ2VyXCIpO1xudmFyICRzcGxpdDJhV2FnZXIgPSAkKFwiLnNwbGl0MmFXYWdlclwiKTtcbnZhciAkc3BsaXQyYldhZ2VyID0gJChcIi5zcGxpdDJiV2FnZXJcIik7XG5cbi8vY2FyZCBoYW5kIGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xudmFyICRzcGxpdDEgPSAkKFwiLnNwbGl0MVwiKTtcbnZhciAkc3BsaXQyID0gJChcIi5zcGxpdDJcIik7XG52YXIgJHNwbGl0MWEgPSAkKFwiLnNwbGl0MWFcIik7XG52YXIgJHNwbGl0MWIgPSAkKFwiLnNwbGl0MWJcIik7XG52YXIgJHNwbGl0MmEgPSAkKFwiLnNwbGl0MmFcIik7XG52YXIgJHNwbGl0MmIgPSAkKFwiLnNwbGl0MmJcIik7XG5cbi8vY2FyZCBzcGxpdCBkaXZzXG52YXIgJHBsYXllclNwbGl0ID0gJChcIi5wbGF5ZXJTcGxpdFwiKTtcbnZhciAkcGxheWVyU3BsaXQxID0gJChcIi5wbGF5ZXJTcGxpdDFcIik7XG52YXIgJHBsYXllclNwbGl0MiA9ICQoXCIucGxheWVyU3BsaXQyXCIpO1xuXG4vL2hhbmQgdG90YWwgZGl2c1xudmFyICRkZWFsZXJUb3RhbCA9ICQoXCIuZGVhbGVyVG90YWxcIik7XG52YXIgJHBsYXllclRvdGFsID0gJChcIi5wbGF5ZXJUb3RhbFwiKTtcbnZhciAkc3BsaXQxVG90YWwgPSAkKFwiLnNwbGl0MVRvdGFsXCIpO1xudmFyICRzcGxpdDJUb3RhbCA9ICQoXCIuc3BsaXQyVG90YWxcIik7XG52YXIgJHNwbGl0MWFUb3RhbCA9ICQoXCIuc3BsaXQxYVRvdGFsXCIpO1xudmFyICRzcGxpdDFiVG90YWwgPSAkKFwiLnNwbGl0MWJUb3RhbFwiKTtcbnZhciAkc3BsaXQyYVRvdGFsID0gJChcIi5zcGxpdDJhVG90YWxcIik7XG52YXIgJHNwbGl0MmJUb3RhbCA9ICQoXCIuc3BsaXQyYlRvdGFsXCIpO1xuXG4vLyB3aW4gLSBsb3NlIC0gcHVzaCAtIGJsYWNramFjayBhbm5vdW5jZSBkaXZzIGFuZCB0ZXh0XG52YXIgJGFubm91bmNlID0gJChcIi5hbm5vdW5jZVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0ID0gJChcIi5hbm5vdW5jZSBwXCIpO1xudmFyICRhbm5vdW5jZTEgPSAkKFwiLmFubm91bmNlMVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MSA9ICQoXCIuYW5ub3VuY2UxIHBcIik7XG52YXIgJGFubm91bmNlMiA9ICQoXCIuYW5ub3VuY2UyXCIpO1xudmFyICRhbm5vdW5jZVRleHQyID0gJChcIi5hbm5vdW5jZTIgcFwiKTtcbnZhciAkYW5ub3VuY2UxYSA9ICQoXCIuYW5ub3VuY2UxYVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MWEgPSAkKFwiLmFubm91bmNlMWEgcFwiKTtcbnZhciAkYW5ub3VuY2UxYiA9ICQoXCIuYW5ub3VuY2UxYlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MWIgPSAkKFwiLmFubm91bmNlMWIgcFwiKTtcbnZhciAkYW5ub3VuY2UyYSA9ICQoXCIuYW5ub3VuY2UyYVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MmEgPSAkKFwiLmFubm91bmNlMmEgcFwiKTtcbnZhciAkYW5ub3VuY2UyYiA9ICQoXCIuYW5ub3VuY2UyYlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MmIgPSAkKFwiLmFubm91bmNlMmIgcFwiKTtcblxuLy9jcmVhdGUgYXVkaW8gZWxlbWVudHNcbnZhciBjYXJkUGxhY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBsYWNlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkUGxhY2UxLndhdicpO1xudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xudmFyIGJ1dHRvbkNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJ1dHRvbkNsaWNrLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jbGljazEud2F2Jyk7XG52YXIgd2luV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbndpbldhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2hpcHNIYW5kbGU1LndhdicpO1xudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9wb3B1bGF0ZSBiYW5rIGFtb3VudCBvbiBwYWdlIGxvYWRcbiRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG5jb3VudENoaXBzKFwiYmFua1wiKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgYnV0dG9uQ2xpY2subG9hZCgpO1xuICBidXR0b25DbGljay5wbGF5KCk7XG59KTtcblxuJGRlYWwuY2xpY2sobmV3R2FtZSk7XG5cbiRoaXQuY2xpY2soaGl0KTtcblxuJHN0YXkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIGZsaXBDYXJkKCk7XG4gIHN0YXkoKTtcbn0pO1xuXG4kc3BsaXRCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MUJ1dHRvbi5jbGljayhzcGxpdCk7XG4kc3BsaXQyQnV0dG9uLmNsaWNrKHNwbGl0KTtcblxuJGRvdWJsZURvd24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGJldChiZXRBbXQpO1xuICBjb25zb2xlLmxvZyhcImRvdWJsZSBkb3duXCIpO1xuICBpc0RvdWJsZWREb3duID0gdHJ1ZTtcbiAgaGl0KCk7XG59KTtcblxuJChcIi50b2dnbGVDb3VudEluZm9cIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkKFwiLmNvdW50SW5mb1wiKS50b2dnbGVDbGFzcyhcImhpZGRlblwiKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZVRlc3RQYW5lbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIudGVzdFBhbmVsXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbi8vY2hpcCBjbGljayBsaXN0ZW5lclxuJChcIi5jaGlwXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICBpZiAoYmV0Q2hhbmdlQWxsb3dlZCkge1xuICAgICQoXCIuY2hpcFwiKS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgJCh0aGlzKS5hdHRyKFwiaWRcIiwgXCJzZWxlY3RlZEJldFwiKTtcbiAgICBiZXRBbXQgPSBOdW1iZXIoJCh0aGlzKS5hdHRyKFwiZGF0YS1pZFwiKSk7XG4gIH1cbn0pO1xuXG4vL2dhbWUgb2JqZWN0XG5mdW5jdGlvbiBHYW1lKCkge1xuICAvLyB0aGlzLmhpZGRlbkNhcmQgPSBcIlwiO1xuICAvLyB0aGlzLmRlYWxlckhhbmQgPSBbXTtcbiAgLy8gdGhpcy5wbGF5ZXJIYW5kID0gW107XG4gIC8vIHRoaXMuZGVhbGVyVG90YWwgPSAwO1xuICAvLyB0aGlzLnBsYXllclRvdGFsID0gMDtcbiAgLy8gdGhpcy53YWdlciA9IDA7XG4gIC8vIHRoaXMud2lubmVyID0gXCJcIjtcblxuICAvLyB0aGlzLnNwbGl0Q2FyZEltYWdlcyA9IFtdOyAvL2ZpeCB0aGlzIGlkZWFcbiAgLy8gdGhpcy5zcGxpdDFIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQySGFuZCA9IFtdO1xuICAvLyB0aGlzLnNwbGl0MWFIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQxYkhhbmQgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdDJhSGFuZCA9IFtdO1xuICAvLyB0aGlzLnNwbGl0MmJIYW5kID0gW107XG4gIC8vIHRoaXMuc3BsaXQxVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MlRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdDFhVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0MWJUb3RhbCA9IDA7XG4gIC8vIHRoaXMuc3BsaXQyYVRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdDJiVG90YWwgPSAwO1xuICAvLyB0aGlzLnNwbGl0SGFuZDEgPSBbXTtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyID0gW107XG4gIC8vIHRoaXMuc3BsaXRIYW5kMVRvdGFsID0gMDtcbiAgLy8gdGhpcy5zcGxpdEhhbmQyVG90YWwgPSAwO1xuICB0aGlzLmRlYWxlciA9IG5ldyBIYW5kKCk7XG4gIHRoaXMucGxheWVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDEgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MiA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQxYSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQxYiA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyYSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyYiA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuaXNGbGlwcGVkID0gZmFsc2U7XG4gIHRoaXMuaXNQbGF5ZXJzVHVybiA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIEhhbmQoKSB7XG4gIHRoaXMuY2FyZFZhbHVlcyA9IFtdO1xuICB0aGlzLmNhcmRJbWFnZXMgPSBbXTtcbiAgdGhpcy50b3RhbCA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMuY2FuU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XG4gIHRoaXMuY2FuRG91YmxlID0gdHJ1ZTtcbiAgdGhpcy5pc0RvdWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5pc0N1cnJlbnRUdXJuID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoXCJwbGF5ZXJcIiwgYmV0QW10KSAmJiBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbiAgaXNGbGlwcGVkID0gZmFsc2U7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgY2xlYXJUYWJsZSgpO1xuICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgaWYgKGRlY2tJZCA9PT0gXCJcIiB8fCBjYXJkc0xlZnQgPCAyMCkge1xuICAgIGdldEpTT04obmV3RGVja1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gbmV3IGRlY2tcIik7XG4gICAgICBkcmF3NCgpO1xuICAgICAgY291bnQgPSAwO1xuICAgICAgdHJ1ZUNvdW50ID0gMDtcbiAgICAgIGNhcmRzTGVmdCA9IDMxMjtcbiAgICAgIGFkdmFudGFnZSA9IC0uNTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBjdXJyZW50IGRlY2tcIik7XG4gICAgZHJhdzQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3NCgpIHtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICBpbWFnZTogY2FyZEJhY2tcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgc3RvcmVJbWc6IHRydWVcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgc3RvcmVJbWc6IHRydWUsXG4gICAgY2FsbGJhY2s6IGNoZWNrU3BsaXRcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU3BsaXQoKSB7XG4gIHZhciBjaGVja1NwbGl0QXJyID0gZ2FtZS5wbGF5ZXJIYW5kLm1hcChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgcmV0dXJuIDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICByZXR1cm4gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuICB9KTtcbiAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbiAgICBzcGxpdEFsbG93ZWQgPSB0cnVlO1xuICAgICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNwbGl0ICgpIHtcbiAgZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbiAgZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbiAgaXNTcGxpdCA9IHRydWU7XG4gICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbiAgJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4gIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbiAgZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4gIGhpZ2hsaWdodChcImhhbmQxXCIpO1xufVxuXG5mdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuICBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4gICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4gICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbiAgKSA6IChcbiAgICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgb3B0aW9ucy5pbWFnZSArIFwiJz5cIixcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLnBlcnNvbikucHJlcGVuZChodG1sKSxcbiAgICAgIGdhbWUuaGlkZGVuQ2FyZCA9IGNhcmRJbWFnZShkYXRhKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBjYXJkSW1hZ2UoZGF0YSkgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgaWYgKG9wdGlvbnMucGVyc29uID09PSBcImRlYWxlclwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbWFnZSkge1xuICAgICAgICBnYW1lLmRlYWxlckhhbmQudW5zaGlmdChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIGhhbmQgLSBcIiArIGdhbWUuZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZ2FtZS5kZWFsZXJUb3RhbCk7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnBlcnNvbiA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIGdhbWUucGxheWVySGFuZCArIFwiICoqKiogcGxheWVyIGlzIGF0IFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCk7XG4gICAgfVxuICAgIGNoZWNrVmljdG9yeSgpO1xuICAgIG9wdGlvbnMuc3RvcmVJbWcgJiYgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChjYXJkSW1hZ2UoZGF0YSkpO1xuICAgIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgfSk7XG4gIGNhcmRzTGVmdC0tO1xufVxuXG5mdW5jdGlvbiBoaXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiaGl0XCIpO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaXNEb3VibGVkRG93biAmJiAhZ2FtZS53aW5uZXIpIHtcbiAgICAgICAgc3RheSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChpc0ZpcnN0VHVybikge1xuICAgIGlzRmlyc3RUdXJuID0gZmFsc2U7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiZG91YmxlRG93bi1kaXNhYmxlZFwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgaXNQbGF5ZXJzVHVybiA9IGZhbHNlO1xuICAgIGRyYXdDYXJkKHtcbiAgICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICAgIGNhbGxiYWNrOiBzdGF5XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gZ2FtZS5wbGF5ZXJUb3RhbCkge1xuICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICBnYW1lRW5kKCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA8IDIyKSB7XG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA+IGdhbWUucGxheWVyVG90YWwgPyAoXG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tTcGxpdFRvdGFsKGhhbmROdW0pIHtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIGhhbmQgPSBoYW5kTnVtID09PSBcImhhbmQxXCIgPyBnYW1lLnNwbGl0SGFuZDEgOiBnYW1lLnNwbGl0SGFuZDI7XG4gIHZhciBhY2VzID0gMDtcblxuICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHRvdGFsICs9IDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBhY2VzICs9IDE7XG4gICAgfVxuICB9KTtcblxuICBpZiAoYWNlcyA+IDApIHtcbiAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuICAgICAgdG90YWwgKz0gYWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuICAgIH1cbiAgfVxuXG4gIGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IChcbiAgICBnYW1lLnNwbGl0SGFuZDFUb3RhbCA9IHRvdGFsLFxuICAgICRoYW5kMVRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQxVG90YWwpXG4gICkgOiAoXG4gICAgZ2FtZS5zcGxpdEhhbmQyVG90YWwgPSB0b3RhbCxcbiAgICAkaGFuZDJUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMlRvdGFsKVxuICApO1xufVxuXG5mdW5jdGlvbiBjaGVja1RvdGFsKHBlcnNvbikge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IGdhbWUuZGVhbGVySGFuZCA6IGdhbWUucGxheWVySGFuZDtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG5cbiAgdmFyIHRleHRDb2xvciA9IFwid2hpdGVcIlxuICBpZiAodG90YWwgPT09IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJsaW1lXCI7XG4gIH0gZWxzZSBpZiAodG90YWwgPiAyMSkge1xuICAgIHRleHRDb2xvciA9IFwicmVkXCI7XG4gIH1cblxuICBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyAoXG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA9IHRvdGFsLFxuICAgICRkZWFsZXJUb3RhbC50ZXh0KGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICRkZWFsZXJUb3RhbC5jc3MoXCJjb2xvclwiLCB0ZXh0Q29sb3IpXG4gICkgOiAoXG4gICAgZ2FtZS5wbGF5ZXJUb3RhbCA9IHRvdGFsLFxuICAgICRwbGF5ZXJUb3RhbC50ZXh0KGdhbWUucGxheWVyVG90YWwpLFxuICAgICRwbGF5ZXJUb3RhbC5jc3MoXCJjb2xvclwiLCB0ZXh0Q29sb3IpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVmljdG9yeSgpIHtcbiAgaWYgKGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPj0gMiAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID49IDIpIHtcbiAgICBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRvdWJsZSBibGFja2phY2sgcHVzaCFcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSAmJiBnYW1lLnBsYXllckhhbmQubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgZ2FtZS53YWdlciAqPSAxLjI1O1xuICAgICAgYW5ub3VuY2UoXCJCTEFDS0pBQ0shXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlckhhbmQubGVuZ3RoID09PSAyICYmIGlzUGxheWVyc1R1cm4gJiYgZ2FtZS5wbGF5ZXJUb3RhbCA8IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrLCBkb2luZyBub3RoaW5nLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCIyMSFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLnBsYXllclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoXCJCVVNUXCIpO1xuICAgIH1cbiAgfVxuXG4gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKGBnaXZpbmcgcGxheWVyICR7Z2FtZS53YWdlciAqIDJ9LiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICBiYW5rICs9IGdhbWUud2FnZXI7XG4gICAgY29uc29sZS5sb2coYHJldHVybmluZyAke2dhbWUud2FnZXJ9IHRvIHBsYXllci4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH1cbiAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgIWlzRmxpcHBlZCAmJiBmbGlwQ2FyZCgpO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbiAgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4gICRkZWFsZXJUb3RhbC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkZGVhbGVyLmVtcHR5KCk7XG4gICRwbGF5ZXIuZW1wdHkoKTtcbiAgJGRlYWxlclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuZW1wdHkoKTtcbiAgJGFubm91bmNlLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS10YWJsZSBjbGVhcmVkLS0tLS0tLS0tLS0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICBpc0ZsaXBwZWQgPSB0cnVlO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG4gIHVwZGF0ZUNvdW50KGdhbWUuZGVhbGVySGFuZFswXSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgLTEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkID49IDcgJiYgY2FyZCA8PSA5KSB7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICswIC0tPiAke2NvdW50fWApO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudC50b1ByZWNpc2lvbigyKSArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3NMZWZ0O1xufVxuXG5mdW5jdGlvbiBnZXRBZHZhbnRhZ2UoKSB7XG4gIGFkdmFudGFnZSA9ICh0cnVlQ291bnQgKiAuNSkgLSAuNTtcbn1cblxuZnVuY3Rpb24gc2V0TmVlZGxlKCkge1xuICB2YXIgbnVtID0gYWR2YW50YWdlICogMzY7XG4gICQoXCIuZ2F1Z2UtbmVlZGxlXCIpLmNzcyhcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArIG51bSArIFwiZGVnKVwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGhhbmQsIGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lW2hhbmRdLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoaGFuZCk7XG4gICAgJChgLiR7aGFuZH1XYWdlcmApLnRleHQoZ2FtZVtoYW5kXS53YWdlcik7XG4gICAgY29uc29sZS5sb2coYGJldHRpbmcgJHthbXR9IG9uICR7aGFuZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgJHtoYW5kfSB3YWdlciBhdCAke2dhbWVbaGFuZF0ud2FnZXJ9YCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJJbnN1ZmZpY2llbnQgZnVuZHMuXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuXG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG5cbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAobG9jYXRpb24gPT09IFwiaGFuZFwiKSB7XG4gICAgJGhhbmRDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5oYW5kQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIFRFU1RJTkcgLy9cbi8vLy8vLy8vLy8vLy9cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIxKTtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIyKTtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbiAgY2hlY2tTcGxpdCgpO1xufSk7XG5cbiQoXCIuZ2l2ZUNhcmRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGdpdmVDYXJkKCQodGhpcykuYXR0cihcImRhdGEtaWRcIikpO1xufSlcblxuLy8gJCgnLmRlYWxlckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgnZGVhbGVyJyk7XG4vLyB9KTtcblxuLy8gJCgnLnBsYXllckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgncGxheWVyJyk7XG4vLyB9KTtcblxuZnVuY3Rpb24gZ2l2ZUNhcmQoaGFuZCkge1xuICB2YXIgY2FyZFZhbHVlID0gJCgnLmdpdmVDYXJkVmFsdWUnKS52YWwoKTtcbiAgdmFyIGNhcmRTdWl0ID0gJCgnLmdpdmVDYXJkU3VpdCcpLnZhbCgpO1xuICB2YXIgY2FyZFNyYyA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG5cbiAgLy9UaGlzIGlzIG1heWJlIGhvdyBpdCBjYW4gbG9vayBpbiB0aGUgZnV0dXJlOlxuICAvL2dhbWUuaGFuZFtoYW5kXS5wdXNoKGNhcmRWYWx1ZSk7XG4gIC8vY2hlY2tUb3RhbChoYW5kKTtcbiAgLy8kKGhhbmQpLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuXG4gIGlmIChwZXJzb24gPT09ICdkZWFsZXInKSB7XG4gICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdkZWFsZXInKTtcbiAgICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3BsYXllcicpIHtcbiAgICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3BsYXllcicpO1xuICAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxJykge1xuICAgIGdhbWUuc3BsaXQxSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxJyk7XG4gICAgJHNwbGl0MS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDInKSB7XG4gICAgZ2FtZS5zcGxpdDJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDInKTtcbiAgICAkc3BsaXQyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWEnKSB7XG4gICAgZ2FtZS5zcGxpdDFhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYScpO1xuICAgICRzcGxpdDFhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWInKSB7XG4gICAgZ2FtZS5zcGxpdDFiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYicpO1xuICAgICRzcGxpdDFiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmEnKSB7XG4gICAgZ2FtZS5zcGxpdDJhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYScpO1xuICAgICRzcGxpdDJhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmInKSB7XG4gICAgZ2FtZS5zcGxpdDJiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYicpO1xuICAgICRzcGxpdDJiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9XG5cbiAgLy8gcGVyc29uID09PSAnZGVhbGVyJyA/IChcbiAgLy8gICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ2RlYWxlcicpLFxuICAvLyAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKSA6IChcbiAgLy8gICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ3BsYXllcicpLFxuICAvLyAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKVxuICBjaGVja1ZpY3RvcnkoKTtcbn1cblxuLy8gSlNPTiByZXF1ZXN0IGZ1bmN0aW9uIHdpdGggSlNPTlAgcHJveHlcbmZ1bmN0aW9uIGdldEpTT04odXJsLCBjYikge1xuICB2YXIgSlNPTlBfUFJPWFkgPSAnaHR0cHM6Ly9qc29ucC5hZmVsZC5tZS8/dXJsPSc7XG4gIC8vIFRISVMgV0lMTCBBREQgVEhFIENST1NTIE9SSUdJTiBIRUFERVJTXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgSlNPTlBfUFJPWFkgKyB1cmwpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiJdfQ==