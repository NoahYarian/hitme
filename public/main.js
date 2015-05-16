"use strict";

var API = "http://deckofcardsapi.com/api/";
var newDeckURL = API + "shuffle/?deck_count=6";
var deckId;

var cardBack = "http://tinyurl.com/kqzzmbr";

//buttons
var $deal = $(".deal");
var $hit = $(".hit");
var $stay = $(".stay");

//scoreboard divs
var $score = $(".score");
var $count = $(".count");

//card hand divs
var $dealer = $(".dealer");
var $player = $(".player");

var dealerHand = [];
var playerHand = [];
var playerTotal = 0;
var dealerTotal = 0;

var winner;
var score = 0;
var count = 0;

$deal.click(deal);
$hit.click(hit);
$stay.click(stay);

function deal() {
  if (!deckId) {
    getJSON(newDeckURL, function (data) {
      deckId = data.deck_id;
      console.log("About to deal from new deck");
      draw4();
    });
  } else {
    console.log("About to deal from current deck");
    draw4();
  }
}

function draw4() {
  drawCard("dealer", cardBack);
  drawCard("player");
  drawCard("dealer");
  drawCard("player");
}

function drawCard(person, image) {
  var cardURL = API + "draw/" + deckId + "/?count=1";
  getJSON(cardURL, function (data, cb) {
    if (image) {
      var html = "<img class='cardImage' src='" + image + "'>";
      $("." + person).append(html);
    } else {
      var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
      $("." + person).append(html);
    }
    if (person === "dealer") {
      dealerHand.push(data.cards[0].value);
      checkDealerTotal();
      console.log("dealer's hand - " + dealerHand + " **** dealer is at " + dealerTotal);
    } else if (person === "player") {
      playerHand.push(data.cards[0].value);
      checkPlayerTotal();
      console.log("player's hand - " + playerHand + " **** player is at " + playerTotal);
    }
    checkVictory();
    updateCount(data.cards[0].value);
  });
}

function checkPlayerTotal() {
  playerTotal = 0;
  playerHand.forEach(function (card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      playerTotal += 10;
    } else if (!isNaN(card)) {
      playerTotal += Number(card);
    }
  });
  playerHand.forEach(function (card) {
    if (card === "ACE") {
      if (playerTotal <= 10) {
        playerTotal += 11;
      } else {
        playerTotal += 1;
      }
    }
  });
}

function checkDealerTotal() {
  dealerTotal = 0;
  dealerHand.forEach(function (card) {
    if (card === "KING" || card === "QUEEN" || card === "JACK") {
      dealerTotal += 10;
    } else if (!isNaN(card)) {
      dealerTotal += Number(card);
    }
  });
  dealerHand.forEach(function (card) {
    if (card === "ACE") {
      if (dealerTotal <= 10) {
        dealerTotal += 11;
      } else {
        dealerTotal += 1;
      }
    }
  });
}

function checkVictory() {
  if (dealerTotal === 21) {
    console.log("dealer has 21");
    winner = "dealer";
    score -= 1;
  } else if (dealerTotal > 21) {
    console.log("dealer busts");
    winner = "player";
    score += 1;
  }

  if (playerTotal === 21) {
    console.log("player has 21");
    winner = "player";
    score += 1;
  } else if (playerTotal > 21) {
    console.log("player busts");
    winner = "dealer";
    score -= 1;
  }

  if (winner) {
    updateScore();
    clearTable();
  }
}

function clearTable() {
  $dealer.empty();
  $player.empty();
  dealerHand = [];
  playerHand = [];
  dealerTotal = 0;
  playerTotal = 0;
  winner = null;
  console.log("--table cleared--");
}

function hit() {
  console.log("hit");
  drawCard("player");
}

function stay() {
  console.log("stay");
  flipCard();
  if (!winner && dealerTotal < 17) {
    drawCard("dealer");
  } else {
    dealerTotal >= playerTotal ? (winner = "dealer", score -= 1, console.log("dealer's " + dealerTotal + " beats player's " + playerTotal)) : (winner = "player", score += 1, console.log("player's " + playerTotal + " beats dealer's " + dealerTotal));
  }
}

function flipCard() {}

function updateScore() {
  $score.empty();
  $score.append("<p>Score: " + score + "</p>");
}

function updateCount(card) {
  if (isNaN(Number(card)) || card === "10") {
    count -= 1;
  } else if (card < 7) {
    count += 1;
  }
  $count.empty();
  $count.append("<p>Count: " + count + "</p>");
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
    }
  };
  request.send();
}

/////////////////
//the graveyard//
/////////////////

//function hit() {
//console.log("hit");
//playerCard();
//if (!winner && dealerTotalMin < 17) {
//dealerCard();
//} else {
//if (dealerTotalMax < 22) {
//console.log("dealer stays at " + dealerTotalMax);
//} else {
//console.log("dealer stays at " + dealerTotalMin);
//}
//}
//}

//function stay() {
//console.log("stay");
//var dealerTotalFinal = (dealerTotalMax < 22) ? dealerTotalMax : dealerTotalMin;
//var playerTotalFinal = (playerTotalMax < 22) ? playerTotalMax : playerTotalMin;

//if (dealerTotalMin < 17) {
//dealerCard();
//} else {
//dealerTotalFinal >= playerTotalFinal ?
//(winner = "dealer", score -= 1, console.log("dealer's " + dealerTotalFinal + " beats player's " + playerTotalFinal)) :
//(winner = "player", score += 1, console.log("player's " + playerTotalFinal + " beats dealer's " + dealerTotalFinal));
//checkGame();
//}
//}

//// deal dealer one card

//// converts JSON string values in card hard arrays to numbers
//function convertCardMax(value) {
//if (value === "ACE") {
//return 11;
//} else if (isNaN(value)) {
//return 10;
//} else {
//return Number(value);
//}
//}

//function convertCardMin(value) {
//if (value === "ACE") {
//return 1;
//} else if (isNaN(value)) {
//return 10;
//} else {
//return Number(value);
//}
//}

//// reduces card hand arrays to totals
//function getTotal(hand) {
//var total = hand.reduce(function(prev, curr) {
//return prev + curr;
//});
//return total;
//}

//// looks for victory conditions and triggers game reset and scorekeeping
//function checkGame() {
//if (dealerTotalMax === 21 || dealerTotalMin === 21) {
//console.log("dealer has 21");
//winner = "dealer";
//score -= 1;
//} else if (dealerTotalMin > 21) {
//console.log("dealer busts");
//winner = "player";
//score += 1;
//}

//if (playerTotalMax === 21 || playerTotalMin === 21) {
//console.log("player has 21");
//winner = "player";
//score += 1;
//} else if (playerTotalMin > 21) {
//console.log("player busts");
//winner = "dealer";
//score -= 1;
//}

//if (winner) {
//updateScore();
//reset();
//}
//}

// adds 1 or subtracts 1 from scoreboard

////function draw4() {
//drawDealerCard(cardBack);
//drawPlayerCard();
//drawDealerCard();
//drawPlayerCard();
//}

//function drawDealerCard(image) {
//var cardURL = API + "draw/" + deckId + "/?count=1";
//getJSON(cardURL, function(data) {
//if (image) {
//var html = "<img class='cardImage' src='" + image + "'>";
//$dealer.append(html);
//} else {
//var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
//$dealer.append(html);
//}
//dealerHand.push(data.cards[0].value);
//checkDealerTotal();
//checkVictory();
//});
//}

//function drawPlayerCard() {
//var cardURL = API + "draw/" + deckId + "/?count=1";
//getJSON(cardURL, function(data) {
//var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
//$player.append(html);
//playerHand.push(data.cards[0].value);
//checkPlayerTotal();
//checkVictory();
//});
//}

// deal a new hand from a new deck
//function deal() {
//var shuffleURL = API + "shuffle/?deck_count=6";
//count = 0;
//reset();
//console.log("shuffleURL = " + shuffleURL);
//getJSON(shuffleURL, function(data) {
//deckId = data.deck_id;
//console.log("deckId = " + deckId);
//dealerCard();
//playerCard();
//dealerCard();
//playerCard();
//});
//}

//// deal a new hand from the same deck
//function sameDeckDeal() {
//reset();
//dealerCard();
//playerCard();
//dealerCard();
//playerCard();
//}
//
//// clears card images and resets game values to initial
//function reset() {
//$dealer.empty();
//$player.empty();
//dealerHandMax = [];
//playerHandMax = [];
//dealerHandMin = [];
//playerHandMin = [];
//dealerTotalMax = 0;
//playerTotalMax = 0;
//dealerTotalMin = 0;
//playerTotalMin = 0;
//winner = null;
//console.log("--reset--");
//}
//
//function dealerCard(){
//var cardURL = API + "draw/" + deckId + "/?count=1";
//getJSON(cardURL, function(data) {
//var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
//$dealer.append(html);

//dealerHandMax.push(convertCardMax(data.cards[0].value));
//dealerTotalMax = getTotal(dealerHandMax);
//dealerHandMin.push(convertCardMin(data.cards[0].value));
//dealerTotalMin = getTotal(dealerHandMin);

//if (dealerTotalMin === dealerTotalMax) {
//console.log("dealer's hand - " + dealerHandMax + " **** dealer is at " + dealerTotalMax);
//} else {
//console.log("dealer's hand - " + dealerHandMax + " or " + dealerHandMin + " **** dealer is at " + dealerTotalMax + " or " + dealerTotalMin);
//}

//whatsTheCount(convertCardMax(data.cards[0].value));
//checkGame();
//});
//}

//// deal player one card
//function playerCard(){
//var cardURL = API + "draw/" + deckId + "/?count=1";
//getJSON(cardURL, function(data) {
//var html = "<img class='cardImage' src='" + data.cards[0].image + "'>";
//$player.append(html);

//playerHandMax.push(convertCardMax(data.cards[0].value));
//playerTotalMax = getTotal(playerHandMax);
//playerHandMin.push(convertCardMin(data.cards[0].value));
//playerTotalMin = getTotal(playerHandMin);

//if (playerTotalMin === playerTotalMax) {
//console.log("player's hand - " + playerHandMax + " **** player is at " + playerTotalMax);
//} else {
//console.log("player's hand - " + playerHandMax + " or " + playerHandMin + " **** player is at " + playerTotalMax + " or " + playerTotalMin);
//}

//whatsTheCount(convertCardMax(data.cards[0].value));
//checkGame();
//});
//}
//# sourceMappingURL=data:application/json;base64,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UUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7S0FDdEM7R0FDRixDQUFDO0FBQ0YsU0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBIiwiZmlsZSI6InNyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQSSA9IFwiaHR0cDovL2RlY2tvZmNhcmRzYXBpLmNvbS9hcGkvXCI7XG52YXIgbmV3RGVja1VSTCA9IEFQSSArIFwic2h1ZmZsZS8/ZGVja19jb3VudD02XCI7XG52YXIgZGVja0lkO1xuXG52YXIgY2FyZEJhY2sgPSBcImh0dHA6Ly90aW55dXJsLmNvbS9rcXp6bWJyXCI7XG5cbi8vYnV0dG9uc1xudmFyICRkZWFsID0gJChcIi5kZWFsXCIpO1xudmFyICRoaXQgPSAkKFwiLmhpdFwiKTtcbnZhciAkc3RheSA9ICQoXCIuc3RheVwiKTtcblxuLy9zY29yZWJvYXJkIGRpdnNcbnZhciAkc2NvcmUgPSAkKFwiLnNjb3JlXCIpO1xudmFyICRjb3VudCA9ICQoXCIuY291bnRcIik7XG5cbi8vY2FyZCBoYW5kIGRpdnNcbnZhciAkZGVhbGVyID0gJChcIi5kZWFsZXJcIik7XG52YXIgJHBsYXllciA9ICQoXCIucGxheWVyXCIpO1xuXG52YXIgZGVhbGVySGFuZCA9IFtdO1xudmFyIHBsYXllckhhbmQgPSBbXTtcbnZhciBwbGF5ZXJUb3RhbCA9IDA7XG52YXIgZGVhbGVyVG90YWwgPSAwO1xuXG52YXIgd2lubmVyO1xudmFyIHNjb3JlID0gMDtcbnZhciBjb3VudCA9IDA7XG5cbiRkZWFsLmNsaWNrKGRlYWwpO1xuJGhpdC5jbGljayhoaXQpO1xuJHN0YXkuY2xpY2soc3RheSk7XG5cbmZ1bmN0aW9uIGRlYWwoKSB7XG4gIGlmICghZGVja0lkKSB7XG4gICAgZ2V0SlNPTihuZXdEZWNrVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkZWNrSWQgPSBkYXRhLmRlY2tfaWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkFib3V0IHRvIGRlYWwgZnJvbSBuZXcgZGVja1wiKTtcbiAgICAgIGRyYXc0KCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJBYm91dCB0byBkZWFsIGZyb20gY3VycmVudCBkZWNrXCIpO1xuICAgIGRyYXc0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZHJhdzQoKSB7XG4gIGRyYXdDYXJkKFwiZGVhbGVyXCIsIGNhcmRCYWNrKTtcbiAgZHJhd0NhcmQoXCJwbGF5ZXJcIik7XG4gIGRyYXdDYXJkKFwiZGVhbGVyXCIpO1xuICBkcmF3Q2FyZChcInBsYXllclwiKTtcbn1cblxuZnVuY3Rpb24gZHJhd0NhcmQocGVyc29uLCBpbWFnZSkge1xuICB2YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIGdldEpTT04oY2FyZFVSTCwgZnVuY3Rpb24oZGF0YSwgY2IpIHtcbiAgICBpZiAoaW1hZ2UpIHtcbiAgICAgIHZhciBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBpbWFnZSArIFwiJz5cIjtcbiAgICAgICQoXCIuXCIgKyBwZXJzb24pLmFwcGVuZChodG1sKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGRhdGEuY2FyZHNbMF0uaW1hZ2UgKyBcIic+XCI7XG4gICAgICAkKFwiLlwiICsgcGVyc29uKS5hcHBlbmQoaHRtbCk7XG4gICAgfVxuICAgIGlmIChwZXJzb24gPT09IFwiZGVhbGVyXCIpIHtcbiAgICAgIGRlYWxlckhhbmQucHVzaChkYXRhLmNhcmRzWzBdLnZhbHVlKTtcbiAgICAgIGNoZWNrRGVhbGVyVG90YWwoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZGVhbGVySGFuZCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZGVhbGVyVG90YWwpO1xuICAgIH0gZWxzZSBpZiAocGVyc29uID09PSBcInBsYXllclwiKSB7XG4gICAgICBwbGF5ZXJIYW5kLnB1c2goZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gICAgICBjaGVja1BsYXllclRvdGFsKCk7XG4gICAgICBjb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIHBsYXllckhhbmQgKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIHBsYXllclRvdGFsKTtcbiAgICB9XG4gICAgY2hlY2tWaWN0b3J5KCk7XG4gICAgdXBkYXRlQ291bnQoZGF0YS5jYXJkc1swXS52YWx1ZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja1BsYXllclRvdGFsKCkge1xuICBwbGF5ZXJUb3RhbCA9IDA7XG4gIHBsYXllckhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiS0lOR1wiIHx8IGNhcmQgPT09IFwiUVVFRU5cIiB8fCBjYXJkID09PSBcIkpBQ0tcIikge1xuICAgICAgcGxheWVyVG90YWwgKz0gMTA7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oY2FyZCkpIHtcbiAgICAgIHBsYXllclRvdGFsICs9IE51bWJlcihjYXJkKTtcbiAgICB9XG4gIH0pO1xuICBwbGF5ZXJIYW5kLmZvckVhY2goZnVuY3Rpb24oY2FyZCkge1xuICAgIGlmIChjYXJkID09PSBcIkFDRVwiKSB7XG4gICAgICBpZiAocGxheWVyVG90YWwgPD0gMTApIHtcbiAgICAgICAgcGxheWVyVG90YWwgKz0gMTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXJUb3RhbCArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrRGVhbGVyVG90YWwoKSB7XG4gIGRlYWxlclRvdGFsID0gMDtcbiAgZGVhbGVySGFuZC5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQpIHtcbiAgICBpZiAoY2FyZCA9PT0gXCJLSU5HXCIgfHwgY2FyZCA9PT0gXCJRVUVFTlwiIHx8IGNhcmQgPT09IFwiSkFDS1wiKSB7XG4gICAgICBkZWFsZXJUb3RhbCArPSAxMDtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihjYXJkKSkge1xuICAgICAgZGVhbGVyVG90YWwgKz0gTnVtYmVyKGNhcmQpO1xuICAgIH1cbiAgfSk7XG4gIGRlYWxlckhhbmQuZm9yRWFjaChmdW5jdGlvbihjYXJkKSB7XG4gICAgaWYgKGNhcmQgPT09IFwiQUNFXCIpIHtcbiAgICAgIGlmIChkZWFsZXJUb3RhbCA8PSAxMCkge1xuICAgICAgICBkZWFsZXJUb3RhbCArPSAxMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYWxlclRvdGFsICs9IDE7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY2hlY2tWaWN0b3J5KCkge1xuICBpZiAoZGVhbGVyVG90YWwgPT09IDIxKSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgaGFzIDIxXCIpO1xuICAgIHdpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgc2NvcmUgLT0gMTtcbiAgfSBlbHNlIGlmIChkZWFsZXJUb3RhbCA+IDIxKSB7XG4gICAgY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgd2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICBzY29yZSArPSAxO1xuICB9XG5cbiAgaWYgKHBsYXllclRvdGFsID09PSAyMSkge1xuICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGhhcyAyMVwiKTtcbiAgICB3aW5uZXIgPSBcInBsYXllclwiO1xuICAgIHNjb3JlICs9IDE7XG4gIH0gZWxzZSBpZiAocGxheWVyVG90YWwgPiAyMSkge1xuICAgIGNvbnNvbGUubG9nKFwicGxheWVyIGJ1c3RzXCIpO1xuICAgIHdpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgc2NvcmUgLT0gMTtcbiAgfVxuXG4gIGlmICh3aW5uZXIpIHtcbiAgICB1cGRhdGVTY29yZSgpO1xuICAgIGNsZWFyVGFibGUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhclRhYmxlKCkge1xuICAkZGVhbGVyLmVtcHR5KCk7XG4gICRwbGF5ZXIuZW1wdHkoKTtcbiAgZGVhbGVySGFuZCA9IFtdO1xuICBwbGF5ZXJIYW5kID0gW107XG4gIGRlYWxlclRvdGFsID0gMDtcbiAgcGxheWVyVG90YWwgPSAwO1xuICB3aW5uZXIgPSBudWxsO1xuICBjb25zb2xlLmxvZyhcIi0tdGFibGUgY2xlYXJlZC0tXCIpO1xufVxuXG5mdW5jdGlvbiBoaXQoKSB7XG4gIGNvbnNvbGUubG9nKFwiaGl0XCIpO1xuICBkcmF3Q2FyZChcInBsYXllclwiKTtcbn1cblxuZnVuY3Rpb24gc3RheSgpIHtcbiAgY29uc29sZS5sb2coXCJzdGF5XCIpO1xuICBmbGlwQ2FyZCgpO1xuICBpZiAoIXdpbm5lciAmJiBkZWFsZXJUb3RhbCA8IDE3KSB7XG4gICAgZHJhd0NhcmQoXCJkZWFsZXJcIik7XG4gIH0gZWxzZSB7XG4gICAgZGVhbGVyVG90YWwgPj0gcGxheWVyVG90YWwgP1xuICAgICAgKHdpbm5lciA9IFwiZGVhbGVyXCIsIHNjb3JlIC09IDEsIGNvbnNvbGUubG9nKFwiZGVhbGVyJ3MgXCIgKyBkZWFsZXJUb3RhbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgcGxheWVyVG90YWwpKSA6XG4gICAgICAod2lubmVyID0gXCJwbGF5ZXJcIiwgc2NvcmUgKz0gMSwgY29uc29sZS5sb2coXCJwbGF5ZXIncyBcIiArIHBsYXllclRvdGFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBkZWFsZXJUb3RhbCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsaXBDYXJkKCkge1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTY29yZSgpIHtcbiAgJHNjb3JlLmVtcHR5KCk7XG4gICRzY29yZS5hcHBlbmQoXCI8cD5TY29yZTogXCIgKyBzY29yZSArIFwiPC9wPlwiKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoY2FyZCkge1xuICBpZiAoaXNOYU4oTnVtYmVyKGNhcmQpKSB8fCBjYXJkID09PSBcIjEwXCIpIHtcbiAgICBjb3VudCAtPSAxO1xuICB9IGVsc2UgaWYgKGNhcmQgPCA3KSB7XG4gICAgY291bnQgKz0gMTtcbiAgfVxuICAkY291bnQuZW1wdHkoKTtcbiAgJGNvdW50LmFwcGVuZChcIjxwPkNvdW50OiBcIiArIGNvdW50ICsgXCI8L3A+XCIpO1xufVxuXG4vLyBKU09OIHJlcXVlc3QgZnVuY3Rpb24gd2l0aCBKU09OUCBwcm94eVxuZnVuY3Rpb24gZ2V0SlNPTih1cmwsIGNiKSB7XG4gIHZhciBKU09OUF9QUk9YWSA9ICdodHRwczovL2pzb25wLmFmZWxkLm1lLz91cmw9J1xuICAvLyBUSElTIFdJTEwgQUREIFRIRSBDUk9TUyBPUklHSU4gSEVBREVSU1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIEpTT05QX1BST1hZICsgdXJsKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICBjYihKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfVxuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vL1xuLy90aGUgZ3JhdmV5YXJkLy9cbi8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vZnVuY3Rpb24gaGl0KCkge1xuICAvL2NvbnNvbGUubG9nKFwiaGl0XCIpO1xuICAvL3BsYXllckNhcmQoKTtcbiAgLy9pZiAoIXdpbm5lciAmJiBkZWFsZXJUb3RhbE1pbiA8IDE3KSB7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gIC8vfSBlbHNlIHtcbiAgICAvL2lmIChkZWFsZXJUb3RhbE1heCA8IDIyKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiZGVhbGVyIHN0YXlzIGF0IFwiICsgZGVhbGVyVG90YWxNYXgpO1xuICAgIC8vfSBlbHNlIHtcbiAgICAgIC8vY29uc29sZS5sb2coXCJkZWFsZXIgc3RheXMgYXQgXCIgKyBkZWFsZXJUb3RhbE1pbik7XG4gICAgLy99XG4gIC8vfVxuLy99XG5cbi8vZnVuY3Rpb24gc3RheSgpIHtcbiAgLy9jb25zb2xlLmxvZyhcInN0YXlcIik7XG4gIC8vdmFyIGRlYWxlclRvdGFsRmluYWwgPSAoZGVhbGVyVG90YWxNYXggPCAyMikgPyBkZWFsZXJUb3RhbE1heCA6IGRlYWxlclRvdGFsTWluO1xuICAvL3ZhciBwbGF5ZXJUb3RhbEZpbmFsID0gKHBsYXllclRvdGFsTWF4IDwgMjIpID8gcGxheWVyVG90YWxNYXggOiBwbGF5ZXJUb3RhbE1pbjtcblxuICAvL2lmIChkZWFsZXJUb3RhbE1pbiA8IDE3KSB7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gIC8vfSBlbHNlIHtcbiAgICAvL2RlYWxlclRvdGFsRmluYWwgPj0gcGxheWVyVG90YWxGaW5hbCA/XG4gICAgICAvLyh3aW5uZXIgPSBcImRlYWxlclwiLCBzY29yZSAtPSAxLCBjb25zb2xlLmxvZyhcImRlYWxlcidzIFwiICsgZGVhbGVyVG90YWxGaW5hbCArIFwiIGJlYXRzIHBsYXllcidzIFwiICsgcGxheWVyVG90YWxGaW5hbCkpIDpcbiAgICAgIC8vKHdpbm5lciA9IFwicGxheWVyXCIsIHNjb3JlICs9IDEsIGNvbnNvbGUubG9nKFwicGxheWVyJ3MgXCIgKyBwbGF5ZXJUb3RhbEZpbmFsICsgXCIgYmVhdHMgZGVhbGVyJ3MgXCIgKyBkZWFsZXJUb3RhbEZpbmFsKSk7XG4gICAgLy9jaGVja0dhbWUoKTtcbiAgLy99XG4vL31cblxuLy8vLyBkZWFsIGRlYWxlciBvbmUgY2FyZFxuXG4vLy8vIGNvbnZlcnRzIEpTT04gc3RyaW5nIHZhbHVlcyBpbiBjYXJkIGhhcmQgYXJyYXlzIHRvIG51bWJlcnNcbi8vZnVuY3Rpb24gY29udmVydENhcmRNYXgodmFsdWUpIHtcbiAgLy9pZiAodmFsdWUgPT09IFwiQUNFXCIpIHtcbiAgICAvL3JldHVybiAxMTtcbiAgLy99IGVsc2UgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgIC8vcmV0dXJuIDEwO1xuICAvL30gZWxzZSB7XG4gICAgLy9yZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgLy99XG4vL31cblxuLy9mdW5jdGlvbiBjb252ZXJ0Q2FyZE1pbih2YWx1ZSkge1xuICAvL2lmICh2YWx1ZSA9PT0gXCJBQ0VcIikge1xuICAgIC8vcmV0dXJuIDE7XG4gIC8vfSBlbHNlIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAvL3JldHVybiAxMDtcbiAgLy99IGVsc2Uge1xuICAgIC8vcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gIC8vfVxuLy99XG5cbi8vLy8gcmVkdWNlcyBjYXJkIGhhbmQgYXJyYXlzIHRvIHRvdGFsc1xuLy9mdW5jdGlvbiBnZXRUb3RhbChoYW5kKSB7XG4gIC8vdmFyIHRvdGFsID0gaGFuZC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3Vycikge1xuICAgIC8vcmV0dXJuIHByZXYgKyBjdXJyO1xuICAvL30pO1xuICAvL3JldHVybiB0b3RhbDtcbi8vfVxuXG4vLy8vIGxvb2tzIGZvciB2aWN0b3J5IGNvbmRpdGlvbnMgYW5kIHRyaWdnZXJzIGdhbWUgcmVzZXQgYW5kIHNjb3Jla2VlcGluZ1xuLy9mdW5jdGlvbiBjaGVja0dhbWUoKSB7XG4gIC8vaWYgKGRlYWxlclRvdGFsTWF4ID09PSAyMSB8fCBkZWFsZXJUb3RhbE1pbiA9PT0gMjEpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiZGVhbGVyIGhhcyAyMVwiKTtcbiAgICAvL3dpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgLy9zY29yZSAtPSAxO1xuICAvL30gZWxzZSBpZiAoZGVhbGVyVG90YWxNaW4gPiAyMSkge1xuICAgIC8vY29uc29sZS5sb2coXCJkZWFsZXIgYnVzdHNcIik7XG4gICAgLy93aW5uZXIgPSBcInBsYXllclwiO1xuICAgIC8vc2NvcmUgKz0gMTtcbiAgLy99XG5cbiAgLy9pZiAocGxheWVyVG90YWxNYXggPT09IDIxIHx8IHBsYXllclRvdGFsTWluID09PSAyMSkge1xuICAgIC8vY29uc29sZS5sb2coXCJwbGF5ZXIgaGFzIDIxXCIpO1xuICAgIC8vd2lubmVyID0gXCJwbGF5ZXJcIjtcbiAgICAvL3Njb3JlICs9IDE7XG4gIC8vfSBlbHNlIGlmIChwbGF5ZXJUb3RhbE1pbiA+IDIxKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcInBsYXllciBidXN0c1wiKTtcbiAgICAvL3dpbm5lciA9IFwiZGVhbGVyXCI7XG4gICAgLy9zY29yZSAtPSAxO1xuICAvL31cblxuICAvL2lmICh3aW5uZXIpIHtcbiAgICAvL3VwZGF0ZVNjb3JlKCk7XG4gICAgLy9yZXNldCgpO1xuICAvL31cbi8vfVxuXG4vLyBhZGRzIDEgb3Igc3VidHJhY3RzIDEgZnJvbSBzY29yZWJvYXJkXG5cbi8vLy9mdW5jdGlvbiBkcmF3NCgpIHtcbiAgLy9kcmF3RGVhbGVyQ2FyZChjYXJkQmFjayk7XG4gIC8vZHJhd1BsYXllckNhcmQoKTtcbiAgLy9kcmF3RGVhbGVyQ2FyZCgpO1xuICAvL2RyYXdQbGF5ZXJDYXJkKCk7XG4vL31cblxuLy9mdW5jdGlvbiBkcmF3RGVhbGVyQ2FyZChpbWFnZSkge1xuICAvL3ZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgLy9nZXRKU09OKGNhcmRVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvL2lmIChpbWFnZSkge1xuICAgICAgLy92YXIgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgaW1hZ2UgKyBcIic+XCI7XG4gICAgICAvLyRkZWFsZXIuYXBwZW5kKGh0bWwpO1xuICAgIC8vfSBlbHNlIHtcbiAgICAgIC8vdmFyIGh0bWwgPSBcIjxpbWcgY2xhc3M9J2NhcmRJbWFnZScgc3JjPSdcIiArIGRhdGEuY2FyZHNbMF0uaW1hZ2UgKyBcIic+XCI7XG4gICAgICAvLyRkZWFsZXIuYXBwZW5kKGh0bWwpO1xuICAgIC8vfVxuICAgIC8vZGVhbGVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgIC8vY2hlY2tEZWFsZXJUb3RhbCgpO1xuICAgIC8vY2hlY2tWaWN0b3J5KCk7XG4gIC8vfSk7XG4vL31cblxuLy9mdW5jdGlvbiBkcmF3UGxheWVyQ2FyZCgpIHtcbiAgLy92YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIC8vZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy92YXIgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgZGF0YS5jYXJkc1swXS5pbWFnZSArIFwiJz5cIjtcbiAgICAvLyRwbGF5ZXIuYXBwZW5kKGh0bWwpO1xuICAgIC8vcGxheWVySGFuZC5wdXNoKGRhdGEuY2FyZHNbMF0udmFsdWUpO1xuICAgIC8vY2hlY2tQbGF5ZXJUb3RhbCgpO1xuICAgIC8vY2hlY2tWaWN0b3J5KCk7XG4gIC8vfSk7XG4vL31cblxuLy8gZGVhbCBhIG5ldyBoYW5kIGZyb20gYSBuZXcgZGVja1xuLy9mdW5jdGlvbiBkZWFsKCkge1xuICAvL3ZhciBzaHVmZmxlVVJMID0gQVBJICsgXCJzaHVmZmxlLz9kZWNrX2NvdW50PTZcIjtcbiAgLy9jb3VudCA9IDA7XG4gIC8vcmVzZXQoKTtcbiAgLy9jb25zb2xlLmxvZyhcInNodWZmbGVVUkwgPSBcIiArIHNodWZmbGVVUkwpO1xuICAvL2dldEpTT04oc2h1ZmZsZVVSTCwgZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vZGVja0lkID0gZGF0YS5kZWNrX2lkO1xuICAgIC8vY29uc29sZS5sb2coXCJkZWNrSWQgPSBcIiArIGRlY2tJZCk7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gICAgLy9wbGF5ZXJDYXJkKCk7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gICAgLy9wbGF5ZXJDYXJkKCk7XG4gIC8vfSk7XG4vL31cblxuLy8vLyBkZWFsIGEgbmV3IGhhbmQgZnJvbSB0aGUgc2FtZSBkZWNrXG4vL2Z1bmN0aW9uIHNhbWVEZWNrRGVhbCgpIHtcbiAgICAvL3Jlc2V0KCk7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gICAgLy9wbGF5ZXJDYXJkKCk7XG4gICAgLy9kZWFsZXJDYXJkKCk7XG4gICAgLy9wbGF5ZXJDYXJkKCk7XG4vL31cbi8vXG4vLy8vIGNsZWFycyBjYXJkIGltYWdlcyBhbmQgcmVzZXRzIGdhbWUgdmFsdWVzIHRvIGluaXRpYWxcbi8vZnVuY3Rpb24gcmVzZXQoKSB7XG4gIC8vJGRlYWxlci5lbXB0eSgpO1xuICAvLyRwbGF5ZXIuZW1wdHkoKTtcbiAgLy9kZWFsZXJIYW5kTWF4ID0gW107XG4gIC8vcGxheWVySGFuZE1heCA9IFtdO1xuICAvL2RlYWxlckhhbmRNaW4gPSBbXTtcbiAgLy9wbGF5ZXJIYW5kTWluID0gW107XG4gIC8vZGVhbGVyVG90YWxNYXggPSAwO1xuICAvL3BsYXllclRvdGFsTWF4ID0gMDtcbiAgLy9kZWFsZXJUb3RhbE1pbiA9IDA7XG4gIC8vcGxheWVyVG90YWxNaW4gPSAwO1xuICAvL3dpbm5lciA9IG51bGw7XG4gIC8vY29uc29sZS5sb2coXCItLXJlc2V0LS1cIik7XG4vL31cbi8vXG4vL2Z1bmN0aW9uIGRlYWxlckNhcmQoKXtcbiAgLy92YXIgY2FyZFVSTCA9IEFQSSArIFwiZHJhdy9cIiArIGRlY2tJZCArIFwiLz9jb3VudD0xXCI7XG4gIC8vZ2V0SlNPTihjYXJkVVJMLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy92YXIgaHRtbCA9IFwiPGltZyBjbGFzcz0nY2FyZEltYWdlJyBzcmM9J1wiICsgZGF0YS5jYXJkc1swXS5pbWFnZSArIFwiJz5cIjtcbiAgICAvLyRkZWFsZXIuYXBwZW5kKGh0bWwpO1xuXG4gICAgLy9kZWFsZXJIYW5kTWF4LnB1c2goY29udmVydENhcmRNYXgoZGF0YS5jYXJkc1swXS52YWx1ZSkpO1xuICAgIC8vZGVhbGVyVG90YWxNYXggPSBnZXRUb3RhbChkZWFsZXJIYW5kTWF4KTtcbiAgICAvL2RlYWxlckhhbmRNaW4ucHVzaChjb252ZXJ0Q2FyZE1pbihkYXRhLmNhcmRzWzBdLnZhbHVlKSk7XG4gICAgLy9kZWFsZXJUb3RhbE1pbiA9IGdldFRvdGFsKGRlYWxlckhhbmRNaW4pO1xuXG4gICAgLy9pZiAoZGVhbGVyVG90YWxNaW4gPT09IGRlYWxlclRvdGFsTWF4KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiZGVhbGVyJ3MgaGFuZCAtIFwiICsgZGVhbGVySGFuZE1heCArIFwiICoqKiogZGVhbGVyIGlzIGF0IFwiICsgZGVhbGVyVG90YWxNYXgpO1xuICAgIC8vfSBlbHNlIHtcbiAgICAgIC8vY29uc29sZS5sb2coXCJkZWFsZXIncyBoYW5kIC0gXCIgKyBkZWFsZXJIYW5kTWF4ICsgXCIgb3IgXCIgKyBkZWFsZXJIYW5kTWluICsgXCIgKioqKiBkZWFsZXIgaXMgYXQgXCIgKyBkZWFsZXJUb3RhbE1heCArIFwiIG9yIFwiICsgZGVhbGVyVG90YWxNaW4pO1xuICAgIC8vfVxuXG4gICAgLy93aGF0c1RoZUNvdW50KGNvbnZlcnRDYXJkTWF4KGRhdGEuY2FyZHNbMF0udmFsdWUpKTtcbiAgICAvL2NoZWNrR2FtZSgpO1xuICAvL30pO1xuLy99XG5cbi8vLy8gZGVhbCBwbGF5ZXIgb25lIGNhcmRcbi8vZnVuY3Rpb24gcGxheWVyQ2FyZCgpe1xuICAvL3ZhciBjYXJkVVJMID0gQVBJICsgXCJkcmF3L1wiICsgZGVja0lkICsgXCIvP2NvdW50PTFcIjtcbiAgLy9nZXRKU09OKGNhcmRVUkwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvL3ZhciBodG1sID0gXCI8aW1nIGNsYXNzPSdjYXJkSW1hZ2UnIHNyYz0nXCIgKyBkYXRhLmNhcmRzWzBdLmltYWdlICsgXCInPlwiO1xuICAgIC8vJHBsYXllci5hcHBlbmQoaHRtbCk7XG5cbiAgICAvL3BsYXllckhhbmRNYXgucHVzaChjb252ZXJ0Q2FyZE1heChkYXRhLmNhcmRzWzBdLnZhbHVlKSk7XG4gICAgLy9wbGF5ZXJUb3RhbE1heCA9IGdldFRvdGFsKHBsYXllckhhbmRNYXgpO1xuICAgIC8vcGxheWVySGFuZE1pbi5wdXNoKGNvbnZlcnRDYXJkTWluKGRhdGEuY2FyZHNbMF0udmFsdWUpKTtcbiAgICAvL3BsYXllclRvdGFsTWluID0gZ2V0VG90YWwocGxheWVySGFuZE1pbik7XG5cbiAgICAvL2lmIChwbGF5ZXJUb3RhbE1pbiA9PT0gcGxheWVyVG90YWxNYXgpIHtcbiAgICAgIC8vY29uc29sZS5sb2coXCJwbGF5ZXIncyBoYW5kIC0gXCIgKyBwbGF5ZXJIYW5kTWF4ICsgXCIgKioqKiBwbGF5ZXIgaXMgYXQgXCIgKyBwbGF5ZXJUb3RhbE1heCk7XG4gICAgLy99IGVsc2Uge1xuICAgICAgLy9jb25zb2xlLmxvZyhcInBsYXllcidzIGhhbmQgLSBcIiArIHBsYXllckhhbmRNYXggKyBcIiBvciBcIiArIHBsYXllckhhbmRNaW4gKyBcIiAqKioqIHBsYXllciBpcyBhdCBcIiArIHBsYXllclRvdGFsTWF4ICsgXCIgb3IgXCIgKyBwbGF5ZXJUb3RhbE1pbik7XG4gICAgLy99XG5cbiAgICAvL3doYXRzVGhlQ291bnQoY29udmVydENhcmRNYXgoZGF0YS5jYXJkc1swXS52YWx1ZSkpO1xuICAgIC8vY2hlY2tHYW1lKCk7XG4gIC8vfSk7XG4vL31cblxuIl19