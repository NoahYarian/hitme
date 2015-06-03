var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=";
var cardBack = "http://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Card_back_16.svg/209px-Card_back_16.svg.png";

var game;
var deckId = "";
var decks = 6;
var count = 0;
var trueCount = count / decksLeft;
var decksLeft = cardsLeft / 52;
var cardsLeft = 52 * decks;
var advantage = -.5;
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
var cardPlace = document.createElement('audio');
cardPlace.setAttribute('src', 'sounds/cardPlace1.wav');
var cardPackage = document.createElement('audio');
cardPackage.setAttribute('src', 'sounds/cardOpenPackage2.wav');
var buttonClick = document.createElement('audio');
buttonClick.setAttribute('src', 'sounds/click1.wav');
var winWav = document.createElement('audio');
winWav.setAttribute('src', 'sounds/chipsHandle5.wav');
var loseWav = document.createElement('audio');
loseWav.setAttribute('src', 'sounds/cardShove3.wav');

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

$splitButton.click(function () {
  if (bank - betAmt >= 0) {
    if ($(".splitTesting").is(":checked")) {
      split("player", true);
    } else {
      split("player");
    }
  } else {
    console.log("Insufficient funds.");
  }
});

$split1Button.click(function () {
  if (bank - betAmt >= 0) {
    if ($(".splitTesting").is(":checked")) {
      split("split1", true);
    } else {
      split("split1");
    }
  } else {
    console.log("Insufficient funds.");
  }
});

$split2Button.click(function () {
  if (bank - betAmt >= 0) {
    if ($(".splitTesting").is(":checked")) {
      split("split2", true);
    } else {
      split("split2");
    }
  } else {
    console.log("Insufficient funds.");
  }
});

$double.click(function () {
  var hand = game.currentHand;
  if (bank - betAmt >= 0) {
    if (game[hand].isFirstTurn) {
      $double.attr("disabled", true);
      $hit.attr("disabled", true);
      $stay.attr("disabled", true);
      bet(hand, betAmt);
      console.log("double down");
      game[hand].isDoubled = true;
      hit();
    }
  } else {
    console.log("Insufficient funds.");
  }
});

$(".toggleCountInfo").click(function () {
  $(".countInfo").toggleClass("hidden");
});

$(".toggleTestPanel").click(function () {
  $(".testPanel").toggleClass("hidden");
});

//chip click listener
$(".chip").click(function() {
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
  this.currentHand = "player";
  this.handsToPlay = 1;
  this.unbustedHands = 1;
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
  this.has21 = false;
  this.isFirstTurn = true;
  this.isBusted = false;
  this.winnings = 0;
  this.charlie = false;
}

function newGame() {
  game = new Game();
  clearTable();
  bet("player", betAmt) && deal();
}

function deal() {
  betChangeAllowed = false;
  game.player.isDone = false;
  $deal.attr("disabled", true);
  $(".hit, .stay, .double").attr("disabled", false);
  $double.attr("id", "");
  cardPackage.load();
  cardPackage.play();
  if (deckId === "" || cardsLeft < 33) {
    getJSON(newDeckURL + decks, function(data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
      count = 0;
      trueCount = 0;
      cardsLeft = 312;
      advantage = -.5;
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
    hand: "player",
    callback: function () {
      $playerChips.removeClass("hidden");
      $playerWager.removeClass("hidden");
    }
  });
  drawCard({
    hand: "dealer"
  });
  drawCard({
    hand: "player",
    callback: function () {
      checkSplit("player");
    }
  });
}

function checkSplit(hand) {
  var checkSplitArr = game[hand].cards.map(function(card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      return "10";
    } else {
      return card;
    }
  });
  if (checkSplitArr[0] === checkSplitArr[1] && bank >= betAmt) {
    game[hand].canSplit = true;
    $(`.${hand} > button`).attr("disabled", false);
    $(`.${hand} > button`).removeClass("hidden");
  }
}

function split(hand, test) {
  console.log("splitting " + hand);
  var hand1;
  var hand2;
  var $button;
  if (hand === "player") {
    hand1 = "split1";
    hand2 = "split2";
    $button = $splitButton;
  } else if (hand === "split1") {
    hand1 = "split1a";
    hand2 = "split1b";
    $button = $split1Button;
  } else if (hand === "split2") {
    hand1 = "split2a";
    hand2 = "split2b";
    $button = $split2Button;
  }
  game[hand1].cards.push(game[hand].cards.shift());
  game[hand2].cards.push(game[hand].cards.shift());
  game[hand].isSplit = true;
  game[hand].isDone = true;
  game[hand1].isDone = false;
  game[hand2].isDone = false;
  $button.attr("disabled", true);
  $(`.${hand}`).addClass("hidden");
  $(`.${hand1}, .${hand2}`).removeClass("hidden");
  game[hand1].wager = betAmt;
  game[hand2].wager = betAmt;
  game[hand].wager = 0;
  bank -= betAmt;
  countChips("bank");
  $bankTotal.text("Bank: " + bank);
  countChips(hand1);
  countChips(hand2);
  $(`.${hand1}Wager`).text(game[hand1].wager);
  $(`.${hand2}Wager`).text(game[hand2].wager);
  game[hand1].cardImages.push(game[hand].cardImages.shift());
  game[hand2].cardImages.push(game[hand].cardImages.shift());
  $(`.${hand1}Hand`).append(`<img class='cardImage' src='${game[hand1].cardImages[0]}'>`);
  $(`.${hand2}Hand`).append(`<img class='cardImage' src='${game[hand2].cardImages[0]}'>`);
  if (test) {
    game[hand1].cards.push(game[hand1].cards[0]);
    game[hand2].cards.push(game[hand2].cards[0]);
    game[hand1].cardImages[1] = game[hand1].cardImages[0];
    game[hand2].cardImages[1] = game[hand2].cardImages[0];
    $(`.${hand1}Hand`).append(`<img class='cardImage' src='${game[hand1].cardImages[1]}'>`);
    $(`.${hand2}Hand`).append(`<img class='cardImage' src='${game[hand2].cardImages[1]}'>`);
    checkSplit(hand1);
    checkSplit(hand2);
    checkTotal(hand1);
    checkTotal(hand2);
  } else {
    drawCard({
      hand: hand1,
      callback: function () {
        checkSplit(hand1);
      }
    });
    drawCard({
      hand: hand2,
      callback: function () {
        checkSplit(hand2);
      }
    });
  }
  game.handsToPlay++;
  game.unbustedHands++;
  checkFocus();
  highlight(game.currentHand);
}

function checkFocus() {
  if (game.split1a.isDone === false) {
    game.currentHand = "split1a";
  } else if (game.split1b.isDone === false) {
    game.currentHand = "split1b";
  } else if (game.split1.isDone === false) {
    game.currentHand = "split1";
  } else if (game.split2a.isDone === false) {
    game.currentHand = "split2a";
  } else if (game.split2b.isDone === false) {
    game.currentHand = "split2b";
  } else if (game.split2.isDone === false) {
    game.currentHand = "split2";
  } else {
    dealerTurn();
  }
}

function highlight(hand) {
  $(".hand").removeClass("highlighted");
  $(`.${hand}Hand`).addClass("highlighted");
  game[hand].canDouble && $double.attr("disabled", false).attr("id", "");;
  $hit.attr("disabled", false);
  $stay.attr("disabled", false);
}

function drawCard(options) {
  var cardURL = `${API}draw/${deckId}/?count=1`;
  getJSON(cardURL, function(data, cb) {
    var html;
    var hand = options.hand;
    var cardImageSrc = cardImage(data);
    game[hand].cardImages.push(cardImageSrc);
    cardPlace.load();
    cardPlace.play();
    options.image ? (
      html = `<img class="cardImage" src="${options.image}">`,
      $dealerHand.prepend(html)
    ) : (
      html = `<img class="cardImage" src="${cardImageSrc}">`,
      $(`.${hand}Hand`).append(html)
    );
    if (hand === "dealer") {
      if (options.image) {
        game.dealer.cards.unshift(data.cards[0].value);
      } else {
        game.dealer.cards.push(data.cards[0].value);
        updateCount(data.cards[0].value);
      }
      checkTotal("dealer");
      console.log(`dealer - ${game.dealer.cards} **** dealer is at ${game.dealer.total}`);
    } else {
      game[hand].cards.push(data.cards[0].value);
      updateCount(data.cards[0].value);
      checkTotal(hand);
      console.log(`${hand} - ${game[hand].cards} **** ${hand} is at ${game.player.total}`);
    }
    // hand !== "dealer" && checkLoss21(hand);
    // if (hand !== "dealer" && game[hand].cards.length === 5) {
    //     game[hand].charlie = true;
    //     handEnd(hand);
    //   }
    // }
    if (hand !== "dealer") {
      checkLoss21(hand);
      if (game[hand].cards.length === 5) {
        game[hand].charlie = true;
        handEnd(hand);
      }
    }
    typeof options.callback === 'function' && options.callback();
  });
  cardsLeft--;
}

function hit() {
  console.log("hit");
  var $thisSplitButton;
  var hand = game.currentHand;
  drawCard({
    hand: hand,
    callback: function () {
      if (game[hand].isDoubled) {
        handEnd(hand);
      }
    }
  });
  if (hand === "player") {
    $thisSplitButton = $splitButton;
  } else if (hand === "split1") {
    $thisSplitButton = $split1Button;
  } else if (hand === "split2") {
    $thisSplitButton = $split2Button;
  }
  if (game[hand].isFirstTurn) {
    game[hand].isFirstTurn = false;
    $double.attr("id", "double-disabled");
    $thisSplitButton && $thisSplitButton.addClass("hidden");
  }
}

function dealerTurn() {
  flipCard();
  if (game.dealer.total < 17 && game.unbustedHands > 0 && game.player.has21 === false) {
    console.log(`dealer hits on ${game.dealer.total}`);
    drawCard({
      hand: "dealer",
      callback: function () {
        checkTotal("dealer");
        dealerTurn();
      }
    });
  } else if (game.dealer.total >= 17 || game.unbustedHands === 0 || game.player.has21 === true || game.player.charlie === true) {
    console.log(`dealer is finished with ${game.dealer.total}`);
    game.player.cards.length >= 2 && checkVictory("player");
    game.split1.cards.length >= 2 && checkVictory("split1");
    game.split2.cards.length >= 2 && checkVictory("split2");
    game.split1a.cards.length >= 2 && checkVictory("split1a");
    game.split1b.cards.length >= 2 && checkVictory("split1b");
    game.split2a.cards.length >= 2 && checkVictory("split2a");
    game.split2b.cards.length >= 2 && checkVictory("split2b");
    gameEnd();
  }
}

function checkTotal(hand) {
  var total = 0;
  var handToCheck = hand === "dealer" ? game.dealer.cards : game[hand].cards;
  var aces = 0;

  handToCheck.forEach(function(card) {
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

  var textColor = "white"
  if (total === 21) {
    textColor = "lime";
  } else if (total > 21) {
    textColor = "red";
  }

  game[hand].total = total;
  $(`.${hand}Total`).text(total).css("color", textColor);
}

function checkLoss21(hand) {
    if (game[hand].total > 21) {
      console.log("player busts");
      game[hand].winner = "dealer";
      announce(hand, "BUST");
      game.unbustedHands--
      handEnd(hand);
    } else if (game[hand].total === 21) {
      game[hand].has21 = true;
      handEnd(hand);
    }
}

function checkVictory(hand) {
    if (game[hand].charlie) {
      console.log("five card charlie!");
      game[hand].winner = "player";
      game[hand].wager *= 1.25;
      announce(hand, "5 CARD!");
    } else if (game.dealer.total === 21 && game.dealer.cards.length === 2 && game[hand].total === 21 && game[hand].cards.length === 2) {
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
      announce(hand, "21!");
    } else if (game.dealer.total === 21 && game[hand].total === 21) {
      console.log("push");
      game[hand].winner = "push";
      announce(hand, "PUSH");
    } else if (game.dealer.total === 21) {
      console.log("dealer has 21");
      game[hand].winner = "dealer";
      announce(hand, "YOU LOSE");
    } else if (game.dealer.total > 21 && game[hand].total < 22) {
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
    } else if (game.dealer.total === game[hand].total) {
      game[hand].winner = "push";
      announce(hand, "PUSH");
      console.log("push");
    } else if (game.dealer.total < 22) {
      game.dealer.total > game[hand].total ? (
        game[hand].winner = "dealer",
        announce(hand, "YOU LOSE"),
        console.log("dealer's " + game.dealer.total + " beats player's' " + game[hand].total)
      ) : (
        game[hand].winner = "player",
        announce(hand, "YOU WIN"),
        console.log("player's " + game[hand].total + " beats dealer's " + game.dealer.total)
      );
    }
  handPayout(hand);
}

function handEnd(hand) {
  game[hand].isDone = true;
  game.handsToPlay--;
  checkFocus();
  game.handsToPlay > 0 && highlight(game.currentHand);
}

function handPayout(hand) {
if (game[hand].winner === "player") {
    game[hand].winnings = game[hand].wager * 2;
    console.log(`giving player ${game[hand].wager * 2}. Bank was at ${bank}`);
  } else if (game[hand].winner === "push") {
    game[hand].winnings = game[hand].wager;
    console.log(`returning ${game[hand].wager} to player. Bank was at ${bank}`);
  }
  bank += game[hand].winnings;
  countChips(hand, true);
  game[hand].winnings > 0 ? $(`.${hand}Wager`).text(game[hand].winnings) : $(`.${hand}Wager`).empty();
  // $bankTotal.text("Bank: " + bank);
}

function gameEnd() {
  !game.isFlipped && flipCard();
  betChangeAllowed = true;
  $dealerTotal.removeClass("hidden");
  $deal.attr("disabled", false);
  $hit.attr("disabled", true);
  $stay.attr("disabled", true);
  $double.attr("disabled", true);
}

function clearTable() {
  $(".hand, .total, .chips, .wager").empty();
  $(".dealerTotal, .playerSplit, .playerSplit1, .playerSplit2, .popup, .playerChips, .playerWager").addClass("hidden");
  $player.removeClass("hidden");
  $(".popup").removeClass("win lose push");
  console.log("------------table cleared------------");
}

function cardImage(data) {
  var cardValue = data.cards[0].value;
  var cardSuit = data.cards[0].suit;
  var filename = "../images/cards/" + cardValue + "_of_" + cardSuit.toLowerCase() + ".svg";
  return filename;
}

function announce(hand, text) {
  var popupWidth = 113 + (game[hand].cards.length - 1) * 22;
  if (game[hand].winner === "dealer") {
    $(`.announce${_.capitalize(hand)}`).addClass("lose");
    loseWav.load();
    loseWav.play();
  } else if (game[hand].winner === "player") {
    $(`.announce${_.capitalize(hand)}`).addClass("win");
    winWav.load();
    winWav.play();
  } else if (game[hand].winner === "push") {
    $(`.announce${_.capitalize(hand)}`).addClass("push");
  }
  if (hand !== "player") {
    $(`.announce${_.capitalize(hand)}`).css("width", popupWidth);
    // if (text === "BLACKJACK!") {
    //   $(`.announce${_.capitalize(hand)}`).css("left", "-38px");
    //   $(`.announce${_.capitalize(hand)} > p`).css("margin-right", "-85px");
    //   $(`.announce${_.capitalize(hand)} > p`).css("font-size", "2em");
    // }
  }
  $(`.announce${_.capitalize(hand)}`).removeClass("hidden");
  $(`.announce${_.capitalize(hand)}`).html(`<p>${text}</p>`);
}

function flipCard() {
  console.log('flip');
  game.isFlipped = true;
  var $flipped = $(".dealerHand .cardImage").first();
  $flipped.remove();
  var html = `<img src='${game.dealer.cardImages[0]}' class='cardImage'>`;
  $dealerHand.prepend(html);
  updateCount(game.dealer.cards[0]);
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
    console.log(`${card} --> count -1 --> ${count}`);
  } else if (card < 7) {
    count += 1;
    console.log(`${card} --> count +1 --> ${count}`);
  } else if (card >= 7 && card <= 9) {
    console.log(`${card} --> count +0 --> ${count}`);
  }
  getTrueCount();
  getAdvantage();
  setNeedle();
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
  $trueCount.empty();
  $trueCount.append("<p>True Count: " + trueCount.toPrecision(2) + "</p>");
  $('.cardsLeft').empty();
  $('.cardsLeft').append("<p>Cards left: " + cardsLeft + "</p>");
  $('.decksLeft').empty();
  $('.decksLeft').append("<p>Decks left: " + decksLeft.toPrecision(2) + " of " + decks + "</p>");
}

function getTrueCount() {
  decksLeft = cardsLeft / 52;
  trueCount = count / decksLeft;
}

function getAdvantage() {
  advantage = (trueCount * .5) - .5;
}

function setNeedle() {
  var num = advantage * 18;
  $(".gauge-needle").css("transform", "rotate(" + num + "deg)");
}

function bet(hand, amt) {
  if (bank >= amt) {
    game[hand].wager += amt;
    bank -= amt;
    $bankTotal.text("Bank: " + bank);
    countChips("bank");
    countChips(hand);
    $(`.${hand}Wager`).text(game[hand].wager);
    console.log(`betting ${amt} on ${hand}`);
    console.log(`${hand} wager at ${game[hand].wager}`);
    return true;
  } else {
    console.log("Insufficient funds.");
    return false;
  }
}

function countChips(location, winnings) {
  var amt = location === "bank" ? bank : winnings ? game[location].winnings : game[location].wager;
  var num100s = Math.floor(amt / 100);
  var num50s = Math.floor((amt - num100s * 100) / 50);
  var num25s = Math.floor((amt - num100s * 100 - num50s * 50) / 25);
  var num10s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25) / 10);
   var num5s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10) / 5);
   var num1s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5) / 1);
  var num05s = Math.floor((amt - num100s * 100 - num50s * 50 - num25s * 25 - num10s * 10 - num5s * 5 - num1s * 1) / .5);

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
    $('.bankChips img').each(function(i, c) {
      $(c).css('top', -5 * i + 7);
    });
  } else {
    $(`.${location}Chips`).html(html);
    $(`.${location}Chips img`).each(function(i, c) {
      $(c).css('top', -5 * i + 7);
    });
  }
}


/////////////
// TESTING //
/////////////

$(".testDeal").click(function () {
  game = new Game();
  bet("player", betAmt);
  game.player.isFirstTurn = true;
  betChangeAllowed = false;
  if (bank >= betAmt) {
    clearTable();
    $deal.attr("disabled", true);
    $hit.attr("disabled", false);
    $stay.attr("disabled", false);
    $double.attr("disabled", false);
    $double.attr("id", "");
    cardPackage.load();
    cardPackage.play();
    getJSON(newDeckURL + decks, function(data) {
      deckId = data.deck_id;
    });
  }
  var dealer1Value = $(".dealer1Value").val().toUpperCase();
  var dealer2Value = $(".dealer2Value").val().toUpperCase();
  var player1Value = $(".player1Value").val().toUpperCase();
  var player2Value = $(".player2Value").val().toUpperCase();
  var dealer1Suit = $(".dealer1Suit").val();
  var dealer2Suit = $(".dealer2Suit").val();
  var player1Suit = $(".player1Suit").val();
  var player2Suit = $(".player2Suit").val();
  var dealer1 = "../images/cards/" + dealer1Value + "_of_" + dealer1Suit + ".svg";
  var dealer2 = "../images/cards/" + dealer2Value + "_of_" + dealer2Suit + ".svg";
  var player1 = "../images/cards/" + player1Value + "_of_" + player1Suit + ".svg";
  var player2 = "../images/cards/" + player2Value + "_of_" + player2Suit + ".svg";
  game.player.cardImages.push(player1);
  game.player.cardImages.push(player2);
  game.dealer.cards = [dealer1Value, dealer2Value];
  game.player.cards = [player1Value, player2Value];
  game.dealer.cardImages = [dealer1];
  $dealerHand.prepend(`<img src='${cardBack}' class='cardImage'>`);
  $dealerHand.append(`<img src='${dealer2}' class='cardImage'>`);
  $playerHand.append(`<img src='${player1}' class='cardImage'>`);
  $playerHand.append(`<img src='${player2}' class='cardImage'>`);
  checkTotal("dealer");
  checkTotal("player");
  checkLoss21("player");
  checkSplit("player");
});

$(".giveCardButton").click(giveCard);

function giveCard() {
  var cardValue = $('.giveCardValue').val();
  var cardSuit = $('.giveCardSuit').val();
  var cardSrc = "../images/cards/" + cardValue + "_of_" + cardSuit + ".svg";
  var hand = $('.giveCardToHand').val();
  game[hand].cards.push(cardValue.toUpperCase());
  checkTotal(hand);
  $(`.${hand}Hand`).append(`<img src='${cardSrc}' class='cardImage'>`);
  hand !== "dealer" && checkLoss21(hand);
}

// JSON request function with JSONP proxy
function getJSON(url, cb) {
  var JSONP_PROXY = 'https://jsonp.afeld.me/?url=';
  // THIS WILL ADD THE CROSS ORIGIN HEADERS
  var request = new XMLHttpRequest();
  request.open('GET', JSONP_PROXY + url);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      cb(JSON.parse(request.responseText));
    } else {
      cb(JSON.parse(request.responseText));
    };
  };
  request.send();
};
