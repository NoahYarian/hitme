"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var decks = 6;
var count = 0;
var trueCount = count / decks;
var cardsLeft = 52 * decks;
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
var $double = $(".double");
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

$double.click(function () {
  $double.attr("disabled", true);
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
  this.currentHand = "player";
}

function Hand() {
  this.cards = [];
  this.cardImages = [];
  this.total = 0;
  this.winner = "";
  this.wager = 0;
  this.canSplit = false;
  this.isSplit = false;
  this.canDouble = true;
  this.isDoubled = false;
  this.isCurrentTurn = false;
  this.isDone = true;
}

function newGame() {
  game = new Game();
  bet("player", betAmt) && deal();
}

function deal() {
  betChangeAllowed = false;
  game.player.isDone = false;
  clearTable();
  $deal.attr("disabled", true);
  $(".hit, .stay, .double").attr("disabled", false);
  $double.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 33) {
    getJSON(newDeckURL + decks, function (data) {
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
    hand: "dealer",
    image: cardBack
  });
  drawCard({
    hand: "player"
  });
  drawCard({
    hand: "dealer"
  });
  drawCard({
    hand: "player",
    callback: function callback() {
      checkSplit("player");
    }
  });
}

function checkSplit(hand) {
  var checkSplitArr = game[hand].cards.map(function (card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      return "10";
    } else {
      return card;
    }
  });
  if (checkSplitArr[0] === checkSplitArr[1]) {
    game[hand].canSplit = true;
    $("." + hand + " > button").attr("disabled", false);
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
  var cardURL = "" + API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function (data, cb) {
    var html;
    var hand = options.hand;
    var cardImageSrc = cardImage(data);
    game[hand].cardImages.push(cardImageSrc);
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class=\"cardImage\" src=\"" + options.image + "\">", $dealerHand.prepend(html)) : (html = "<img class=\"cardImage\" src=\"" + cardImage(data) + "\">", $("." + hand).append(html));
    if (options.person === "dealer") {
      if (options.image) {
        game.dealer.cards.unshift(data.cards[0].value);
      } else {
        game.dealer.cards.push(data.cards[0].value);
        updateCount(data.cards[0].value);
      }
      checkTotal("dealer");
      console.log("dealer - " + game.dealer.cards + " **** dealer is at " + game.dealer.total);
    } else {
      game[hand].cards.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal(hand);
      console.log("" + hand + " - " + game[hand].cards + " **** " + hand + " is at " + game.player.total);
    }
    checkLoss21(game.currentHand);
    typeof options.callback === "function" && options.callback();
  });
  cardsLeft--;
}

