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
  handEnd(game.currentHand);
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
  this.handsToPlay = 1;
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

function split() {}

function highlight(hand) {}

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
    hand !== "dealer" && checkLoss21(game.currentHand);
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
function dealerTurn() {
  if (game.dealer.total < 17) {
    console.log("dealer hits on " + game.dealer.total);
    drawCard({
      hand: "dealer",
      callback: dealerTurn
    });
  } else if (game.dealer.total >= 17) {
    console.log("dealer is finished with " + game.dealer.total);
    game.player.cards.length > 0 && checkVictory("player");
    game.split1.cards.length > 0 && checkVictory("split1");
    game.split2.cards.length > 0 && checkVictory("split2");
    game.split1a.cards.length > 0 && checkVictory("split1a");
    game.split1b.cards.length > 0 && checkVictory("split1b");
    game.split2a.cards.length > 0 && checkVictory("split2a");
    game.split2b.cards.length > 0 && checkVictory("split2b");
    gameEnd();
  }
}

// function stay() {
//   if (!game.winner && game.dealerTotal < 17) {
//     console.log("dealer hits");
//     isPlayersTurn = false;
//     drawCard({
//       person: "dealer",
//       callback: stay
//     });
//   } else if (game.dealerTotal === game.playerTotal) {
//     game.winner = "push";
//     announce("PUSH");
//     console.log("push");
//     gameEnd();
//   } else if (game.dealerTotal < 22) {
//     game.dealerTotal > game.playerTotal ? (
//       game.winner = "dealer",
//       announce("YOU LOSE"),
//       console.log("dealer's " + game.dealerTotal + " beats player's " + game.playerTotal),
//       gameEnd()
//     ) : (
//       game.winner = "player",
//       announce("YOU WIN"),
//       console.log("player's " + game.playerTotal + " beats dealer's " + game.dealerTotal),
//       gameEnd()
//     );
//   }
// }

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
  // if (hand === "dealer") {
  //   if (game.dealer.total > 21) {
  //     console.log("dealer busts");

  //   } else if (game.dealer.total === 21) {
  //     console.log("dealer has 21");
  //     checkVictory("player");
  //     checkVictory("split1");
  //     checkVictory("split2");
  //     checkVictory("split1a");
  //     checkVictory("split1b");
  //     checkVictory("split2a");
  //     checkVictory("split2b");
  //   } else if (game.dealer.total < 17 && game.dealer.total < 21) {
  //     console.log(`dealer stays with ${game.dealer.total}`);
  //     checkVictory("player");
  //     checkVictory("split1");
  //     checkVictory("split2");
  //     checkVictory("split1a");
  //     checkVictory("split1b");
  //     checkVictory("split2a");
  //     checkVictory("split2b");
  //   }
  // } else {
  if (game[hand].total > 21) {
    console.log("player busts");
    game[hand].winner = "dealer";
    announce(hand, "BUST");
    handEnd(hand);
  } else if (game[hand].total === 21) {
    handEnd(hand);
  }
  //}
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
}

function checkVictoryAll() {}

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
    dealerTurn();
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

// game.splitHand1.push(game.playerHand[0]);
// game.splitHand2.push(game.playerHand[1]);
// isSplit = true;
// $split.attr("disabled", true);
// $player.addClass("hidden");
// $playerTotal.addClass("hidden");
// $playerSplit.removeClass("hidden");
// $hand1.html(`<img class='cardImage' src='${game.splitCardImages[0]}'>`);
// $hand2.html(`<img class='cardImage' src='${game.splitCardImages[1]}'>`);
// checkSplitTotal("hand1");
// checkSplitTotal("hand2");
// gameHand = "hand1";
// highlight("hand1");

