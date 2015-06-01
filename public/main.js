"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
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
}

function newGame() {
  game = new Game();
  bet("player", betAmt) && deal();
}

function deal() {
  betChangeAllowed = false;
  clearTable();
  $deal.attr("disabled", true);
  $(".hit, .stay, .double").attr("disabled", false);
  $double.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 33) {
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
  var cardURL = "" + API + "draw/" + deckId + "/?count=" + decks;
  getJSON(cardURL, function (data, cb) {
    var html;
    var cardImage = cardImage(data);
    $("game[options.hand].cardImages").push(cardImage);
    cardPlace.load();
    cardPlace.play();
    options.image ? (html = "<img class=\"cardImage\" src=\"" + options.image + "\">", $dealerHand.prepend(html)) : (html = "<img class=\"cardImage\" src=\"" + cardImage(data) + "\">", $("." + options.hand).append(html));
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
      game[options.hand].cards.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal(options.hand);
      console.log("" + options.hand + " - " + game[options.hand].cards + " **** " + options.hand + " is at " + game.playerTotal);
    }
    checkVictory(options.hand);
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

  //  Need to replace this with something elsewhere

  //  game.winner && gameEnd();
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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLENB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QUssTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzVELE1BQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFBLEdBQUksRUFBRSxDQUFDLENBQUM7QUFDbEUsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVGLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUM7QUFDekcsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcs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QUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLE1BQU07QUFDTCxRQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDO0dBQ0gsQ0FBQztBQUNGLFNBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNoQixDQUFDIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD02XCI7XG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzUyL0NhcmRfYmFja18xNi5zdmcvMjA5cHgtQ2FyZF9iYWNrXzE2LnN2Zy5wbmdcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBkZWNrcyA9IDY7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3M7XG52YXIgY2FyZHNMZWZ0ID0gNTIgKiBkZWNrcztcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbi8vIHZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG4vLyB2YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4vLyB2YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzRmxpcHBlZCA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vZ2FtZSBidXR0b25zXG52YXIgJGRlYWwgPSAkKFwiLmRlYWxcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xudmFyICRkb3VibGUgPSAkKFwiLmRvdWJsZVwiKTtcbnZhciAkc3BsaXRCdXR0b24gPSAkKFwiLnNwbGl0QnV0dG9uXCIpO1xudmFyICRzcGxpdDFCdXR0b24gPSAkKFwiLnNwbGl0MUJ1dHRvblwiKTtcbnZhciAkc3BsaXQyQnV0dG9uID0gJChcIi5zcGxpdDJCdXR0b25cIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG5cbi8vIENoaXAgc3RhY2tzXG52YXIgJGJhbmtDaGlwcyA9ICQoXCIuYmFua0NoaXBzXCIpO1xudmFyICRwbGF5ZXJDaGlwcyA9ICQoXCIucGxheWVyQ2hpcHNcIik7XG52YXIgJHNwbGl0MUNoaXBzID0gJChcIi5zcGxpdDFDaGlwc1wiKTtcbnZhciAkc3BsaXQyQ2hpcHMgPSAkKFwiLnNwbGl0MkNoaXBzXCIpO1xudmFyICRzcGxpdDFhQ2hpcHMgPSAkKFwiLnNwbGl0MWFDaGlwc1wiKTtcbnZhciAkc3BsaXQxYkNoaXBzID0gJChcIi5zcGxpdDFiQ2hpcHNcIik7XG52YXIgJHNwbGl0MmFDaGlwcyA9ICQoXCIuc3BsaXQyYUNoaXBzXCIpO1xudmFyICRzcGxpdDJiQ2hpcHMgPSAkKFwiLnNwbGl0MmJDaGlwc1wiKTtcblxuLy8gQ2hpcCB0b3RhbHNcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJHBsYXllcldhZ2VyID0gJChcIi5wbGF5ZXJXYWdlclwiKTtcbnZhciAkc3BsaXQxV2FnZXIgPSAkKFwiLnNwbGl0MVdhZ2VyXCIpO1xudmFyICRzcGxpdDJXYWdlciA9ICQoXCIuc3BsaXQyV2FnZXJcIik7XG52YXIgJHNwbGl0MWFXYWdlciA9ICQoXCIuc3BsaXQxYVdhZ2VyXCIpO1xudmFyICRzcGxpdDFiV2FnZXIgPSAkKFwiLnNwbGl0MWJXYWdlclwiKTtcbnZhciAkc3BsaXQyYVdhZ2VyID0gJChcIi5zcGxpdDJhV2FnZXJcIik7XG52YXIgJHNwbGl0MmJXYWdlciA9ICQoXCIuc3BsaXQyYldhZ2VyXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlckhhbmQgPSAkKFwiLmRlYWxlckhhbmRcIik7XG52YXIgJHBsYXllckhhbmQgPSAkKFwiLnBsYXllckhhbmRcIik7XG52YXIgJHNwbGl0MUhhbmQgPSAkKFwiLnNwbGl0MUhhbmRcIik7XG52YXIgJHNwbGl0MkhhbmQgPSAkKFwiLnNwbGl0MkhhbmRcIik7XG52YXIgJHNwbGl0MWFIYW5kID0gJChcIi5zcGxpdDFhSGFuZFwiKTtcbnZhciAkc3BsaXQxYkhhbmQgPSAkKFwiLnNwbGl0MWJIYW5kXCIpO1xudmFyICRzcGxpdDJhSGFuZCA9ICQoXCIuc3BsaXQyYUhhbmRcIik7XG52YXIgJHNwbGl0MmJIYW5kID0gJChcIi5zcGxpdDJiSGFuZFwiKTtcblxuLy9jYXJkIGhhbmQgcGFyZW50IGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xudmFyICRzcGxpdDEgPSAkKFwiLnNwbGl0MVwiKTtcbnZhciAkc3BsaXQyID0gJChcIi5zcGxpdDJcIik7XG52YXIgJHNwbGl0MWEgPSAkKFwiLnNwbGl0MWFcIik7XG52YXIgJHNwbGl0MWIgPSAkKFwiLnNwbGl0MWJcIik7XG52YXIgJHNwbGl0MmEgPSAkKFwiLnNwbGl0MmFcIik7XG52YXIgJHNwbGl0MmIgPSAkKFwiLnNwbGl0MmJcIik7XG5cbi8vY2FyZCBzcGxpdCBwYXJlbnQgZGl2c1xudmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG52YXIgJHBsYXllclNwbGl0MSA9ICQoXCIucGxheWVyU3BsaXQxXCIpO1xudmFyICRwbGF5ZXJTcGxpdDIgPSAkKFwiLnBsYXllclNwbGl0MlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG52YXIgJHNwbGl0MVRvdGFsID0gJChcIi5zcGxpdDFUb3RhbFwiKTtcbnZhciAkc3BsaXQyVG90YWwgPSAkKFwiLnNwbGl0MlRvdGFsXCIpO1xudmFyICRzcGxpdDFhVG90YWwgPSAkKFwiLnNwbGl0MWFUb3RhbFwiKTtcbnZhciAkc3BsaXQxYlRvdGFsID0gJChcIi5zcGxpdDFiVG90YWxcIik7XG52YXIgJHNwbGl0MmFUb3RhbCA9ICQoXCIuc3BsaXQyYVRvdGFsXCIpO1xudmFyICRzcGxpdDJiVG90YWwgPSAkKFwiLnNwbGl0MmJUb3RhbFwiKTtcblxuLy8gd2luIC0gbG9zZSAtIHB1c2ggLSBibGFja2phY2sgYW5ub3VuY2UgZGl2cyBhbmQgdGV4dFxudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcbnZhciAkYW5ub3VuY2UxID0gJChcIi5hbm5vdW5jZTFcIik7XG52YXIgJGFubm91bmNlVGV4dDEgPSAkKFwiLmFubm91bmNlMSBwXCIpO1xudmFyICRhbm5vdW5jZTIgPSAkKFwiLmFubm91bmNlMlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MiA9ICQoXCIuYW5ub3VuY2UyIHBcIik7XG52YXIgJGFubm91bmNlMWEgPSAkKFwiLmFubm91bmNlMWFcIik7XG52YXIgJGFubm91bmNlVGV4dDFhID0gJChcIi5hbm5vdW5jZTFhIHBcIik7XG52YXIgJGFubm91bmNlMWIgPSAkKFwiLmFubm91bmNlMWJcIik7XG52YXIgJGFubm91bmNlVGV4dDFiID0gJChcIi5hbm5vdW5jZTFiIHBcIik7XG52YXIgJGFubm91bmNlMmEgPSAkKFwiLmFubm91bmNlMmFcIik7XG52YXIgJGFubm91bmNlVGV4dDJhID0gJChcIi5hbm5vdW5jZTJhIHBcIik7XG52YXIgJGFubm91bmNlMmIgPSAkKFwiLmFubm91bmNlMmJcIik7XG52YXIgJGFubm91bmNlVGV4dDJiID0gJChcIi5hbm5vdW5jZTJiIHBcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbiRkZWFsLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBzdGF5KCk7XG59KTtcblxuJHNwbGl0QnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDFCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MkJ1dHRvbi5jbGljayhzcGxpdCk7XG5cbiRkb3VibGUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZUNvdW50SW5mb1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIuY291bnRJbmZvXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi50ZXN0UGFuZWxcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gSGFuZCgpIHtcbiAgdGhpcy5jYXJkcyA9IFtdO1xuICB0aGlzLmNhcmRJbWFnZXMgPSBbXTtcbiAgdGhpcy50b3RhbCA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMuY2FuU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XG4gIHRoaXMuY2FuRG91YmxlID0gdHJ1ZTtcbiAgdGhpcy5pc0RvdWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5pc0N1cnJlbnRUdXJuID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoXCJwbGF5ZXJcIiwgYmV0QW10KSAmJiBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgY2xlYXJUYWJsZSgpO1xuICAkZGVhbC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICQoXCIuaGl0LCAuc3RheSwgLmRvdWJsZVwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gIGlmIChkZWNrSWQgPT09IFwiXCIgfHwgY2FyZHNMZWZ0IDwgMzMpIHtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRlY2tJZCA9IGRhdGEuZGVja19pZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQWJvdXQgdG8gZGVhbCBmcm9tIG5ldyBkZWNrXCIpO1xuICAgICAgZHJhdzQoKTtcbiAgICAgIGNvdW50ID0gMDtcbiAgICAgIHRydWVDb3VudCA9IDA7XG4gICAgICBjYXJkc0xlZnQgPSAzMTI7XG4gICAgICBhZHZhbnRhZ2UgPSAtLjU7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcImRlYWxlclwiLFxuICAgIGltYWdlOiBjYXJkQmFja1xuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIGhhbmQ6IFwicGxheWVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcImRlYWxlclwiXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogY2hlY2tTcGxpdFxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTcGxpdCgpIHtcbiAgdmFyIGNoZWNrU3BsaXRBcnIgPSBnYW1lLnBsYXllckhhbmQubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICByZXR1cm4gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHJldHVybiBOdW1iZXIoY2FyZCk7XG4gICAgfSBlbHNlIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gIH0pO1xuICBpZiAoY2hlY2tTcGxpdEFyclswXSA9PT0gY2hlY2tTcGxpdEFyclsxXSkge1xuICAgIHNwbGl0QWxsb3dlZCA9IHRydWU7XG4gICAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaXQgKCkge1xuICBnYW1lLnNwbGl0SGFuZDEucHVzaChnYW1lLnBsYXllckhhbmRbMF0pO1xuICBnYW1lLnNwbGl0SGFuZDIucHVzaChnYW1lLnBsYXllckhhbmRbMV0pO1xuICBpc1NwbGl0ID0gdHJ1ZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJHBsYXllci5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgJHBsYXllclRvdGFsLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyU3BsaXQucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRoYW5kMS5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1swXX0nPmApO1xuICAkaGFuZDIuaHRtbChgPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9JyR7Z2FtZS5zcGxpdENhcmRJbWFnZXNbMV19Jz5gKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDFcIik7XG4gIGNoZWNrU3BsaXRUb3RhbChcImhhbmQyXCIpO1xuICBnYW1lSGFuZCA9IFwiaGFuZDFcIjtcbiAgaGlnaGxpZ2h0KFwiaGFuZDFcIik7XG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodChoYW5kKSB7XG4gIGhhbmQgPT09IFwiaGFuZDFcIiA/IChcbiAgICAkaGFuZDEuYWRkQ2xhc3MoXCJoaWdobGlnaHRlZFwiKSxcbiAgICAkaGFuZDIucmVtb3ZlQ2xhc3MoXCJoaWdobGlnaHRlZFwiKVxuICApIDogKFxuICAgICRoYW5kMi5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMS5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdDYXJkKG9wdGlvbnMpIHtcbiAgdmFyIGNhcmRVUkwgPSBgJHtBUEl9ZHJhdy8ke2RlY2tJZH0vP2NvdW50PSR7ZGVja3N9YDtcbiAgZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhLCBjYikge1xuICAgIHZhciBodG1sO1xuICAgIHZhciBjYXJkSW1hZ2UgPSBjYXJkSW1hZ2UoZGF0YSk7XG4gICAgJChgZ2FtZVtvcHRpb25zLmhhbmRdLmNhcmRJbWFnZXNgKS5wdXNoKGNhcmRJbWFnZSk7XG4gICAgY2FyZFBsYWNlLmxvYWQoKTtcbiAgICBjYXJkUGxhY2UucGxheSgpO1xuICAgIG9wdGlvbnMuaW1hZ2UgPyAoXG4gICAgICBodG1sID0gYDxpbWcgY2xhc3M9XCJjYXJkSW1hZ2VcIiBzcmM9XCIke29wdGlvbnMuaW1hZ2V9XCI+YCxcbiAgICAgICRkZWFsZXJIYW5kLnByZXBlbmQoaHRtbClcbiAgICApIDogKFxuICAgICAgaHRtbCA9IGA8aW1nIGNsYXNzPVwiY2FyZEltYWdlXCIgc3JjPVwiJHtjYXJkSW1hZ2UoZGF0YSl9XCI+YCxcbiAgICAgICQoXCIuXCIgKyBvcHRpb25zLmhhbmQpLmFwcGVuZChodG1sKVxuICAgICk7XG4gICAgaWYgKG9wdGlvbnMucGVyc29uID09PSBcImRlYWxlclwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbWFnZSkge1xuICAgICAgICBnYW1lLmRlYWxlci5jYXJkcy51bnNoaWZ0KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2FtZS5kZWFsZXIuY2FyZHMucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB9XG4gICAgICBjaGVja1RvdGFsKFwiZGVhbGVyXCIpO1xuICAgICAgY29uc29sZS5sb2coYGRlYWxlciAtICR7Z2FtZS5kZWFsZXIuY2FyZHN9ICoqKiogZGVhbGVyIGlzIGF0ICR7Z2FtZS5kZWFsZXIudG90YWx9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdhbWVbb3B0aW9ucy5oYW5kXS5jYXJkcy5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICBjaGVja1RvdGFsKG9wdGlvbnMuaGFuZCk7XG4gICAgICBjb25zb2xlLmxvZyhgJHtvcHRpb25zLmhhbmR9IC0gJHtnYW1lW29wdGlvbnMuaGFuZF0uY2FyZHN9ICoqKiogJHtvcHRpb25zLmhhbmR9IGlzIGF0ICR7Z2FtZS5wbGF5ZXJUb3RhbH1gKTtcbiAgICB9XG4gICAgY2hlY2tWaWN0b3J5KG9wdGlvbnMuaGFuZCk7XG4gICAgdHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucy5jYWxsYmFjaygpO1xuICB9KTtcbiAgY2FyZHNMZWZ0LS07XG59XG5cbmZ1bmN0aW9uIGhpdCgpIHtcbiAgY29uc29sZS5sb2coXCJoaXRcIik7XG4gIGRyYXdDYXJkKHtcbiAgICBwZXJzb246IFwicGxheWVyXCIsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChpc0RvdWJsZWREb3duICYmICFnYW1lLndpbm5lcikge1xuICAgICAgICBzdGF5KCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGlzRmlyc3RUdXJuKSB7XG4gICAgaXNGaXJzdFR1cm4gPSBmYWxzZTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiaWRcIiwgXCJkb3VibGVEb3duLWRpc2FibGVkXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXkoKSB7XG4gIGlmICghZ2FtZS53aW5uZXIgJiYgZ2FtZS5kZWFsZXJUb3RhbCA8IDE3KSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGl0c1wiKTtcbiAgICBpc1BsYXllcnNUdXJuID0gZmFsc2U7XG4gICAgZHJhd0NhcmQoe1xuICAgICAgcGVyc29uOiBcImRlYWxlclwiLFxuICAgICAgY2FsbGJhY2s6IHN0YXlcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsID09PSBnYW1lLnBsYXllclRvdGFsKSB7XG4gICAgZ2FtZS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICBhbm5vdW5jZShcIlBVU0hcIik7XG4gICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xuICAgIGdhbWVFbmQoKTtcbiAgfSBlbHNlIGlmIChnYW1lLmRlYWxlclRvdGFsIDwgMjIpIHtcbiAgICBnYW1lLmRlYWxlclRvdGFsID4gZ2FtZS5wbGF5ZXJUb3RhbCA/IChcbiAgICAgIGdhbWUud2lubmVyID0gXCJkZWFsZXJcIixcbiAgICAgIGFubm91bmNlKFwiWU9VIExPU0VcIiksXG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApIDogKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcInBsYXllclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgV0lOXCIpLFxuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIGdhbWUucGxheWVyVG90YWwgKyBcIiBiZWF0cyBkZWFsZXIncyBcIiArIGdhbWUuZGVhbGVyVG90YWwpLFxuICAgICAgZ2FtZUVuZCgpXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1NwbGl0VG90YWwoaGFuZE51bSkge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZCA9IGhhbmROdW0gPT09IFwiaGFuZDFcIiA/IGdhbWUuc3BsaXRIYW5kMSA6IGdhbWUuc3BsaXRIYW5kMjtcbiAgdmFyIGFjZXMgPSAwO1xuXG4gIGhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG5cbiAgaGFuZE51bSA9PT0gXCJoYW5kMVwiID8gKFxuICAgIGdhbWUuc3BsaXRIYW5kMVRvdGFsID0gdG90YWwsXG4gICAgJGhhbmQxVG90YWwudGV4dChnYW1lLnNwbGl0SGFuZDFUb3RhbClcbiAgKSA6IChcbiAgICBnYW1lLnNwbGl0SGFuZDJUb3RhbCA9IHRvdGFsLFxuICAgICRoYW5kMlRvdGFsLnRleHQoZ2FtZS5zcGxpdEhhbmQyVG90YWwpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwocGVyc29uKSB7XG4gIHZhciB0b3RhbCA9IDA7XG4gIHZhciBoYW5kID0gcGVyc29uID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXJIYW5kIDogZ2FtZS5wbGF5ZXJIYW5kO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICB0b3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgdG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH0gZWxzZSBpZiAoY2FyZCA9PT0gXCJBQ0VcIikge1xuICAgICAgYWNlcyArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGFjZXMgPiAwKSB7XG4gICAgaWYgKHRvdGFsICsgYWNlcyArIDEwID4gMjEpIHtcbiAgICAgIHRvdGFsICs9IGFjZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvdGFsICs9IGFjZXMgKyAxMDtcbiAgICB9XG4gIH1cblxuICB2YXIgdGV4dENvbG9yID0gXCJ3aGl0ZVwiXG4gIGlmICh0b3RhbCA9PT0gMjEpIHtcbiAgICB0ZXh0Q29sb3IgPSBcImxpbWVcIjtcbiAgfSBlbHNlIGlmICh0b3RhbCA+IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJyZWRcIjtcbiAgfVxuXG4gIHBlcnNvbiA9PT0gXCJkZWFsZXJcIiA/IChcbiAgICBnYW1lLmRlYWxlclRvdGFsID0gdG90YWwsXG4gICAgJGRlYWxlclRvdGFsLnRleHQoZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgJGRlYWxlclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKSA6IChcbiAgICBnYW1lLnBsYXllclRvdGFsID0gdG90YWwsXG4gICAgJHBsYXllclRvdGFsLnRleHQoZ2FtZS5wbGF5ZXJUb3RhbCksXG4gICAgJHBsYXllclRvdGFsLmNzcyhcImNvbG9yXCIsIHRleHRDb2xvcilcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KGhhbmQpIHtcbiAgLy9ndWFyZHMgYWdhaW5zdCBjaGVja2luZyBiZWZvcmUgdGhlIGRlYWwgaXMgY29tcGxldGVcbiAgaWYgKGdhbWUuZGVhbGVyLmNhcmRzLmxlbmd0aCA+PSAyICYmIGdhbWUucGxheWVyLmNhcmRzLmxlbmd0aCA+PSAyKSB7XG4gICAgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlci5jYXJkcy5sZW5ndGggPT09IDIgJiYgZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEgJiYgZ2FtZVtoYW5kXS5jYXJkcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZG91YmxlIGJsYWNramFjayBwdXNoIVwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID09PSAyICYmIGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJZT1UgTE9TRVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPT09IDIxICYmIGdhbWVbaGFuZF0uY2FyZHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgYmxhY2tqYWNrXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgZ2FtZVtoYW5kXS53YWdlciAqPSAxLjI1O1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJCTEFDS0pBQ0shXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxICYmIGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicHVzaFwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJQVVNIXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVyLmNhcmRzLmxlbmd0aCA9PT0gMiAmJiBnYW1lLmlzUGxheWVyc1R1cm4gJiYgZ2FtZVtoYW5kXS50b3RhbCA8IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgYmxhY2tqYWNrLCBkb2luZyBub3RoaW5nLi4uXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoYXMgMjFcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIllPVSBXSU5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lW2hhbmRdLnRvdGFsID09PSAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInBsYXllclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCIyMSFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lW2hhbmRdLnRvdGFsID4gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcImRlYWxlclwiO1xuICAgICAgYW5ub3VuY2UoaGFuZCwgXCJCVVNUXCIpO1xuICAgIH1cbiAgfVxuXG4vLyAgTmVlZCB0byByZXBsYWNlIHRoaXMgd2l0aCBzb21ldGhpbmcgZWxzZXdoZXJlXG5cbi8vICBnYW1lLndpbm5lciAmJiBnYW1lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIGdhbWVFbmQoKSB7XG4gIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgIGJhbmsgKz0gKGdhbWUud2FnZXIgKiAyKTtcbiAgICBjb25zb2xlLmxvZyhgZ2l2aW5nIHBsYXllciAke2dhbWUud2FnZXIgKiAyfS4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgYmFuayArPSBnYW1lLndhZ2VyO1xuICAgIGNvbnNvbGUubG9nKGByZXR1cm5pbmcgJHtnYW1lLndhZ2VyfSB0byBwbGF5ZXIuIEJhbmsgYXQgJHtiYW5rfWApO1xuICB9XG4gICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICFpc0ZsaXBwZWQgJiYgZmxpcENhcmQoKTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IHRydWU7XG4gIGlzUGxheWVyc1R1cm4gPSB0cnVlO1xuICAkZGVhbGVyVG90YWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICRoaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIGlzRG91YmxlZERvd24gPSBmYWxzZTtcbiAgJGRvdWJsZURvd24uYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbiAgJHNwbGl0LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gY2xlYXJUYWJsZSgpIHtcbiAgJChcIi5oYW5kLCAud2FnZXIsIC50b3RhbCwgLmNoaXBzXCIpLmVtcHR5KCk7XG4gICQoXCIuZGVhbGVyVG90YWwsIC5wbGF5ZXJTcGxpdCwgLnBsYXllclNwbGl0MSwgLnBsYXllclNwbGl0MiwgLnBvcHVwXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkKFwiLnBvcHVwXCIpLnJlbW92ZUNsYXNzKFwid2luIGxvc2UgcHVzaFwiKTtcbiAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS10YWJsZSBjbGVhcmVkLS0tLS0tLS0tLS0tXCIpO1xufVxuXG5mdW5jdGlvbiBjYXJkSW1hZ2UoZGF0YSkge1xuICB2YXIgY2FyZFZhbHVlID0gZGF0YS5jYXJkc1swXS52YWx1ZTtcbiAgdmFyIGNhcmRTdWl0ID0gZGF0YS5jYXJkc1swXS5zdWl0O1xuICB2YXIgZmlsZW5hbWUgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICByZXR1cm4gZmlsZW5hbWU7XG59XG5cbmZ1bmN0aW9uIGFubm91bmNlKHRleHQpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcImRlYWxlclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwibG9zZVwiKTtcbiAgICBsb3NlV2F2LmxvYWQoKTtcbiAgICBsb3NlV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwbGF5ZXJcIikge1xuICAgICRhbm5vdW5jZS5hZGRDbGFzcyhcIndpblwiKTtcbiAgICB3aW5XYXYubG9hZCgpO1xuICAgIHdpbldhdi5wbGF5KCk7XG4gIH0gZWxzZSBpZiAoZ2FtZS53aW5uZXIgPT09IFwicHVzaFwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwicHVzaFwiKTtcbiAgfVxuICAkYW5ub3VuY2VUZXh0LnRleHQodGV4dCk7XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xuICBjb25zb2xlLmxvZygnZmxpcCcpO1xuICBpc0ZsaXBwZWQgPSB0cnVlO1xuICB2YXIgJGZsaXBwZWQgPSAkKFwiLmRlYWxlciAuY2FyZEltYWdlXCIpLmZpcnN0KCk7XG4gICRmbGlwcGVkLnJlbW92ZSgpO1xuICB2YXIgaHRtbCA9IGA8aW1nIHNyYz0nJHtnYW1lLmhpZGRlbkNhcmR9JyBjbGFzcz0nY2FyZEltYWdlJz5gO1xuICAkZGVhbGVyLnByZXBlbmQoaHRtbCk7XG4gIHVwZGF0ZUNvdW50KGdhbWUuZGVhbGVySGFuZFswXSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KGNhcmQpIHtcbiAgaWYgKGlzTmFOKE51bWJlcihjYXJkKSkgfHwgY2FyZCA9PT0gXCIxMFwiKSB7XG4gICAgY291bnQgLT0gMTtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgLTEgLS0+ICR7Y291bnR9YCk7XG4gIH0gZWxzZSBpZiAoY2FyZCA8IDcpIHtcbiAgICBjb3VudCArPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCArMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkID49IDcgJiYgY2FyZCA8PSA5KSB7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICswIC0tPiAke2NvdW50fWApO1xuICB9XG4gIGdldFRydWVDb3VudCgpO1xuICBnZXRBZHZhbnRhZ2UoKTtcbiAgc2V0TmVlZGxlKCk7XG4gICRjb3VudC5lbXB0eSgpO1xuICAkY291bnQuYXBwZW5kKFwiPHA+Q291bnQ6IFwiICsgY291bnQgKyBcIjwvcD5cIik7XG4gICR0cnVlQ291bnQuZW1wdHkoKTtcbiAgJHRydWVDb3VudC5hcHBlbmQoXCI8cD5UcnVlIENvdW50OiBcIiArIHRydWVDb3VudC50b1ByZWNpc2lvbigyKSArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZUNvdW50KCkge1xuICB2YXIgZGVja3NMZWZ0ID0gY2FyZHNMZWZ0IC8gNTI7XG4gIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3NMZWZ0O1xufVxuXG5mdW5jdGlvbiBnZXRBZHZhbnRhZ2UoKSB7XG4gIGFkdmFudGFnZSA9ICh0cnVlQ291bnQgKiAuNSkgLSAuNTtcbn1cblxuZnVuY3Rpb24gc2V0TmVlZGxlKCkge1xuICB2YXIgbnVtID0gYWR2YW50YWdlICogMzY7XG4gICQoXCIuZ2F1Z2UtbmVlZGxlXCIpLmNzcyhcInRyYW5zZm9ybVwiLCBcInJvdGF0ZShcIiArIG51bSArIFwiZGVnKVwiKTtcbn1cblxuZnVuY3Rpb24gYmV0KGhhbmQsIGFtdCkge1xuICBpZiAoYmFuayA+PSBhbXQpIHtcbiAgICBnYW1lW2hhbmRdLndhZ2VyICs9IGFtdDtcbiAgICBiYW5rIC09IGFtdDtcbiAgICAkYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuICAgIGNvdW50Q2hpcHMoXCJiYW5rXCIpO1xuICAgIGNvdW50Q2hpcHMoaGFuZCk7XG4gICAgJChgLiR7aGFuZH1XYWdlcmApLnRleHQoZ2FtZVtoYW5kXS53YWdlcik7XG4gICAgY29uc29sZS5sb2coYGJldHRpbmcgJHthbXR9IG9uICR7aGFuZH1gKTtcbiAgICBjb25zb2xlLmxvZyhgJHtoYW5kfSB3YWdlciBhdCAke2dhbWVbaGFuZF0ud2FnZXJ9YCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJJbnN1ZmZpY2llbnQgZnVuZHMuXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3VudENoaXBzKGxvY2F0aW9uKSB7XG4gIHZhciBhbXQgPSBsb2NhdGlvbiA9PT0gXCJiYW5rXCIgPyBiYW5rIDogZ2FtZVtsb2NhdGlvbl0ud2FnZXI7XG4gIHZhciBudW0xMDBzID0gTWF0aC5mbG9vcihhbXQgLyAxMDApO1xuICB2YXIgbnVtNTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCkgLyA1MCk7XG4gIHZhciBudW0yNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTApIC8gMjUpO1xuICB2YXIgbnVtMTBzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUpIC8gMTApO1xuICAgdmFyIG51bTVzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCkgLyA1KTtcbiAgIHZhciBudW0xcyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUpIC8gMSk7XG4gIHZhciBudW0wNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwIC0gbnVtNXMgKiA1IC0gbnVtMXMgKiAxKSAvIC41KTtcblxuICB2YXIgaHRtbCA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMTAwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMDAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01MHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtNTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0yNXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMjUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMHM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMTAucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW01czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01LnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMXM7IGkrKykge1xuICAgIGh0bWwgKz0gXCI8aW1nIHNyYz0naW1hZ2VzL2NoaXAtMS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTA1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0wNS5wbmcnPlwiO1xuICB9O1xuXG4gIGlmIChsb2NhdGlvbiA9PT0gXCJiYW5rXCIpIHtcbiAgICAkYmFua0NoaXBzLmh0bWwoaHRtbCk7XG4gICAgJCgnLmJhbmtDaGlwcyBpbWcnKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgICQoYC4ke2xvY2F0aW9ufUNoaXBzYCkuaHRtbChodG1sKTtcbiAgICAkKGAuJHtsb2NhdGlvbn1DaGlwcyBpbWdgKS5lYWNoKGZ1bmN0aW9uKGksIGMpIHtcbiAgICAgICQoYykuY3NzKCd0b3AnLCAtNSAqIGkpO1xuICAgIH0pO1xuICB9XG59XG5cblxuLy8vLy8vLy8vLy8vL1xuLy8gVEVTVElORyAvL1xuLy8vLy8vLy8vLy8vL1xuXG4kKFwiLnRlc3REZWFsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIGJldChiZXRBbXQpO1xuICBpc0ZpcnN0VHVybiA9IHRydWU7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgaWYgKGJhbmsgPj0gYmV0QW10KSB7XG4gICAgY2xlYXJUYWJsZSgpO1xuICAgICRuZXdHYW1lLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAkaGl0LmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJHN0YXkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICBjYXJkUGFja2FnZS5sb2FkKCk7XG4gICAgY2FyZFBhY2thZ2UucGxheSgpO1xuICAgIGdldEpTT04obmV3RGVja1VSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgIH0pO1xuICB9XG4gIHZhciBkZWFsZXIxVmFsdWUgPSAkKFwiLmRlYWxlcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJWYWx1ZSA9ICQoXCIuZGVhbGVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVZhbHVlID0gJChcIi5wbGF5ZXIxVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIyVmFsdWUgPSAkKFwiLnBsYXllcjJWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjFTdWl0ID0gJChcIi5kZWFsZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjJTdWl0ID0gJChcIi5kZWFsZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjFTdWl0ID0gJChcIi5wbGF5ZXIxU3VpdFwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJTdWl0ID0gJChcIi5wbGF5ZXIyU3VpdFwiKS52YWwoKTtcbiAgdmFyIGRlYWxlcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGRlYWxlcjFWYWx1ZSArIFwiX29mX1wiICsgZGVhbGVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgZGVhbGVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMlZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBwbGF5ZXIxID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBwbGF5ZXIxVmFsdWUgKyBcIl9vZl9cIiArIHBsYXllcjFTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjIgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjJWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMlN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKHBsYXllcjEpO1xuICBnYW1lLnNwbGl0Q2FyZEltYWdlcy5wdXNoKHBsYXllcjIpO1xuICBnYW1lLmRlYWxlckhhbmQgPSBbZGVhbGVyMVZhbHVlLCBkZWFsZXIyVmFsdWVdO1xuICBnYW1lLnBsYXllckhhbmQgPSBbcGxheWVyMVZhbHVlLCBwbGF5ZXIyVmFsdWVdO1xuICBnYW1lLmhpZGRlbkNhcmQgPSBkZWFsZXIxO1xuICAkZGVhbGVyLnByZXBlbmQoYDxpbWcgc3JjPScke2NhcmRCYWNrfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtkZWFsZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIxfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gICRwbGF5ZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtwbGF5ZXIyfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIGNoZWNrVG90YWwoXCJkZWFsZXJcIik7XG4gIGNoZWNrVG90YWwoXCJwbGF5ZXJcIik7XG4gIGNoZWNrVmljdG9yeSgpO1xuICBjaGVja1NwbGl0KCk7XG59KTtcblxuJChcIi5naXZlQ2FyZFwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgZ2l2ZUNhcmQoJCh0aGlzKS5hdHRyKFwiZGF0YS1pZFwiKSk7XG59KVxuXG4vLyAkKCcuZGVhbGVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdpdmVDYXJkKCdkZWFsZXInKTtcbi8vIH0pO1xuXG4vLyAkKCcucGxheWVyR2l2ZUNhcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4vLyAgIGdpdmVDYXJkKCdwbGF5ZXInKTtcbi8vIH0pO1xuXG5mdW5jdGlvbiBnaXZlQ2FyZChoYW5kKSB7XG4gIHZhciBjYXJkVmFsdWUgPSAkKCcuZ2l2ZUNhcmRWYWx1ZScpLnZhbCgpO1xuICB2YXIgY2FyZFN1aXQgPSAkKCcuZ2l2ZUNhcmRTdWl0JykudmFsKCk7XG4gIHZhciBjYXJkU3JjID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBjYXJkVmFsdWUgKyBcIl9vZl9cIiArIGNhcmRTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcblxuICAvL1RoaXMgaXMgbWF5YmUgaG93IGl0IGNhbiBsb29rIGluIHRoZSBmdXR1cmU6XG4gIC8vZ2FtZS5oYW5kW2hhbmRdLnB1c2goY2FyZFZhbHVlKTtcbiAgLy9jaGVja1RvdGFsKGhhbmQpO1xuICAvLyQoaGFuZCkuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG5cbiAgaWYgKHBlcnNvbiA9PT0gJ2RlYWxlcicpIHtcbiAgICBnYW1lLmRlYWxlckhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ2RlYWxlcicpO1xuICAgICRkZWFsZXIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAncGxheWVyJykge1xuICAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgncGxheWVyJyk7XG4gICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDEnKSB7XG4gICAgZ2FtZS5zcGxpdDFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDEnKTtcbiAgICAkc3BsaXQxLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MicpIHtcbiAgICBnYW1lLnNwbGl0MkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MicpO1xuICAgICRzcGxpdDIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxYScpIHtcbiAgICBnYW1lLnNwbGl0MWFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDFhJyk7XG4gICAgJHNwbGl0MWEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQxYicpIHtcbiAgICBnYW1lLnNwbGl0MWJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDFiJyk7XG4gICAgJHNwbGl0MWIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyYScpIHtcbiAgICBnYW1lLnNwbGl0MmFIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDJhJyk7XG4gICAgJHNwbGl0MmEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyYicpIHtcbiAgICBnYW1lLnNwbGl0MmJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdzcGxpdDJiJyk7XG4gICAgJHNwbGl0MmIuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH1cblxuICAvLyBwZXJzb24gPT09ICdkZWFsZXInID8gKFxuICAvLyAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gIC8vICAgY2hlY2tUb3RhbCgnZGVhbGVyJyksXG4gIC8vICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICAvLyApIDogKFxuICAvLyAgIGdhbWUucGxheWVySGFuZC5wdXNoKGNhcmRWYWx1ZSksXG4gIC8vICAgY2hlY2tUb3RhbCgncGxheWVyJyksXG4gIC8vICAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKVxuICAvLyApXG4gIGNoZWNrVmljdG9yeSgpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9JztcbiAgLy8gVEhJUyBXSUxMIEFERCBUSEUgQ1JPU1MgT1JJR0lOIEhFQURFUlNcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCBKU09OUF9QUk9YWSArIHVybCk7XG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgY2IoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIl19