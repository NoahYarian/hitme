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
    checkVictory(hand);
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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3ZDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNuQyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ25DLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN6QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHekMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoRCxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEQsV0FBVyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztBQUMvRCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDckQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQzs7O0FBR3JELFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR25CLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUM1QixhQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsYUFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3BCLENBQUMsQ0FBQzs7QUFFSCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVyQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoQixLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDdEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixVQUFRLEVBQUUsQ0FBQztBQUNYLE1BQUksRUFBRSxDQUFDO0NBQ1IsQ0FBQyxDQUFDOztBQUVILFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUzQixPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDeEIsU0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsT0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsS0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ1osU0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQixlQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLEtBQUcsRUFBRSxDQUFDO0NBQ1AsQ0FBQyxDQUFDOztBQUVILENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3RDLEdBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdkMsQ0FBQyxDQUFDOztBQUVILENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ3RDLEdBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdkMsQ0FBQyxDQUFDOzs7QUFHSCxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVc7QUFDMUIsTUFBSSxnQkFBZ0IsRUFBRTtBQUNwQixLQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQixLQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNsQyxVQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztHQUMxQztDQUNGLENBQUMsQ0FBQzs7O0FBR0gsU0FBUyxJQUFJLEdBQUc7QUFDZCxNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN6QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDekIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQzFCLE1BQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0NBQzNCOztBQUVELFNBQVMsSUFBSSxHQUFHO0FBQ2QsTUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixNQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixNQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE1BQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLE1BQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0NBQzVCOztBQUVELFNBQVMsT0FBTyxHQUFHO0FBQ2pCLE1BQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLEtBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Q0FDakM7O0FBRUQsU0FBUyxJQUFJLEdBQUc7QUFDZCxrQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDekIsWUFBVSxFQUFFLENBQUM7QUFDYixPQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixHQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2xELFNBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLGFBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixhQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsTUFBSSxNQUFNLEtBQUssRUFBRSxJQUFJLFNBQVMsR0FBRyxFQUFFLEVBQUU7QUFDbkMsV0FBTyxDQUFDLFVBQVUsR0FBRyxLQUFLLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDekMsWUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdEIsYUFBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQzNDLFdBQUssRUFBRSxDQUFDO0FBQ1IsV0FBSyxHQUFHLENBQUMsQ0FBQztBQUNWLGVBQVMsR0FBRyxDQUFDLENBQUM7QUFDZCxlQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLGVBQVMsR0FBRyxDQUFDLEdBQUUsQ0FBQztLQUNqQixDQUFDLENBQUM7R0FDSixNQUFNO0FBQ0wsV0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQy9DLFNBQUssRUFBRSxDQUFDO0dBQ1Q7Q0FDRjs7QUFFRCxTQUFTLEtBQUssR0FBRztBQUNmLFVBQVEsQ0FBQztBQUNQLFFBQUksRUFBRSxRQUFRO0FBQ2QsU0FBSyxFQUFFLFFBQVE7R0FDaEIsQ0FBQyxDQUFDO0FBQ0gsVUFBUSxDQUFDO0FBQ1AsUUFBSSxFQUFFLFFBQVE7R0FDZixDQUFDLENBQUM7QUFDSCxVQUFRLENBQUM7QUFDUCxRQUFJLEVBQUUsUUFBUTtHQUNmLENBQUMsQ0FBQztBQUNILFVBQVEsQ0FBQztBQUNQLFFBQUksRUFBRSxRQUFRO0FBQ2QsWUFBUSxFQUFFLG9CQUFZO0FBQ3BCLGdCQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdEI7R0FDRixDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsTUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDdEQsUUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUMxRCxhQUFPLElBQUksQ0FBQztLQUNiLE1BQU07QUFDTCxhQUFPLElBQUksQ0FBQztLQUNiO0dBQ0YsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3pDLFFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQzNCLEtBQUMsT0FBSyxJQUFJLGVBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ2hEO0NBQ0Y7O0FBRUQsU0FBUyxLQUFLLEdBQUk7QUFDaEIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxTQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ2YsUUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixjQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLGNBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsUUFBTSxDQUFDLElBQUksa0NBQWdDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFFBQUssQ0FBQztBQUN4RSxRQUFNLENBQUMsSUFBSSxrQ0FBZ0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBSyxDQUFDO0FBQ3hFLGlCQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsaUJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixVQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ25CLFdBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUNwQjs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDdkIsTUFBSSxLQUFLLE9BQU8sSUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUM5QixNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUNuQyxJQUNFLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQzlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQ25DLEFBQUMsQ0FBQztDQUNIOztBQUVELFNBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUN6QixNQUFJLE9BQU8sUUFBTSxHQUFHLGFBQVEsTUFBTSxjQUFXLENBQUM7QUFDOUMsU0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFTLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDbEMsUUFBSSxJQUFJLENBQUM7QUFDVCxRQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxRQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxhQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsYUFBUyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pCLFdBQU8sQ0FBQyxLQUFLLElBQ1gsSUFBSSx1Q0FBa0MsT0FBTyxDQUFDLEtBQUssUUFBSSxFQUN2RCxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUMzQixJQUNFLElBQUksdUNBQWtDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBSSxFQUN6RCxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDNUIsQUFBQyxDQUFDO0FBQ0YsUUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUMvQixVQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDakIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDaEQsTUFBTTtBQUNMLFlBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLG1CQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNsQztBQUNELGdCQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckIsYUFBTyxDQUFDLEdBQUcsZUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssMkJBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFHLENBQUM7S0FDckYsTUFBTTtBQUNMLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsaUJBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLGdCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakIsYUFBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLFdBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssY0FBUyxJQUFJLGVBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUcsQ0FBQztLQUN0RjtBQUNELGdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsV0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDOUQsQ0FBQyxDQUFDO0FBQ0gsV0FBUyxFQUFFLENBQUM7Q0FDYjs7QUFFRCxTQUFTLEdBQUcsR0FBRztBQUNiLFNBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkIsVUFBUSxDQUFDO0FBQ1AsVUFBTSxFQUFFLFFBQVE7QUFDaEIsWUFBUSxFQUFFLG9CQUFZO0FBQ3BCLFVBQUksYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNqQyxZQUFJLEVBQUUsQ0FBQztPQUNSO0tBQ0Y7R0FDRixDQUFDLENBQUM7QUFDSCxNQUFJLFdBQVcsRUFBRTtBQUNmLGVBQVcsR0FBRyxLQUFLLENBQUM7QUFDcEIsZUFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsQ0FBQztHQUMvQztDQUNGOztBQUVELFNBQVMsSUFBSSxHQUFHO0FBQ2QsTUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUU7QUFDekMsV0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMzQixpQkFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixZQUFRLENBQUM7QUFDUCxZQUFNLEVBQUUsUUFBUTtBQUNoQixjQUFRLEVBQUUsSUFBSTtLQUNmLENBQUMsQ0FBQztHQUNKLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEQsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pCLFdBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsV0FBTyxFQUFFLENBQUM7R0FDWCxNQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUU7QUFDaEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFDdEIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbkYsT0FBTyxFQUFFLENBQ1gsSUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFDdEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbkYsT0FBTyxFQUFFLENBQ1gsQUFBQyxDQUFDO0dBQ0g7Q0FDRjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxXQUFXLEdBQUcsSUFBSSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzNFLE1BQUksSUFBSSxHQUFHLENBQUMsQ0FBQzs7QUFFYixhQUFXLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ2pDLFFBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDMUQsV0FBSyxJQUFJLEVBQUUsQ0FBQztLQUNiLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN2QixXQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZCLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQ3pCLFVBQUksSUFBSSxDQUFDLENBQUM7S0FDWDtHQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDWixRQUFJLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUMxQixXQUFLLElBQUksSUFBSSxDQUFDO0tBQ2YsTUFBTTtBQUNMLFdBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ3BCO0dBQ0Y7O0FBRUQsTUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFBO0FBQ3ZCLE1BQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNoQixhQUFTLEdBQUcsTUFBTSxDQUFDO0dBQ3BCLE1BQU0sSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFO0FBQ3JCLGFBQVMsR0FBRyxLQUFLLENBQUM7R0FDbkI7O0FBRUQsTUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDekIsR0FBQyxPQUFLLElBQUksV0FBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3hEOztBQUVELFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRTs7QUFFMUIsTUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDbEUsUUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUgsYUFBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzNCLGNBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ2hHLGFBQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM3QixjQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzVCLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDbkUsYUFBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0FBQ3pCLGNBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDOUIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUM5RCxhQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzNCLGNBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDeEIsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUU7QUFDcEgsYUFBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQ3ZELE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7QUFDbkMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM3QixjQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzVCLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUU7QUFDakMsYUFBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUM3QixjQUFRLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNCLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNsQyxhQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQzdCLGNBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdkIsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO0FBQ2hDLGFBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDN0IsY0FBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4QjtHQUNGOzs7OztBQUFBLENBS0Y7O0FBRUQsU0FBUyxPQUFPLEdBQUc7QUFDakIsTUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM1QixRQUFJLElBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEFBQUMsQ0FBQztBQUN6QixXQUFPLENBQUMsR0FBRyxvQkFBa0IsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLGtCQUFhLElBQUksQ0FBRyxDQUFDO0dBQ2pFLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtBQUNqQyxRQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixXQUFPLENBQUMsR0FBRyxnQkFBYyxJQUFJLENBQUMsS0FBSyw0QkFBdUIsSUFBSSxDQUFHLENBQUM7R0FDbkU7QUFDRCxZQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqQyxHQUFDLFNBQVMsSUFBSSxRQUFRLEVBQUUsQ0FBQztBQUN6QixrQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDeEIsZUFBYSxHQUFHLElBQUksQ0FBQztBQUNyQixjQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLFVBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLE1BQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVCLE9BQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLGVBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsYUFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsY0FBWSxHQUFHLEtBQUssQ0FBQztBQUNyQixRQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUMvQjs7QUFFRCxTQUFTLFVBQVUsR0FBRztBQUNwQixHQUFDLENBQUMsK0JBQStCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMzQyxHQUFDLENBQUMsa0VBQWtFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekYsR0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN6QyxTQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Q0FDdEQ7O0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3BDLE1BQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2xDLE1BQUksUUFBUSxHQUFHLGtCQUFrQixHQUFHLFNBQVMsR0FBRyxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUN6RixTQUFPLFFBQVEsQ0FBQztDQUNqQjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsTUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM1QixhQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNmLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNoQixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDbkMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZCxVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDZixNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDakMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1QjtBQUNELGVBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxRQUFRLEdBQUc7QUFDbEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixXQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9DLFVBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQixNQUFJLElBQUksa0JBQWdCLElBQUksQ0FBQyxVQUFVLHlCQUFzQixDQUFDO0FBQzlELFNBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsYUFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDekIsTUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUN4QyxTQUFLLElBQUksQ0FBQyxDQUFDO0FBQ1gsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLDBCQUFxQixLQUFLLENBQUcsQ0FBQztHQUNsRCxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUNuQixTQUFLLElBQUksQ0FBQyxDQUFDO0FBQ1gsV0FBTyxDQUFDLEdBQUcsTUFBSSxJQUFJLDBCQUFxQixLQUFLLENBQUcsQ0FBQztHQUNsRCxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLE1BQUksSUFBSSwwQkFBcUIsS0FBSyxDQUFHLENBQUM7R0FDbEQ7QUFDRCxjQUFZLEVBQUUsQ0FBQztBQUNmLGNBQVksRUFBRSxDQUFDO0FBQ2YsV0FBUyxFQUFFLENBQUM7QUFDWixRQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixRQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDN0MsWUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25CLFlBQVUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztDQUMxRTs7QUFFRCxTQUFTLFlBQVksR0FBRztBQUN0QixNQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQy9CLFdBQVMsR0FBRyxLQUFLLEdBQUcsU0FBUyxDQUFDO0NBQy9COztBQUVELFNBQVMsWUFBWSxHQUFHO0FBQ3RCLFdBQVMsR0FBRyxBQUFDLFNBQVMsR0FBRyxHQUFFLEdBQUksR0FBRSxDQUFDO0NBQ25DOztBQUVELFNBQVMsU0FBUyxHQUFHO0FBQ25CLE1BQUksR0FBRyxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDekIsR0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztDQUMvRDs7QUFFRCxTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3RCLE1BQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtBQUNmLFFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDO0FBQ3hCLFFBQUksSUFBSSxHQUFHLENBQUM7QUFDWixjQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqQyxjQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkIsY0FBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pCLEtBQUMsT0FBSyxJQUFJLFdBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLFdBQU8sQ0FBQyxHQUFHLGNBQVksR0FBRyxZQUFPLElBQUksQ0FBRyxDQUFDO0FBQ3pDLFdBQU8sQ0FBQyxHQUFHLE1BQUksSUFBSSxrQkFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFHLENBQUM7QUFDcEQsV0FBTyxJQUFJLENBQUM7R0FDYixNQUFNO0FBQ0wsV0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ25DLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7Q0FDRjs7QUFFRCxTQUFTLFVBQVUsQ0FBQyxRQUFRLEVBQUU7QUFDNUIsTUFBSSxHQUFHLEdBQUcsUUFBUSxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNwQyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUNwRCxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2xFLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxFQUFFLENBQUMsQ0FBQztBQUMvRSxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUM1RixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pHLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxD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Q0wsUUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQztHQUNILENBQUM7QUFDRixTQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsQ0FBQyIsImZpbGUiOiJzcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBUEkgPSBcImh0dHA6Ly9kZWNrb2ZjYXJkc2FwaS5jb20vYXBpL1wiO1xudmFyIG5ld0RlY2tVUkwgPSBBUEkgKyBcInNodWZmbGUvP2RlY2tfY291bnQ9XCI7XG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi81LzUyL0NhcmRfYmFja18xNi5zdmcvMjA5cHgtQ2FyZF9iYWNrXzE2LnN2Zy5wbmdcIjtcblxudmFyIGdhbWU7XG52YXIgZGVja0lkID0gXCJcIjtcbnZhciBkZWNrcyA9IDY7XG52YXIgY291bnQgPSAwO1xudmFyIHRydWVDb3VudCA9IGNvdW50IC8gZGVja3M7XG52YXIgY2FyZHNMZWZ0ID0gNTIgKiBkZWNrcztcbnZhciBhZHZhbnRhZ2UgPSAtLjU7XG52YXIgYmFuayA9IDUwMDtcbnZhciBiZXRBbXQgPSAyNTtcbnZhciBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbi8vIHZhciBzcGxpdEFsbG93ZWQgPSBmYWxzZTtcbi8vIHZhciBpc0ZpcnN0VHVybiA9IHRydWU7XG4vLyB2YXIgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4vLyB2YXIgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuLy8gdmFyIGlzRmxpcHBlZCA9IGZhbHNlO1xuLy8gdmFyIGlzU3BsaXQgPSBmYWxzZTtcbi8vIHZhciBnYW1lSGFuZCA9IFwiXCI7XG5cbi8vZ2FtZSBidXR0b25zXG52YXIgJGRlYWwgPSAkKFwiLmRlYWxcIik7XG52YXIgJGhpdCA9ICQoXCIuaGl0XCIpO1xudmFyICRzdGF5ID0gJChcIi5zdGF5XCIpO1xudmFyICRkb3VibGUgPSAkKFwiLmRvdWJsZVwiKTtcbnZhciAkc3BsaXRCdXR0b24gPSAkKFwiLnNwbGl0QnV0dG9uXCIpO1xudmFyICRzcGxpdDFCdXR0b24gPSAkKFwiLnNwbGl0MUJ1dHRvblwiKTtcbnZhciAkc3BsaXQyQnV0dG9uID0gJChcIi5zcGxpdDJCdXR0b25cIik7XG5cbi8vY2hpcHNcbnZhciAkY2hpcDEgPSAkKFwiLmNoaXAxXCIpO1xudmFyICRjaGlwNSA9ICQoXCIuY2hpcDVcIik7XG52YXIgJGNoaXAxMCA9ICQoXCIuY2hpcDEwXCIpO1xudmFyICRjaGlwMjUgPSAkKFwiLmNoaXAyNVwiKTtcbnZhciAkY2hpcDUwID0gJChcIi5jaGlwNTBcIik7XG52YXIgJGNoaXAxMDAgPSAkKFwiLmNoaXAxMDBcIik7XG5cbi8vaW5mbyBkaXZzXG52YXIgJGNvdW50ID0gJChcIi5jb3VudFwiKTtcbnZhciAkdHJ1ZUNvdW50ID0gJChcIi50cnVlQ291bnRcIik7XG5cbi8vIENoaXAgc3RhY2tzXG52YXIgJGJhbmtDaGlwcyA9ICQoXCIuYmFua0NoaXBzXCIpO1xudmFyICRwbGF5ZXJDaGlwcyA9ICQoXCIucGxheWVyQ2hpcHNcIik7XG52YXIgJHNwbGl0MUNoaXBzID0gJChcIi5zcGxpdDFDaGlwc1wiKTtcbnZhciAkc3BsaXQyQ2hpcHMgPSAkKFwiLnNwbGl0MkNoaXBzXCIpO1xudmFyICRzcGxpdDFhQ2hpcHMgPSAkKFwiLnNwbGl0MWFDaGlwc1wiKTtcbnZhciAkc3BsaXQxYkNoaXBzID0gJChcIi5zcGxpdDFiQ2hpcHNcIik7XG52YXIgJHNwbGl0MmFDaGlwcyA9ICQoXCIuc3BsaXQyYUNoaXBzXCIpO1xudmFyICRzcGxpdDJiQ2hpcHMgPSAkKFwiLnNwbGl0MmJDaGlwc1wiKTtcblxuLy8gQ2hpcCB0b3RhbHNcbnZhciAkYmFua1RvdGFsID0gJChcIi5iYW5rVG90YWxcIik7XG52YXIgJHBsYXllcldhZ2VyID0gJChcIi5wbGF5ZXJXYWdlclwiKTtcbnZhciAkc3BsaXQxV2FnZXIgPSAkKFwiLnNwbGl0MVdhZ2VyXCIpO1xudmFyICRzcGxpdDJXYWdlciA9ICQoXCIuc3BsaXQyV2FnZXJcIik7XG52YXIgJHNwbGl0MWFXYWdlciA9ICQoXCIuc3BsaXQxYVdhZ2VyXCIpO1xudmFyICRzcGxpdDFiV2FnZXIgPSAkKFwiLnNwbGl0MWJXYWdlclwiKTtcbnZhciAkc3BsaXQyYVdhZ2VyID0gJChcIi5zcGxpdDJhV2FnZXJcIik7XG52YXIgJHNwbGl0MmJXYWdlciA9ICQoXCIuc3BsaXQyYldhZ2VyXCIpO1xuXG4vL2NhcmQgaGFuZCBkaXZzXG52YXIgJGRlYWxlckhhbmQgPSAkKFwiLmRlYWxlckhhbmRcIik7XG52YXIgJHBsYXllckhhbmQgPSAkKFwiLnBsYXllckhhbmRcIik7XG52YXIgJHNwbGl0MUhhbmQgPSAkKFwiLnNwbGl0MUhhbmRcIik7XG52YXIgJHNwbGl0MkhhbmQgPSAkKFwiLnNwbGl0MkhhbmRcIik7XG52YXIgJHNwbGl0MWFIYW5kID0gJChcIi5zcGxpdDFhSGFuZFwiKTtcbnZhciAkc3BsaXQxYkhhbmQgPSAkKFwiLnNwbGl0MWJIYW5kXCIpO1xudmFyICRzcGxpdDJhSGFuZCA9ICQoXCIuc3BsaXQyYUhhbmRcIik7XG52YXIgJHNwbGl0MmJIYW5kID0gJChcIi5zcGxpdDJiSGFuZFwiKTtcblxuLy9jYXJkIGhhbmQgcGFyZW50IGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xudmFyICRzcGxpdDEgPSAkKFwiLnNwbGl0MVwiKTtcbnZhciAkc3BsaXQyID0gJChcIi5zcGxpdDJcIik7XG52YXIgJHNwbGl0MWEgPSAkKFwiLnNwbGl0MWFcIik7XG52YXIgJHNwbGl0MWIgPSAkKFwiLnNwbGl0MWJcIik7XG52YXIgJHNwbGl0MmEgPSAkKFwiLnNwbGl0MmFcIik7XG52YXIgJHNwbGl0MmIgPSAkKFwiLnNwbGl0MmJcIik7XG5cbi8vY2FyZCBzcGxpdCBwYXJlbnQgZGl2c1xudmFyICRwbGF5ZXJTcGxpdCA9ICQoXCIucGxheWVyU3BsaXRcIik7XG52YXIgJHBsYXllclNwbGl0MSA9ICQoXCIucGxheWVyU3BsaXQxXCIpO1xudmFyICRwbGF5ZXJTcGxpdDIgPSAkKFwiLnBsYXllclNwbGl0MlwiKTtcblxuLy9oYW5kIHRvdGFsIGRpdnNcbnZhciAkZGVhbGVyVG90YWwgPSAkKFwiLmRlYWxlclRvdGFsXCIpO1xudmFyICRwbGF5ZXJUb3RhbCA9ICQoXCIucGxheWVyVG90YWxcIik7XG52YXIgJHNwbGl0MVRvdGFsID0gJChcIi5zcGxpdDFUb3RhbFwiKTtcbnZhciAkc3BsaXQyVG90YWwgPSAkKFwiLnNwbGl0MlRvdGFsXCIpO1xudmFyICRzcGxpdDFhVG90YWwgPSAkKFwiLnNwbGl0MWFUb3RhbFwiKTtcbnZhciAkc3BsaXQxYlRvdGFsID0gJChcIi5zcGxpdDFiVG90YWxcIik7XG52YXIgJHNwbGl0MmFUb3RhbCA9ICQoXCIuc3BsaXQyYVRvdGFsXCIpO1xudmFyICRzcGxpdDJiVG90YWwgPSAkKFwiLnNwbGl0MmJUb3RhbFwiKTtcblxuLy8gd2luIC0gbG9zZSAtIHB1c2ggLSBibGFja2phY2sgYW5ub3VuY2UgZGl2cyBhbmQgdGV4dFxudmFyICRhbm5vdW5jZSA9ICQoXCIuYW5ub3VuY2VcIik7XG52YXIgJGFubm91bmNlVGV4dCA9ICQoXCIuYW5ub3VuY2UgcFwiKTtcbnZhciAkYW5ub3VuY2UxID0gJChcIi5hbm5vdW5jZTFcIik7XG52YXIgJGFubm91bmNlVGV4dDEgPSAkKFwiLmFubm91bmNlMSBwXCIpO1xudmFyICRhbm5vdW5jZTIgPSAkKFwiLmFubm91bmNlMlwiKTtcbnZhciAkYW5ub3VuY2VUZXh0MiA9ICQoXCIuYW5ub3VuY2UyIHBcIik7XG52YXIgJGFubm91bmNlMWEgPSAkKFwiLmFubm91bmNlMWFcIik7XG52YXIgJGFubm91bmNlVGV4dDFhID0gJChcIi5hbm5vdW5jZTFhIHBcIik7XG52YXIgJGFubm91bmNlMWIgPSAkKFwiLmFubm91bmNlMWJcIik7XG52YXIgJGFubm91bmNlVGV4dDFiID0gJChcIi5hbm5vdW5jZTFiIHBcIik7XG52YXIgJGFubm91bmNlMmEgPSAkKFwiLmFubm91bmNlMmFcIik7XG52YXIgJGFubm91bmNlVGV4dDJhID0gJChcIi5hbm5vdW5jZTJhIHBcIik7XG52YXIgJGFubm91bmNlMmIgPSAkKFwiLmFubm91bmNlMmJcIik7XG52YXIgJGFubm91bmNlVGV4dDJiID0gJChcIi5hbm5vdW5jZTJiIHBcIik7XG5cbi8vY3JlYXRlIGF1ZGlvIGVsZW1lbnRzXG52YXIgY2FyZFBsYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmNhcmRQbGFjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZFBsYWNlMS53YXYnKTtcbnZhciBjYXJkUGFja2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5jYXJkUGFja2FnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2FyZE9wZW5QYWNrYWdlMi53YXYnKTtcbnZhciBidXR0b25DbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG5idXR0b25DbGljay5zZXRBdHRyaWJ1dGUoJ3NyYycsICdzb3VuZHMvY2xpY2sxLndhdicpO1xudmFyIHdpbldhdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG53aW5XYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NoaXBzSGFuZGxlNS53YXYnKTtcbnZhciBsb3NlV2F2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbmxvc2VXYXYuc2V0QXR0cmlidXRlKCdzcmMnLCAnc291bmRzL2NhcmRTaG92ZTMud2F2Jyk7XG5cbi8vcG9wdWxhdGUgYmFuayBhbW91bnQgb24gcGFnZSBsb2FkXG4kYmFua1RvdGFsLnRleHQoXCJCYW5rOiBcIiArIGJhbmspO1xuY291bnRDaGlwcyhcImJhbmtcIik7XG5cbi8vYnV0dG9uIGNsaWNrIGxpc3RlbmVyc1xuJChcImJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGJ1dHRvbkNsaWNrLmxvYWQoKTtcbiAgYnV0dG9uQ2xpY2sucGxheSgpO1xufSk7XG5cbiRkZWFsLmNsaWNrKG5ld0dhbWUpO1xuXG4kaGl0LmNsaWNrKGhpdCk7XG5cbiRzdGF5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBzdGF5KCk7XG59KTtcblxuJHNwbGl0QnV0dG9uLmNsaWNrKHNwbGl0KTtcbiRzcGxpdDFCdXR0b24uY2xpY2soc3BsaXQpO1xuJHNwbGl0MkJ1dHRvbi5jbGljayhzcGxpdCk7XG5cbiRkb3VibGUuY2xpY2soZnVuY3Rpb24gKCkge1xuICAkZG91YmxlLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgYmV0KGJldEFtdCk7XG4gIGNvbnNvbGUubG9nKFwiZG91YmxlIGRvd25cIik7XG4gIGlzRG91YmxlZERvd24gPSB0cnVlO1xuICBoaXQoKTtcbn0pO1xuXG4kKFwiLnRvZ2dsZUNvdW50SW5mb1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICQoXCIuY291bnRJbmZvXCIpLnRvZ2dsZUNsYXNzKFwiaGlkZGVuXCIpO1xufSk7XG5cbiQoXCIudG9nZ2xlVGVzdFBhbmVsXCIpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgJChcIi50ZXN0UGFuZWxcIikudG9nZ2xlQ2xhc3MoXCJoaWRkZW5cIik7XG59KTtcblxuLy9jaGlwIGNsaWNrIGxpc3RlbmVyXG4kKFwiLmNoaXBcIikuY2xpY2soZnVuY3Rpb24oKSB7XG4gIGlmIChiZXRDaGFuZ2VBbGxvd2VkKSB7XG4gICAgJChcIi5jaGlwXCIpLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgICAkKHRoaXMpLmF0dHIoXCJpZFwiLCBcInNlbGVjdGVkQmV0XCIpO1xuICAgIGJldEFtdCA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgfVxufSk7XG5cbi8vZ2FtZSBvYmplY3RcbmZ1bmN0aW9uIEdhbWUoKSB7XG4gIHRoaXMuZGVhbGVyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgSGFuZCgpO1xuICB0aGlzLnNwbGl0MSA9IG5ldyBIYW5kKCk7XG4gIHRoaXMuc3BsaXQyID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDFiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJhID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5zcGxpdDJiID0gbmV3IEhhbmQoKTtcbiAgdGhpcy5pc0ZsaXBwZWQgPSBmYWxzZTtcbiAgdGhpcy5pc1BsYXllcnNUdXJuID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gSGFuZCgpIHtcbiAgdGhpcy5jYXJkcyA9IFtdO1xuICB0aGlzLmNhcmRJbWFnZXMgPSBbXTtcbiAgdGhpcy50b3RhbCA9IDA7XG4gIHRoaXMud2lubmVyID0gXCJcIjtcbiAgdGhpcy53YWdlciA9IDA7XG4gIHRoaXMuY2FuU3BsaXQgPSBmYWxzZTtcbiAgdGhpcy5pc1NwbGl0ID0gZmFsc2U7XG4gIHRoaXMuY2FuRG91YmxlID0gdHJ1ZTtcbiAgdGhpcy5pc0RvdWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5pc0N1cnJlbnRUdXJuID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gIGdhbWUgPSBuZXcgR2FtZSgpO1xuICBiZXQoXCJwbGF5ZXJcIiwgYmV0QW10KSAmJiBkZWFsKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGJldENoYW5nZUFsbG93ZWQgPSBmYWxzZTtcbiAgY2xlYXJUYWJsZSgpO1xuICAkZGVhbC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICQoXCIuaGl0LCAuc3RheSwgLmRvdWJsZVwiKS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAkZG91YmxlLmF0dHIoXCJpZFwiLCBcIlwiKTtcbiAgY2FyZFBhY2thZ2UubG9hZCgpO1xuICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gIGlmIChkZWNrSWQgPT09IFwiXCIgfHwgY2FyZHNMZWZ0IDwgMzMpIHtcbiAgICBnZXRKU09OKG5ld0RlY2tVUkwgKyBkZWNrcywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gbmV3IGRlY2tcIik7XG4gICAgICBkcmF3NCgpO1xuICAgICAgY291bnQgPSAwO1xuICAgICAgdHJ1ZUNvdW50ID0gMDtcbiAgICAgIGNhcmRzTGVmdCA9IDMxMjtcbiAgICAgIGFkdmFudGFnZSA9IC0uNTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBjdXJyZW50IGRlY2tcIik7XG4gICAgZHJhdzQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3NCgpIHtcbiAgZHJhd0NhcmQoe1xuICAgIGhhbmQ6IFwiZGVhbGVyXCIsXG4gICAgaW1hZ2U6IGNhcmRCYWNrXG4gIH0pO1xuICBkcmF3Q2FyZCh7XG4gICAgaGFuZDogXCJwbGF5ZXJcIlxuICB9KTtcbiAgZHJhd0NhcmQoe1xuICAgIGhhbmQ6IFwiZGVhbGVyXCJcbiAgfSk7XG4gIGRyYXdDYXJkKHtcbiAgICBoYW5kOiBcInBsYXllclwiLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjaGVja1NwbGl0KFwicGxheWVyXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU3BsaXQoaGFuZCkge1xuICB2YXIgY2hlY2tTcGxpdEFyciA9IGdhbWVbaGFuZF0uY2FyZHMubWFwKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICByZXR1cm4gXCIxMFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FyZDtcbiAgICB9XG4gIH0pO1xuICBpZiAoY2hlY2tTcGxpdEFyclswXSA9PT0gY2hlY2tTcGxpdEFyclsxXSkge1xuICAgIGdhbWVbaGFuZF0uY2FuU3BsaXQgPSB0cnVlO1xuICAgICQoYC4ke2hhbmR9ID4gYnV0dG9uYCkuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzcGxpdCAoKSB7XG4gIGdhbWUuc3BsaXRIYW5kMS5wdXNoKGdhbWUucGxheWVySGFuZFswXSk7XG4gIGdhbWUuc3BsaXRIYW5kMi5wdXNoKGdhbWUucGxheWVySGFuZFsxXSk7XG4gIGlzU3BsaXQgPSB0cnVlO1xuICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAkcGxheWVyLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAkcGxheWVyVG90YWwuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICRwbGF5ZXJTcGxpdC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJGhhbmQxLmh0bWwoYDxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPScke2dhbWUuc3BsaXRDYXJkSW1hZ2VzWzBdfSc+YCk7XG4gICRoYW5kMi5odG1sKGA8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nJHtnYW1lLnNwbGl0Q2FyZEltYWdlc1sxXX0nPmApO1xuICBjaGVja1NwbGl0VG90YWwoXCJoYW5kMVwiKTtcbiAgY2hlY2tTcGxpdFRvdGFsKFwiaGFuZDJcIik7XG4gIGdhbWVIYW5kID0gXCJoYW5kMVwiO1xuICBoaWdobGlnaHQoXCJoYW5kMVwiKTtcbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0KGhhbmQpIHtcbiAgaGFuZCA9PT0gXCJoYW5kMVwiID8gKFxuICAgICRoYW5kMS5hZGRDbGFzcyhcImhpZ2hsaWdodGVkXCIpLFxuICAgICRoYW5kMi5yZW1vdmVDbGFzcyhcImhpZ2hsaWdodGVkXCIpXG4gICkgOiAoXG4gICAgJGhhbmQyLmFkZENsYXNzKFwiaGlnaGxpZ2h0ZWRcIiksXG4gICAgJGhhbmQxLnJlbW92ZUNsYXNzKFwiaGlnaGxpZ2h0ZWRcIilcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd0NhcmQob3B0aW9ucykge1xuICB2YXIgY2FyZFVSTCA9IGAke0FQSX1kcmF3LyR7ZGVja0lkfS8/Y291bnQ9MWA7XG4gIGdldEpTT04oY2FyZFVSTCwgZnVuY3Rpb24oZGF0YSwgY2IpIHtcbiAgICB2YXIgaHRtbDtcbiAgICB2YXIgaGFuZCA9IG9wdGlvbnMuaGFuZDtcbiAgICB2YXIgY2FyZEltYWdlU3JjID0gY2FyZEltYWdlKGRhdGEpO1xuICAgIGdhbWVbaGFuZF0uY2FyZEltYWdlcy5wdXNoKGNhcmRJbWFnZVNyYyk7XG4gICAgY2FyZFBsYWNlLmxvYWQoKTtcbiAgICBjYXJkUGxhY2UucGxheSgpO1xuICAgIG9wdGlvbnMuaW1hZ2UgPyAoXG4gICAgICBodG1sID0gYDxpbWcgY2xhc3M9XCJjYXJkSW1hZ2VcIiBzcmM9XCIke29wdGlvbnMuaW1hZ2V9XCI+YCxcbiAgICAgICRkZWFsZXJIYW5kLnByZXBlbmQoaHRtbClcbiAgICApIDogKFxuICAgICAgaHRtbCA9IGA8aW1nIGNsYXNzPVwiY2FyZEltYWdlXCIgc3JjPVwiJHtjYXJkSW1hZ2UoZGF0YSl9XCI+YCxcbiAgICAgICQoXCIuXCIgKyBoYW5kKS5hcHBlbmQoaHRtbClcbiAgICApO1xuICAgIGlmIChvcHRpb25zLnBlcnNvbiA9PT0gXCJkZWFsZXJcIikge1xuICAgICAgaWYgKG9wdGlvbnMuaW1hZ2UpIHtcbiAgICAgICAgZ2FtZS5kZWFsZXIuY2FyZHMudW5zaGlmdChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdhbWUuZGVhbGVyLmNhcmRzLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICAgIHVwZGF0ZUNvdW50KGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgICAgfVxuICAgICAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgICAgIGNvbnNvbGUubG9nKGBkZWFsZXIgLSAke2dhbWUuZGVhbGVyLmNhcmRzfSAqKioqIGRlYWxlciBpcyBhdCAke2dhbWUuZGVhbGVyLnRvdGFsfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBnYW1lW2hhbmRdLmNhcmRzLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICB1cGRhdGVDb3VudChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIGNoZWNrVG90YWwoaGFuZCk7XG4gICAgICBjb25zb2xlLmxvZyhgJHtoYW5kfSAtICR7Z2FtZVtoYW5kXS5jYXJkc30gKioqKiAke2hhbmR9IGlzIGF0ICR7Z2FtZS5wbGF5ZXIudG90YWx9YCk7XG4gICAgfVxuICAgIGNoZWNrVmljdG9yeShoYW5kKTtcbiAgICB0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNhbGxiYWNrKCk7XG4gIH0pO1xuICBjYXJkc0xlZnQtLTtcbn1cblxuZnVuY3Rpb24gaGl0KCkge1xuICBjb25zb2xlLmxvZyhcImhpdFwiKTtcbiAgZHJhd0NhcmQoe1xuICAgIHBlcnNvbjogXCJwbGF5ZXJcIixcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGlzRG91YmxlZERvd24gJiYgIWdhbWUud2lubmVyKSB7XG4gICAgICAgIHN0YXkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAoaXNGaXJzdFR1cm4pIHtcbiAgICBpc0ZpcnN0VHVybiA9IGZhbHNlO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJpZFwiLCBcImRvdWJsZURvd24tZGlzYWJsZWRcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RheSgpIHtcbiAgaWYgKCFnYW1lLndpbm5lciAmJiBnYW1lLmRlYWxlclRvdGFsIDwgMTcpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlYWxlciBoaXRzXCIpO1xuICAgIGlzUGxheWVyc1R1cm4gPSBmYWxzZTtcbiAgICBkcmF3Q2FyZCh7XG4gICAgICBwZXJzb246IFwiZGVhbGVyXCIsXG4gICAgICBjYWxsYmFjazogc3RheVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPT09IGdhbWUucGxheWVyVG90YWwpIHtcbiAgICBnYW1lLndpbm5lciA9IFwicHVzaFwiO1xuICAgIGFubm91bmNlKFwiUFVTSFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XG4gICAgZ2FtZUVuZCgpO1xuICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyVG90YWwgPCAyMikge1xuICAgIGdhbWUuZGVhbGVyVG90YWwgPiBnYW1lLnBsYXllclRvdGFsID8gKFxuICAgICAgZ2FtZS53aW5uZXIgPSBcImRlYWxlclwiLFxuICAgICAgYW5ub3VuY2UoXCJZT1UgTE9TRVwiKSxcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgXCIgKyBnYW1lLmRlYWxlclRvdGFsICsgXCIgYmVhdHMgcGxheWVyJ3MgXCIgKyBnYW1lLnBsYXllclRvdGFsKSxcbiAgICAgIGdhbWVFbmQoKVxuICAgICkgOiAoXG4gICAgICBnYW1lLndpbm5lciA9IFwicGxheWVyXCIsXG4gICAgICBhbm5vdW5jZShcIllPVSBXSU5cIiksXG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIFwiICsgZ2FtZS5wbGF5ZXJUb3RhbCArIFwiIGJlYXRzIGRlYWxlcidzIFwiICsgZ2FtZS5kZWFsZXJUb3RhbCksXG4gICAgICBnYW1lRW5kKClcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrVG90YWwoaGFuZCkge1xuICB2YXIgdG90YWwgPSAwO1xuICB2YXIgaGFuZFRvQ2hlY2sgPSBoYW5kID09PSBcImRlYWxlclwiID8gZ2FtZS5kZWFsZXIuY2FyZHMgOiBnYW1lW2hhbmRdLmNhcmRzO1xuICB2YXIgYWNlcyA9IDA7XG5cbiAgaGFuZFRvQ2hlY2suZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgdG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9IGVsc2UgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGFjZXMgKz0gMTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChhY2VzID4gMCkge1xuICAgIGlmICh0b3RhbCArIGFjZXMgKyAxMCA+IDIxKSB7XG4gICAgICB0b3RhbCArPSBhY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbCArPSBhY2VzICsgMTA7XG4gICAgfVxuICB9XG5cbiAgdmFyIHRleHRDb2xvciA9IFwid2hpdGVcIlxuICBpZiAodG90YWwgPT09IDIxKSB7XG4gICAgdGV4dENvbG9yID0gXCJsaW1lXCI7XG4gIH0gZWxzZSBpZiAodG90YWwgPiAyMSkge1xuICAgIHRleHRDb2xvciA9IFwicmVkXCI7XG4gIH1cblxuICBnYW1lW2hhbmRdLnRvdGFsID0gdG90YWw7XG4gICQoYC4ke2hhbmR9VG90YWxgKS50ZXh0KHRvdGFsKS5jc3MoXCJjb2xvclwiLCB0ZXh0Q29sb3IpO1xufVxuXG5mdW5jdGlvbiBjaGVja1ZpY3RvcnkoaGFuZCkge1xuICAvL2d1YXJkcyBhZ2FpbnN0IGNoZWNraW5nIGJlZm9yZSB0aGUgZGVhbCBpcyBjb21wbGV0ZVxuICBpZiAoZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID49IDIgJiYgZ2FtZS5wbGF5ZXIuY2FyZHMubGVuZ3RoID49IDIpIHtcbiAgICBpZiAoZ2FtZS5kZWFsZXIudG90YWwgPT09IDIxICYmIGdhbWUuZGVhbGVyLmNhcmRzLmxlbmd0aCA9PT0gMiAmJiBnYW1lW2hhbmRdLnRvdGFsID09PSAyMSAmJiBnYW1lW2hhbmRdLmNhcmRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc29sZS5sb2coXCJkb3VibGUgYmxhY2tqYWNrIHB1c2ghXCIpO1xuICAgICAgZ2FtZVtoYW5kXS53aW5uZXIgPSBcInB1c2hcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiUFVTSFwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWUuZGVhbGVyLnRvdGFsID09PSAyMSAmJiBnYW1lLmRlYWxlci5jYXJkcy5sZW5ndGggPT09IDIgJiYgZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIllPVSBMT1NFXCIpO1xuICAgIH0gZWxzZSBpZiAoZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEgJiYgZ2FtZVtoYW5kXS5jYXJkcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyBibGFja2phY2tcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBnYW1lW2hhbmRdLndhZ2VyICo9IDEuMjU7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIkJMQUNLSkFDSyFcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZVtoYW5kXS50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwdXNoXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIlBVU0hcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEgJiYgZ2FtZS5kZWFsZXIuY2FyZHMubGVuZ3RoID09PSAyICYmIGdhbWUuaXNQbGF5ZXJzVHVybiAmJiBnYW1lW2hhbmRdLnRvdGFsIDwgMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyBibGFja2phY2ssIGRvaW5nIG5vdGhpbmcuLi5cIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA9PT0gMjEpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJkZWFsZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiWU9VIExPU0VcIik7XG4gICAgfSBlbHNlIGlmIChnYW1lLmRlYWxlci50b3RhbCA+IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImRlYWxlciBidXN0c1wiKTtcbiAgICAgIGdhbWVbaGFuZF0ud2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAgIGFubm91bmNlKGhhbmQsIFwiWU9VIFdJTlwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPT09IDIxKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllciBoYXMgMjFcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwicGxheWVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIjIxIVwiKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVbaGFuZF0udG90YWwgPiAyMSkge1xuICAgICAgY29uc29sZS5sb2coXCJwbGF5ZXIgYnVzdHNcIik7XG4gICAgICBnYW1lW2hhbmRdLndpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgICBhbm5vdW5jZShoYW5kLCBcIkJVU1RcIik7XG4gICAgfVxuICB9XG5cbi8vICBOZWVkIHRvIHJlcGxhY2UgdGhpcyB3aXRoIHNvbWV0aGluZyBlbHNld2hlcmVcblxuLy8gIGdhbWUud2lubmVyICYmIGdhbWVFbmQoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUVuZCgpIHtcbiAgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgYmFuayArPSAoZ2FtZS53YWdlciAqIDIpO1xuICAgIGNvbnNvbGUubG9nKGBnaXZpbmcgcGxheWVyICR7Z2FtZS53YWdlciAqIDJ9LiBCYW5rIGF0ICR7YmFua31gKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICBiYW5rICs9IGdhbWUud2FnZXI7XG4gICAgY29uc29sZS5sb2coYHJldHVybmluZyAke2dhbWUud2FnZXJ9IHRvIHBsYXllci4gQmFuayBhdCAke2Jhbmt9YCk7XG4gIH1cbiAgJGJhbmtUb3RhbC50ZXh0KFwiQmFuazogXCIgKyBiYW5rKTtcbiAgIWlzRmxpcHBlZCAmJiBmbGlwQ2FyZCgpO1xuICBiZXRDaGFuZ2VBbGxvd2VkID0gdHJ1ZTtcbiAgaXNQbGF5ZXJzVHVybiA9IHRydWU7XG4gICRkZWFsZXJUb3RhbC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgJGhpdC5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICRzdGF5LmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgaXNEb3VibGVkRG93biA9IGZhbHNlO1xuICAkZG91YmxlRG93bi5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gIHNwbGl0QWxsb3dlZCA9IGZhbHNlO1xuICAkc3BsaXQuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkKFwiLmhhbmQsIC53YWdlciwgLnRvdGFsLCAuY2hpcHNcIikuZW1wdHkoKTtcbiAgJChcIi5kZWFsZXJUb3RhbCwgLnBsYXllclNwbGl0LCAucGxheWVyU3BsaXQxLCAucGxheWVyU3BsaXQyLCAucG9wdXBcIikuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICQoXCIucG9wdXBcIikucmVtb3ZlQ2xhc3MoXCJ3aW4gbG9zZSBwdXNoXCIpO1xuICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLXRhYmxlIGNsZWFyZWQtLS0tLS0tLS0tLS1cIik7XG59XG5cbmZ1bmN0aW9uIGNhcmRJbWFnZShkYXRhKSB7XG4gIHZhciBjYXJkVmFsdWUgPSBkYXRhLmNhcmRzWzBdLnZhbHVlO1xuICB2YXIgY2FyZFN1aXQgPSBkYXRhLmNhcmRzWzBdLnN1aXQ7XG4gIHZhciBmaWxlbmFtZSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgY2FyZFZhbHVlICsgXCJfb2ZfXCIgKyBjYXJkU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHJldHVybiBmaWxlbmFtZTtcbn1cblxuZnVuY3Rpb24gYW5ub3VuY2UodGV4dCkge1xuICBpZiAoZ2FtZS53aW5uZXIgPT09IFwiZGVhbGVyXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJsb3NlXCIpO1xuICAgIGxvc2VXYXYubG9hZCgpO1xuICAgIGxvc2VXYXYucGxheSgpO1xuICB9IGVsc2UgaWYgKGdhbWUud2lubmVyID09PSBcInBsYXllclwiKSB7XG4gICAgJGFubm91bmNlLmFkZENsYXNzKFwid2luXCIpO1xuICAgIHdpbldhdi5sb2FkKCk7XG4gICAgd2luV2F2LnBsYXkoKTtcbiAgfSBlbHNlIGlmIChnYW1lLndpbm5lciA9PT0gXCJwdXNoXCIpIHtcbiAgICAkYW5ub3VuY2UuYWRkQ2xhc3MoXCJwdXNoXCIpO1xuICB9XG4gICRhbm5vdW5jZVRleHQudGV4dCh0ZXh0KTtcbn1cblxuZnVuY3Rpb24gZmxpcENhcmQoKSB7XG4gIGNvbnNvbGUubG9nKCdmbGlwJyk7XG4gIGlzRmxpcHBlZCA9IHRydWU7XG4gIHZhciAkZmxpcHBlZCA9ICQoXCIuZGVhbGVyIC5jYXJkSW1hZ2VcIikuZmlyc3QoKTtcbiAgJGZsaXBwZWQucmVtb3ZlKCk7XG4gIHZhciBodG1sID0gYDxpbWcgc3JjPScke2dhbWUuaGlkZGVuQ2FyZH0nIGNsYXNzPSdjYXJkSW1hZ2UnPmA7XG4gICRkZWFsZXIucHJlcGVuZChodG1sKTtcbiAgdXBkYXRlQ291bnQoZ2FtZS5kZWFsZXJIYW5kWzBdKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoY2FyZCkge1xuICBpZiAoaXNOYU4oTnVtYmVyKGNhcmQpKSB8fCBjYXJkID09PSBcIjEwXCIpIHtcbiAgICBjb3VudCAtPSAxO1xuICAgIGNvbnNvbGUubG9nKGAke2NhcmR9IC0tPiBjb3VudCAtMSAtLT4gJHtjb3VudH1gKTtcbiAgfSBlbHNlIGlmIChjYXJkIDwgNykge1xuICAgIGNvdW50ICs9IDE7XG4gICAgY29uc29sZS5sb2coYCR7Y2FyZH0gLS0+IGNvdW50ICsxIC0tPiAke2NvdW50fWApO1xuICB9IGVsc2UgaWYgKGNhcmQgPj0gNyAmJiBjYXJkIDw9IDkpIHtcbiAgICBjb25zb2xlLmxvZyhgJHtjYXJkfSAtLT4gY291bnQgKzAgLS0+ICR7Y291bnR9YCk7XG4gIH1cbiAgZ2V0VHJ1ZUNvdW50KCk7XG4gIGdldEFkdmFudGFnZSgpO1xuICBzZXROZWVkbGUoKTtcbiAgJGNvdW50LmVtcHR5KCk7XG4gICRjb3VudC5hcHBlbmQoXCI8cD5Db3VudDogXCIgKyBjb3VudCArIFwiPC9wPlwiKTtcbiAgJHRydWVDb3VudC5lbXB0eSgpO1xuICAkdHJ1ZUNvdW50LmFwcGVuZChcIjxwPlRydWUgQ291bnQ6IFwiICsgdHJ1ZUNvdW50LnRvUHJlY2lzaW9uKDIpICsgXCI8L3A+XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlQ291bnQoKSB7XG4gIHZhciBkZWNrc0xlZnQgPSBjYXJkc0xlZnQgLyA1MjtcbiAgdHJ1ZUNvdW50ID0gY291bnQgLyBkZWNrc0xlZnQ7XG59XG5cbmZ1bmN0aW9uIGdldEFkdmFudGFnZSgpIHtcbiAgYWR2YW50YWdlID0gKHRydWVDb3VudCAqIC41KSAtIC41O1xufVxuXG5mdW5jdGlvbiBzZXROZWVkbGUoKSB7XG4gIHZhciBudW0gPSBhZHZhbnRhZ2UgKiAzNjtcbiAgJChcIi5nYXVnZS1uZWVkbGVcIikuY3NzKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKFwiICsgbnVtICsgXCJkZWcpXCIpO1xufVxuXG5mdW5jdGlvbiBiZXQoaGFuZCwgYW10KSB7XG4gIGlmIChiYW5rID49IGFtdCkge1xuICAgIGdhbWVbaGFuZF0ud2FnZXIgKz0gYW10O1xuICAgIGJhbmsgLT0gYW10O1xuICAgICRiYW5rVG90YWwudGV4dChcIkJhbms6IFwiICsgYmFuayk7XG4gICAgY291bnRDaGlwcyhcImJhbmtcIik7XG4gICAgY291bnRDaGlwcyhoYW5kKTtcbiAgICAkKGAuJHtoYW5kfVdhZ2VyYCkudGV4dChnYW1lW2hhbmRdLndhZ2VyKTtcbiAgICBjb25zb2xlLmxvZyhgYmV0dGluZyAke2FtdH0gb24gJHtoYW5kfWApO1xuICAgIGNvbnNvbGUubG9nKGAke2hhbmR9IHdhZ2VyIGF0ICR7Z2FtZVtoYW5kXS53YWdlcn1gKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkluc3VmZmljaWVudCBmdW5kcy5cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvdW50Q2hpcHMobG9jYXRpb24pIHtcbiAgdmFyIGFtdCA9IGxvY2F0aW9uID09PSBcImJhbmtcIiA/IGJhbmsgOiBnYW1lW2xvY2F0aW9uXS53YWdlcjtcbiAgdmFyIG51bTEwMHMgPSBNYXRoLmZsb29yKGFtdCAvIDEwMCk7XG4gIHZhciBudW01MHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwKSAvIDUwKTtcbiAgdmFyIG51bTI1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCkgLyAyNSk7XG4gIHZhciBudW0xMHMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSkgLyAxMCk7XG4gICB2YXIgbnVtNXMgPSBNYXRoLmZsb29yKChhbXQgLSBudW0xMDBzICogMTAwIC0gbnVtNTBzICogNTAgLSBudW0yNXMgKiAyNSAtIG51bTEwcyAqIDEwKSAvIDUpO1xuICAgdmFyIG51bTFzID0gTWF0aC5mbG9vcigoYW10IC0gbnVtMTAwcyAqIDEwMCAtIG51bTUwcyAqIDUwIC0gbnVtMjVzICogMjUgLSBudW0xMHMgKiAxMCAtIG51bTVzICogNSkgLyAxKTtcbiAgdmFyIG51bTA1cyA9IE1hdGguZmxvb3IoKGFtdCAtIG51bTEwMHMgKiAxMDAgLSBudW01MHMgKiA1MCAtIG51bTI1cyAqIDI1IC0gbnVtMTBzICogMTAgLSBudW01cyAqIDUgLSBudW0xcyAqIDEpIC8gLjUpO1xuXG4gIHZhciBodG1sID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xMDBzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTEwMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTUwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC01MC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTI1czsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0yNS5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTEwczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xMC5wbmcnPlwiO1xuICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTUucG5nJz5cIjtcbiAgfTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW0xczsgaSsrKSB7XG4gICAgaHRtbCArPSBcIjxpbWcgc3JjPSdpbWFnZXMvY2hpcC0xLnBuZyc+XCI7XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtMDVzOyBpKyspIHtcbiAgICBodG1sICs9IFwiPGltZyBzcmM9J2ltYWdlcy9jaGlwLTA1LnBuZyc+XCI7XG4gIH07XG5cbiAgaWYgKGxvY2F0aW9uID09PSBcImJhbmtcIikge1xuICAgICRiYW5rQ2hpcHMuaHRtbChodG1sKTtcbiAgICAkKCcuYmFua0NoaXBzIGltZycpLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgJChgLiR7bG9jYXRpb259Q2hpcHNgKS5odG1sKGh0bWwpO1xuICAgICQoYC4ke2xvY2F0aW9ufUNoaXBzIGltZ2ApLmVhY2goZnVuY3Rpb24oaSwgYykge1xuICAgICAgJChjKS5jc3MoJ3RvcCcsIC01ICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG4vLy8vLy8vLy8vLy8vXG4vLyBURVNUSU5HIC8vXG4vLy8vLy8vLy8vLy8vXG5cbiQoXCIudGVzdERlYWxcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICBnYW1lID0gbmV3IEdhbWUoKTtcbiAgYmV0KGJldEFtdCk7XG4gIGlzRmlyc3RUdXJuID0gdHJ1ZTtcbiAgYmV0Q2hhbmdlQWxsb3dlZCA9IGZhbHNlO1xuICBpZiAoYmFuayA+PSBiZXRBbXQpIHtcbiAgICBjbGVhclRhYmxlKCk7XG4gICAgJG5ld0dhbWUuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICRoaXQuYXR0cihcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAkc3RheS5hdHRyKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICRkb3VibGVEb3duLmF0dHIoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgJGRvdWJsZURvd24uYXR0cihcImlkXCIsIFwiXCIpO1xuICAgIGNhcmRQYWNrYWdlLmxvYWQoKTtcbiAgICBjYXJkUGFja2FnZS5wbGF5KCk7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgfSk7XG4gIH1cbiAgdmFyIGRlYWxlcjFWYWx1ZSA9ICQoXCIuZGVhbGVyMVZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlZhbHVlID0gJChcIi5kZWFsZXIyVmFsdWVcIikudmFsKCk7XG4gIHZhciBwbGF5ZXIxVmFsdWUgPSAkKFwiLnBsYXllcjFWYWx1ZVwiKS52YWwoKTtcbiAgdmFyIHBsYXllcjJWYWx1ZSA9ICQoXCIucGxheWVyMlZhbHVlXCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMVN1aXQgPSAkKFwiLmRlYWxlcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMlN1aXQgPSAkKFwiLmRlYWxlcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMVN1aXQgPSAkKFwiLnBsYXllcjFTdWl0XCIpLnZhbCgpO1xuICB2YXIgcGxheWVyMlN1aXQgPSAkKFwiLnBsYXllcjJTdWl0XCIpLnZhbCgpO1xuICB2YXIgZGVhbGVyMSA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgZGVhbGVyMVZhbHVlICsgXCJfb2ZfXCIgKyBkZWFsZXIxU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIHZhciBkZWFsZXIyID0gXCIuLi9pbWFnZXMvY2FyZHMvXCIgKyBkZWFsZXIyVmFsdWUgKyBcIl9vZl9cIiArIGRlYWxlcjJTdWl0LnRvTG93ZXJDYXNlKCkgKyBcIi5zdmdcIjtcbiAgdmFyIHBsYXllcjEgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIHBsYXllcjFWYWx1ZSArIFwiX29mX1wiICsgcGxheWVyMVN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuICB2YXIgcGxheWVyMiA9IFwiLi4vaW1hZ2VzL2NhcmRzL1wiICsgcGxheWVyMlZhbHVlICsgXCJfb2ZfXCIgKyBwbGF5ZXIyU3VpdC50b0xvd2VyQ2FzZSgpICsgXCIuc3ZnXCI7XG4gIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2gocGxheWVyMSk7XG4gIGdhbWUuc3BsaXRDYXJkSW1hZ2VzLnB1c2gocGxheWVyMik7XG4gIGdhbWUuZGVhbGVySGFuZCA9IFtkZWFsZXIxVmFsdWUsIGRlYWxlcjJWYWx1ZV07XG4gIGdhbWUucGxheWVySGFuZCA9IFtwbGF5ZXIxVmFsdWUsIHBsYXllcjJWYWx1ZV07XG4gIGdhbWUuaGlkZGVuQ2FyZCA9IGRlYWxlcjE7XG4gICRkZWFsZXIucHJlcGVuZChgPGltZyBzcmM9JyR7Y2FyZEJhY2t9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2RlYWxlcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjF9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgJHBsYXllci5hcHBlbmQoYDxpbWcgc3JjPScke3BsYXllcjJ9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgY2hlY2tUb3RhbChcImRlYWxlclwiKTtcbiAgY2hlY2tUb3RhbChcInBsYXllclwiKTtcbiAgY2hlY2tWaWN0b3J5KCk7XG4gIGNoZWNrU3BsaXQoKTtcbn0pO1xuXG4kKFwiLmdpdmVDYXJkXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICBnaXZlQ2FyZCgkKHRoaXMpLmF0dHIoXCJkYXRhLWlkXCIpKTtcbn0pXG5cbi8vICQoJy5kZWFsZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2l2ZUNhcmQoJ2RlYWxlcicpO1xuLy8gfSk7XG5cbi8vICQoJy5wbGF5ZXJHaXZlQ2FyZCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbi8vICAgZ2l2ZUNhcmQoJ3BsYXllcicpO1xuLy8gfSk7XG5cbmZ1bmN0aW9uIGdpdmVDYXJkKGhhbmQpIHtcbiAgdmFyIGNhcmRWYWx1ZSA9ICQoJy5naXZlQ2FyZFZhbHVlJykudmFsKCk7XG4gIHZhciBjYXJkU3VpdCA9ICQoJy5naXZlQ2FyZFN1aXQnKS52YWwoKTtcbiAgdmFyIGNhcmRTcmMgPSBcIi4uL2ltYWdlcy9jYXJkcy9cIiArIGNhcmRWYWx1ZSArIFwiX29mX1wiICsgY2FyZFN1aXQudG9Mb3dlckNhc2UoKSArIFwiLnN2Z1wiO1xuXG4gIC8vVGhpcyBpcyBtYXliZSBob3cgaXQgY2FuIGxvb2sgaW4gdGhlIGZ1dHVyZTpcbiAgLy9nYW1lLmhhbmRbaGFuZF0ucHVzaChjYXJkVmFsdWUpO1xuICAvL2NoZWNrVG90YWwoaGFuZCk7XG4gIC8vJChoYW5kKS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcblxuICBpZiAocGVyc29uID09PSAnZGVhbGVyJykge1xuICAgIGdhbWUuZGVhbGVySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnZGVhbGVyJyk7XG4gICAgJGRlYWxlci5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdwbGF5ZXInKSB7XG4gICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goY2FyZFZhbHVlKTtcbiAgICBjaGVja1RvdGFsKCdwbGF5ZXInKTtcbiAgICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApO1xuICB9IGVsc2UgaWYgKHBlcnNvbiA9PT0gJ3NwbGl0MScpIHtcbiAgICBnYW1lLnNwbGl0MUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MScpO1xuICAgICRzcGxpdDEuYXBwZW5kKGA8aW1nIHNyYz0nJHtjYXJkU3JjfScgY2xhc3M9J2NhcmRJbWFnZSc+YCk7XG4gIH0gZWxzZSBpZiAocGVyc29uID09PSAnc3BsaXQyJykge1xuICAgIGdhbWUuc3BsaXQySGFuZC5wdXNoKGNhcmRWYWx1ZSk7XG4gICAgY2hlY2tUb3RhbCgnc3BsaXQyJyk7XG4gICAgJHNwbGl0Mi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDFhJykge1xuICAgIGdhbWUuc3BsaXQxYUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MWEnKTtcbiAgICAkc3BsaXQxYS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDFiJykge1xuICAgIGdhbWUuc3BsaXQxYkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MWInKTtcbiAgICAkc3BsaXQxYi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDJhJykge1xuICAgIGdhbWUuc3BsaXQyYUhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MmEnKTtcbiAgICAkc3BsaXQyYS5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfSBlbHNlIGlmIChwZXJzb24gPT09ICdzcGxpdDJiJykge1xuICAgIGdhbWUuc3BsaXQyYkhhbmQucHVzaChjYXJkVmFsdWUpO1xuICAgIGNoZWNrVG90YWwoJ3NwbGl0MmInKTtcbiAgICAkc3BsaXQyYi5hcHBlbmQoYDxpbWcgc3JjPScke2NhcmRTcmN9JyBjbGFzcz0nY2FyZEltYWdlJz5gKTtcbiAgfVxuXG4gIC8vIHBlcnNvbiA9PT0gJ2RlYWxlcicgPyAoXG4gIC8vICAgZ2FtZS5kZWFsZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgLy8gICBjaGVja1RvdGFsKCdkZWFsZXInKSxcbiAgLy8gICAkZGVhbGVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gIC8vICkgOiAoXG4gIC8vICAgZ2FtZS5wbGF5ZXJIYW5kLnB1c2goY2FyZFZhbHVlKSxcbiAgLy8gICBjaGVja1RvdGFsKCdwbGF5ZXInKSxcbiAgLy8gICAkcGxheWVyLmFwcGVuZChgPGltZyBzcmM9JyR7Y2FyZFNyY30nIGNsYXNzPSdjYXJkSW1hZ2UnPmApXG4gIC8vIClcbiAgY2hlY2tWaWN0b3J5KCk7XG59XG5cbi8vIEpTT04gcmVxdWVzdCBmdW5jdGlvbiB3aXRoIEpTT05QIHByb3h5XG5mdW5jdGlvbiBnZXRKU09OKHVybCwgY2IpIHtcbiAgdmFyIEpTT05QX1BST1hZID0gJ2h0dHBzOi8vanNvbnAuYWZlbGQubWUvP3VybD0nO1xuICAvLyBUSElTIFdJTEwgQUREIFRIRSBDUk9TUyBPUklHSU4gSEVBREVSU1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIEpTT05QX1BST1hZICsgdXJsKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNiKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpKTtcbiAgICB9O1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn07XG4iXX0=