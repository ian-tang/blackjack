let delay = 1000; // variable used to time the fade-in animations sequentially

// load images for the dealer's and player's cards
$(document).ready(function() {
  animateCard(getNewCard(), "#face-up");
  // special function for hiding the value of the dealer's "hole" card
  animateHoleCard(getNewCard());
  $("#dealer-total").text("Dealer's Card Total: ??");

  animateCard(getNewCard(), "#player-cards");
  animateCard(getNewCard(), "#player-cards", delay);
  $("#player-total").text("Your Card Total: " + getPlayerTotal());

  // check for the special case in which the dealer has a face up 10 value card
  // and an ace hole card
  let $dealerCards = $("#face-up .card");
  let dealerCards = [];
  for (let i = 0; i < $dealerCards.length; i++) {
    dealerCards[i] = parseInt($dealerCards[i].getAttribute("data-value"));
  }
  // the game immediately ends if the dealer has a face up 10 value card and
  // an ace in the hole
  // it also ends if the player has blackjack
  if ((dealerCards[0] === 10 && dealerCards[1] === 1) ||
      getPlayerTotal() === "Blackjack!") {
    $(".decision-button").prop("disabled", true);
    $("#hole-card").remove();
    $("#face-up .card").delay(delay).fadeIn(1000);
    $("#dealer-total").text("Dealer's Card Total: " + getDealerTotal());
    declareWinner();
  }
});

// button functions
// add card upon clicking "hit"
$("#hit").click(() => {
  let card = getNewCard();
  animateCard(card, "#player-cards", delay);
  $("#player-total").text("Your Card Total: " + getPlayerTotal());
  if (getPlayerTotal() === 21 || getPlayerTotal() === "Bust!") {
    resolveDealer();
  }
});
// reveal dealer's hole card and hit to 17
$("#stand").click(() => {
  resolveDealer();
});
// reloads the page for a new game
$("#new-game").click(() => {
  location.reload();
});
$("#rules-button").click(() => {
  $(this).toggleClass("active");
  let rules = $(".rules");
  if (rules.css("max-height") !== "0px")
    rules.css("max-height", "0");
  else
    rules.css("max-height", rules.prop("scrollHeight") + "px");
});

// helper functions below -----------------------------------------------------

// randomly selects a new card and returns its name and number value in an array
// designed to be used as an input to animateCard()
// also has a role in getting the proper file name for the card image and for
// creating the alt text for the image
//
// because it randomly generates each card, it does not accurately model the
// probability of a real blackjack game, since it can create duplicate cards
// however, since most casino blackjack games are played with up to as many as
// 8 decks of cards, the difference is small
// a more accurate implementation would generate an array of 1-8 decks of cards
// and remove each one from the array after it is drawn and also keep the array
// persistent between games
function getNewCard() {
  num = Math.ceil(Math.random() * 13);
  suit = Math.ceil(Math.random() * 4);
  str = "";

  if (suit === 1) str += "clubs_";
  else if (suit === 2) str += "diamonds_";
  else if (suit === 3) str += "hearts_";
  else str += "spades_";

  if (num === 1) str += "A";
  else if (num > 1 && num < 10) str += ("0" + num);
  else if (num === 10) str += num;
  else if (num === 11) str += "J";
  else if (num === 12) str += "Q";
  else str += "K";
  
  // returns an array with the card name as the first element
  // and the number value of the card as the second element
  if (num < 11) return [str, num];
  else return [str, 10];
}

// gets the image of the new card and adds it to the playing area
function animateCard(card, location, delay=0) {
  let img = $("<img>")
              .addClass("card")
              .attr("src", "cards/card_" + card[0] + ".png")
              .attr("data-value", card[1])
              .attr("alt", card[0])
              .hide()
              .appendTo($(location));
  if (delay) img.delay(delay).fadeIn(1000);
  else img.fadeIn(1000);
}