function hit() {
  console.log("hit");
  var hand = game.currentHand;
  drawCard({
    hand: hand,
    callback: function callback() {
      if (game[hand].isDoubled && !game[hand].winner) {
        stay();
      }
    }
  });
  if (game[hand].isFirstTurn) {
    game[hand].isFirstTurn = false;
    $doubled.attr("id", "doubled-disabled");
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

function checkTotal(hand) {
  var total = 0;
  var handToCheck = hand === "dealer" ? game.dealer.cards : game[hand].cards;
  var aces = 0;

  handToCheck.forEach(function (card) {
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

  game[hand].total = total;
  $("." + hand + "Total").text(total).css("color", textColor);
}

function checkLoss21(hand) {
  if (hand === "dealer") {
    if (game.dealer.total > 21) {
      console.log("dealer busts");
      checkVictory("player");
      checkVictory("split1");
      checkVictory("split2");
      checkVictory("split1a");
      checkVictory("split1b");
      checkVictory("split2a");
      checkVictory("split2b");
    } else if (game.dealer.total === 21) {
      console.log("dealer has 21");
      checkVictory("player");
      checkVictory("split1");
      checkVictory("split2");
      checkVictory("split1a");
      checkVictory("split1b");
      checkVictory("split2a");
      checkVictory("split2b");
    } else if (game.dealer.total < 17 && game.dealer.total < 21) {
      console.log("dealer stays with " + game.dealer.total);
      checkVictory("player");
      checkVictory("split1");
      checkVictory("split2");
      checkVictory("split1a");
      checkVictory("split1b");
      checkVictory("split2a");
      checkVictory("split2b");
    }
  } else {
    if (game[hand].total > 21) {
      console.log("player busts");
      game[hand].winner = "dealer";
      announce(hand, "BUST");
      handEnd(hand);
    } else if (game[hand].total === 21) {
      handEnd(hand);
    }
  }
}

function checkVictory(hand) {
  //guards against checking before the deal is complete
  if (game.dealer.cards.length >= 2 && game.player.cards.length >= 2) {
    if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21 && game[hand].cards.length === 2) {
      console.log("double blackjack push!");
      game[hand].winner = "push";
      announce(hand, "PUSH");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21) {
      console.log("dealer has blackjack");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game[hand].total === 21 && game[hand].cards.length === 2) {
      console.log("player has blackjack");
      game[hand].winner = "player";
      game[hand].wager *= 1.25;
      announce(hand, "BLACKJACK!");
    } else if (game.dealer.total === 21 && game[hand].total === 21) {
      console.log("push");
      game[hand].winner = "push";
      announce(hand, "PUSH");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game.isPlayersTurn && game[hand].total < 21) {
      console.log("dealer has blackjack, doing nothing...");
    } else if (game.dealer.total === 21) {
      console.log("dealer has 21");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game.dealer.total > 21) {
      console.log("dealer busts");
      game[hand].winner = "player";
      announce(hand, "YOU WIN");
    } else if (game[hand].total === 21) {
      console.log("player has 21");
      game[hand].winner = "player";
      announce(hand, "21!");
    } else if (game[hand].total > 21) {
      console.log("player busts");
      game[hand].winner = "dealer";
      announce(hand, "BUST");
    }
  }

  //game[hand].winner && handEnd(hand);
}

function handEnd(hand) {
  game[hand].isDone = true;
  if (game.split1b.isDone === false) {
    game.currentHand = "split1b";
    highlight("split1b");
  } else if (game.split1.isDone === false) {
    game.currentHand = "split1";
    highlight("split1");
  } else if (game.split2a.isDone === false) {
    game.currentHand = "split2a";
    highlight("split2a");
  } else if (game.split2b.isDone === false) {
    game.currentHand = "split2b";
    highlight("split2b");
  } else if (game.split2.isDone === false) {
    game.currentHand = "split2";
    highlight("split2");
  } else {
    gameEnd();
  }
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
  $(".hand, .wager, .total, .chips").empty();
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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLENB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QUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzlCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLGNBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzVELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdELE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QixZQUFRLENBQUMsTUFBTSxnQkFBYyxPQUFPLDBCQUF1QixDQUFDO0dBQzdEOzs7Ozs7Ozs7OztBQVdELGNBQVksRUFBRSxDQUFDO0NBQ2hCOzs7QUFHRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ3hCLE1BQUksV0FBVyxHQUFHLDhCQUE4QixDQUFDOztBQUVqRCxNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ25DLFNBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2QyxTQUFPLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDMUIsUUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtBQUNqRCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxNQUFNO0FBQ0wsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsQ0FBQyIsImZpbGUiOiJzcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBUEkgPSBcImh0dHA6Ly9kZWNrb2ZjYXJkc2FwaS5jb20vYXBpL1wiO1xudmFyIG5ld0RlY2tVUkwgPSBBUEkgKyBcInNodWZmbGUvP2RlY2tfY291bnQ9XCI7XG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzUyL0NhcmRfYmFja18xNi5zdmcvMjA5cHgtQ2FyZF9iYWNrXzE2LnN2Zy5wbmdcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBkZWNrcyA9IDY7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3M7XG52YXIgY2FyZHNMZWZ0ID0gNTIgKiBkZWNrcztcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbi8vIHZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG4vLyB2YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4vLyB2YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzRmxpcHBlZCA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vZ2FtZSBidXR0b25zXG52YXIgJGRlYWwgPSAkKFwiLmRlYWxcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xudmFyICRkb3VibGUgPSAkKFwiLmRvdWJsZVwiKTtcbnZhciAkc3BsaXRCdXR0b24gPSAkKFwiLnNwbGl0QnV0dG9uXCIpO1xudmFyICRzcGxpdDFCdXR0b24gPSAkKFwiLnNwbGl0MUJ1dHRvblwiKTtcbnZhciAkc3BsaXQyQnV0dG9uID0gJChcIi5zcGxpdDJCdXR0b25cIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG5cbi8vIENoaXAgc3RhY2tzXG52YXIgJGJhbmtDaGlwcyA9ICQoXCIuYmFua0NoaXBzXCIpO1xudmFyICRwbGF5ZXJDaGlwcyA9ICQoXCIucGxheWVyQ2hpcHNcIik7XG52YXIgJHNwbGl0MUNoaXBzID0gJChcIi5zcGxpdDFDaGlwc1wiKTtcbnZhciAkc3BsaXQyQ2hpcHMgPSAkKFwiLnNwbGl0MkNoaXBzXCIpO1xudmFyICRzcGxpdDFhQ2hpcHMgPSAkKFwiLnNwbGl0MWFDaGlwc1wiKTtcbnZhciAkc3BsaXQxYkNoaXBzID0gJChcIi5zcGxpdDFiQ2hpcHNcIik7XG52YXIgJHNwbGl0MmFDaGlwcyA9ICQoXCIuc3BsaXQyYUNoaXBzXCIpO1xudmFyICRzcGxpdDJiQ2hpcHMgPSAkKFwiLnNwbGl0MmJDaGlwc1wiKTtcblxuLy8gQ2hpcCB0b3RhbHNcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJHBsYXllcldhZ2VyID0gJChcIi5wbGF5ZXJXYWdlclwiKTtcbnZhciAkc3BsaXQxV2FnZXIgPSAkKFwiLnNwbGl0MVdhZ2VyXCIpO1xudmFyICRzcGxpdDJXYWdlciA9ICQoXCIuc3BsaXQyV2FnZXJcIik7XG52YXIgJHNwbGl0MWFXYWdlciA9ICQoXCIuc3BsaXQxYVdhZ2VyXCIpO1xudmFyICRzcGxpdDFiV2FnZXIgPSAkKFwiLnNwbGl0MWJXYWdlclwiKTtcbnZhciAkc3BsaXQyYVdhZ2VyID0gJChcIi5zcGxpdDJhV2FnZXJcIik7XG52YXIgJHNwbGl0MmJXYWdlciA9ICQoXCIuc3BsaXQyYldhZ2VyXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlckhhbmQgPSAkKFwiLmRlYWxlckhhbmRcIik7XG52YXIgJHBsYXllckhhbmQgPSAkKFwiLnBsYXllckhhbmRcIik7XG52YXIgJHNwbGl0MUhhbmQgPSAkKFwiLnNwbGl0MUhhbmRcIik7XG52YXIgJHNwbGl0MkhhbmQgPSAkKFwiLnNwbGl0MkhhbmRcIik7XG52YXIgJHNwbGl0MWFIYW5kID0gJChcIi5zcGxpdDFhSGFuZFwiKTtcbnZhciAkc3BsaXQxYkhhbmQgPSAkKFwiLnNwbGl0MWJIYW5kXCIpO1xudmFyICRzcGxpdDJhSGFuZCA9ICQoXCIuc3BsaXQyYUhhbmRcIik7XG52YXIgJHNwbGl0MmJIYW5kID0gJChcIi5zcGxpdDJiSGFuZFwiKTtcblxuLy9jYXJkIGhhbmQgcGFyZW50IGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xudmFyICRzcGxpdDEgPSAkKFwiLnNwbGl0MVwiKTtcbnZhciAkc3BsaXQyID0gJChcIi5zcGxpdDJcIik7XG52YXIgJHNwbGl0MWEgPSAkKFwiLnNwbGl0MWFcIik7XG52YXIgJHNwbGl0MWIgPSAkKFwiLnNwbGl0MWJcIik7XG52YXIgJHNwbGl0MmEgPSAkKFwiLnNwbGl0MmFcIik7XG52YXIgJHNwbGl0MmIgPSAkKFwiLnNwbGl0MmJcIik7XG5cbi8vY2FyZCBzcGxpdCBwYXJlbnQgZGl2c1xudmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG52YXIgJHBsYXllclNwbGl0MSA9ICQoXCIucGxheWVyU3BsaXQxXCIpO1xudmFyICRwbGF5ZXJTcGxpdDIgPSAkKFwiLnBsYXllclNwbGl0MlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG52YXIgJHNwbGl0MVRvdGFsID0gJChcIi5zcGxpdDFUb3RhbFwiKTtcbnZhciAkc3BsaXQyVG90YWwgPSAkKFwiLnNwbGl0MlRvdGFsXCIpO1xudmFyICRzcGxpdDFhVG90YWwgPSAkKFwiLnNwbGl0MWFUb3RhbFwiKTtcbnZhciAkc3BsaXQxYlRvdGFsID0gJChcIi5zcGxpdDFiVG90YWxcIik7XG52YXIgJHNwbGl0MmFUb3RhbCA9ICQoXCIuc3BsaXQyYVRvdGFsXCIpO1xudmFyICRzcGxpdDJiVG90YWwgPSAkKFwiLnNwbGl0MmJUb3RhbFwiKTtcblxuLy8gd2luIC0gbG9zZSAtIHB1c2ggLSBibGFja2phY2sgYW5ub3VuY2UgZGl2cyBhbmQgdGV4dFxudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcbnZhciAkYW5ub3VuY2UxID0gJChcIi5hbm5vdW5jZTFcIik7XG52YXIgJGFubm91bmNlVGV4dDEgPSAkKFwiLmFubm91bmNlMSBwXCIpO1xudmFyICRhbm5vdW5jZTIgPSAkKFwiLmFubm91bmNlMlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MiA9ICQoXCIuYW5ub3VuY2UyIHBcIik7XG52YXIgJGFubm91bmNlMWEgPSAkKFwiLmFubm91bmNlMWFcIik7XG52YXIgJGFubm91bmNlVGV4dDFhID0gJChcIi5hbm5vdW5jZTFhIHBcIik7XG52YXIgJGFubm91bmNlMWIgPSAkKFwiLmFubm91bmNlMWJcIik7XG52YXIgJGFubm91bmNlVGV4dDFiID0gJChcIi5hbm5vdW5jZTFiIHBcIik7XG52YXIgJGFubm91bmNlMmEgPSAkKFwiLmFubm91bmNlMmFcIik7XG52YXIgJGFubm91bmNlVGV4dDJhID0gJChcIi5hbm5vdW5jZTJhIHBcIik7XG52YXIgJGFubm91bmNlMmIgPSAkKFwiLmFubm91bmNlMmJcIik7XG52YXIgJGFubm91bmNlVGV4dDJiID0gJChcIi5hbm5vdW5jZTJiIHBcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbiRkZWFsLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBzdGF5KCk7XG59KTtcblxuJHNwbGl0QnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDFCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MkJ1dHRvbi5jbGljayhzcGxpdCk7XG5cbiRkb3VibGUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZUNvdW50SW5mb1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIuY291bnRJbmZvXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi50ZXN0UGFuZWxcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgdGhpcy5jdXJyZW50SGFuZCA9IFwicGxheWVyXCI7XG59XG5cbmZ1bmN0aW9uIEhhbmQoKSB7XG4gIHRoaXMuY2FyZHMgPSBbXTtcbiAgdGhpcy5jYXJkSW1hZ2VzID0gW107XG4gIHRoaXMudG90YWwgPSAwO1xuICB0aGlzLndpbm5lciA9IFwiXCI7XG4gIHRoaXMud2FnZXIgPSAwO1xuICB0aGlzLmNhblNwbGl0ID0gZmFsc2U7XG4gIHRoaXMuaXNTcGxpdCA9IGZhbHNlO1xuICB0aGlzLmNhbkRvdWJsZSA9IHRydWU7XG4gIHRoaXMuaXNEb3VibGVkID0gZmFsc2U7XG4gIHRoaXMuaXNDdXJyZW50VHVybiA9IGZhbHNlO1xuICB0aGlzLmlzRG9uZSA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoXCJwbGF5ZXJcIiwgYmV0QW10KSAmJiBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgZ2FtZS5wbGF5ZXIuaXNEb25lID0gZmFsc2U7XG4gIGNsZWFyVGFibGUoKTtcbiAgJGRlYWwuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkKFwiLmhpdCwgLnN0YXksIC5kb3VibGVcIikuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGRvdWJsZS5hdHRyKFwiaWRcIiwgXCJcIik7XG4gIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgY2FyZFBhY2thZ2UucGxheSgpO1xuICBpZiAoZGVja0lkID09PSBcIlwiIHx8IGNhcmRzTGVmdCA8IDMzKSB7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMICsgZGVja3MsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIG5ldyBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICAgIGNvdW50ID0gMDtcbiAgICAgIHRydWVDb3VudCA9IDA7XG4gICAgICBjYXJkc0xlZnQgPSAzMTI7XG4gICAgICBhZHZhbnRhZ2UgPSAtLjU7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIGhhbmQ6IFwicGxheWVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgY2hlY2tTcGxpdChcInBsYXllclwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja1NwbGl0KGhhbmQpIHtcbiAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lW2hhbmRdLmNhcmRzLm1hcChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgcmV0dXJuIFwiMTBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhcmQ7XG4gICAgfVxuICB9KTtcbiAgaWYgKGNoZWNrU3BsaXRBcnJbMF0gPT09IGNoZWNrU3BsaXRBcnJbMV0pIHtcbiAgICBnYW1lW2hhbmRdLmNhblNwbGl0ID0gdHJ1ZTtcbiAgICAkKGAuJHtoYW5kfSA+IGJ1dHRvbmApLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXQgKCkge1xuICBnYW1lLnNwbGl0SGFuZDEucHVzaChnYW1lLnBsYXllckhhbmRbMF0pO1xuICBnYW1lLnNwbGl0SGFuZDIucHVzaChnYW1lLnBsYXllckhhbmRbMV0pO1xuICBpc1NwbGl0ID0gdHJ1ZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHBsYXllci5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJHBsYXllclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyU3BsaXQucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRoYW5kMS5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1swXX0nPmApO1xuICAkaGFuZDIuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMV19Jz5gKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDFcIik7XG4gIGNoZWNrU3BsaXRUb3RhbChcImhhbmQyXCIpO1xuICBnYW1lSGFuZCA9IFwiaGFuZDFcIjtcbiAgaGlnaGxpZ2h0KFwiaGFuZDFcIik7XG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChoYW5kKSB7XG4gIGhhbmQgPT09IFwiaGFuZDFcIiA/IChcbiAgICAkaGFuZDEuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgICAkaGFuZDIucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICApIDogKFxuICAgICRoYW5kMi5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMS5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdDYXJkKG9wdGlvbnMpIHtcbiAgdmFyIGNhcmRVUkwgPSBgJHtBUEl9ZHJhdy8ke2RlY2tJZH0vP2NvdW50PTFgO1xuICBnZXRKU09OKGNhcmRVUkwsIGZ1bmN0aW9uKGRhdGEsIGNiKSB7XG4gICAgdmFyIGh0bWw7XG4gICAgdmFyIGhhbmQgPSBvcHRpb25zLmhhbmQ7XG4gICAgdmFyIGNhcmRJbWFnZVNyYyA9IGNhcmRJbWFnZShkYXRhKTtcbiAgICBnYW1lW2hhbmRdLmNhcmRJbWFnZXMucHVzaChjYXJkSW1hZ2VTcmMpO1xuICAgIGNhcmRQbGFjZS5sb2FkKCk7XG4gICAgY2FyZFBsYWNlLnBsYXkoKTtcbiAgICBvcHRpb25zLmltYWdlID8gKFxuICAgICAgaHRtbCA9IGA8aW1nIGNsYXNzPVwiY2FyZEltYWdlXCIgc3JjPVwiJHtvcHRpb25zLmltYWdlfVwiPmAsXG4gICAgICAkZGVhbGVySGFuZC5wcmVwZW5kKGh0bWwpXG4gICAgKSA6IChcbiAgICAgIGh0bWwgPSBgPGltZyBjbGFzcz1cImNhcmRJbWFnZVwiIHNyYz1cIiR7Y2FyZEltYWdlKGRhdGEpfVwiPmAsXG4gICAgICAkKFwiLlwiICsgaGFuZCkuYXBwZW5kKGh0bWwpXG4gICAgKTtcbiAgICBpZiAob3B0aW9ucy5wZXJzb24gPT09IFwiZGVhbGVyXCIpIHtcbiAgICAgIGlmIChvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIGdhbWUuZGVhbGVyLmNhcmRzLnVuc2hpZnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYW1lLmRlYWxlci5jYXJkcy5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gICAgICBjb25zb2xlLmxvZyhgZGVhbGVyIC0gJHtnYW1lLmRlYWxlci5jYXJkc30gKioqKiBkZWFsZXIgaXMgYXQgJHtnYW1lLmRlYWxlci50b3RhbH1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2FtZVtoYW5kXS5jYXJkcy5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICBjaGVja1RvdGFsKGhhbmQpO1xuICAgICAgY29uc29sZS5sb2coYCR7aGFuZH0gLSAke2dhbWVbaGFuZF0uY2FyZHN9ICoqKiogJHtoYW5kfSBpcyBhdCAke2dhbWUucGxheWVyLnRvdGFsfWApO1xuICAgIH1cbiAgICBjaGVja0xvc3MyMShnYW1lLmN1cnJlbnRIYW5kKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgdmFyIGhhbmQgPSBnYW1lLmN1cnJlbnRIYW5kO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogaGFuZCxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGdhbWVbaGFuZF0uaXNEb3VibGVkICYmICFnYW1lW2hhbmRdLndpbm5lcikge1xuICAgICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGdhbWVbaGFuZF0uaXNGaXJzdFR1cm4pIHtcbiAgICBnYW1lW2hhbmRdLmlzRmlyc3RUdXJuID0gZmFsc2U7XG4gICAgJGRvdWJsZWQuYXR0cihcImlkXCIsIFwiZG91YmxlZC1kaXNhYmxlZFwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGF5KCkge1xuICBpZiAoIWdhbWUud2lubmVyICYmIGdhbWUuZGVhbGVyVG90YWwgPCAxNykge1xuICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhpdHNcIik7XG4gICAgaXNQbGF5ZXJzVHVybiA9IGZhbHNlO1xuICAgIGRyYXdDYXJkKHtcbiAgICAgIHBlcnNvbjogXCJkZWFsZXJcIixcbiAgICAgIGNhbGxiYWNrOiBzdGF5XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA9PT0gZ2FtZS5wbGF5ZXJUb3RhbCkge1xuICAgIGdhbWUud2lubmVyID0gXCJwdXNoXCI7XG4gICAgYW5ub3VuY2UoXCJQVVNIXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICBnYW1lRW5kKCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXJUb3RhbCA8IDIyKSB7XG4gICAgZ2FtZS5kZWFsZXJUb3RhbCA+IGdhbWUucGxheWVyVG90YWwgPyAoXG4gICAgICBnYW1lLndpbm5lciA9IFwiZGVhbGVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBMT1NFXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwgKyBcIiBiZWF0cyBwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKSA6IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJwbGF5ZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIFdJTlwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tUb3RhbChoYW5kKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kVG9DaGVjayA9IGhhbmQgPT09IFwiZGVhbGVyXCIgPyBnYW1lLmRlYWxlci5jYXJkcyA6IGdhbWVbaGFuZF0uY2FyZHM7XG4gIHZhciBhY2VzID0gMDtcblxuICBoYW5kVG9DaGVjay5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICB2YXIgdGV4dENvbG9yID0gXCJ3aGl0ZVwiXG4gIGlmICh0b3RhbCA9PT0gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcImxpbWVcIjtcbiAgfSBlbHNlIGlmICh0b3RhbCA+IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJyZWRcIjtcbiAgfVxuXG4gIGdhbWVbaGFuZF0udG90YWwgPSB0b3RhbDtcbiAgJChgLiR7aGFuZH1Ub3RhbGApLnRleHQodG90YWwpLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcik7XG59XG5cbmZ1bmN0aW9uIGNoZWNrTG9zczIxKGhhbmQpIHtcbiAgaWYgKGhhbmQgPT09IFwiZGVhbGVyXCIpIHtcbiAgICBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJwbGF5ZXJcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFhXCIpO1xuICAgICAgY2hlY2tWaWN0b3J5KFwic3BsaXQxYlwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MmFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJiXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJwbGF5ZXJcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFhXCIpO1xuICAgICAgY2hlY2tWaWN0b3J5KFwic3BsaXQxYlwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MmFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJiXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPCAxNyAmJiBnYW1lLmRlYWxlci50b3RhbCA8IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhgZGVhbGVyIHN0YXlzIHdpdGggJHtnYW1lLmRlYWxlci50b3RhbH1gKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInBsYXllclwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MVwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MlwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MWFcIik7XG4gICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFiXCIpO1xuICAgICAgY2hlY2tWaWN0b3J5KFwic3BsaXQyYVwiKTtcbiAgICAgIGNoZWNrVmljdG9yeShcInNwbGl0MmJcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChnYW1lW2hhbmRdLnRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJCVVNUXCIpO1xuICAgICAgaGFuZEVuZChoYW5kKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBoYW5kRW5kKGhhbmQpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoaGFuZCkge1xuICAvL2d1YXJkcyBhZ2FpbnN0IGNoZWNraW5nIGJlZm9yZSB0aGUgZGVhbCBpcyBjb21wbGV0ZVxuICBpZiAoZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXIuY2FyZHMubGVuZ3RoID49IDIpIHtcbiAgICBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVyLmNhcmRzLmxlbmd0aCA9PT0gMiAmJiBnYW1lW2hhbmRdLnRvdGFsID09PSAyMSAmJiBnYW1lW2hhbmRdLmNhcmRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlci5jYXJkcy5sZW5ndGggPT09IDIgJiYgZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEgJiYgZ2FtZVtoYW5kXS5jYXJkcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lW2hhbmRdLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID09PSAyICYmIGdhbWUuaXNQbGF5ZXJzVHVybiAmJiBnYW1lW2hhbmRdLnRvdGFsIDwgMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2ssIGRvaW5nIG5vdGhpbmcuLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiWU9VIFdJTlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgMjFcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIjIxIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgYnVzdHNcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIkJVU1RcIik7XG4gICAgfVxuICB9XG5cbiAgLy9nYW1lW2hhbmRdLndpbm5lciAmJiBoYW5kRW5kKGhhbmQpO1xufVxuXG5mdW5jdGlvbiBoYW5kRW5kKGhhbmQpIHtcbiAgZ2FtZVtoYW5kXS5pc0RvbmUgPSB0cnVlO1xuICBpZiAoZ2FtZS5zcGxpdDFiLmlzRG9uZSA9PT0gZmFsc2UpIHtcbiAgICBnYW1lLmN1cnJlbnRIYW5kID0gXCJzcGxpdDFiXCI7XG4gICAgaGlnaGxpZ2h0KFwic3BsaXQxYlwiKTtcbiAgfSBlbHNlIGlmIChnYW1lLnNwbGl0MS5pc0RvbmUgPT09IGZhbHNlKSB7XG4gICAgZ2FtZS5jdXJyZW50SGFuZCA9IFwic3BsaXQxXCI7XG4gICAgaGlnaGxpZ2h0KFwic3BsaXQxXCIpO1xuICB9IGVsc2UgaWYgKGdhbWUuc3BsaXQyYS5pc0RvbmUgPT09IGZhbHNlKSB7XG4gICAgZ2FtZS5jdXJyZW50SGFuZCA9IFwic3BsaXQyYVwiO1xuICAgIGhpZ2hsaWdodChcInNwbGl0MmFcIik7XG4gIH0gZWxzZSBpZiAoZ2FtZS5zcGxpdDJiLmlzRG9uZSA9PT0gZmFsc2UpIHtcbiAgICBnYW1lLmN1cnJlbnRIYW5kID0gXCJzcGxpdDJiXCI7XG4gICAgaGlnaGxpZ2h0KFwic3BsaXQyYlwiKTtcbiAgfSBlbHNlIGlmIChnYW1lLnNwbGl0Mi5pc0RvbmUgPT09IGZhbHNlKSB7XG4gICAgZ2FtZS5jdXJyZW50SGFuZCA9IFwic3BsaXQyXCI7XG4gICAgaGlnaGxpZ2h0KFwic3BsaXQyXCIpO1xuICB9IGVsc2Uge1xuICAgIGdhbWVFbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnYW1lRW5kKCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICBiYW5rICs9IChnYW1lLndhZ2VyICogMik7XG4gICAgY29uc29sZS5sb2coYGdpdmluZyBwbGF5ZXIgJHtnYW1lLndhZ2VyICogMn0uIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgIGJhbmsgKz0gZ2FtZS53YWdlcjtcbiAgICBjb25zb2xlLmxvZyhgcmV0dXJuaW5nICR7Z2FtZS53YWdlcn0gdG8gcGxheWVyLiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfVxuICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAhaXNGbGlwcGVkICYmIGZsaXBDYXJkKCk7XG4gIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuICBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgJGRlYWxlclRvdGFsLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4gICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgc3BsaXRBbGxvd2VkID0gZmFsc2U7XG4gICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFibGUoKSB7XG4gICQoXCIuaGFuZCwgLndhZ2VyLCAudG90YWwsIC5jaGlwc1wiKS5lbXB0eSgpO1xuICAkKFwiLmRlYWxlclRvdGFsLCAucGxheWVyU3BsaXQsIC5wbGF5ZXJTcGxpdDEsIC5wbGF5ZXJTcGxpdDIsIC5wb3B1cFwiKS5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJChcIi5wb3B1cFwiKS5yZW1vdmVDbGFzcyhcIndpbiBsb3NlIHB1c2hcIik7XG4gIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tdGFibGUgY2xlYXJlZC0tLS0tLS0tLS0tLVwiKTtcbn1cblxuZnVuY3Rpb24gY2FyZEltYWdlKGRhdGEpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9IGRhdGEuY2FyZHNbMF0udmFsdWU7XG4gIHZhciBjYXJkU3VpdCA9IGRhdGEuY2FyZHNbMF0uc3VpdDtcbiAgdmFyIGZpbGVuYW1lID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgcmV0dXJuIGZpbGVuYW1lO1xufVxuXG5mdW5jdGlvbiBhbm5vdW5jZSh0ZXh0KSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJkZWFsZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcImxvc2VcIik7XG4gICAgbG9zZVdhdi5sb2FkKCk7XG4gICAgbG9zZVdhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicGxheWVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJ3aW5cIik7XG4gICAgd2luV2F2LmxvYWQoKTtcbiAgICB3aW5XYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInB1c2hcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcInB1c2hcIik7XG4gIH1cbiAgJGFubm91bmNlVGV4dC50ZXh0KHRleHQpO1xufVxuXG5mdW5jdGlvbiBmbGlwQ2FyZCgpIHtcbiAgY29uc29sZS5sb2coJ2ZsaXAnKTtcbiAgaXNGbGlwcGVkID0gdHJ1ZTtcbiAgdmFyICRmbGlwcGVkID0gJChcIi5kZWFsZXIgLmNhcmRJbWFnZVwiKS5maXJzdCgpO1xuICAkZmxpcHBlZC5yZW1vdmUoKTtcbiAgdmFyIGh0bWwgPSBgPGltZyBzcmM9JyR7Z2FtZS5oaWRkZW5DYXJkfScgY2xhc3M9J2NhcmRJbWFnZSc+YDtcbiAgJGRlYWxlci5wcmVwZW5kKGh0bWwpO1xuICB1cGRhdGVDb3VudChnYW1lLmRlYWxlckhhbmRbMF0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDb3VudChjYXJkKSB7XG4gIGlmIChpc05hTihOdW1iZXIoY2FyZCkpIHx8IGNhcmQgPT09IFwiMTBcIikge1xuICAgIGNvdW50IC09IDE7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50IC0xIC0tPiAke2NvdW50fWApO1xuICB9IGVsc2UgaWYgKGNhcmQgPCA3KSB7XG4gICAgY291bnQgKz0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgKzEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA+PSA3ICYmIGNhcmQgPD0gOSkge1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMCAtLT4gJHtjb3VudH1gKTtcbiAgfVxuICBnZXRUcnVlQ291bnQoKTtcbiAgZ2V0QWR2YW50YWdlKCk7XG4gIHNldE5lZWRsZSgpO1xuICAkY291bnQuZW1wdHkoKTtcbiAgJGNvdW50LmFwcGVuZChcIjxwPkNvdW50OiBcIiArIGNvdW50ICsgXCI8L3A+XCIpO1xuICAkdHJ1ZUNvdW50LmVtcHR5KCk7XG4gICR0cnVlQ291bnQuYXBwZW5kKFwiPHA+VHJ1ZSBDb3VudDogXCIgKyB0cnVlQ291bnQudG9QcmVjaXNpb24oMikgKyBcIjwvcD5cIik7XG59XG5cbmZ1bmN0aW9uIGdldFRydWVDb3VudCgpIHtcbiAgdmFyIGRlY2tzTGVmdCA9IGNhcmRzTGVmdCAvIDUyO1xuICB0cnVlQ291bnQgPSBjb3VudCAvIGRlY2tzTGVmdDtcbn1cblxuZnVuY3Rpb24gZ2V0QWR2YW50YWdlKCkge1xuICBhZHZhbnRhZ2UgPSAodHJ1ZUNvdW50ICogLjUpIC0gLjU7XG59XG5cbmZ1bmN0aW9uIHNldE5lZWRsZSgpIHtcbiAgdmFyIG51bSA9IGFkdmFudGFnZSAqIDM2O1xuICAkKFwiLmdhdWdlLW5lZWRsZVwiKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoXCIgKyBudW0gKyBcImRlZylcIik7XG59XG5cbmZ1bmN0aW9uIGJldChoYW5kLCBhbXQpIHtcbiAgaWYgKGJhbmsgPj0gYW10KSB7XG4gICAgZ2FtZVtoYW5kXS53YWdlciArPSBhbXQ7XG4gICAgYmFuayAtPSBhbXQ7XG4gICAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgICBjb3VudENoaXBzKFwiYmFua1wiKTtcbiAgICBjb3VudENoaXBzKGhhbmQpO1xuICAgICQoYC4ke2hhbmR9V2FnZXJgKS50ZXh0KGdhbWVbaGFuZF0ud2FnZXIpO1xuICAgIGNvbnNvbGUubG9nKGBiZXR0aW5nICR7YW10fSBvbiAke2hhbmR9YCk7XG4gICAgY29uc29sZS5sb2coYCR7aGFuZH0gd2FnZXIgYXQgJHtnYW1lW2hhbmRdLndhZ2VyfWApO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiSW5zdWZmaWNpZW50IGZ1bmRzLlwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gY291bnRDaGlwcyhsb2NhdGlvbikge1xuICB2YXIgYW10ID0gbG9jYXRpb24gPT09IFwiYmFua1wiID8gYmFuayA6IGdhbWVbbG9jYXRpb25dLndhZ2VyO1xuICB2YXIgbnVtMTAwcyA9IE1hdGguZmxvb3IoYW10IC8gMTAwKTtcbiAgdmFyIG51bTUwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDApIC8gNTApO1xuICB2YXIgbnVtMjVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwKSAvIDI1KTtcbiAgdmFyIG51bTEwcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1KSAvIDEwKTtcbiAgIHZhciBudW01cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTApIC8gNSk7XG4gICB2YXIgbnVtMXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1KSAvIDEpO1xuICB2YXIgbnVtMDVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSAtIG51bTFzICogMSkgLyAuNSk7XG5cbiAgdmFyIGh0bWwgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMjVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTI1LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTFzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0wNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMDUucG5nJz5cIjtcbiAgfTtcblxuICBpZiAobG9jYXRpb24gPT09IFwiYmFua1wiKSB7XG4gICAgJGJhbmtDaGlwcy5odG1sKGh0bWwpO1xuICAgICQoJy5iYW5rQ2hpcHMgaW1nJykuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAkKGAuJHtsb2NhdGlvbn1DaGlwc2ApLmh0bWwoaHRtbCk7XG4gICAgJChgLiR7bG9jYXRpb259Q2hpcHMgaW1nYCkuZWFjaChmdW5jdGlvbihpLCBjKSB7XG4gICAgICAkKGMpLmNzcygndG9wJywgLTUgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy9cbi8vIFRFU1RJTkcgLy9cbi8vLy8vLy8vLy8vLy9cblxuJChcIi50ZXN0RGVhbFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoYmV0QW10KTtcbiAgaXNGaXJzdFR1cm4gPSB0cnVlO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGlmIChiYW5rID49IGJldEFtdCkge1xuICAgIGNsZWFyVGFibGUoKTtcbiAgICAkbmV3R2FtZS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJcIik7XG4gICAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICAgIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGVhbGVyMVZhbHVlID0gJChcIi5kZWFsZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyVmFsdWUgPSAkKFwiLmRlYWxlcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFWYWx1ZSA9ICQoXCIucGxheWVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlZhbHVlID0gJChcIi5wbGF5ZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxU3VpdCA9ICQoXCIuZGVhbGVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIyU3VpdCA9ICQoXCIuZGVhbGVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxU3VpdCA9ICQoXCIucGxheWVyMVN1aXRcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyU3VpdCA9ICQoXCIucGxheWVyMlN1aXRcIikudmFsKCk7XG4gIHZhciBkZWFsZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIxVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIGRlYWxlcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjJWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMVZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIyVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIxKTtcbiAgZ2FtZS5zcGxpdENhcmRJbWFnZXMucHVzaChwbGF5ZXIyKTtcbiAgZ2FtZS5kZWFsZXJIYW5kID0gW2RlYWxlcjFWYWx1ZSwgZGVhbGVyMlZhbHVlXTtcbiAgZ2FtZS5wbGF5ZXJIYW5kID0gW3BsYXllcjFWYWx1ZSwgcGxheWVyMlZhbHVlXTtcbiAgZ2FtZS5oaWRkZW5DYXJkID0gZGVhbGVyMTtcbiAgJGRlYWxlci5wcmVwZW5kKGA8aW1nIHNyYz0nJHtjYXJkQmFja30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7ZGVhbGVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMX0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7cGxheWVyMn0nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICBjaGVja1RvdGFsKFwicGxheWVyXCIpO1xuICBjaGVja1ZpY3RvcnkoKTtcbiAgY2hlY2tTcGxpdCgpO1xufSk7XG5cbiQoXCIuZ2l2ZUNhcmRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGdpdmVDYXJkKCQodGhpcykuYXR0cihcImRhdGEtaWRcIikpO1xufSlcblxuLy8gJCgnLmRlYWxlckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgnZGVhbGVyJyk7XG4vLyB9KTtcblxuLy8gJCgnLnBsYXllckdpdmVDYXJkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuLy8gICBnaXZlQ2FyZCgncGxheWVyJyk7XG4vLyB9KTtcblxuZnVuY3Rpb24gZ2l2ZUNhcmQoaGFuZCkge1xuICB2YXIgY2FyZFZhbHVlID0gJCgnLmdpdmVDYXJkVmFsdWUnKS52YWwoKTtcbiAgdmFyIGNhcmRTdWl0ID0gJCgnLmdpdmVDYXJkU3VpdCcpLnZhbCgpO1xuICB2YXIgY2FyZFNyYyA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG5cbiAgLy9UaGlzIGlzIG1heWJlIGhvdyBpdCBjYW4gbG9vayBpbiB0aGUgZnV0dXJlOlxuICAvL2dhbWUuaGFuZFtoYW5kXS5wdXNoKGNhcmRWYWx1ZSk7XG4gIC8vY2hlY2tUb3RhbChoYW5kKTtcbiAgLy8kKGhhbmQpLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuXG4gIGlmIChwZXJzb24gPT09ICdkZWFsZXInKSB7XG4gICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdkZWFsZXInKTtcbiAgICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3BsYXllcicpIHtcbiAgICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3BsYXllcicpO1xuICAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxJykge1xuICAgIGdhbWUuc3BsaXQxSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxJyk7XG4gICAgJHNwbGl0MS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDInKSB7XG4gICAgZ2FtZS5zcGxpdDJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDInKTtcbiAgICAkc3BsaXQyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWEnKSB7XG4gICAgZ2FtZS5zcGxpdDFhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYScpO1xuICAgICRzcGxpdDFhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MWInKSB7XG4gICAgZ2FtZS5zcGxpdDFiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQxYicpO1xuICAgICRzcGxpdDFiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmEnKSB7XG4gICAgZ2FtZS5zcGxpdDJhSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYScpO1xuICAgICRzcGxpdDJhLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MmInKSB7XG4gICAgZ2FtZS5zcGxpdDJiSGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyYicpO1xuICAgICRzcGxpdDJiLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9XG5cbiAgLy8gcGVyc29uID09PSAnZGVhbGVyJyA/IChcbiAgLy8gICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ2RlYWxlcicpLFxuICAvLyAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKSA6IChcbiAgLy8gICBnYW1lLnBsYXllckhhbmQucHVzaChjYXJkVmFsdWUpLFxuICAvLyAgIGNoZWNrVG90YWwoJ3BsYXllcicpLFxuICAvLyAgICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YClcbiAgLy8gKVxuICBjaGVja1ZpY3RvcnkoKTtcbn1cblxuLy8gSlNPTiByZXF1ZXN0IGZ1bmN0aW9uIHdpdGggSlNPTlAgcHJveHlcbmZ1bmN0aW9uIGdldEpTT04odXJsLCBjYikge1xuICB2YXIgSlNPTlBfUFJPWFkgPSAnaHR0cHM6Ly9qc29ucC5hZmVsZC5tZS8/dXJsPSc7XG4gIC8vIFRISVMgV0lMTCBBREQgVEhFIENST1NTIE9SSUdJTiBIRUFERVJTXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgSlNPTlBfUFJPWFkgKyB1cmwpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH07XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiJdfQ==