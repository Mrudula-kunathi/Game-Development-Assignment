window.addEventListener("DOMContentLoaded", function (event) {
  window.focus();  
  let st; 
  let opacity;
  let lt; 
  let sCount; 
  let points;
  let sp; 
  let ap;
  let controls; 
  let play = false;
  const w = 15; 
  const h = 15; 
  const color = "brown";  
  let decayRate = 6000; 
  const velocity = 180; 
  const opacityup = 0.6; 
  let expDecay = 1+0.024;

  
  const box = document.querySelector(".box");
  for (let i = 0; i < w * h; i++) {
    const gameBox = document.createElement("div");
    gameBox.setAttribute("class", "gameBox");
    gameBox.setAttribute("id", i); 

    const piece = document.createElement("div");
    piece.setAttribute("class", "piece");
    piece.appendChild(gameBox);

    box.appendChild(piece);
  }

  const pieces = document.querySelectorAll(".box .piece .gameBox");

  const conEle = document.querySelector(".conEle");
  const footer = document.querySelector("footer");
  const opacityEle = document.querySelector(".opacity");
  const pointsEle = document.querySelector(".points");

 
  restart();

 
  function restart() {
    
    sp = [164, 165, 166, 167];
    ap = 100;

    
    st = undefined;
    lt = undefined;
    sCount = -1; 
    points = 0;
    opacity = 1;

    
    controls = [];

    opacityEle.innerText = `${Math.floor(opacity * 100)}%`;
    pointsEle.innerText = points;

    
    for (const piece of pieces) setPiece(piece);

   
    setPiece(pieces[ap], {
      "background-color": color,
      "border-radius": "50%"
    });

    
    for (const i of sp.slice(1)) {
      const playerPart = pieces[i];
      playerPart.style.backgroundColor = color;

      
      if (i == sp[sp.length - 1])
        playerPart.style.left = 0;
      if (i == sp[0]) playerPart.style.right = 0;
    }
  }

  
  window.addEventListener("keydown", function (event) {
   
    if (
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "H",
        "h",
        "E",
        "e"
      ].includes(event.key)
    )
      return;

   
    event.preventDefault();

    if (event.key == " ") {
      restart();
      playGame();
      return;
    }
    if (
      event.key == "ArrowUp" &&
      controls[controls.length - 1] != "up" &&
      orientation() != "down"
    ) {
      controls.push("up");
      if (!play) playGame();
      return;
    }
    if (
      event.key == "ArrowDown" &&
      controls[controls.length - 1] != "down" &&
      orientation() != "up"
    ) {
      controls.push("down");
      if (!play) playGame();
      return;
    }

    if (
      event.key == "ArrowLeft" &&
      controls[controls.length - 1] != "left" &&
      orientation() != "right"
    ) {
      controls.push("left");
      if (!play) playGame();
      return;
    }
    
    if (
      event.key == "ArrowRight" &&
      controls[controls.length - 1] != "right" &&
      orientation() != "left"
    ) {
      controls.push("right");
      if (!play) playGame();
      return;
    }
    
  });

  
  function playGame() {
    play = true;
    footer.style.opacity = 0;
    window.requestAnimationFrame(game);
  }

  function game(ts) {
    try {
      if (st === undefined) st = ts;
      const duration = ts - st;
      const previousDuration = ts - lt;

      const expectedInputs = Math.floor(duration / velocity);
      const inputRatio = (duration % velocity) / velocity;

  
      if (sCount != expectedInputs) {
        inputTransition(inputRatio);

      
        const playerPosition = sp[sp.length - 1];
        if (playerPosition == ap) {
          
          points++;
          pointsEle.innerText = points;

          
          spawnUnit();
          opacity = Math.min(1, opacity + opacityup);
        }

        sCount++;
      } else {
        changes(inputRatio);
      }

      if (lt) {
        const opacityDecrease =
          previousDuration /
          (Math.pow(expDecay, points) * decayRate);
        opacity = Math.max(0, opacity - opacityDecrease);
      }

      opacityEle.innerText = `${Math.floor(opacity * 100)}%`;
      conEle.style.opacity = opacity;

      window.requestAnimationFrame(game);
    } catch (error) {
      const startButton = "hit space bar to restart the game";
      footer.style.opacity = 1;
      conEle.style.opacity = 1;
    }

    lt = ts;
  }

  
  function inputTransition(inputRatio) {
    
    const nextPlayerPos = acquireCurrentPos();
    sp.push(nextPlayerPos);
    const lastPlayerPosition = pieces[sp[0]];
    setPiece(lastPlayerPosition);

    if (nextPlayerPos != ap) {
     sp.shift();
      const end = pieces[sp[0]];
      const endDi = endDirection();
      const endValue = `${100 - inputRatio * 100}%`;
      if (endDi == "down")
        setPiece(end, {
          top: 0,
          height: endValue,
          "background-color": color
        });
      if (endDi == "right")
        setPiece(end, {
          left: 0,
          width: endValue,
          "background-color": color
        });
      if (endDi == "up")
          setPiece(end, {
            bottom: 0,
            height: endValue,
            "background-color": color
          });

      if (endDi == "left")
        setPiece(end, {
          right: 0,
          width: endValue,
          "background-color": color
        });
      }
    const previousHead = pieces[sp[sp.length - 2]];
    setPiece(previousHead, { "background-color": color });

  
    const start = pieces[nextPlayerPos];
    const startDi = orientation();
    const startValue = `${inputRatio * 100}%`;
    if (startDi == "up")
      setPiece(start, {
        bottom: 0, 
        height: startValue,
        "background-color": color,
        "border-radius": 0
      });
    if (startDi == "left")
        setPiece(start, {
          right: 0, 
          width: startValue,
          "background-color": color,
          "border-radius": 0
        });
    if (startDi == "right")
      setPiece(start, {
        left: 0, 
        width: startValue,
        "background-color": color,
        "border-radius": 0
      });

    if (startDi == "down")
      setPiece(start, {
        top: 0, 
        height: startValue,
        "background-color": color,
        "border-radius": 0
      });
  }

  
  function changes(inputRatio) {
    const start = pieces[sp[sp.length - 1]];
    const startDi = orientation();
    const startValue = `${inputRatio * 100}%`;
    if (startDi == "right" || startDi == "left") start.style.w = startValue;
    if (startDi == "down" || startDi == "up") start.style.h = startValue;

    const end = pieces[sp[0]];
    const endDi = endDirection();
    const endValue = `${100 - inputRatio * 100}%`;
    if (endDi == "right" || endDi == "left") end.style.w = endValue;
    if (endDi == "down" || endDi == "up") end.style.h = endValue;
  }

  function acquireCurrentPos() {
    const playerPosition = sp[sp.length - 1];
    const playerDir = controls.shift() || orientation();
    switch (playerDir) {
      case "up": {
        const nPos = playerPosition - w;
        if (nPos < 0) throw Error("");
        
        if (sp.slice(1).includes(nPos))
          throw Error("");
        return nPos;
      }
      case "right": {
        const nPos = playerPosition + 1;
        if (nPos % w == 0) throw Error("");
        
        if (sp.slice(1).includes(nPos))
          throw Error("");
        return nPos;
      }
      case "down": {
        const nPos = playerPosition + w;
        if (nPos > w * h - 1)
          throw Error("");
        
        if (sp.slice(1).includes(nPos))
          throw Error("");
        return nPos;
      }
      case "left": {
        const nPos = playerPosition - 1;
        if (nPos % w == w - 1 || nPos < 0)
          throw Error("");
        
        if (sp.slice(1).includes(nPos))
          throw Error("");
        return nPos;
      }
    }
  }

  
  function orientation() {
    const start = sp[sp.length - 1];
    const n = sp[sp.length - 2];
    return retrieveDir(start, n);
  }

  
  function endDirection() {
    const end1 = sp[0];
    const end2 = sp[1];
    return retrieveDir(end1, end2);
  }

  function retrieveDir(f, s) {
    if (f + w == s) return "up";
    if (f - 1 == s) return "right";
    if (f - w == s) return "down";
    if (f + 1 == s) return "left";
    throw Error("");
  }

  
  function spawnUnit() {
    
    let newPos;
    do {
      newPos = Math.floor(Math.random() * w * h);
    } while (sp.includes(newPos));

    setPiece(pieces[newPos], {
      "background-color": color,
      "border-radius": "50%"
    });


    ap = newPos;
  }


  function setPiece(element, or= {}) {
    const def = {
      top: "auto",
      bottom: "auto",
      height: "100%",
      width: "100%",
      left: "auto",
      right: "auto",
      "background-color": "transparent"
    };
    const props = { ...def, ...or};
    element.style.cssText = Object.entries(props)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");
  }
});
