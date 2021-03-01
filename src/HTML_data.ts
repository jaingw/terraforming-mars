import {CardName} from './CardName';

/* eslint-disable no-irregular-whitespace */
export const HTML_DATA: Map<string, string> =
  new Map([
    // /// breakthrough
    [CardName._INVENTRIX_, `
    <div class="contentCorporation ">
        <div class="corporationEffectBox ">
            <div class="corporationEffectBoxLabel ">EFFECT</div>
            <div class="corporation-ability">
              <div class="globals-box">Global requirements</div>: +/- 3
            </div>
            <div class="description ">
                (Effect: Your temperature, oxygen and ocean requirements are +3 or -3 steps, your choice in each case.)
            </div>
        </div>
        <span style="color: #020202;
        position: relative;
        top: 22px;
        font-size:24px;
        padding-left:5px;
        padding-bottom:5px;
        text-shadow: 6px 6px 5px grey;
        ;">
          <span style="color: #020202;background-color:#6bb5c7;margin-top:33px;padding-left:4px;padding-right:4px;font-size:26px;box-shadow: 6px 6px 10px grey;">X</span> INVENTRIX
        </span>
        <div class="description " style="text-align:center;margin-top: 22px;">
          <div class="resource money " style="margin-left:20px;">45</div> <div class="resource card" style="margin-left:20px"></div><div class="resource card"></div><div class="resource card"></div><br>
            (As your first action in the game, draw 3 cards. Start with 45MC.)
        </div>
    </div>
`],
    [CardName._PHOBOLOG_, `
    <div class="contentCorporation">
      <div class="corporationEffectBox">
        <div class="corporationEffectBoxLabel">EFFECT</div>
        <div class="resource titanium"></div> : +
        <div class="resource money">1</div>

        <div class="description" style="text-align:center;margin-top:0px;">
          (Effect: Your titanium resources are each worth 1 MC extra.)
        </div>
      </div>
      <span style="font-size:24px;
                      margin-left:15px;
                      color:white;
                      line-height:40px;
                      background: #32004d;
                      padding-left:5px;
                      padding-right:5px;
                      border:1px solid #444;
                      border-radius:10px;
                      font-family: 'Times New Roman';
                      display:inline-block;
                      -webkit-transform:scale(1.2,1); /* Safari and Chrome */
                      -moz-transform:scale(1.2,1); /* Firefox */
                      -ms-transform:scale(1.2,1); /* IE 9 */
                      -o-transform:scale(1.2,1); /* Opera */
                      transform:scale(1.2,1); /* W3C */
                      box-shadow:  6px 6px 5px  grey;">
                  PHOBOLOG
              </span><br><br>
              
      <div class="resource money" style="margin-left:10px;">23</div>
      10<div class="resource titanium"></div>
      <div class="resource card"><div class="card-icon tag-space"></div></div> 
      <div class="resource card"><div class="card-icon tag-space"></div></div>
      
      <div class="description" style="text-align:center;">
        (You start with 10 titanium and 23 MC.As your first action, draw 2 space cards. )
      </div>
    </div>
`],
    [CardName._THORGATE_, `
    <div class="contentCorporation">
      <div class="corporationEffectBox">
        <div class="corporationEffectBoxLabel">EFFECT</div>
        <div class="resource-tag tag-power"></div> * :
        <div class="resource money">-3</div>
        <div class="description" style="text-align:center;margin-top:0px;">
          (Effect: When playing a power card OR THE STANDARD PROJECT POWER PLANT, you pay 3 MC less for it.)
        </div>
      </div>
      <span style="color: #020202;
                      font-size:32px;
                      font-family: 'Arial Narrow','Verdana';
                      font-weight:normal;
                      text-shadow: 6px 3px 5px  grey;">
                  THORGATE
              </span><br><br>
      <div class="production-box production-box-size2" style="margin-left:45px;margin-top:-10px;">
        <div class="production energy"></div><div class="production energy"></div>
      </div>
      <div class="resource money" style="margin-left:20px;">44</div>
      <div class="description" style="text-align:center;">
        (You start with 2 energy production and 44 MC.)
      </div>
    </div>
`],
    [CardName._HELION_, `
    <div class="contentCorporation">
      <div class="corporationEffectBox">
        <div class="corporationEffectBoxLabel">EFFECT</div>
        X<div class="resource heat"></div> :
        <div class="resource money">X</div>
        <div class="description" >
          (Effect: Your may use heat as MC. You may not use MC as heat.)
        </div>
      </div>
      <div class="helion">helion</div><br>
      <div style="margin-left: -10px">
        <div class="production-box production-box-size3 helion-production" >
          <div class="production heat"></div><div class="production heat"></div><div class="production heat"></div>
        </div>
        3<div class="resource heat"></div><div class="resource money">48</div>
      </div>
      <div class="description" style="text-align:center;">
        (You start with 3 heat production, 3 heat and 48 MC.)
      </div>
    </div>
`],
    [CardName._TERACTOR_, `
    <div class="corporate-icon corporation-icon"></div>
    <div class="contentCorporation">
      <div class="corporationEffectBox">
        <div class="corporationEffectBoxLabel">EFFECT</div>
        <div class="resource-tag tag-earth"></div> :
        <div class="resource money">-3</div>
        <div class="description" style="text-align:center;margin-top:0px;">
          (Effect: When playing an Earth card, you pay 3 MC less for it.)
        </div>
      </div>
      <span style="font-size:34px;
                      color: orangered;
                      font-family: 'Times New Roman';
                      font-weight:normal;
                      text-shadow: -1px 0 #333333, 0 1px #333333, 1px 0 #333333,0px -1px #333333, 6px 3px 5px  grey;">
                  TERACTOR
              </span><br>
      <div class="description" style="text-align:center;">
        <div class="resource money" style="margin-top:10px;margin-right:10px;">55</div>
        <div class="resource card"><div class="card-icon tag-earth"></div></div> 
        <br> (You start with 55 MC. As your first action, draw 1 earth tag card. )
      </div>
    </div>
`],
    [CardName._FACTORUM_, `
    <div class="promo-icon corporation-icon"></div>
    <div class="contentCorporation">
      <div class="corporationEffectBox">
        <div class="corporationEffectBoxLabel" style="margin-bottom:5px">ACTION</div>
        <div class="corporation-action-icons nowrap">
          <div class="red-arrow"></div>
          <div class="production-box"><div class="production energy"></div></div> * OR
          <div class="resource money">3</div><div class="red-arrow"></div>
          <div class="resource card"><div class="card-icon card-icon-building" ></div></div>
        </div>
        <div class="description" style="text-align:center;margin-top:0px;">
          (Action: Increase your energy production 1 step IF YOU HAVE NO ENERGY RESOURCES, or spend 3MC to draw a building card.)
        </div>
      </div>
      <div class="factorum">
        FACTORUM
      </div>
      <div class="resource money" style="margin-left:35px;margin-right:20px;margin-top:20px;">45</div>
      <div class="production-box">
        <div class="production steel"></div>
      </div>
      <div class="description" style="text-align:center;">
        (You start with 45 MC. Increase your steel production 1 step.)
      </div>
    </div>
    `],
    [CardName._RECYCLON_, `
      <div class="promo-icon corporation-icon"></div>
      <div class="contentCorporation">
        <div class="corporationEffectBox hover-hide-res">
          <div class="corporationEffectBoxLabel" style="margin-bottom:10px">EFFECT</div>
          <div class="resource-tag tag-building"></div> :<div class="resource microbe"></div> OR
          2<div class="resource microbe"></div>:<div class="production-box" style="margin-left:5px;"><div class="production plant"></div></div><br>
          <div class="description" style="margin-top:-3px;text-align:center;">(Effect: When you play a building tag, including this, gain 1 microbe to this card, or remove 2 microbes here and raise your plant production 1 step.)
          </div>
        </div>
        <div  class="recyclon-fix"> RECYCLON</div>
      </div><br>
      <div class="recyclon-fix-2" style="margin-top: -20px; color: black;">
        <div class="resource money" style="margin-left:25px;">38</div>
        <div class="resource microbe"></div>
        <div class="resource microbe"></div>*
        <div class="production-box"><div class="production steel"></div></div>
        <div class="description" style="margin-top:0px;text-align:center;">(You start with 38 MC and 1 steel production. As your first action, add 2 mocrobed to this card)</div>
      </div>
`],
    [CardName._ROBINSON_INDUSTRIES_, `
      <div class="prelude-icon corporation-icon"></div>
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">ACTION</div>
          <div class="resource money">2</div>
          <div class="red-arrow"></div>
          <div class="production-box">
            <div class="production" style="background:white;">?</div>
          </div>
          <div class="description" style="text-align:center;margin-top:0px;">
            (Action: Spend 2 MC to increase (one of) your LOWEST PRODUCTION 1 step.)
          </div>
        </div>
        <div class="robinson" style="letter-spacing:4px;border-bottom:3px solid #ccc;margin-top:5px;">ROBINSON</div>
        <div class="robinson" style="border-bottom:3px solid #ccc;">•—•—•—•—•—•—•&nbsp;</div>
        <div class="robinson" style="letter-spacing:2px;">INDUSTRIES</div>
        <div class="resource money" style="margin-left:59px;margin-top:10px;">47</div>
        <div class="description" style="text-align:center;">
          (You start with 47 MC.)
        </div>
`],
    [CardName._SPLICE_, `
      <div class="promo-icon corporation-icon"></div>
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel" style="margin-bottom:2px">EFFECT</div>
          <div class="resource-tag tag-microbe red-outline"></div> : <div class="resource money red-outline">2</div> * OR <div class="resource microbe red-outline"></div> *<br>
          <div class="resource-tag tag-microbe red-outline" style="margin-top:-4px;"></div> : <div class="resource money" style="margin-right:91px;margin-left:5px;margin-top:-4px;">2</div> <br>
          <div class="description" style="margin-top:-3px;text-align:center;">(Effect: when a microbe tag is played, incl. this, THAT PLAYER gains 2 MC, or adds a microbe to THAT card, and you gain 2 MC.)
        </div>
        </div>
        <div class="splice"><div style="margin-left:2px"> SPLI<span style="color:red">C</span>E</div>
                    <div STYLE="height:3px;background:red;margin-top:-3px;"></div>
                    <div STYLE="font-size:10px">TACTICAL GENOMICS</div>
                </div>
                <div class="resource money" style="margin-left:60px;margin-right:5px;">44</div>
                <div class="resource card" style="margin-left:20px;margin-bottom: 0px;top: -10px;margin-top: -4px;"><div class="card-icon tag-microbe"></div></div>
                <div class="resource card" style="margin-bottom: 0px;top: -10px;margin-top: -4px;"><div class="card-icon tag-microbe"></div></div>
        <div class="description" style="margin-top:-2px;margin-left:-7px;margin-right:-7px;text-align:center;">(You start with 44 MC. As your first action, reveal cards until you have revealed 2 microbe tag. Take these cards into hand and discard the rest.)</div>
      </div>
`],

    [CardName._VALLEY_TRUST_, `
        <div class="prelude-icon corporation-icon"></div>
        <div class="contentCorporation ">
            <div class="corporationEffectBox ">
                <div class="corporationEffectBoxLabel ">EFFECT</div>
                <div class="resource-tag science"></div> : <div class="resource money">-2</div>
                <div class="description " style="text-align:center;margin-top:0px; ">
                    (Effect: When you play a Science tag, you pay 2MC less for it.)
                </div>
            </div>
            <div style="color:rgb(2,125,195);background:linear-gradient(to right,rgb(2,125,195) 10%,white,white,white, white,white,white, white);box-shadow:3px 3px 10px 1px rgb(58,58,58);width:135px;line-height:24px;border-radius:10px 0px 0px 10px">
              <div style="display:inline-block;margin-left:25px;margin-top: 3px;margin-bottom:15px;font-size:26px;text-shadow: 2px 2px #ccc;text-align:center">VALLEY TRUST</div>
            </div>
            <div class="description" style="text-align:center;">
            <div class="resource money" style="margin-left:12px;margin-top:10px;">37</div> <div class="resource card-corporation" style="margin-left:50px"><span style="background:linear-gradient(to right, rgb(235,118,171), #e64d91);padding-left:4px;padding-right:4px;border-radius:2px;">PREL</span></div>
            <div class="description" style="margin-top:-2px;">
              (You start with 37 MC. As your first action, draw 4 Prelude cards, and play one of them. Discard the other three.)
            </div>
        </div>
`],
    [CardName._VIRON_, `
      <div class="venus-icon corporation-icon"></div>
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">ACTION</div>
          <div class="red-arrow" style="font-size:30px;"></div>
          <div class="description" style="text-align:center;margin-top:0px;">
            (Action: Use a blue card action that has already been used this generation.)
          </div>
        </div>
        <div  style="font-size:50px; font-family: Prototype;margin-left: 15px;
        text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white, 6px 3px 5px  grey;
                        ">
                    VIRON
                </div>
        <div class="resource money" style="margin-left:65px;">48</div>
        <div class="description" style="text-align:center;">
          (You start with 48 MC.)
        </div>
      </div>
`],
    [CardName._CELESTIC_, `
      <div class="venus-icon corporation-icon"></div>
      <div class="contentCorporation">
        <div class="pointsCorporation">1/3<div class="resource floater"></div></div>
        <div class="corporationEffectBox" style="margin-top: 143px; height: 144px">
          <div class="corporationEffectBoxLabel"style="margin-bottom:5px;">ACTION</div>
          <div class="red-arrow"></div> <div class="resource floater"></div>*&nbsp&nbsp&nbsp
          <div class="floater resource" style="margin-bottom:0px;"></div>* : <div class="money resource">1</div>
          <div class="description" style="margin-top:0px;text-align:left;margin-right:5px;">
            (Action: Add a floater to ANY card. When you gain a floater to ANY CARD, gain 1 MC. 1 VP per 3 floaters on this card.) <br>
          </div>
        </div>
        <div class="celestic" style="font-size:24px;box-shadow:6px 6px 6px grey;margin-left: 9px;margin-bottom:2px">
          <span style="background:linear-gradient(to right, rgb(251,192,137),rgb(251,192,137),rgb(23,185,236));padding-left:5px;">CEL</span><span
          style="background:linear-gradient(to right,rgb(23,185,236),rgb(251,192,137))">ES</span><span style="background:rgb(251,192,137);padding-right:5px;">TIC</span>
        </div>
      </div><br>
      <div class="celestic-fix">
          <div class="resource money" style="margin-left:30px;">42</div>
          <div class="resource card"><div class="card-icon-box floater"></div></div>
          <div class="resource card"><div class="card-icon-box floater"></div></div>
          <div class="description" style="text-align:center;margin-top:-3px;font-size:10px;">
          (You start with 42 MC. As your first action, draw 2 floater-icon cards.)
          </div>
      </div>
`],
    [CardName.IDO_FRONT, `
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">EFFECT</div>
          <span class="resource-tag" style="background:linear-gradient(to bottom right, white, grey)">&nbsp;</span>&nbsp;:
          <div class="resource money">2</div>
          <div class="description" style="text-align:center;margin-top:0px;">
            (Effect: When you play a card, gain 2 MC for each tag on that card that you already have.)
          </div>
        </div>
        <span style="font-size:14px;
        color:white;
        line-height:80px;
        background: #000000;
        margin-left:20px;
        padding-top:8px;
        padding-bottom:8px;
        padding-left:20px;
        padding-right:20px;
        border-radius:50%;
        font-weight:normal;
        border:2px solid white;
        box-shadow:  6px 6px 5px  grey;">
        Id Front <span style="font-size:20px;display:inline-block;">&#x25CF;</span> 前线基地
        </span><br>
        <div class="description" style="text-align:center;">
        <div class="resource money">32</div><br> (You start with 32 MC.)
        </div>
      </div>
`],
    [CardName._ARKLIGHT_, `
      <div class="colonies-icon corporation-icon"></div>
      <div class="contentCorporation">
         <div class="pointsCorporation">1/2<div class="resource animal"></div></div>
        <div class="corporationEffectBox" style="margin-top: 136px; height: 149px">
          <div class="corporationEffectBoxLabel"style="margin-bottom:3px;">EFFECT</div>
          <div class="resource-tag tag-animal"style="margin-left:1px;"></div> / <div class="resource-tag tag-plant"style="margin-left:1px;"></div> : <div class="resource animal"style="margin-left:1px;"></div>
          <div class="animal resource" style="margin-left:3px;"></div>*:<div class="money resource"style="margin-left:3px;">1</div>
          <div class="description" style="margin-top:0px;text-align:left;margin-right:5px;">
            (Effect: When you play an animal or plant tag, including this, add 1 animal to this card. When you gain an animal to ANY CARD, gain 1 MC.)
          </div>
        </div>
        <div  class= "arklight" style="font-size:19px;
          font-family: Prototype;
          margin-left: 74px;
          letter-spacing: 1px;
          background: linear-gradient(to right,#000089, dodgerblue, deepskyblue);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-transform:scale(2,1); /* Safari and Chrome */
          -moz-transform:scale(2,1); /* Firefox */
          -ms-transform:scale(2,1); /* IE 9 */
          -o-transform:scale(2,1); /* Opera */
          transform:scale(2,1); /* W3C */
          margin-top: 3px;
          margin-bottom: -12px;
          "> ARKLIGHT
        </div><br>
        <div class="resource money" style="margin-right:30px;margin-left:30px;">45</div>
        <div class="production-box ">
            <div class="money production ">2</div>
        </div>
        <div class="description" style="text-align:center;">
          (You start with 45 MC. Increase your MC production 2 steps. 1 VP per 2 animals on this card.)
        </div>
`],
    [CardName._STORMCRAFT_INCORPORATED_, `
      <div class="colonies-icon corporation-icon"></div>
      <div class="contentCorporation">
      <div class="pointsCorporation" style="margin-left:150px;padding-right:4px;width: 60px;">1/<span class="resource-tag tag-jovian"></span></div>
        <div class="corporationEffectBox" style="margin-top: 136px; height: 149px">
          <div class="corporationEffectBoxLabel" style="margin-bottom:5px;" >ACTION</div>
          <div class="red-arrow"></div> <div class="resource floater" style="margin-bottom:5px;"></div>* <br>
          <div class="resource floater"></div> = <div class="resource heat"></div><div class="resource heat"></div>
          <div class="description" style="margin-top:3px;text-align:left;width:145px;">
            (Action: Add a floater to ANY card.Effect: Floaters on this card may be used as 2 heat each.) <br>
          </div>
        </div>
        <div class="stormcraft1">STORM</div><div class="stormcraft2">CRAFT</div>
        <div class="stormcraft3">INCOR</div><div class="stormcraft4">PORATED</div>
        <div class="resource money" style="margin-left:60px;">48</div>
        <div class="description" style="margin-left: 20px">
          (You start with 48 MC.)
        </div>
      </div>
`],

    // fan-made
    [CardName.AGRICOLA_INC, ` 
      
      <div class="contentCorporation">
        <div class="pointsCorporation">?</div>
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">EFFECT</div>

          <div class="description effect">
            (Effect: At game end, score -2 / 0 / 1 / 2 VP PER TAG TYPE for 0 / 1-2 / 3-4 / 5+ tags.)
          </div>
        </div>
      </div>

      <div class="agricola">Agricola Inc</div>
      <div class="resource money">40</div>

      <div class="production-box production-box-size2">
        <div class="money production ">1</div>
        <div class="production plant"></div>
      </div>
      
      <div class="description">
        (You start with 1 plant production, 1 MC production and 40 MC.)
      </div>
`],
    [CardName.PROJECT_WORKSHOP, `
      
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">ACTION</div>

          <div style="margin-top:-2px">
            FLIP <div class="resource card card-small"><div class="card-icon card-icon-blue"></div></div>
            <div class="red-arrow "></div>
            ? <div class="tile rating"></div>
            <div class="resource card card-small"></div>
            <div class="resource card card-small"></div>
          </div>

          <div>
            OR <div class="money production">3</div>
            <div class="red-arrow "></div>
            <div class="resource card card-small"><div class="card-icon card-icon-blue"></div></div>
          </div>

          <div class="effect description">
            (Action: Flip and discard a played blue card to convert any VP on it into TR and draw 2 cards, or spend 3 MC to draw a blue card.)
          </div>
        </div>
      </div>

      <div class="project_workshop">PROJECT WORKSHOP</div>
      <div class="resource money">39</div>
      <div class="resource steel"></div>
      <div class="resource titanium"></div>
      <div class="resource card card-medium"><div class="card-icon card-icon-blue"></div></div>
      
      <div class="description">
        (You start with 39 MC, 1 steel and 1 titanium.
        <br>
        As your first action, draw a blue card.)
      </div>
`],
    [CardName.INCITE, `
      
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">EFFECT</div>
          + <div class="influence"></div>
          <br>
          <div class="delegate effect"></div> : <div class="money resource effect-money">-2</div>
          <div class="description effect">
            (Effect: You have influence +1. When you send a delegate using the lobbying action, you pay 2 MC less for it.)
          </div>
        </div>
      </div>

      <div class="incite">INCITE</div>
      <div class="resource money">32</div>
      <div class="delegate"></div><div class="delegate"></div>
      
      <div class="description start-text">
        (You start with 32 MC. As your first action, place two delegates in one party.)
      </div>
`],
    [CardName.PLAYWRIGHTS, `
      
      <div class="contentCorporation">
        <div class="corporationEffectBox">
          <div class="corporationEffectBoxLabel">ACTION</div>
          <div class="resource money effect-money">?</div>
          <div class="red-arrow"></div>
          REPLAY &nbsp;<div class="resource card red-outline"><div class="card-icon tag-event"></div></div>&nbsp;*
          
          <div class="description effect">
            (Action: Replay a played event from any player by paying its cost ONLY in MC (discounts and rebates apply), then REMOVE IT FROM PLAY.)
          </div>
        </div>
      </div>

      <div class="playwrights">Playwrights</div>
      <div class="resource money">38</div>
      <div class="production-box">
        <div class="production energy"></div>
      </div>
      
      <div class="description start-text">
        (You start with 38 MC and 1 Energy production.)
      </div>
`],
    [CardName.MIDAS, `
      

      <div class="midas">Midas</div>
      <div class="resource money">120</div>
      <span class="start-tr-text">-7</span>
      <div class="tile rating"></div>

      <div class="description">
        (You start with 120 MC. Lower your TR 7 steps.)
      </div>
`],
  ]);
