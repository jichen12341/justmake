const MAX_PLAYERS = 4;
const MAX_CARDS = 52;
const MAX_TRUMPS = 5;

var gCardSuit = ['S', 'H', 'D', 'C'];
var gCards = [];
var gPlayerName;
var gPlayerNameList = ["", "", "", ""];
var gPlayerNo; // 0, 1, 2 or 3
var gTurn = 0;
var gFirstPlayerNo = 0;
var gGuessHands = [0, 0, 0, 0];
var gRealHands = [0, 0, 0, 0];
var gDeskCards = ["", "", "", ""];
var gTrump = 0;

for (var i = 0; i < MAX_CARDS / MAX_PLAYERS; i++)
    gCards.push(0);

function deal_cards(cards)
{
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (gPlayerNameList[i] == "")
            gPlayerNameList[i] = "電腦" + i;
        display_playernames(gPlayerNameList);
    }
    
    for (var i = 0; i < MAX_PLAYERS; i++)
        gRealHands[i] = 0;
    
    for (var i = 0; i < MAX_CARDS / MAX_PLAYERS; i++)
    {
        gCards[i] = cards[gPlayerNo * 13 + i];
    }
    
    gCards.sort(function(a,b) {
        return a - b;
    });
    
    /*for (var i = 0; i < MAX_CARDS / MAX_PLAYERS; i++)
    {
        value = gCards[i];
        gCards[i] = gCardSuit[Math.floor(value / 13)] + value % 13;
    }*/
    
    document.getElementById("msgDesk").innerHTML = gCards;   
    display_hand_cards(gCards);
}

function guess_hands()
{
    var hands = document.getElementById('txtGuessHands').value;
    gSocket.emit('guess hands', gPlayerNo, hands);
}

// 玩家出一張牌
function play_card()
{
    var card = parseInt(document.getElementById('txtPlayCard').value);
    if (validate_card(card) == true)
    {
        gSocket.emit('play a card', gPlayerNo, card);
        var index = gCards.indexOf(card);
        gCards[index] = -1;
        document.getElementById('msgDesk').innerHTML = gCards;
    }
    else
        add_message("不可出此牌 " + card);
}

// 是否可以出這張牌
function validate_card(card)
{
    // 第一人可以任出一張牌
    if (gTurn == gFirstPlayerNo)
        return true;
    
    // 該牌與第一人出的花色相同
    if (get_card_suit(card) == get_card_suit(gDeskCards[gFirstPlayerNo]))
        return true;
    
    // 檢查手上牌是否還有與第一人出的花色相同
    for (var i = 0; i < 13; i++)
    {
        if (gCards[i] == -1) continue;
        if (gCards[i] == card) continue;
        console.log(i + " " + gCards[i] + " " + gFirstPlayerNo + " " + gDeskCards[gFirstPlayerNo]);
        if (get_card_suit(gCards[i]) == get_card_suit(gDeskCards[gFirstPlayerNo]))
            return false;
    }
    return true;    
}

// 四個人都出牌了，看誰吃這墩
function proc_desk_card()
{
    card = gDeskCards[gFirstPlayerNo];
    turn = gFirstPlayerNo;
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (i == gFirstPlayerNo) continue;
        if (compare_card(card, gDeskCards[i]) < 0)
        {
            card = gDeskCards[i];
            turn = i;
        }
    }
    
    return turn;
}

// Returns: positive => card1 is bigger, 0 => even,  negative => card2 is bigger 
function compare_card(card1, card2)
{
    if (card1 == card2)
        return 0;
    if (card_is_trump(card1) && !card_is_trump(card2))
        return 1;
    if (!card_is_trump(card1) && card_is_trump(card2))
        return -1;
    if (get_card_suit(card1) != get_card_suit(card2))
        return 1;
    return get_card_value(card1) - get_card_value(card2);   
}

function get_card_value(card)
{
    value = card % 13;
    if (value == 0)
        value = 13; // Ace
    return value;
}

function get_card_suit(card)
{
    return Math.floor(card / 13);
}

function card_is_trump(card)
{
    if (get_card_suit(card) == gTrump)
        return true;
    return false;
}