// special function for the dealer's hole card
function animateHoleCard(card) {
  // appends the actual card to the dealer's list of cards but hides it
  let actual = $("<img>")
                  .addClass("card")
                  .attr("src", "cards/card_" + card[0] + ".png")
                  .attr("data-value", card[1])
                  .attr("alt", card[0])
                  .hide()
                  .appendTo("#face-up");
  // shows a card back in a separate div as a placeholder for the hole card
  let cardBack = $("<img>")
                  .addClass("card")
                  .attr("src", "cards/card_back.png")
                  .attr("alt", "hole_card")
                  .attr("id", "hole-card")
                  .hide()
                  .appendTo("#face-down")
                  .delay(1000)
                  .fadeIn(1000);
    
}

// returns the total value of the dealer's cards or a string with
// "Blackjack!" or "Bust!"
function getDealerTotal() {
  let $dealerCards = $("#face-up .card");
  let dealerCards = [];
  let total = 0;
  for (let i = 0; i < $dealerCards.length; i++) {
    dealerCards[i] = parseInt($dealerCards[i].getAttribute("data-value"));
  }
  total = dealerCards.reduce((a, n) => a + n);
  if (dealerCards.includes(1) && dealerCards.length === 2 && total === 11) {
    return "Blackjack!";
  } else if (dealerCards.includes(1) && total <= 11) {
    total += 10;
  } else if (total > 21) {
    return "Bust!";
  }
  return total;
}

// returns the total value of the player's cards
function getPlayerTotal() {
  let $playerCards = $("#player-cards .card");
  let playerCards = [];
  let total = 0;
  for (let i = 0; i < $playerCards.length; i++) {
    playerCards[i] = parseInt($playerCards[i].getAttribute("data-value"));
  }
  total = playerCards.reduce((a, n) => a + n);
  if (playerCards.includes(1) && playerCards.length === 2 && total === 11) {
    return "Blackjack!";
  } else if (playerCards.includes(1) && total <= 11) {
    total += 10;
  } else if (total > 21) {
    return "Bust!";
  }
  return total;
}

// dealers hits if under 17
function resolveDealer() {
  $(".decision-button").prop("disabled", true);
  $("#hole-card").remove();
  $("#face-up .card").fadeIn(1000);
  $("#dealer-total").text("Dealer's Card Total: " + getDealerTotal());
  
  // gives the dealer more cards
  // takes advantage of the fact that a string output from getDealerTotal()
  // such as "Bust!" would evaluate to false since NaN evaluated against
  // a number is always false
  //
  // a better implementation would probably be to rewrite getDealerTotal() and
  // getPlayerTotal() to give all outputs as numbers, and print "Blackjack!" or
  // "Bust!" based on those outputs, but this works in the current
  // implementation
  while (getDealerTotal() < 17) {
    animateCard(getNewCard(), "#face-up", delay);
    $("#dealer-total").text("Dealer's Card Total: " + getDealerTotal());
    // increases the delay each loop so that each card fades in sequentially
    delay += 1000;
  }
  declareWinner();
}

// finds the winner between the dealer and the player
function declareWinner() {
  result = "";
  let player = getPlayerTotal();
  let dealer = getDealerTotal();
  if (player === dealer && player === "Bust!")
    result = "Everyone bust. Nobody wins.";
  else if (player === dealer)
    result = "It's a push. Nobody wins.";
  else if (dealer === "Blackjack!")
    result = "The dealer wins with blackjack.";
  else if (player === "Blackjack!")
    result = "Blackjack! You win!";
  else if (typeof player === "number" && typeof dealer === "number" &&
      dealer > player)
    result = "The dealer wins.";
  else if (typeof player === "number" && typeof dealer === "number" &&
      dealer < player)
    result = "You win!";
  else if (player === "Bust!")
    result = "You bust. The dealer wins.";
  else if (dealer === "Bust!")
    result = "The dealer bust. You win!";
  
  $("<h1>")
    .text(result)
    .css("min-width", "296px")
    .css("padding", "0")
    .css("margin", "0")
    .hide()
    .appendTo(".button-area")
    .delay(delay)
    .fadeIn();
}