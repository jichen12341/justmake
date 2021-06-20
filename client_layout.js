var gCardImages = [];
var gBidButtons = [];
var gWindowHeight = window.innerHeight;
var gWindowWidth = window.innerWidth;
var gCardHeight;
var gCardWidth;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init_layout()
{
    // load playing cards
    for (var i = 0; i < MAX_CARDS; i++)
    {
        var img = new Image();
        img.src = "images/" + i + ".png";
        img.tag = i;
        //img.style.width = '105px';
        //img.style.height  = '150px';
        img.onclick = play_card;
        img.classList.add('cardImage');
        //img.style = 'height: 100%; width: 100%;';// object-fit: contain';
        gCardImages.push(img);
    }
    gCardHeight = 150;//gCardImages[0].height;
    gCardWidth = 105;//gCardImages[0].width;

    // Adjust size of each table
    document.getElementById('table1').style.height = Math.floor(gWindowHeight / 6) + "px";
    document.getElementById('table2').style.height = Math.floor(2 * gWindowHeight / 6) + "px";
    document.getElementById('table3').style.height = Math.floor(gWindowHeight / 6) + "px";
    document.getElementById('table4').style.height = Math.floor(2 * gWindowHeight / 6) + "px";
    
    // Adjust Desk card position
    var table = document.getElementById('table2');
    var width = table.rows[0].cells[1].offsetWidth;
    var height = table.rows[0].cells[1].offsetHeight;
    
    var x, y;
    x = width / 2;
    y = height / 2;
    document.getElementById('deskPanel0').style.transform = "translate(" + x + "px, " + y + "px)";
    document.getElementById('deskPanel0').myOffsetLeft = x;
    document.getElementById('deskPanel0').myOffsetTop = y;
    
    x -= gCardWidth;
    y -= height / 2;
    document.getElementById('deskPanel1').style.transform = "translate(" + x + "px, " + y + "px)";
    document.getElementById('deskPanel1').myOffsetLeft = x;
    document.getElementById('deskPanel1').myOffsetTop = y;
    
    x += gCardWidth;
    y -= height / 2;
    document.getElementById('deskPanel2').style.transform = "translate(" + x + "px, " + y + "px)";    
    document.getElementById('deskPanel2').myOffsetLeft = x;
    document.getElementById('deskPanel2').myOffsetTop = y;
    
    x += gCardWidth;
    y += height / 2;
    document.getElementById('deskPanel3').style.transform = "translate(" + x + "px, " + y + "px)";    
    document.getElementById('deskPanel3').myOffsetLeft = x;
    document.getElementById('deskPanel3').myOffsetTop = y;
    
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var deskPanel = document.getElementById('deskPanel' + i);
        deskPanel.style.width = gCardWidth + "px";
        deskPanel.style.height = gCardHeight + "px";               
    }
    
    // Generate bid buttons
    var bidPanel = document.getElementById("bidPanel");
    bidPanel.style.display = 'none';
    
    for (var i = 0; i <= 13; i++)
    {
        var btn = document.createElement("button");
        btn.innerHTML = i;
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.style.fontSize = "x-large";
        btn.onclick = bid;
        bidPanel.appendChild(btn);
    }
    var lbl = document.createElement('label');
    lbl.textContent = "請叫牌";
    lbl.classList.add('bidTip');
    bidPanel.appendChild(lbl);    
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
            document.getElementById('lblPlayerName' + index).innerHTML = "等待其他玩家...";
    }
}

// 顯示所有人的叫牌墩數
function display_bid_label(bid)
{
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;        
        document.getElementById('lblBid' + index).innerHTML = "叫 " + bid[i] + " 墩";
    }
    
    /*var lblBid = document.getElementById('lblBid0');
    var item = document.createElement('li');
    item.classList.add('scoreTipText');
    item.textContent = "asdasdf";
    lblBid.appendChild(item);    */
}
    
function display_hand_cards(cards)
{   
    var index = 0;

    // Adjust Desk card position
    var table = document.getElementById('table4');
    var width = table.rows[0].cells[0].offsetWidth;
    var height = table.rows[0].cells[0].offsetHeight;
    
    var deltaX = -(gCardWidth / 3);  // 預設每張牌往左邊內縮1/3
    var extra = (MAX_HAND_CARDS * gCardWidth - width);  // 總共超出多少px    
    if (extra > 0)
        deltaX = -Math.floor(extra / MAX_HAND_CARDS) * 3;  // 重新計算每張牌往左邊內縮量
    console.log("extra/deltaX= " + extra + " " + deltaX);
    
    for (var i = 0; i < cards.length; i++)
    {           
        if (cards[i] >= 0)
        {                        
            var cHandCardsPanel = document.getElementById('cHandCardsPanel' + index);
            cHandCardsPanel.innerHTML = "";
            cHandCardsPanel.appendChild(gCardImages[cards[i]]);
                        
            var handCardsPanel = document.getElementById('handCardsPanel' + index);
            var offsetX = index * (gCardWidth + deltaX);
            handCardsPanel.style = "transform: translate(" + offsetX + "px, 0px)";     

            index++;             
        }        
    }
}

function display_bid_panel()
{
    var bidPanel = document.getElementById("bidPanel");
    bidPanel.style.display = 'block';    
}

function display_eat_label()
{           
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;        
        document.getElementById('lblEat' + index).innerHTML = "吃 " + gEat[i] + " 墩";
    }   
}

// 顯示玩家的排到牌桌上
function display_desk_card(playerNo, card)
{   
    //console.log(playerNo + " " + card);
    var index = (playerNo + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
    
    var deskPanel = document.getElementById("deskPanel" + index);
    deskPanel.innerHTML = "";
    deskPanel.appendChild(gCardImages[card]);
}

function display_transform_deck_card(card, from, to)
{   
    if (card == null) return;
    
    var deskfromPanel = document.getElementById("deskPanel" + from);
    var deskToPanel = document.getElementById("deskPanel" + to);
    deltaX = deskToPanel.myOffsetLeft - deskfromPanel.myOffsetLeft;
    deltaY = deskToPanel.myOffsetTop - deskfromPanel.myOffsetTop;
    card.style.transition = "1s";
    card.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
}

// 顯示該玩家吃到這墩 (動畫)
async function display_eat(playerNo)
{
    gState = STATE_ANIME_EAT;    
    playerNo = (playerNo + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS; 
    
    // 將該玩家的牌至頂
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (i == playerNo)
            document.getElementById("deskPanel" + i).style.zIndex = "2";
        else
            document.getElementById("deskPanel" + i).style.zIndex = "1";
    }
    
    // 該玩家收所有牌
    await sleep(2000);
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        if (i == playerNo) continue;
        
        var deskPanel = document.getElementById("deskPanel" + i);
        var card = deskPanel.firstChild;        
        display_transform_deck_card(card, i, playerNo);              
    }
    await sleep(1000);    
    
    // 移除桌上牌, 移除動畫
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var deskPanel = document.getElementById("deskPanel" + i);
        card = deskPanel.firstChild;
        card.style.transition = "0";
        card.style.transform = "";
        deskPanel.innerHTML = "";
    }
    
    display_eat_label();   
    display_first_player_desk_card();
    
    // 手上牌都出完了，結算成績
    gHandCardLeft--;
    if (gHandCardLeft == 0)
    {
        calculate_score();
        display_score(gScore);
    }    
    /*gHandCardLeft--;
    if (gHandCardLeft == 0)
    {
        calculate_score();
        display_score(gScore);
        gState = STATE_BID;
    }
    else if (gTurn == gPlayerNo)
    {
        gState = STATE_MY_TURN;
        display_your_turn(true);
        console.log("換你了");
    } */
    
    // 告知伺服器已完成一墩
    console.log("emit finish turn");    
    gSocket.emit('finish turn', gPlayerNo);         
}

function display_message(msg)
{
    //var lblMessage = document.getElementById("lblMessage");
    //lblMessage.innerHTML = msg;
}

function display_your_turn(enable)
{    
    var deskPanel = document.getElementById("deskPanel0");
    if (enable)
    {
        var lbl = document.createElement('label');
        lbl.textContent = "換你了";
        lbl.classList.add('yourTurnTip');
        deskPanel.appendChild(lbl);         
        //deskPanel.innerHTML = "換你了";
        //deskPanel.classList.add('deskPanelTip');
    }
    else
        deskPanel.innerHTML = "";
}

function display_score(score)
{    
    /*for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        
        var lblScore = document.getElementById("lblScore" + index);
        lblScore.innerHTML = "總分: " + gScoreOld[i] + " --> " + gScore[i];
        lblScore.classList.add('scoreColorChange');
    } */

    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        var lblScore = document.getElementById("lblScore" + index);
        lblScore.innerHTML = "";
        
        var item = document.createElement('div');
        item.textContent = "總分: " + gScoreOld[i] + " --> " + gScore[i];
        item.classList.add('scoreColorChange');
        lblScore.appendChild(item);        
    }           
}

function display_trump()
{
    var lblTrump = document.getElementById("lblTrump");
    if (gTrump == 1 || gTrump == 2)
        lblTrump.style.color = "red";
    else
        lblTrump.style.color = "black";
    lblTrump.innerHTML = "王牌: " + gCardSuit[gTrump];    
}

function display_first_player_desk_card()
{
    for (var i = 0; i < MAX_PLAYERS; i++)
    {
        var index = (i + MAX_PLAYERS - gPlayerNo) % MAX_PLAYERS;
        var deskPanel = document.getElementById("deskPanel" + index);
        if (i == gFirstPlayerNo)
            deskPanel.style.border = "10px solid #666";
        else
            deskPanel.style.border = "";
        console.log(gFirstPlayerNo);
    }
}