// hand === "hand1" ? (
//   $hand1.addClass("highlighted"),
//   $hand2.removeClass("highlighted")
// ) : (
//   $hand2.addClass("highlighted"),
//   $hand1.removeClass("highlighted")
// );
//# sourceMappingURL=data:application/json;base64,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R0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNuQyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25DLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHekMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoRCxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsV0FBVyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztBQUMvRCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7O0FBR3JELFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR25CLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUM1QixhQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsYUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3BCLENBQUMsQ0FBQzs7QUFFSCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVyQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoQixLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDdEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixTQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQzNCLENBQUMsQ0FBQzs7QUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3hCLFNBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVCLE9BQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLEtBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNaLFNBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0IsZUFBYSxHQUFHLElBQUksQ0FBQztBQUNyQixLQUFHLEVBQUUsQ0FBQztDQUNQLENBQUMsQ0FBQzs7QUFFSCxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN0QyxHQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3ZDLENBQUMsQ0FBQzs7QUFFSCxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN0QyxHQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3ZDLENBQUMsQ0FBQzs7O0FBR0gsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFXO0FBQzFCLE1BQUksZ0JBQWdCLEVBQUU7QUFDcEIsS0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsS0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbEMsVUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7R0FDMUM7Q0FDRixDQUFDLENBQUM7OztBQUdILFNBQVMsSUFBSSxHQUFHO0FBQ2QsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN6QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQixNQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN2QixNQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM1QixNQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLElBQUksR0FBRztBQUNkLE1BQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE1BQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixNQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUN0QixNQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixNQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN2QixNQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUMzQixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztDQUNwQjs7QUFFRCxTQUFTLE9BQU8sR0FBRztBQUNqQixNQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixLQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ2pDOztBQUVELFNBQVMsSUFBSSxHQUFHO0FBQ2Qsa0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUMzQixZQUFVLEVBQUUsQ0FBQztBQUNiLE9BQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLEdBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbEQsU0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkIsYUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLGFBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixNQUFJLE1BQU0sS0FBSyxFQUFFLElBQUksU0FBUyxHQUFHLEVBQUUsRUFBRTtBQUNuQyxXQUFPLENBQUMsVUFBVSxHQUFHLEtBQUssRUFBRSxVQUFTLElBQUksRUFBRTtBQUN6QyxZQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN0QixhQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDM0MsV0FBSyxFQUFFLENBQUM7QUFDUixXQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsZUFBUyxHQUFHLENBQUMsQ0FBQztBQUNkLGVBQVMsR0FBRyxHQUFHLENBQUM7QUFDaEIsZUFBUyxHQUFHLENBQUMsR0FBRSxDQUFDO0tBQ2pCLENBQUMsQ0FBQztHQUNKLE1BQU07QUFDTCxXQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDL0MsU0FBSyxFQUFFLENBQUM7R0FDVDtDQUNGOztBQUVELFNBQVMsS0FBSyxHQUFHO0FBQ2YsVUFBUSxDQUFDO0FBQ1AsUUFBSSxFQUFFLFFBQVE7QUFDZCxTQUFLLEVBQUUsUUFBUTtHQUNoQixDQUFDLENBQUM7QUFDSCxVQUFRLENBQUM7QUFDUCxRQUFJLEVBQUUsUUFBUTtHQUNmLENBQUMsQ0FBQztBQUNILFVBQVEsQ0FBQztBQUNQLFFBQUksRUFBRSxRQUFRO0dBQ2YsQ0FBQyxDQUFDO0FBQ0gsVUFBUSxDQUFDO0FBQ1AsUUFBSSxFQUFFLFFBQVE7QUFDZCxZQUFRLEVBQUUsb0JBQVk7QUFDcEIsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0QjtHQUNGLENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QixNQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUN0RCxRQUFJLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQzFELGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekMsUUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDM0IsS0FBQyxPQUFLLElBQUksZUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDaEQ7Q0FDRjs7QUFFRCxTQUFTLEtBQUssR0FBSSxFQWNqQjs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFReEI7O0FBRUQsU0FBUyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ3pCLE1BQUksT0FBTyxRQUFNLEdBQUcsYUFBUSxNQUFNLGNBQVcsQ0FBQztBQUM5QyxTQUFPLENBQUMsT0FBTyxFQUFFLFVBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNsQyxRQUFJLElBQUksQ0FBQztBQUNULFFBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDeEIsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLFFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLGFBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNqQixhQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsV0FBTyxDQUFDLEtBQUssSUFDWCxJQUFJLHVDQUFrQyxPQUFPLENBQUMsS0FBSyxRQUFJLEVBQ3ZELFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQzNCLElBQ0UsSUFBSSx1Q0FBa0MsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFJLEVBQ3pELENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUM1QixBQUFDLENBQUM7QUFDRixRQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQy9CLFVBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtBQUNqQixZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsbUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2xDO0FBQ0QsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQixhQUFPLENBQUMsR0FBRyxlQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSywyQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUcsQ0FBQztLQUNyRixNQUFNO0FBQ0wsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxpQkFBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsZ0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQixhQUFPLENBQUMsR0FBRyxNQUFJLElBQUksV0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxjQUFTLElBQUksZUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBRyxDQUFDO0tBQ3RGO0FBQ0QsUUFBSSxLQUFLLFFBQVEsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELFdBQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxVQUFVLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQzlELENBQUMsQ0FBQztBQUNILFdBQVMsRUFBRSxDQUFDO0NBQ2I7O0FBRUQsU0FBUyxHQUFHLEdBQUc7QUFDYixTQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25CLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDNUIsVUFBUSxDQUFDO0FBQ1AsUUFBSSxFQUFFLElBQUk7QUFDVixZQUFRLEVBQUUsb0JBQVk7QUFDcEIsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUM5QyxZQUFJLEVBQUUsQ0FBQztPQUNSO0tBQ0Y7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDMUIsUUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDL0IsWUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztHQUN6QztDQUNGO0FBQ0QsU0FBUyxVQUFVLEdBQUc7QUFDcEIsTUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUU7QUFDMUIsV0FBTyxDQUFDLEdBQUcscUJBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFHLENBQUM7QUFDbkQsWUFBUSxDQUFDO0FBQ1AsVUFBSSxFQUFFLFFBQVE7QUFDZCxjQUFRLEVBQUUsVUFBVTtLQUNyQixDQUFDLENBQUM7R0FDSixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxFQUFFO0FBQ2xDLFdBQU8sQ0FBQyxHQUFHLDhCQUE0QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBRyxDQUFDO0FBQzVELFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pELFdBQU8sRUFBRSxDQUFDO0dBQ1g7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QixNQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxNQUFJLFdBQVcsR0FBRyxJQUFJLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDM0UsTUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDOztBQUViLGFBQVcsQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDakMsUUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUMxRCxXQUFLLElBQUksRUFBRSxDQUFDO0tBQ2IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLFdBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsVUFBSSxJQUFJLENBQUMsQ0FBQztLQUNYO0dBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNaLFFBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQzFCLFdBQUssSUFBSSxJQUFJLENBQUM7S0FDZixNQUFNO0FBQ0wsV0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7S0FDcEI7R0FDRjs7QUFFRCxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUE7QUFDdkIsTUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ2hCLGFBQVMsR0FBRyxNQUFNLENBQUM7R0FDcEIsTUFBTSxJQUFJLEtBQUssR0FBRyxFQUFFLEVBQUU7QUFDckIsYUFBUyxHQUFHLEtBQUssQ0FBQztHQUNuQjs7QUFFRCxNQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUN6QixHQUFDLE9BQUssSUFBSSxXQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDeEQ7O0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJ2QixNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO0FBQ3pCLFdBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDN0IsWUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QixXQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDZixNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7QUFDbEMsV0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2Y7O0FBQUEsQ0FFSjs7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7O0FBRTFCLE1BQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ2xFLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFILGFBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMzQixjQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNoRyxhQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDN0IsY0FBUSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztLQUM1QixNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ25FLGFBQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM3QixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztBQUN6QixjQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzlCLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7QUFDOUQsYUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMzQixjQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO0FBQ3BILGFBQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUN2RCxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ25DLGFBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDN0IsY0FBUSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztLQUM1QixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO0FBQ2pDLGFBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDN0IsY0FBUSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMzQixNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7QUFDbEMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM3QixjQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRTtBQUNoQyxhQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQzdCLGNBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEI7R0FDRjtDQUNGOztBQUVELFNBQVMsZUFBZSxHQUFHLEVBRTFCOztBQUVELFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtBQUNyQixNQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUN6QixNQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtBQUNqQyxRQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QixhQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtBQUN2QyxRQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM1QixhQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDckIsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtBQUN4QyxRQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QixhQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtBQUN4QyxRQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QixhQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtBQUN2QyxRQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUM1QixhQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDckIsTUFBTTtBQUNMLGNBQVUsRUFBRSxDQUFDO0dBQ2Q7Q0FDRjs7QUFFRCxTQUFTLE9BQU8sR0FBRztBQUNqQixNQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzVCLFFBQUksSUFBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQUFBQyxDQUFDO0FBQ3pCLFdBQU8sQ0FBQyxHQUFHLG9CQUFrQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsa0JBQWEsSUFBSSxDQUFHLENBQUM7R0FDakUsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQ2pDLFFBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLGdCQUFjLElBQUksQ0FBQyxLQUFLLDRCQUF1QixJQUFJLENBQUcsQ0FBQztHQUNuRTtBQUNELFlBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLEdBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBQ3pCLGtCQUFnQixHQUFHLElBQUksQ0FBQztBQUN4QixlQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLGNBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsVUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsT0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsZUFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixhQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxjQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFFBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQy9COztBQUVELFNBQVMsVUFBVSxHQUFHO0FBQ3BCLEdBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzNDLEdBQUMsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RixHQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLFNBQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQztDQUN0RDs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDdkIsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEMsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbEMsTUFBSSxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsU0FBUyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQ3pGLFNBQU8sUUFBUSxDQUFDO0NBQ2pCOztBQUVELFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUN0QixNQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQzVCLGFBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsV0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2YsV0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ2hCLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUNuQyxhQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNkLFVBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNmLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUNqQyxhQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzVCO0FBQ0QsZUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMxQjs7QUFFRCxTQUFTLFFBQVEsR0FBRztBQUNsQixTQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLFdBQVMsR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0MsVUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLE1BQUksSUFBSSxrQkFBZ0IsSUFBSSxDQUFDLFVBQVUseUJBQXNCLENBQUM7QUFDOUQsU0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixhQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pDOztBQUVELFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUN6QixNQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQ3hDLFNBQUssSUFBSSxDQUFDLENBQUM7QUFDWCxXQUFPLENBQUMsR0FBRyxNQUFJLElBQUksMEJBQXFCLEtBQUssQ0FBRyxDQUFDO0dBQ2xELE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ25CLFNBQUssSUFBSSxDQUFDLENBQUM7QUFDWCxXQUFPLENBQUMsR0FBRyxNQUFJLElBQUksMEJBQXFCLEtBQUssQ0FBRyxDQUFDO0dBQ2xELE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7QUFDakMsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLDBCQUFxQixLQUFLLENBQUcsQ0FBQztHQUNsRDtBQUNELGNBQVksRUFBRSxDQUFDO0FBQ2YsY0FBWSxFQUFFLENBQUM7QUFDZixXQUFTLEVBQUUsQ0FBQztBQUNaLFFBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNmLFFBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztBQUM3QyxZQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbkIsWUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0NBQzFFOztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLE1BQUksU0FBUyxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDL0IsV0FBUyxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUM7Q0FDL0I7O0FBRUQsU0FBUyxZQUFZLEdBQUc7QUFDdEIsV0FBUyxHQUFHLEFBQUMsU0FBUyxHQUFHLEdBQUUsR0FBSSxHQUFFLENBQUM7Q0FDbkM7O0FBRUQsU0FBUyxTQUFTLEdBQUc7QUFDbkIsTUFBSSxHQUFHLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN6QixHQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0NBQy9EOztBQUVELFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDdEIsTUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0FBQ2YsUUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDeEIsUUFBSSxJQUFJLEdBQUcsQ0FBQztBQUNaLGNBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLGNBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQixjQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakIsS0FBQyxPQUFLLElBQUksV0FBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsV0FBTyxDQUFDLEdBQUcsY0FBWSxHQUFHLFlBQU8sSUFBSSxDQUFHLENBQUM7QUFDekMsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLGtCQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUcsQ0FBQztBQUNwRCxXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxXQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbkMsV0FBTyxLQUFLLENBQUM7R0FDZDtDQUNGOztBQUVELFNBQVMsVUFBVSxDQUFDLFFBQVEsRUFBRTtBQUM1QixNQUFJLEdBQUcsR0FBRyxRQUFRLEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzVELE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDbEUsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVGLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDekcsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLEdBQUUsQ0FBQyxDQUFDOztBQUV0SCxNQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hDLFFB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QUFDdkIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDNUQsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0QsTUFBTSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsY0FBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RCLFlBQVEsQ0FBQyxNQUFNLGdCQUFjLE9BQU8sMEJBQXVCLENBQUM7R0FDN0Q7Ozs7Ozs7Ozs7O0FBV0QsY0FBWSxFQUFFLENBQUM7Q0FDaEI7OztBQUdELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDeEIsTUFBSSxXQUFXLEdBQUcsOEJBQThCLENBQUM7O0FBRWpELE1BQUksT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDbkMsU0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUMxQixRQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO0FBQ2pELFFBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDO0dBQ0gsQ0FBQztBQUNGLFNBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNoQixDQUFDIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD1cIjtcbnZhciBjYXJkQmFjayA9IFwiaHR0cDovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzUvNTIvQ2FyZF9iYWNrXzE2LnN2Zy8yMDlweC1DYXJkX2JhY2tfMTYuc3ZnLnBuZ1wiO1xuXG52YXIgZ2FtZTtcbnZhciBkZWNrSWQgPSBcIlwiO1xudmFyIGRlY2tzID0gNjtcbnZhciBjb3VudCA9IDA7XG52YXIgdHJ1ZUNvdW50ID0gY291bnQgLyBkZWNrcztcbnZhciBjYXJkc0xlZnQgPSA1MiAqIGRlY2tzO1xudmFyIGFkdmFudGFnZSA9IC0uNTtcbnZhciBiYW5rID0gNTAwO1xudmFyIGJldEFtdCA9IDI1O1xudmFyIGJldENoYW5nZUFsbG93ZWQgPSB0cnVlO1xuLy8gdmFyIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuLy8gdmFyIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbi8vIHZhciBpc1BsYXllcnNUdXJuID0gdHJ1ZTtcbi8vIHZhciBpc0RvdWJsZWREb3duID0gZmFsc2U7XG4vLyB2YXIgaXNGbGlwcGVkID0gZmFsc2U7XG4vLyB2YXIgaXNTcGxpdCA9IGZhbHNlO1xuLy8gdmFyIGdhbWVIYW5kID0gXCJcIjtcblxuLy9nYW1lIGJ1dHRvbnNcbnZhciAkZGVhbCA9ICQoXCIuZGVhbFwiKTtcbnZhciAkaGl0ID0gJChcIi5oaXRcIik7XG52YXIgJHN0YXkgPSAkKFwiLnN0YXlcIik7XG52YXIgJGRvdWJsZSA9ICQoXCIuZG91YmxlXCIpO1xudmFyICRzcGxpdEJ1dHRvbiA9ICQoXCIuc3BsaXRCdXR0b25cIik7XG52YXIgJHNwbGl0MUJ1dHRvbiA9ICQoXCIuc3BsaXQxQnV0dG9uXCIpO1xudmFyICRzcGxpdDJCdXR0b24gPSAkKFwiLnNwbGl0MkJ1dHRvblwiKTtcblxuLy9jaGlwc1xudmFyICRjaGlwMSA9ICQoXCIuY2hpcDFcIik7XG52YXIgJGNoaXA1ID0gJChcIi5jaGlwNVwiKTtcbnZhciAkY2hpcDEwID0gJChcIi5jaGlwMTBcIik7XG52YXIgJGNoaXAyNSA9ICQoXCIuY2hpcDI1XCIpO1xudmFyICRjaGlwNTAgPSAkKFwiLmNoaXA1MFwiKTtcbnZhciAkY2hpcDEwMCA9ICQoXCIuY2hpcDEwMFwiKTtcblxuLy9pbmZvIGRpdnNcbnZhciAkY291bnQgPSAkKFwiLmNvdW50XCIpO1xudmFyICR0cnVlQ291bnQgPSAkKFwiLnRydWVDb3VudFwiKTtcblxuLy8gQ2hpcCBzdGFja3NcbnZhciAkYmFua0NoaXBzID0gJChcIi5iYW5rQ2hpcHNcIik7XG52YXIgJHBsYXllckNoaXBzID0gJChcIi5wbGF5ZXJDaGlwc1wiKTtcbnZhciAkc3BsaXQxQ2hpcHMgPSAkKFwiLnNwbGl0MUNoaXBzXCIpO1xudmFyICRzcGxpdDJDaGlwcyA9ICQoXCIuc3BsaXQyQ2hpcHNcIik7XG52YXIgJHNwbGl0MWFDaGlwcyA9ICQoXCIuc3BsaXQxYUNoaXBzXCIpO1xudmFyICRzcGxpdDFiQ2hpcHMgPSAkKFwiLnNwbGl0MWJDaGlwc1wiKTtcbnZhciAkc3BsaXQyYUNoaXBzID0gJChcIi5zcGxpdDJhQ2hpcHNcIik7XG52YXIgJHNwbGl0MmJDaGlwcyA9ICQoXCIuc3BsaXQyYkNoaXBzXCIpO1xuXG4vLyBDaGlwIHRvdGFsc1xudmFyICRiYW5rVG90YWwgPSAkKFwiLmJhbmtUb3RhbFwiKTtcbnZhciAkcGxheWVyV2FnZXIgPSAkKFwiLnBsYXllcldhZ2VyXCIpO1xudmFyICRzcGxpdDFXYWdlciA9ICQoXCIuc3BsaXQxV2FnZXJcIik7XG52YXIgJHNwbGl0MldhZ2VyID0gJChcIi5zcGxpdDJXYWdlclwiKTtcbnZhciAkc3BsaXQxYVdhZ2VyID0gJChcIi5zcGxpdDFhV2FnZXJcIik7XG52YXIgJHNwbGl0MWJXYWdlciA9ICQoXCIuc3BsaXQxYldhZ2VyXCIpO1xudmFyICRzcGxpdDJhV2FnZXIgPSAkKFwiLnNwbGl0MmFXYWdlclwiKTtcbnZhciAkc3BsaXQyYldhZ2VyID0gJChcIi5zcGxpdDJiV2FnZXJcIik7XG5cbi8vY2FyZCBoYW5kIGRpdnNcbnZhciAkZGVhbGVySGFuZCA9ICQoXCIuZGVhbGVySGFuZFwiKTtcbnZhciAkcGxheWVySGFuZCA9ICQoXCIucGxheWVySGFuZFwiKTtcbnZhciAkc3BsaXQxSGFuZCA9ICQoXCIuc3BsaXQxSGFuZFwiKTtcbnZhciAkc3BsaXQySGFuZCA9ICQoXCIuc3BsaXQySGFuZFwiKTtcbnZhciAkc3BsaXQxYUhhbmQgPSAkKFwiLnNwbGl0MWFIYW5kXCIpO1xudmFyICRzcGxpdDFiSGFuZCA9ICQoXCIuc3BsaXQxYkhhbmRcIik7XG52YXIgJHNwbGl0MmFIYW5kID0gJChcIi5zcGxpdDJhSGFuZFwiKTtcbnZhciAkc3BsaXQyYkhhbmQgPSAkKFwiLnNwbGl0MmJIYW5kXCIpO1xuXG4vL2NhcmQgaGFuZCBwYXJlbnQgZGl2c1xudmFyICRkZWFsZXIgPSAkKFwiLmRlYWxlclwiKTtcbnZhciAkcGxheWVyID0gJChcIi5wbGF5ZXJcIik7XG52YXIgJHNwbGl0MSA9ICQoXCIuc3BsaXQxXCIpO1xudmFyICRzcGxpdDIgPSAkKFwiLnNwbGl0MlwiKTtcbnZhciAkc3BsaXQxYSA9ICQoXCIuc3BsaXQxYVwiKTtcbnZhciAkc3BsaXQxYiA9ICQoXCIuc3BsaXQxYlwiKTtcbnZhciAkc3BsaXQyYSA9ICQoXCIuc3BsaXQyYVwiKTtcbnZhciAkc3BsaXQyYiA9ICQoXCIuc3BsaXQyYlwiKTtcblxuLy9jYXJkIHNwbGl0IHBhcmVudCBkaXZzXG52YXIgJHBsYXllclNwbGl0ID0gJChcIi5wbGF5ZXJTcGxpdFwiKTtcbnZhciAkcGxheWVyU3BsaXQxID0gJChcIi5wbGF5ZXJTcGxpdDFcIik7XG52YXIgJHBsYXllclNwbGl0MiA9ICQoXCIucGxheWVyU3BsaXQyXCIpO1xuXG4vL2hhbmQgdG90YWwgZGl2c1xudmFyICRkZWFsZXJUb3RhbCA9ICQoXCIuZGVhbGVyVG90YWxcIik7XG52YXIgJHBsYXllclRvdGFsID0gJChcIi5wbGF5ZXJUb3RhbFwiKTtcbnZhciAkc3BsaXQxVG90YWwgPSAkKFwiLnNwbGl0MVRvdGFsXCIpO1xudmFyICRzcGxpdDJUb3RhbCA9ICQoXCIuc3BsaXQyVG90YWxcIik7XG52YXIgJHNwbGl0MWFUb3RhbCA9ICQoXCIuc3BsaXQxYVRvdGFsXCIpO1xudmFyICRzcGxpdDFiVG90YWwgPSAkKFwiLnNwbGl0MWJUb3RhbFwiKTtcbnZhciAkc3BsaXQyYVRvdGFsID0gJChcIi5zcGxpdDJhVG90YWxcIik7XG52YXIgJHNwbGl0MmJUb3RhbCA9ICQoXCIuc3BsaXQyYlRvdGFsXCIpO1xuXG4vLyB3aW4gLSBsb3NlIC0gcHVzaCAtIGJsYWNramFjayBhbm5vdW5jZSBkaXZzIGFuZCB0ZXh0XG52YXIgJGFubm91bmNlID0gJChcIi5hbm5vdW5jZVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0ID0gJChcIi5hbm5vdW5jZSBwXCIpO1xudmFyICRhbm5vdW5jZTEgPSAkKFwiLmFubm91bmNlMVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MSA9ICQoXCIuYW5ub3VuY2UxIHBcIik7XG52YXIgJGFubm91bmNlMiA9ICQoXCIuYW5ub3VuY2UyXCIpO1xudmFyICRhbm5vdW5jZVRleHQyID0gJChcIi5hbm5vdW5jZTIgcFwiKTtcbnZhciAkYW5ub3VuY2UxYSA9ICQoXCIuYW5ub3VuY2UxYVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MWEgPSAkKFwiLmFubm91bmNlMWEgcFwiKTtcbnZhciAkYW5ub3VuY2UxYiA9ICQoXCIuYW5ub3VuY2UxYlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MWIgPSAkKFwiLmFubm91bmNlMWIgcFwiKTtcbnZhciAkYW5ub3VuY2UyYSA9ICQoXCIuYW5ub3VuY2UyYVwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MmEgPSAkKFwiLmFubm91bmNlMmEgcFwiKTtcbnZhciAkYW5ub3VuY2UyYiA9ICQoXCIuYW5ub3VuY2UyYlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MmIgPSAkKFwiLmFubm91bmNlMmIgcFwiKTtcblxuLy9jcmVhdGUgYXVkaW8gZWxlbWVudHNcbnZhciBjYXJkUGxhY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuY2FyZFBsYWNlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkUGxhY2UxLndhdicpO1xudmFyIGNhcmRQYWNrYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQYWNrYWdlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jYXJkT3BlblBhY2thZ2UyLndhdicpO1xudmFyIGJ1dHRvbkNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmJ1dHRvbkNsaWNrLnNldEF0dHJpYnV0ZSgnc3JjJywgJ3NvdW5kcy9jbGljazEud2F2Jyk7XG52YXIgd2luV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbndpbldhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2hpcHNIYW5kbGU1LndhdicpO1xudmFyIGxvc2VXYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xubG9zZVdhdi5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFNob3ZlMy53YXYnKTtcblxuLy9wb3B1bGF0ZSBiYW5rIGFtb3VudCBvbiBwYWdlIGxvYWRcbiRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG5jb3VudENoaXBzKFwiYmFua1wiKTtcblxuLy9idXR0b24gY2xpY2sgbGlzdGVuZXJzXG4kKFwiYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgYnV0dG9uQ2xpY2subG9hZCgpO1xuICBidXR0b25DbGljay5wbGF5KCk7XG59KTtcblxuJGRlYWwuY2xpY2sobmV3R2FtZSk7XG5cbiRoaXQuY2xpY2soaGl0KTtcblxuJHN0YXkuY2xpY2soZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIGhhbmRFbmQoZ2FtZS5jdXJyZW50SGFuZCk7XG59KTtcblxuJHNwbGl0QnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDFCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MkJ1dHRvbi5jbGljayhzcGxpdCk7XG5cbiRkb3VibGUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZUNvdW50SW5mb1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIuY291bnRJbmZvXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi50ZXN0UGFuZWxcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbiAgdGhpcy5jdXJyZW50SGFuZCA9IFwicGxheWVyXCI7XG4gIHRoaXMuaGFuZHNUb1BsYXkgPSAxO1xufVxuXG5mdW5jdGlvbiBIYW5kKCkge1xuICB0aGlzLmNhcmRzID0gW107XG4gIHRoaXMuY2FyZEltYWdlcyA9IFtdO1xuICB0aGlzLnRvdGFsID0gMDtcbiAgdGhpcy53aW5uZXIgPSBcIlwiO1xuICB0aGlzLndhZ2VyID0gMDtcbiAgdGhpcy5jYW5TcGxpdCA9IGZhbHNlO1xuICB0aGlzLmlzU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5jYW5Eb3VibGUgPSB0cnVlO1xuICB0aGlzLmlzRG91YmxlZCA9IGZhbHNlO1xuICB0aGlzLmlzQ3VycmVudFR1cm4gPSBmYWxzZTtcbiAgdGhpcy5pc0RvbmUgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBuZXdHYW1lKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KFwicGxheWVyXCIsIGJldEFtdCkgJiYgZGVhbCgpO1xufVxuXG5mdW5jdGlvbiBkZWFsKCkge1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gZmFsc2U7XG4gIGdhbWUucGxheWVyLmlzRG9uZSA9IGZhbHNlO1xuICBjbGVhclRhYmxlKCk7XG4gICRkZWFsLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJChcIi5oaXQsIC5zdGF5LCAuZG91YmxlXCIpLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRkb3VibGUuYXR0cihcImlkXCIsIFwiXCIpO1xuICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gIGNhcmRQYWNrYWdlLnBsYXkoKTtcbiAgaWYgKGRlY2tJZCA9PT0gXCJcIiB8fCBjYXJkc0xlZnQgPCAzMykge1xuICAgIGdldEpTT04obmV3RGVja1VSTCArIGRlY2tzLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgICBjb3VudCA9IDA7XG4gICAgICB0cnVlQ291bnQgPSAwO1xuICAgICAgY2FyZHNMZWZ0ID0gMzEyO1xuICAgICAgYWR2YW50YWdlID0gLS41O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIGN1cnJlbnQgZGVja1wiKTtcbiAgICBkcmF3NCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRyYXc0KCkge1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogXCJkZWFsZXJcIixcbiAgICBpbWFnZTogY2FyZEJhY2tcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcInBsYXllclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogXCJkZWFsZXJcIlxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIGhhbmQ6IFwicGxheWVyXCIsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNoZWNrU3BsaXQoXCJwbGF5ZXJcIik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTcGxpdChoYW5kKSB7XG4gIHZhciBjaGVja1NwbGl0QXJyID0gZ2FtZVtoYW5kXS5jYXJkcy5tYXAoZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHJldHVybiBcIjEwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYXJkO1xuICAgIH1cbiAgfSk7XG4gIGlmIChjaGVja1NwbGl0QXJyWzBdID09PSBjaGVja1NwbGl0QXJyWzFdKSB7XG4gICAgZ2FtZVtoYW5kXS5jYW5TcGxpdCA9IHRydWU7XG4gICAgJChgLiR7aGFuZH0gPiBidXR0b25gKS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNwbGl0ICgpIHtcbiAgLy8gZ2FtZS5zcGxpdEhhbmQxLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzBdKTtcbiAgLy8gZ2FtZS5zcGxpdEhhbmQyLnB1c2goZ2FtZS5wbGF5ZXJIYW5kWzFdKTtcbiAgLy8gaXNTcGxpdCA9IHRydWU7XG4gIC8vICRzcGxpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIC8vICRwbGF5ZXIuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gIC8vICRwbGF5ZXJUb3RhbC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgLy8gJHBsYXllclNwbGl0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAvLyAkaGFuZDEuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMF19Jz5gKTtcbiAgLy8gJGhhbmQyLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzFdfSc+YCk7XG4gIC8vIGNoZWNrU3BsaXRUb3RhbChcImhhbmQxXCIpO1xuICAvLyBjaGVja1NwbGl0VG90YWwoXCJoYW5kMlwiKTtcbiAgLy8gZ2FtZUhhbmQgPSBcImhhbmQxXCI7XG4gIC8vIGhpZ2hsaWdodChcImhhbmQxXCIpO1xufVxuXG5mdW5jdGlvbiBoaWdobGlnaHQoaGFuZCkge1xuICAvLyBoYW5kID09PSBcImhhbmQxXCIgPyAoXG4gIC8vICAgJGhhbmQxLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4gIC8vICAgJGhhbmQyLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbiAgLy8gKSA6IChcbiAgLy8gICAkaGFuZDIuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgLy8gICAkaGFuZDEucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICAvLyApO1xufVxuXG5mdW5jdGlvbiBkcmF3Q2FyZChvcHRpb25zKSB7XG4gIHZhciBjYXJkVVJMID0gYCR7QVBJfWRyYXcvJHtkZWNrSWR9Lz9jb3VudD0xYDtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIHZhciBoYW5kID0gb3B0aW9ucy5oYW5kO1xuICAgIHZhciBjYXJkSW1hZ2VTcmMgPSBjYXJkSW1hZ2UoZGF0YSk7XG4gICAgZ2FtZVtoYW5kXS5jYXJkSW1hZ2VzLnB1c2goY2FyZEltYWdlU3JjKTtcbiAgICBjYXJkUGxhY2UubG9hZCgpO1xuICAgIGNhcmRQbGFjZS5wbGF5KCk7XG4gICAgb3B0aW9ucy5pbWFnZSA/IChcbiAgICAgIGh0bWwgPSBgPGltZyBjbGFzcz1cImNhcmRJbWFnZVwiIHNyYz1cIiR7b3B0aW9ucy5pbWFnZX1cIj5gLFxuICAgICAgJGRlYWxlckhhbmQucHJlcGVuZChodG1sKVxuICAgICkgOiAoXG4gICAgICBodG1sID0gYDxpbWcgY2xhc3M9XCJjYXJkSW1hZ2VcIiBzcmM9XCIke2NhcmRJbWFnZShkYXRhKX1cIj5gLFxuICAgICAgJChcIi5cIiArIGhhbmQpLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgaWYgKG9wdGlvbnMucGVyc29uID09PSBcImRlYWxlclwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbWFnZSkge1xuICAgICAgICBnYW1lLmRlYWxlci5jYXJkcy51bnNoaWZ0KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2FtZS5kZWFsZXIuY2FyZHMucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICAgICAgY29uc29sZS5sb2coYGRlYWxlciAtICR7Z2FtZS5kZWFsZXIuY2FyZHN9ICoqKiogZGVhbGVyIGlzIGF0ICR7Z2FtZS5kZWFsZXIudG90YWx9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdhbWVbaGFuZF0uY2FyZHMucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgY2hlY2tUb3RhbChoYW5kKTtcbiAgICAgIGNvbnNvbGUubG9nKGAke2hhbmR9IC0gJHtnYW1lW2hhbmRdLmNhcmRzfSAqKioqICR7aGFuZH0gaXMgYXQgJHtnYW1lLnBsYXllci50b3RhbH1gKTtcbiAgICB9XG4gICAgaGFuZCAhPT0gXCJkZWFsZXJcIiAmJiBjaGVja0xvc3MyMShnYW1lLmN1cnJlbnRIYW5kKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgdmFyIGhhbmQgPSBnYW1lLmN1cnJlbnRIYW5kO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogaGFuZCxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGdhbWVbaGFuZF0uaXNEb3VibGVkICYmICFnYW1lW2hhbmRdLndpbm5lcikge1xuICAgICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGdhbWVbaGFuZF0uaXNGaXJzdFR1cm4pIHtcbiAgICBnYW1lW2hhbmRdLmlzRmlyc3RUdXJuID0gZmFsc2U7XG4gICAgJGRvdWJsZWQuYXR0cihcImlkXCIsIFwiZG91YmxlZC1kaXNhYmxlZFwiKTtcbiAgfVxufVxuZnVuY3Rpb24gZGVhbGVyVHVybigpIHtcbiAgaWYgKGdhbWUuZGVhbGVyLnRvdGFsIDwgMTcpIHtcbiAgICBjb25zb2xlLmxvZyhgZGVhbGVyIGhpdHMgb24gJHtnYW1lLmRlYWxlci50b3RhbH1gKTtcbiAgICBkcmF3Q2FyZCh7XG4gICAgICBoYW5kOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IGRlYWxlclR1cm5cbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA+PSAxNykge1xuICAgIGNvbnNvbGUubG9nKGBkZWFsZXIgaXMgZmluaXNoZWQgd2l0aCAke2dhbWUuZGVhbGVyLnRvdGFsfWApO1xuICAgIGdhbWUucGxheWVyLmNhcmRzLmxlbmd0aCA+IDAgJiYgY2hlY2tWaWN0b3J5KFwicGxheWVyXCIpO1xuICAgIGdhbWUuc3BsaXQxLmNhcmRzLmxlbmd0aCA+IDAgJiYgY2hlY2tWaWN0b3J5KFwic3BsaXQxXCIpO1xuICAgIGdhbWUuc3BsaXQyLmNhcmRzLmxlbmd0aCA+IDAgJiYgY2hlY2tWaWN0b3J5KFwic3BsaXQyXCIpO1xuICAgIGdhbWUuc3BsaXQxYS5jYXJkcy5sZW5ndGggPiAwICYmIGNoZWNrVmljdG9yeShcInNwbGl0MWFcIik7XG4gICAgZ2FtZS5zcGxpdDFiLmNhcmRzLmxlbmd0aCA+IDAgJiYgY2hlY2tWaWN0b3J5KFwic3BsaXQxYlwiKTtcbiAgICBnYW1lLnNwbGl0MmEuY2FyZHMubGVuZ3RoID4gMCAmJiBjaGVja1ZpY3RvcnkoXCJzcGxpdDJhXCIpO1xuICAgIGdhbWUuc3BsaXQyYi5jYXJkcy5sZW5ndGggPiAwICYmIGNoZWNrVmljdG9yeShcInNwbGl0MmJcIik7XG4gICAgZ2FtZUVuZCgpO1xuICB9XG59XG5cbi8vIGZ1bmN0aW9uIHN0YXkoKSB7XG4vLyAgIGlmICghZ2FtZS53aW5uZXIgJiYgZ2FtZS5kZWFsZXJUb3RhbCA8IDE3KSB7XG4vLyAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGl0c1wiKTtcbi8vICAgICBpc1BsYXllcnNUdXJuID0gZmFsc2U7XG4vLyAgICAgZHJhd0NhcmQoe1xuLy8gICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuLy8gICAgICAgY2FsbGJhY2s6IHN0YXlcbi8vICAgICB9KTtcbi8vICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4vLyAgICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbi8vICAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4vLyAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuLy8gICAgIGdhbWVFbmQoKTtcbi8vICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbi8vICAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbi8vICAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbi8vICAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4vLyAgICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCksXG4vLyAgICAgICBnYW1lRW5kKClcbi8vICAgICApIDogKFxuLy8gICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiLFxuLy8gICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpLFxuLy8gICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwgKyBcIiBiZWF0cyBkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwpLFxuLy8gICAgICAgZ2FtZUVuZCgpXG4vLyAgICAgKTtcbi8vICAgfVxuLy8gfVxuXG5mdW5jdGlvbiBjaGVja1RvdGFsKGhhbmQpIHtcbiAgdmFyIHRvdGFsID0gMDtcbiAgdmFyIGhhbmRUb0NoZWNrID0gaGFuZCA9PT0gXCJkZWFsZXJcIiA/IGdhbWUuZGVhbGVyLmNhcmRzIDogZ2FtZVtoYW5kXS5jYXJkcztcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmRUb0NoZWNrLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIktJTkdcIiB8fCBjYXJkID09PSBcIlFVRUVOXCIgfHwgY2FyZCA9PT0gXCJKQUNLXCIpIHtcbiAgICAgIHRvdGFsICs9IDEwO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKGNhcmQpKSB7XG4gICAgICB0b3RhbCArPSBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBhY2VzICs9IDE7XG4gICAgfVxuICB9KTtcblxuICBpZiAoYWNlcyA+IDApIHtcbiAgICBpZiAodG90YWwgKyBhY2VzICsgMTAgPiAyMSkge1xuICAgICAgdG90YWwgKz0gYWNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWwgKz0gYWNlcyArIDEwO1xuICAgIH1cbiAgfVxuXG4gIHZhciB0ZXh0Q29sb3IgPSBcIndoaXRlXCJcbiAgaWYgKHRvdGFsID09PSAyMSkge1xuICAgIHRleHRDb2xvciA9IFwibGltZVwiO1xuICB9IGVsc2UgaWYgKHRvdGFsID4gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcInJlZFwiO1xuICB9XG5cbiAgZ2FtZVtoYW5kXS50b3RhbCA9IHRvdGFsO1xuICAkKGAuJHtoYW5kfVRvdGFsYCkudGV4dCh0b3RhbCkuY3NzKFwiY29sb3JcIiwgdGV4dENvbG9yKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tMb3NzMjEoaGFuZCkge1xuICAvLyBpZiAoaGFuZCA9PT0gXCJkZWFsZXJcIikge1xuICAvLyAgIGlmIChnYW1lLmRlYWxlci50b3RhbCA+IDIxKSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcblxuICAvLyAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxKSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJwbGF5ZXJcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFhXCIpO1xuICAvLyAgICAgY2hlY2tWaWN0b3J5KFwic3BsaXQxYlwiKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInNwbGl0MmFcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDJiXCIpO1xuICAvLyAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPCAxNyAmJiBnYW1lLmRlYWxlci50b3RhbCA8IDIxKSB7XG4gIC8vICAgICBjb25zb2xlLmxvZyhgZGVhbGVyIHN0YXlzIHdpdGggJHtnYW1lLmRlYWxlci50b3RhbH1gKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInBsYXllclwiKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInNwbGl0MVwiKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInNwbGl0MlwiKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInNwbGl0MWFcIik7XG4gIC8vICAgICBjaGVja1ZpY3RvcnkoXCJzcGxpdDFiXCIpO1xuICAvLyAgICAgY2hlY2tWaWN0b3J5KFwic3BsaXQyYVwiKTtcbiAgLy8gICAgIGNoZWNrVmljdG9yeShcInNwbGl0MmJcIik7XG4gIC8vICAgfVxuICAvLyB9IGVsc2Uge1xuICAgIGlmIChnYW1lW2hhbmRdLnRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJCVVNUXCIpO1xuICAgICAgaGFuZEVuZChoYW5kKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBoYW5kRW5kKGhhbmQpO1xuICAgIH1cbiAgLy99XG59XG5cbmZ1bmN0aW9uIGNoZWNrVmljdG9yeShoYW5kKSB7XG4gIC8vZ3VhcmRzIGFnYWluc3QgY2hlY2tpbmcgYmVmb3JlIHRoZSBkZWFsIGlzIGNvbXBsZXRlXG4gIGlmIChnYW1lLmRlYWxlci5jYXJkcy5sZW5ndGggPj0gMiAmJiBnYW1lLnBsYXllci5jYXJkcy5sZW5ndGggPj0gMikge1xuICAgIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID09PSAyICYmIGdhbWVbaGFuZF0udG90YWwgPT09IDIxICYmIGdhbWVbaGFuZF0uY2FyZHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRvdWJsZSBibGFja2phY2sgcHVzaCFcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVyLmNhcmRzLmxlbmd0aCA9PT0gMiAmJiBnYW1lW2hhbmRdLnRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lW2hhbmRdLnRvdGFsID09PSAyMSAmJiBnYW1lW2hhbmRdLmNhcmRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIGJsYWNramFja1wiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGdhbWVbaGFuZF0ud2FnZXIgKj0gMS4yNTtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiQkxBQ0tKQUNLIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSAmJiBnYW1lW2hhbmRdLnRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlci5jYXJkcy5sZW5ndGggPT09IDIgJiYgZ2FtZS5pc1BsYXllcnNUdXJuICYmIGdhbWVbaGFuZF0udG90YWwgPCAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIGJsYWNramFjaywgZG9pbmcgbm90aGluZy4uLlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJZT1UgV0lOXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiMjEhXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVtoYW5kXS50b3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBidXN0c1wiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiQlVTVFwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5QWxsKCkge1xuXG59XG5cbmZ1bmN0aW9uIGhhbmRFbmQoaGFuZCkge1xuICBnYW1lW2hhbmRdLmlzRG9uZSA9IHRydWU7XG4gIGlmIChnYW1lLnNwbGl0MWIuaXNEb25lID09PSBmYWxzZSkge1xuICAgIGdhbWUuY3VycmVudEhhbmQgPSBcInNwbGl0MWJcIjtcbiAgICBoaWdobGlnaHQoXCJzcGxpdDFiXCIpO1xuICB9IGVsc2UgaWYgKGdhbWUuc3BsaXQxLmlzRG9uZSA9PT0gZmFsc2UpIHtcbiAgICBnYW1lLmN1cnJlbnRIYW5kID0gXCJzcGxpdDFcIjtcbiAgICBoaWdobGlnaHQoXCJzcGxpdDFcIik7XG4gIH0gZWxzZSBpZiAoZ2FtZS5zcGxpdDJhLmlzRG9uZSA9PT0gZmFsc2UpIHtcbiAgICBnYW1lLmN1cnJlbnRIYW5kID0gXCJzcGxpdDJhXCI7XG4gICAgaGlnaGxpZ2h0KFwic3BsaXQyYVwiKTtcbiAgfSBlbHNlIGlmIChnYW1lLnNwbGl0MmIuaXNEb25lID09PSBmYWxzZSkge1xuICAgIGdhbWUuY3VycmVudEhhbmQgPSBcInNwbGl0MmJcIjtcbiAgICBoaWdobGlnaHQoXCJzcGxpdDJiXCIpO1xuICB9IGVsc2UgaWYgKGdhbWUuc3BsaXQyLmlzRG9uZSA9PT0gZmFsc2UpIHtcbiAgICBnYW1lLmN1cnJlbnRIYW5kID0gXCJzcGxpdDJcIjtcbiAgICBoaWdobGlnaHQoXCJzcGxpdDJcIik7XG4gIH0gZWxzZSB7XG4gICAgZGVhbGVyVHVybigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdhbWVFbmQoKSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgIGJhbmsgKz0gKGdhbWUud2FnZXIgKiAyKTtcbiAgICBjb25zb2xlLmxvZyhgZ2l2aW5nIHBsYXllciAke2dhbWUud2FnZXIgKiAyfS4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgYmFuayArPSBnYW1lLndhZ2VyO1xuICAgIGNvbnNvbGUubG9nKGByZXR1cm5pbmcgJHtnYW1lLndhZ2VyfSB0byBwbGF5ZXIuIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9XG4gICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICFpc0ZsaXBwZWQgJiYgZmxpcENhcmQoKTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4gIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gY2xlYXJUYWJsZSgpIHtcbiAgJChcIi5oYW5kLCAud2FnZXIsIC50b3RhbCwgLmNoaXBzXCIpLmVtcHR5KCk7XG4gICQoXCIuZGVhbGVyVG90YWwsIC5wbGF5ZXJTcGxpdCwgLnBsYXllclNwbGl0MSwgLnBsYXllclNwbGl0MiwgLnBvcHVwXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkKFwiLnBvcHVwXCIpLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS10YWJsZSBjbGVhcmVkLS0tLS0tLS0tLS0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICBpc0ZsaXBwZWQgPSB0cnVlO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG4gIHVwZGF0ZUNvdW50KGdhbWUuZGVhbGVySGFuZFswXSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgLTEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkID49IDcgJiYgY2FyZCA8PSA5KSB7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICswIC0tPiAke2NvdW50fWApO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudC50b1ByZWNpc2lvbigyKSArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3NMZWZ0O1xufVxuXG5mdW5jdGlvbiBnZXRBZHZhbnRhZ2UoKSB7XG4gIGFkdmFudGFnZSA9ICh0cnVlQ291bnQgKiAuNSkgLSAuNTtcbn1cblxuZnVuY3Rpb24gc2V0TmVlZGxlKCkge1xuICB2YXIgbnVtID0gYWR2YW50YWdlICogMzY7XG4gICQoXCIuZ2F1Z2UtbmVlZGxlXCIpLmNzcyhcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArIG51bSArIFwiZGVnKVwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGhhbmQsIGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lW2hhbmRdLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoaGFuZCk7XG4gICAgJChgLiR7aGFuZH1XYWdlcmApLnRleHQoZ2FtZVtoYW5kXS53YWdlcik7XG4gICAgY29uc29sZS5sb2coYGJldHRpbmcgJHthbXR9IG9uICR7aGFuZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgJHtoYW5kfSB3YWdlciBhdCAke2dhbWVbaGFuZF0ud2FnZXJ9YCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJJbnN1ZmZpY2llbnQgZnVuZHMuXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZVtsb2NhdGlvbl0ud2FnZXI7XG4gIHZhciBudW0xMDBzID0gTWF0aC5mbG9vcihhbXQgLyAxMDApO1xuICB2YXIgbnVtNTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCkgLyA1MCk7XG4gIHZhciBudW0yNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTApIC8gMjUpO1xuICB2YXIgbnVtMTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUpIC8gMTApO1xuICAgdmFyIG51bTVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCkgLyA1KTtcbiAgIHZhciBudW0xcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUpIC8gMSk7XG4gIHZhciBudW0wNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1IC0gbnVtMXMgKiAxKSAvIC41KTtcblxuICB2YXIgaHRtbCA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTAwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMDAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01MHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0yNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMjUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTA1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0wNS5wbmcnPlwiO1xuICB9O1xuXG4gIGlmIChsb2NhdGlvbiA9PT0gXCJiYW5rXCIpIHtcbiAgICAkYmFua0NoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmJhbmtDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgICQoYC4ke2xvY2F0aW9ufUNoaXBzYCkuaHRtbChodG1sKTtcbiAgICAkKGAuJHtsb2NhdGlvbn1DaGlwcyBpbWdgKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vL1xuLy8gVEVTVElORyAvL1xuLy8vLy8vLy8vLy8vL1xuXG4kKFwiLnRlc3REZWFsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpO1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgaWYgKGJhbmsgPj0gYmV0QW10KSB7XG4gICAgY2xlYXJUYWJsZSgpO1xuICAgICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gICAgY2FyZFBhY2thZ2UucGxheSgpO1xuICAgIGdldEpTT04obmV3RGVja1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgIH0pO1xuICB9XG4gIHZhciBkZWFsZXIxVmFsdWUgPSAkKFwiLmRlYWxlcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJWYWx1ZSA9ICQoXCIuZGVhbGVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVZhbHVlID0gJChcIi5wbGF5ZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyVmFsdWUgPSAkKFwiLnBsYXllcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjFTdWl0ID0gJChcIi5kZWFsZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJTdWl0ID0gJChcIi5kZWFsZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFTdWl0ID0gJChcIi5wbGF5ZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJTdWl0ID0gJChcIi5wbGF5ZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjFWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgZGVhbGVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMlZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIxVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjJWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKHBsYXllcjEpO1xuICBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKHBsYXllcjIpO1xuICBnYW1lLmRlYWxlckhhbmQgPSBbZGVhbGVyMVZhbHVlLCBkZWFsZXIyVmFsdWVdO1xuICBnYW1lLnBsYXllckhhbmQgPSBbcGxheWVyMVZhbHVlLCBwbGF5ZXIyVmFsdWVdO1xuICBnYW1lLmhpZGRlbkNhcmQgPSBkZWFsZXIxO1xuICAkZGVhbGVyLnByZXBlbmQoYDxpbWcgc3JjPScke2NhcmRCYWNrfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtkZWFsZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIxfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gIGNoZWNrVmljdG9yeSgpO1xuICBjaGVja1NwbGl0KCk7XG59KTtcblxuJChcIi5naXZlQ2FyZFwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgZ2l2ZUNhcmQoJCh0aGlzKS5hdHRyKFwiZGF0YS1pZFwiKSk7XG59KVxuXG4vLyAkKCcuZGVhbGVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdpdmVDYXJkKCdkZWFsZXInKTtcbi8vIH0pO1xuXG4vLyAkKCcucGxheWVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdpdmVDYXJkKCdwbGF5ZXInKTtcbi8vIH0pO1xuXG5mdW5jdGlvbiBnaXZlQ2FyZChoYW5kKSB7XG4gIHZhciBjYXJkVmFsdWUgPSAkKCcuZ2l2ZUNhcmRWYWx1ZScpLnZhbCgpO1xuICB2YXIgY2FyZFN1aXQgPSAkKCcuZ2l2ZUNhcmRTdWl0JykudmFsKCk7XG4gIHZhciBjYXJkU3JjID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcblxuICAvL1RoaXMgaXMgbWF5YmUgaG93IGl0IGNhbiBsb29rIGluIHRoZSBmdXR1cmU6XG4gIC8vZ2FtZS5oYW5kW2hhbmRdLnB1c2goY2FyZFZhbHVlKTtcbiAgLy9jaGVja1RvdGFsKGhhbmQpO1xuICAvLyQoaGFuZCkuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG5cbiAgaWYgKHBlcnNvbiA9PT0gJ2RlYWxlcicpIHtcbiAgICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ2RlYWxlcicpO1xuICAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAncGxheWVyJykge1xuICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgncGxheWVyJyk7XG4gICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDEnKSB7XG4gICAgZ2FtZS5zcGxpdDFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDEnKTtcbiAgICAkc3BsaXQxLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MicpIHtcbiAgICBnYW1lLnNwbGl0MkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MicpO1xuICAgICRzcGxpdDIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxYScpIHtcbiAgICBnYW1lLnNwbGl0MWFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDFhJyk7XG4gICAgJHNwbGl0MWEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxYicpIHtcbiAgICBnYW1lLnNwbGl0MWJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDFiJyk7XG4gICAgJHNwbGl0MWIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyYScpIHtcbiAgICBnYW1lLnNwbGl0MmFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDJhJyk7XG4gICAgJHNwbGl0MmEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyYicpIHtcbiAgICBnYW1lLnNwbGl0MmJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDJiJyk7XG4gICAgJHNwbGl0MmIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH1cblxuICAvLyBwZXJzb24gPT09ICdkZWFsZXInID8gKFxuICAvLyAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gIC8vICAgY2hlY2tUb3RhbCgnZGVhbGVyJyksXG4gIC8vICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICAvLyApIDogKFxuICAvLyAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gIC8vICAgY2hlY2tUb3RhbCgncGxheWVyJyksXG4gIC8vICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICAvLyApXG4gIGNoZWNrVmljdG9yeSgpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIl19