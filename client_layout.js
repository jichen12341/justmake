var cardImages = [];

init_layout();

function init_layout()
{
    var i;
    for (i = 0; i < MAX_CARDS; i++)
    {
        var img = new Image();
        img.src = "images/" + i + ".jpg";
        img.tag = i;
        img.onclick = click_card;
        cardImages.push(img);
    }
}

function click_card()
{
    console.log(this.tag);
}

function display_playernames(playerNames)
{
    //console.log(playerNames);
    for (var i = 0; i < MAX_PLAYERS; i++)
    {        
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        
        if (playerNames[i].length > 0)            
        {            
            //console.log(i + " " + gPlayerNo + " " + index);
            var title = (i == gPlayerNo) ? "你: " : "玩家: ";
            document.getElementById('lblPlayerName' + index).innerHTML = title + playerNames[i];
        }
        else
            document.getElementById('lblPlayerName' + index).innerHTML = "";
    }
}
    
function display_hand_cards(cards)
{
    //console.log(cards);
    var panel = document.getElementById('dealCardsPanel');    

    
    for (var i = 0; i < cards.length; i++)
    {   
        var tt = document.getElementById('tt' + i);
        tt.appendChild(cardImages[cards[i]]);
        //if (cards[i] >= 0)
        //    panel.appendChild(cardImages[cards[i]]);
        //var cell = panel.insertCell(0);
        //cell.appendChild(img2);
        //panel.appendChild(cell);
    }
        //var cell = panel.insertCell(0);
       // cell.appendChild(img2);   
    
}