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
var $dealerHand = $(".dealerHand");
var $playerHand = $(".playerHand");
var $split1Hand = $(".split1Hand");
var $split2Hand = $(".split2Hand");
var $split1aHand = $(".split1aHand");
var $split1bHand = $(".split1bHand");
var $split2aHand = $(".split2aHand");
var $split2bHand = $(".split2bHand");

//card hand parent divs
var $dealer = $(".dealer");
var $player = $(".player");
var $split1 = $(".split1");
var $split2 = $(".split2");
var $split1a = $(".split1a");
var $split1b = $(".split1b");
var $split2a = $(".split2a");
var $split2b = $(".split2b");

//card split parent divs
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
  game.player.canDouble = true;
  game.isFlipped = false;
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
  $(".hand, .wager, .total, .chips").empty;
  $(".dealerTotal, .playerSplit, .playerSplit1, .playerSplit2, .popup").addClass("hidden");
  $(".popup").removeClass("win lose push");
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
//# sourceMappingURL=data:application/json;base64,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aEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0Q7Ozs7Ozs7Ozs7O0FBV0QsY0FBWSxFQUFFLENBQUM7Q0FDaEI7OztBQUdELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDeEIsTUFBSSxXQUFXLEdBQUcsOEJBQThCLENBQUM7O0FBRWpELE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDbkMsU0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUMxQixRQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO0FBQ2pELFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDO0dBQ0gsQ0FBQztBQUNGLFNBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNoQixDQUFDIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD02XCI7XG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzUyL0NhcmRfYmFja18xNi5zdmcvMjA5cHgtQ2FyZF9iYWNrXzE2LnN2Zy5wbmdcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBjb3VudCA9IDA7XG52YXIgdHJ1ZUNvdW50ID0gMDtcbnZhciBjYXJkc0xlZnQgPSAzMTI7XG52YXIgYWR2YW50YWdlID0gLS41O1xudmFyIGJhbmsgPSA1MDA7XG52YXIgYmV0QW10ID0gMjU7XG52YXIgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4vLyB2YXIgc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4vLyB2YXIgaXNGaXJzdFR1cm4gPSB0cnVlO1xuLy8gdmFyIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuLy8gdmFyIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbi8vIHZhciBpc0ZsaXBwZWQgPSBmYWxzZTtcbi8vIHZhciBpc1NwbGl0ID0gZmFsc2U7XG4vLyB2YXIgZ2FtZUhhbmQgPSBcIlwiO1xuXG4vL2dhbWUgYnV0dG9uc1xudmFyICRkZWFsID0gJChcIi5kZWFsXCIpO1xudmFyICRoaXQgPSAkKFwiLmhpdFwiKTtcbnZhciAkc3RheSA9ICQoXCIuc3RheVwiKTtcbnZhciAkZG91YmxlRG93biA9ICQoXCIuZG91YmxlRG93blwiKTtcbnZhciAkc3BsaXRCdXR0b24gPSAkKFwiLnNwbGl0QnV0dG9uXCIpO1xudmFyICRzcGxpdDFCdXR0b24gPSAkKFwiLnNwbGl0MUJ1dHRvblwiKTtcbnZhciAkc3BsaXQyQnV0dG9uID0gJChcIi5zcGxpdDJCdXR0b25cIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG5cbi8vIENoaXAgc3RhY2tzXG52YXIgJGJhbmtDaGlwcyA9ICQoXCIuYmFua0NoaXBzXCIpO1xudmFyICRwbGF5ZXJDaGlwcyA9ICQoXCIucGxheWVyQ2hpcHNcIik7XG52YXIgJHNwbGl0MUNoaXBzID0gJChcIi5zcGxpdDFDaGlwc1wiKTtcbnZhciAkc3BsaXQyQ2hpcHMgPSAkKFwiLnNwbGl0MkNoaXBzXCIpO1xudmFyICRzcGxpdDFhQ2hpcHMgPSAkKFwiLnNwbGl0MWFDaGlwc1wiKTtcbnZhciAkc3BsaXQxYkNoaXBzID0gJChcIi5zcGxpdDFiQ2hpcHNcIik7XG52YXIgJHNwbGl0MmFDaGlwcyA9ICQoXCIuc3BsaXQyYUNoaXBzXCIpO1xudmFyICRzcGxpdDJiQ2hpcHMgPSAkKFwiLnNwbGl0MmJDaGlwc1wiKTtcblxuLy8gQ2hpcCB0b3RhbHNcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJHBsYXllcldhZ2VyID0gJChcIi5wbGF5ZXJXYWdlclwiKTtcbnZhciAkc3BsaXQxV2FnZXIgPSAkKFwiLnNwbGl0MVdhZ2VyXCIpO1xudmFyICRzcGxpdDJXYWdlciA9ICQoXCIuc3BsaXQyV2FnZXJcIik7XG52YXIgJHNwbGl0MWFXYWdlciA9ICQoXCIuc3BsaXQxYVdhZ2VyXCIpO1xudmFyICRzcGxpdDFiV2FnZXIgPSAkKFwiLnNwbGl0MWJXYWdlclwiKTtcbnZhciAkc3BsaXQyYVdhZ2VyID0gJChcIi5zcGxpdDJhV2FnZXJcIik7XG52YXIgJHNwbGl0MmJXYWdlciA9ICQoXCIuc3BsaXQyYldhZ2VyXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlckhhbmQgPSAkKFwiLmRlYWxlckhhbmRcIik7XG52YXIgJHBsYXllckhhbmQgPSAkKFwiLnBsYXllckhhbmRcIik7XG52YXIgJHNwbGl0MUhhbmQgPSAkKFwiLnNwbGl0MUhhbmRcIik7XG52YXIgJHNwbGl0MkhhbmQgPSAkKFwiLnNwbGl0MkhhbmRcIik7XG52YXIgJHNwbGl0MWFIYW5kID0gJChcIi5zcGxpdDFhSGFuZFwiKTtcbnZhciAkc3BsaXQxYkhhbmQgPSAkKFwiLnNwbGl0MWJIYW5kXCIpO1xudmFyICRzcGxpdDJhSGFuZCA9ICQoXCIuc3BsaXQyYUhhbmRcIik7XG52YXIgJHNwbGl0MmJIYW5kID0gJChcIi5zcGxpdDJiSGFuZFwiKTtcblxuLy9jYXJkIGhhbmQgcGFyZW50IGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xudmFyICRzcGxpdDEgPSAkKFwiLnNwbGl0MVwiKTtcbnZhciAkc3BsaXQyID0gJChcIi5zcGxpdDJcIik7XG52YXIgJHNwbGl0MWEgPSAkKFwiLnNwbGl0MWFcIik7XG52YXIgJHNwbGl0MWIgPSAkKFwiLnNwbGl0MWJcIik7XG52YXIgJHNwbGl0MmEgPSAkKFwiLnNwbGl0MmFcIik7XG52YXIgJHNwbGl0MmIgPSAkKFwiLnNwbGl0MmJcIik7XG5cbi8vY2FyZCBzcGxpdCBwYXJlbnQgZGl2c1xudmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG52YXIgJHBsYXllclNwbGl0MSA9ICQoXCIucGxheWVyU3BsaXQxXCIpO1xudmFyICRwbGF5ZXJTcGxpdDIgPSAkKFwiLnBsYXllclNwbGl0MlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG52YXIgJHNwbGl0MVRvdGFsID0gJChcIi5zcGxpdDFUb3RhbFwiKTtcbnZhciAkc3BsaXQyVG90YWwgPSAkKFwiLnNwbGl0MlRvdGFsXCIpO1xudmFyICRzcGxpdDFhVG90YWwgPSAkKFwiLnNwbGl0MWFUb3RhbFwiKTtcbnZhciAkc3BsaXQxYlRvdGFsID0gJChcIi5zcGxpdDFiVG90YWxcIik7XG52YXIgJHNwbGl0MmFUb3RhbCA9ICQoXCIuc3BsaXQyYVRvdGFsXCIpO1xudmFyICRzcGxpdDJiVG90YWwgPSAkKFwiLnNwbGl0MmJUb3RhbFwiKTtcblxuLy8gd2luIC0gbG9zZSAtIHB1c2ggLSBibGFja2phY2sgYW5ub3VuY2UgZGl2cyBhbmQgdGV4dFxudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcbnZhciAkYW5ub3VuY2UxID0gJChcIi5hbm5vdW5jZTFcIik7XG52YXIgJGFubm91bmNlVGV4dDEgPSAkKFwiLmFubm91bmNlMSBwXCIpO1xudmFyICRhbm5vdW5jZTIgPSAkKFwiLmFubm91bmNlMlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MiA9ICQoXCIuYW5ub3VuY2UyIHBcIik7XG52YXIgJGFubm91bmNlMWEgPSAkKFwiLmFubm91bmNlMWFcIik7XG52YXIgJGFubm91bmNlVGV4dDFhID0gJChcIi5hbm5vdW5jZTFhIHBcIik7XG52YXIgJGFubm91bmNlMWIgPSAkKFwiLmFubm91bmNlMWJcIik7XG52YXIgJGFubm91bmNlVGV4dDFiID0gJChcIi5hbm5vdW5jZTFiIHBcIik7XG52YXIgJGFubm91bmNlMmEgPSAkKFwiLmFubm91bmNlMmFcIik7XG52YXIgJGFubm91bmNlVGV4dDJhID0gJChcIi5hbm5vdW5jZTJhIHBcIik7XG52YXIgJGFubm91bmNlMmIgPSAkKFwiLmFubm91bmNlMmJcIik7XG52YXIgJGFubm91bmNlVGV4dDJiID0gJChcIi5hbm5vdW5jZTJiIHBcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbiRkZWFsLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBzdGF5KCk7XG59KTtcblxuJHNwbGl0QnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDFCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MkJ1dHRvbi5jbGljayhzcGxpdCk7XG5cbiRkb3VibGVEb3duLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBiZXQoYmV0QW10KTtcbiAgY29uc29sZS5sb2coXCJkb3VibGUgZG93blwiKTtcbiAgaXNEb3VibGVkRG93biA9IHRydWU7XG4gIGhpdCgpO1xufSk7XG5cbiQoXCIudG9nZ2xlQ291bnRJbmZvXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi5jb3VudEluZm9cIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuJChcIi50b2dnbGVUZXN0UGFuZWxcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkKFwiLnRlc3RQYW5lbFwiKS50b2dnbGVDbGFzcyhcImhpZGRlblwiKTtcbn0pO1xuXG4vL2NoaXAgY2xpY2sgbGlzdGVuZXJcbiQoXCIuY2hpcFwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgaWYgKGJldENoYW5nZUFsbG93ZWQpIHtcbiAgICAkKFwiLmNoaXBcIikuYXR0cihcImlkXCIsIFwiXCIpO1xuICAgICQodGhpcykuYXR0cihcImlkXCIsIFwic2VsZWN0ZWRCZXRcIik7XG4gICAgYmV0QW10ID0gTnVtYmVyKCQodGhpcykuYXR0cihcImRhdGEtaWRcIikpO1xuICB9XG59KTtcblxuLy9nYW1lIG9iamVjdFxuZnVuY3Rpb24gR2FtZSgpIHtcbiAgdGhpcy5kZWFsZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnBsYXllciA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQxID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MWEgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MWIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MmEgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MmIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLmlzRmxpcHBlZCA9IGZhbHNlO1xuICB0aGlzLmlzUGxheWVyc1R1cm4gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBIYW5kKCkge1xuICB0aGlzLmNhcmRWYWx1ZXMgPSBbXTtcbiAgdGhpcy5jYXJkSW1hZ2VzID0gW107XG4gIHRoaXMudG90YWwgPSAwO1xuICB0aGlzLndpbm5lciA9IFwiXCI7XG4gIHRoaXMud2FnZXIgPSAwO1xuICB0aGlzLmNhblNwbGl0ID0gZmFsc2U7XG4gIHRoaXMuaXNTcGxpdCA9IGZhbHNlO1xuICB0aGlzLmNhbkRvdWJsZSA9IHRydWU7XG4gIHRoaXMuaXNEb3VibGVkID0gZmFsc2U7XG4gIHRoaXMuaXNDdXJyZW50VHVybiA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBuZXdHYW1lKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KFwicGxheWVyXCIsIGJldEFtdCkgJiYgZGVhbCgpO1xufVxuXG5mdW5jdGlvbiBkZWFsKCkge1xuICBnYW1lLnBsYXllci5jYW5Eb3VibGUgPSB0cnVlO1xuICBnYW1lLmlzRmxpcHBlZCA9IGZhbHNlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGNsZWFyVGFibGUoKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gIGlmIChkZWNrSWQgPT09IFwiXCIgfHwgY2FyZHNMZWZ0IDwgMjApIHtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIG5ldyBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICAgIGNvdW50ID0gMDtcbiAgICAgIHRydWVDb3VudCA9IDA7XG4gICAgICBjYXJkc0xlZnQgPSAzMTI7XG4gICAgICBhZHZhbnRhZ2UgPSAtLjU7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLFxuICAgIHN0b3JlSW1nOiB0cnVlXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgcGVyc29uOiBcInBsYXllclwiLFxuICAgIHN0b3JlSW1nOiB0cnVlLFxuICAgIGNhbGxiYWNrOiBjaGVja1NwbGl0XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja1NwbGl0KCkge1xuICB2YXIgY2hlY2tTcGxpdEFyciA9IGdhbWUucGxheWVySGFuZC5tYXAoZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHJldHVybiAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgcmV0dXJuIE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgfSk7XG4gIGlmIChjaGVja1NwbGl0QXJyWzBdID09PSBjaGVja1NwbGl0QXJyWzFdKSB7XG4gICAgc3BsaXRBbGxvd2VkID0gdHJ1ZTtcbiAgICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzcGxpdCAoKSB7XG4gIGdhbWUuc3BsaXRIYW5kMS5wdXNoKGdhbWUucGxheWVySGFuZFswXSk7XG4gIGdhbWUuc3BsaXRIYW5kMi5wdXNoKGdhbWUucGxheWVySGFuZFsxXSk7XG4gIGlzU3BsaXQgPSB0cnVlO1xuICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkcGxheWVyLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJTcGxpdC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJGhhbmQxLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzBdfSc+YCk7XG4gICRoYW5kMi5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1sxXX0nPmApO1xuICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMVwiKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDJcIik7XG4gIGdhbWVIYW5kID0gXCJoYW5kMVwiO1xuICBoaWdobGlnaHQoXCJoYW5kMVwiKTtcbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0KGhhbmQpIHtcbiAgaGFuZCA9PT0gXCJoYW5kMVwiID8gKFxuICAgICRoYW5kMS5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMi5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICkgOiAoXG4gICAgJGhhbmQyLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4gICAgJGhhbmQxLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd0NhcmQob3B0aW9ucykge1xuICB2YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIGdldEpTT04oY2FyZFVSTCwgZnVuY3Rpb24oZGF0YSwgY2IpIHtcbiAgICB2YXIgaHRtbDtcbiAgICBjYXJkUGxhY2UubG9hZCgpO1xuICAgIGNhcmRQbGFjZS5wbGF5KCk7XG4gICAgb3B0aW9ucy5pbWFnZSA/IChcbiAgICAgIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIG9wdGlvbnMuaW1hZ2UgKyBcIic+XCIsXG4gICAgICAkKFwiLlwiICsgb3B0aW9ucy5wZXJzb24pLnByZXBlbmQoaHRtbCksXG4gICAgICBnYW1lLmhpZGRlbkNhcmQgPSBjYXJkSW1hZ2UoZGF0YSlcbiAgICApIDogKFxuICAgICAgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgY2FyZEltYWdlKGRhdGEpICsgXCInPlwiLFxuICAgICAgJChcIi5cIiArIG9wdGlvbnMucGVyc29uKS5hcHBlbmQoaHRtbClcbiAgICApO1xuICAgIGlmIChvcHRpb25zLnBlcnNvbiA9PT0gXCJkZWFsZXJcIikge1xuICAgICAgaWYgKG9wdGlvbnMuaW1hZ2UpIHtcbiAgICAgICAgZ2FtZS5kZWFsZXJIYW5kLnVuc2hpZnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYW1lLmRlYWxlckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBoYW5kIC0gXCIgKyBnYW1lLmRlYWxlckhhbmQgKyBcIiAqKioqIGRlYWxlciBpcyBhdCBcIiArIGdhbWUuZGVhbGVyVG90YWwpO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wZXJzb24gPT09IFwicGxheWVyXCIpIHtcbiAgICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBoYW5kIC0gXCIgKyBnYW1lLnBsYXllckhhbmQgKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIGdhbWUucGxheWVyVG90YWwpO1xuICAgIH1cbiAgICBjaGVja1ZpY3RvcnkoKTtcbiAgICBvcHRpb25zLnN0b3JlSW1nICYmIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2goY2FyZEltYWdlKGRhdGEpKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGlzRG91YmxlZERvd24gJiYgIWdhbWUud2lubmVyKSB7XG4gICAgICAgIHN0YXkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoaXNGaXJzdFR1cm4pIHtcbiAgICBpc0ZpcnN0VHVybiA9IGZhbHNlO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcImRvdWJsZURvd24tZGlzYWJsZWRcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RheSgpIHtcbiAgaWYgKCFnYW1lLndpbm5lciAmJiBnYW1lLmRlYWxlclRvdGFsIDwgMTcpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoaXRzXCIpO1xuICAgIGlzUGxheWVyc1R1cm4gPSBmYWxzZTtcbiAgICBkcmF3Q2FyZCh7XG4gICAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgICBjYWxsYmFjazogc3RheVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IGdhbWUucGxheWVyVG90YWwpIHtcbiAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgZ2FtZUVuZCgpO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPCAyMikge1xuICAgIGdhbWUuZGVhbGVyVG90YWwgPiBnYW1lLnBsYXllclRvdGFsID8gKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsICsgXCIgYmVhdHMgcGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICkgOiAoXG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCArIFwiIGJlYXRzIGRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrU3BsaXRUb3RhbChoYW5kTnVtKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gZ2FtZS5zcGxpdEhhbmQxIDogZ2FtZS5zcGxpdEhhbmQyO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICBoYW5kTnVtID09PSBcImhhbmQxXCIgPyAoXG4gICAgZ2FtZS5zcGxpdEhhbmQxVG90YWwgPSB0b3RhbCxcbiAgICAkaGFuZDFUb3RhbC50ZXh0KGdhbWUuc3BsaXRIYW5kMVRvdGFsKVxuICApIDogKFxuICAgIGdhbWUuc3BsaXRIYW5kMlRvdGFsID0gdG90YWwsXG4gICAgJGhhbmQyVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDJUb3RhbClcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tUb3RhbChwZXJzb24pIHtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIGhhbmQgPSBwZXJzb24gPT09IFwiZGVhbGVyXCIgPyBnYW1lLmRlYWxlckhhbmQgOiBnYW1lLnBsYXllckhhbmQ7XG4gIHZhciBhY2VzID0gMDtcblxuICBoYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHRvdGFsICs9IDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBhY2VzICs9IDE7XG4gICAgfVxuICB9KTtcblxuICBpZiAoYWNlcyA+IDApIHtcbiAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuICAgICAgdG90YWwgKz0gYWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuICAgIH1cbiAgfVxuXG4gIHZhciB0ZXh0Q29sb3IgPSBcIndoaXRlXCJcbiAgaWYgKHRvdGFsID09PSAyMSkge1xuICAgIHRleHRDb2xvciA9IFwibGltZVwiO1xuICB9IGVsc2UgaWYgKHRvdGFsID4gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcInJlZFwiO1xuICB9XG5cbiAgcGVyc29uID09PSBcImRlYWxlclwiID8gKFxuICAgIGdhbWUuZGVhbGVyVG90YWwgPSB0b3RhbCxcbiAgICAkZGVhbGVyVG90YWwudGV4dChnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAkZGVhbGVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApIDogKFxuICAgIGdhbWUucGxheWVyVG90YWwgPSB0b3RhbCxcbiAgICAkcGxheWVyVG90YWwudGV4dChnYW1lLnBsYXllclRvdGFsKSxcbiAgICAkcGxheWVyVG90YWwuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKVxuICApO1xufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoKSB7XG4gIGlmIChnYW1lLmRlYWxlckhhbmQubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA+PSAyKSB7XG4gICAgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVySGFuZC5sZW5ndGggPT09IDIgJiYgZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5wbGF5ZXJIYW5kLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGdhbWUud2FnZXIgKj0gMS4yNTtcbiAgICAgIGFubm91bmNlKFwiQkxBQ0tKQUNLIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IDIxICYmIGdhbWUucGxheWVyVG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXJIYW5kLmxlbmd0aCA9PT0gMiAmJiBpc1BsYXllcnNUdXJuICYmIGdhbWUucGxheWVyVG90YWwgPCAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFjaywgZG9pbmcgbm90aGluZy4uXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKFwiMjEhXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5wbGF5ZXJUb3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBidXN0c1wiKTtcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKFwiQlVTVFwiKTtcbiAgICB9XG4gIH1cblxuICBnYW1lLndpbm5lciAmJiBnYW1lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIGdhbWVFbmQoKSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgIGJhbmsgKz0gKGdhbWUud2FnZXIgKiAyKTtcbiAgICBjb25zb2xlLmxvZyhgZ2l2aW5nIHBsYXllciAke2dhbWUud2FnZXIgKiAyfS4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgYmFuayArPSBnYW1lLndhZ2VyO1xuICAgIGNvbnNvbGUubG9nKGByZXR1cm5pbmcgJHtnYW1lLndhZ2VyfSB0byBwbGF5ZXIuIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9XG4gICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICFpc0ZsaXBwZWQgJiYgZmxpcENhcmQoKTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4gIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gY2xlYXJUYWJsZSgpIHtcbiAgJChcIi5oYW5kLCAud2FnZXIsIC50b3RhbCwgLmNoaXBzXCIpLmVtcHR5O1xuICAkKFwiLmRlYWxlclRvdGFsLCAucGxheWVyU3BsaXQsIC5wbGF5ZXJTcGxpdDEsIC5wbGF5ZXJTcGxpdDIsIC5wb3B1cFwiKS5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJChcIi5wb3B1cFwiKS5yZW1vdmVDbGFzcyhcIndpbiBsb3NlIHB1c2hcIik7XG4gIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tdGFibGUgY2xlYXJlZC0tLS0tLS0tLS0tLVwiKTtcbn1cblxuZnVuY3Rpb24gY2FyZEltYWdlKGRhdGEpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9IGRhdGEuY2FyZHNbMF0udmFsdWU7XG4gIHZhciBjYXJkU3VpdCA9IGRhdGEuY2FyZHNbMF0uc3VpdDtcbiAgdmFyIGZpbGVuYW1lID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgcmV0dXJuIGZpbGVuYW1lO1xufVxuXG5mdW5jdGlvbiBhbm5vdW5jZSh0ZXh0KSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJkZWFsZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcImxvc2VcIik7XG4gICAgbG9zZVdhdi5sb2FkKCk7XG4gICAgbG9zZVdhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJ3aW5cIik7XG4gICAgd2luV2F2LmxvYWQoKTtcbiAgICB3aW5XYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcInB1c2hcIik7XG4gIH1cbiAgJGFubm91bmNlVGV4dC50ZXh0KHRleHQpO1xufVxuXG5mdW5jdGlvbiBmbGlwQ2FyZCgpIHtcbiAgY29uc29sZS5sb2coJ2ZsaXAnKTtcbiAgaXNGbGlwcGVkID0gdHJ1ZTtcbiAgdmFyICRmbGlwcGVkID0gJChcIi5kZWFsZXIgLmNhcmRJbWFnZVwiKS5maXJzdCgpO1xuICAkZmxpcHBlZC5yZW1vdmUoKTtcbiAgdmFyIGh0bWwgPSBgPGltZyBzcmM9JyR7Z2FtZS5oaWRkZW5DYXJkfScgY2xhc3M9J2NhcmRJbWFnZSc+YDtcbiAgJGRlYWxlci5wcmVwZW5kKGh0bWwpO1xuICB1cGRhdGVDb3VudChnYW1lLmRlYWxlckhhbmRbMF0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb3VudChjYXJkKSB7XG4gIGlmIChpc05hTihOdW1iZXIoY2FyZCkpIHx8IGNhcmQgPT09IFwiMTBcIikge1xuICAgIGNvdW50IC09IDE7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50IC0xIC0tPiAke2NvdW50fWApO1xuICB9IGVsc2UgaWYgKGNhcmQgPCA3KSB7XG4gICAgY291bnQgKz0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgKzEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA+PSA3ICYmIGNhcmQgPD0gOSkge1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMCAtLT4gJHtjb3VudH1gKTtcbiAgfVxuICBnZXRUcnVlQ291bnQoKTtcbiAgZ2V0QWR2YW50YWdlKCk7XG4gIHNldE5lZWRsZSgpO1xuICAkY291bnQuZW1wdHkoKTtcbiAgJGNvdW50LmFwcGVuZChcIjxwPkNvdW50OiBcIiArIGNvdW50ICsgXCI8L3A+XCIpO1xuICAkdHJ1ZUNvdW50LmVtcHR5KCk7XG4gICR0cnVlQ291bnQuYXBwZW5kKFwiPHA+VHJ1ZSBDb3VudDogXCIgKyB0cnVlQ291bnQudG9QcmVjaXNpb24oMikgKyBcIjwvcD5cIik7XG59XG5cbmZ1bmN0aW9uIGdldFRydWVDb3VudCgpIHtcbiAgdmFyIGRlY2tzTGVmdCA9IGNhcmRzTGVmdCAvIDUyO1xuICB0cnVlQ291bnQgPSBjb3VudCAvIGRlY2tzTGVmdDtcbn1cblxuZnVuY3Rpb24gZ2V0QWR2YW50YWdlKCkge1xuICBhZHZhbnRhZ2UgPSAodHJ1ZUNvdW50ICogLjUpIC0gLjU7XG59XG5cbmZ1bmN0aW9uIHNldE5lZWRsZSgpIHtcbiAgdmFyIG51bSA9IGFkdmFudGFnZSAqIDM2O1xuICAkKFwiLmdhdWdlLW5lZWRsZVwiKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIgKyBudW0gKyBcImRlZylcIik7XG59XG5cbmZ1bmN0aW9uIGJldChoYW5kLCBhbXQpIHtcbiAgaWYgKGJhbmsgPj0gYW10KSB7XG4gICAgZ2FtZVtoYW5kXS53YWdlciArPSBhbXQ7XG4gICAgYmFuayAtPSBhbXQ7XG4gICAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgICBjb3VudENoaXBzKFwiYmFua1wiKTtcbiAgICBjb3VudENoaXBzKGhhbmQpO1xuICAgICQoYC4ke2hhbmR9V2FnZXJgKS50ZXh0KGdhbWVbaGFuZF0ud2FnZXIpO1xuICAgIGNvbnNvbGUubG9nKGBiZXR0aW5nICR7YW10fSBvbiAke2hhbmR9YCk7XG4gICAgY29uc29sZS5sb2coYCR7aGFuZH0gd2FnZXIgYXQgJHtnYW1lW2hhbmRdLndhZ2VyfWApO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiSW5zdWZmaWNpZW50IGZ1bmRzLlwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gY291bnRDaGlwcyhsb2NhdGlvbikge1xuICB2YXIgYW10ID0gbG9jYXRpb24gPT09IFwiYmFua1wiID8gYmFuayA6IGdhbWVbbG9jYXRpb25dLndhZ2VyO1xuICB2YXIgbnVtMTAwcyA9IE1hdGguZmxvb3IoYW10IC8gMTAwKTtcbiAgdmFyIG51bTUwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDApIC8gNTApO1xuICB2YXIgbnVtMjVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwKSAvIDI1KTtcbiAgdmFyIG51bTEwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1KSAvIDEwKTtcbiAgIHZhciBudW01cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTApIC8gNSk7XG4gICB2YXIgbnVtMXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1KSAvIDEpO1xuICB2YXIgbnVtMDVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSAtIG51bTFzICogMSkgLyAuNSk7XG5cbiAgdmFyIGh0bWwgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMjVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTI1LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTFzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0wNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMDUucG5nJz5cIjtcbiAgfTtcblxuICBpZiAobG9jYXRpb24gPT09IFwiYmFua1wiKSB7XG4gICAgJGJhbmtDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5iYW5rQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAkKGAuJHtsb2NhdGlvbn1DaGlwc2ApLmh0bWwoaHRtbCk7XG4gICAgJChgLiR7bG9jYXRpb259Q2hpcHMgaW1nYCkuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIFRFU1RJTkcgLy9cbi8vLy8vLy8vLy8vLy9cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIxKTtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIyKTtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbiAgY2hlY2tTcGxpdCgpO1xufSk7XG5cbiQoXCIuZ2l2ZUNhcmRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGdpdmVDYXJkKCQodGhpcykuYXR0cihcImRhdGEtaWRcIikpO1xufSlcblxuLy8gJCgnLmRlYWxlckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgnZGVhbGVyJyk7XG4vLyB9KTtcblxuLy8gJCgnLnBsYXllckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgncGxheWVyJyk7XG4vLyB9KTtcblxuZnVuY3Rpb24gZ2l2ZUNhcmQoaGFuZCkge1xuICB2YXIgY2FyZFZhbHVlID0gJCgnLmdpdmVDYXJkVmFsdWUnKS52YWwoKTtcbiAgdmFyIGNhcmRTdWl0ID0gJCgnLmdpdmVDYXJkU3VpdCcpLnZhbCgpO1xuICB2YXIgY2FyZFNyYyA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG5cbiAgLy9UaGlzIGlzIG1heWJlIGhvdyBpdCBjYW4gbG9vayBpbiB0aGUgZnV0dXJlOlxuICAvL2dhbWUuaGFuZFtoYW5kXS5wdXNoKGNhcmRWYWx1ZSk7XG4gIC8vY2hlY2tUb3RhbChoYW5kKTtcbiAgLy8kKGhhbmQpLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuXG4gIGlmIChwZXJzb24gPT09ICdkZWFsZXInKSB7XG4gICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdkZWFsZXInKTtcbiAgICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3BsYXllcicpIHtcbiAgICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3BsYXllcicpO1xuICAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxJykge1xuICAgIGdhbWUuc3BsaXQxSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxJyk7XG4gICAgJHNwbGl0MS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDInKSB7XG4gICAgZ2FtZS5zcGxpdDJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDInKTtcbiAgICAkc3BsaXQyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWEnKSB7XG4gICAgZ2FtZS5zcGxpdDFhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYScpO1xuICAgICRzcGxpdDFhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWInKSB7XG4gICAgZ2FtZS5zcGxpdDFiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYicpO1xuICAgICRzcGxpdDFiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmEnKSB7XG4gICAgZ2FtZS5zcGxpdDJhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYScpO1xuICAgICRzcGxpdDJhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmInKSB7XG4gICAgZ2FtZS5zcGxpdDJiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYicpO1xuICAgICRzcGxpdDJiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9XG5cbiAgLy8gcGVyc29uID09PSAnZGVhbGVyJyA/IChcbiAgLy8gICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ2RlYWxlcicpLFxuICAvLyAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKSA6IChcbiAgLy8gICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ3BsYXllcicpLFxuICAvLyAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKVxuICBjaGVja1ZpY3RvcnkoKTtcbn1cblxuLy8gSlNPTiByZXF1ZXN0IGZ1bmN0aW9uIHdpdGggSlNPTlAgcHJveHlcbmZ1bmN0aW9uIGdldEpTT04odXJsLCBjYikge1xuICB2YXIgSlNPTlBfUFJPWFkgPSAnaHR0cHM6Ly9qc29ucC5hZmVsZC5tZS8/dXJsPSc7XG4gIC8vIFRISVMgV0lMTCBBREQgVEhFIENST1NTIE9SSUdJTiBIRUFERVJTXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgSlNPTlBfUFJPWFkgKyB1cmwpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiJdfQ==