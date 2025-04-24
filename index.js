const DOT_RADIUS = 30;
const DOT_TEXT_MARGE = 20;
const DOT_TEXT_SIZE = 20;
const DOT_TEXT_COLOR = 'black';
const DOT_TEXT_FONT = 'Arial';
const MIN_SCALE = 0.1
const MAX_SCALE = 4;

const canva = {}
const dots = [
    {x: 0, y: 0, r: DOT_RADIUS, text: 'Hecton Aparecido Gonçalves'},
    // {x: -150, y: 250, r: DOT_RADIUS},
    // {x: 150, y: 250, r: DOT_RADIUS},
]
const connections = [
    // { d1: 0, d2: 1, description: 'Pai' },
    // { d1: 0, d2: 2, description: 'Tio' },
]

const arrowDistance = 3;

const controle = {
    tela: {},
    dotCatched: null,
    selectedItens: {
        dots: [],
        length: 0,
    },
    
    mouse: {
        x: 0, y: 0, btn0: false, btn2: false, doubleClick: false
    },
}
const renderConfig = {
    scala: 1,
}

// COISAS PARA FAZER
// limpar area de selecao



init();
render();

function render() {
    updateRenderConfig()
    clearCanva()
    renderConnections()
    renderDots();
    renderSelectionArea()
}

function renderSelectionArea() {
    if (!controle.mouse.selectionArea) return

    let {init_x, init_y, end_x, end_y} = controle.mouse.selectionArea

    let w = end_x - init_x
    let h = end_y - init_y

    canva.ctx.beginPath(); // Start a new path
    canva.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Set the fill color to a semi-transparent black
    canva.ctx.fillRect(init_x, init_y, w, h); // Draw the rectangle
    canva.ctx.strokeStyle = 'black'; // Set the stroke color to black
    canva.ctx.strokeRect(init_x, init_y, w, h); // Draw the rectangle outline
}

function updateRenderConfig() {
    renderConfig.scala = controle.tela.z
}

function renderConnections() {
    for(connection of connections) {
        renderConncection(connection)
    }
}

function renderConncection(connection) {
    let dot1 = dots[connection.d1]
    let dot2 = dots[connection.d2]

    if (checkDotColision(dot1, dot2)) {
        // Se os círculos colidirem, não desenhe a linha
        return;
    }


    // levar em consideração o tamanho do círculo
    let angle1 = getAngle(dot1.x, dot1.y, dot2.x, dot2.y)
    let angle2 = getAngle(dot2.x, dot2.y, dot1.x, dot1.y)
    let {x: dx1, y: dy1} = getCircleBorderPositionByAngle(dot1.x, dot1.y, getDotRadius(dot1.r) + arrowDistance, angle1)
    let {x: dx2, y: dy2} = getCircleBorderPositionByAngle(dot2.x, dot2.y, getDotRadius(dot2.r) + arrowDistance, angle2)

    // draw arrow
    let {x: x1, y: y1} = getTelaPosition(dx1, dy1)
    let {x: x2, y: y2} = getTelaPosition(dx2, dy2)
    drawArrow(x1, y1, x2, y2)

    // draw text
    if(!connection.description) return

    let {x: cx, y: cy} = getCenterOfLine(x1, y1, x2, y2)
    drawCenterText(connection.description, cx, cy, byScala(DOT_TEXT_SIZE), DOT_TEXT_FONT, DOT_TEXT_COLOR)
}

function getDotRadius(r) {
    return r
}

function getAngle(x1, y1, x2, y2) {
    // Calculate the angle between two points (x1, y1) and (x2, y2)
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const angle = Math.atan2(deltaY, deltaX); // Angle in radians

    return angle;
}


function getCircleBorderPositionByAngle(x, y, r, angle) {
    // Calculate the x and y coordinates of the point on the circle's border
    const xBorder = x + r * Math.cos(angle);
    const yBorder = y + r * Math.sin(angle);

    return { x: xBorder, y: yBorder };
}

function drawArrow(x1, y1, x2, y2) {
    canva.ctx.beginPath();
    canva.ctx.moveTo(x1, y1);
    canva.ctx.lineTo(x2, y2);
    canva.ctx.stroke();

    // Calculate the angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Calculate the arrowhead points
    const arrowLength = getLength(10); // Length of the arrowhead
    const arrowAngle = Math.PI / 6; // Angle of the arrowhead

    const x3 = x2 - arrowLength * Math.cos(angle - arrowAngle);
    const y3 = y2 - arrowLength * Math.sin(angle - arrowAngle);
    const x4 = x2 - arrowLength * Math.cos(angle + arrowAngle);
    const y4 = y2 - arrowLength * Math.sin(angle + arrowAngle);

    canva.ctx.beginPath();
    canva.ctx.moveTo(x2, y2);
    canva.ctx.lineTo(x3, y3);
    canva.ctx.lineTo(x4, y4);
    canva.ctx.closePath();
    canva.ctx.fillStyle = "black"; // Change to your desired color
    canva.ctx.fill();
}

function getCenterOfLine(x1, y1, x2, y2) {
    return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    }
}


function getLength(length) {
    return length * renderConfig.scala
}

function clearCanva() {
    canva.ctx.clearRect(0, 0, canva.width, canva.height)
}

function renderDots() {
    for(dot of dots) {
        renderDot(dot);
    }
}

function renderDot(dot) {
    let {x, y} = getTelaPosition(dot.x, dot.y)
    let r = byScala(dot.r)

    drawCircle(x, y, r);

    if (dot.text) {
        drawCenterText(dot.text, x, y + r*1.1, byScala(DOT_TEXT_SIZE), DOT_TEXT_FONT, DOT_TEXT_COLOR)
    }
}

function byScala(value) {
    return value * renderConfig.scala
}


function drawCenterText(text, x, y, fontSize, fontFamily, color = 'black') {
    // set blackground color
    let margem = byScala(4);

    let textBox = getTextSize(text, fontSize, fontFamily, margem)
    canva.ctx.fillStyle = 'white'; // Set the background color
    canva.ctx.fillRect(x - (textBox.width/2), y - (textBox.height/2), textBox.width, textBox.height); // Draw the background rectangle

    canva.ctx.font = `${fontSize}px ${fontFamily}`; // Set the font size and family
    canva.ctx.fillStyle = color; // Set the text color
    canva.ctx.textAlign = 'center'; // Set the text alignment
    canva.ctx.textBaseLine = 'middle'; // Set the text alignment
    canva.ctx.fillText(text, x, y+margem); // Draw the text at the specified position
}

function getTelaPosition(x, y) {
    let cx = (x*renderConfig.scala)+controle.tela.x+(controle.tela.width/2)
    let cy = (y*renderConfig.scala)+controle.tela.y+(controle.tela.height/2)

    return { x: cx, y: cy }
}

function getMapaPosition(x, y) {
    let mx = (x - controle.tela.x - (controle.tela.width / 2)) / renderConfig.scala;
    let my = (y - controle.tela.y - (controle.tela.height / 2)) / renderConfig.scala;

    return { x: mx, y: my };
}

function getTextSize (text, fontSize, fontFamily, margem = 0) {
    canva.ctx.font = `${fontSize}px ${fontFamily}`; // Set the font size and family
    const metrics = canva.ctx.measureText(text);
    return { width: metrics.width + (margem*2), height: fontSize + (margem*2)};
}



function drawCircle(x, y, r) {
    canva.ctx.beginPath()
    canva.ctx.arc(x, y, r, 0, 2*Math.PI);
    canva.ctx.stroke();
}

function init() {
    setCanva();
    setTela();
    setEventListeners()
}

function setEventListeners() {
    window.addEventListener('resize', setCanvaSize)


    // eventos do mouse
    window.addEventListener('mousemove', (e) => {
        mouseUpdate({x: e.clientX, y: e.clientY})
    })
    let timeClick = new Date().getTime()
    canva.el.addEventListener('mousedown', (e) => { 
        let index = `btn${e.button}`

        let currentTime = new Date().getTime()
        let doubleClick = false;
        
        if (currentTime - timeClick < 300) {
            doubleClick = true
        }

        timeClick = currentTime;
        mouseUpdate({[index]: true, doubleClick})
    })
    canva.el.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    });
    canva.el.addEventListener('mouseup', (e) => {
        let index = `btn${e.button}`
        mouseUpdate({[index]: false, doubleClick: false})
    })
    canva.el.addEventListener('mouseleave', (e) => {
        mouseUpdate({btn0: false, btn2: false, doubleClick: false})
    });
    canva.el.addEventListener('wheel', (e) => {
        setTelaZoom(e.deltaY)
        // console.log('delta', delta, controle.tela.z)
        e.preventDefault()
    }, false);
}

function setTelaZoom(deltaY) {
    let delta = (Math.sign(deltaY)*-1)/12// TODO: adicionar um configuracao disso
    let scale = setMinMax(controle.tela.z + delta, MIN_SCALE, MAX_SCALE)

    updateTela({z: scale });
}

function setMinMax(value, min, max) {
    if (value < min) return min
    if (value > max) return max
    return value
}


function updateTela(updateData) {
    controle.tela = { ...controle.tela, ...updateData }
    controle.tela.speed = 1 - (renderConfig.scala / 100)
    // console.log('updateTela', controle.tela.speed, renderConfig.scala)
    render();
}

function mouseUpdate(updateData) {
    // console.log('update mouse', updateData)
    delete controle.mouse.old
    
    controle.mouse.old = { ...controle.mouse, date: new Date().getTime() }
    controle.mouse = { ...controle.mouse, ...updateData }

    // adiciona flags
    if(
        controle.mouse.x != controle.mouse.old.x ||
        controle.mouse.y != controle.mouse.old.y
    ) {
        controle.mouse.isMove = true
        controle.mouse.clickMove = controle.mouse.btn0 || controle.mouse.btn2
    } else {
        controle.mouse.clickMove = false
        controle.mouse.isMove = false
    }

    // valida se tá clicando em um círculo
    if ( !controle.mouse.btn0 && !controle.mouse.btn2) {
        controle.dotCatched = null
        runSelectionArea();
    }
    else if (controle.mouse.btn0 && controle.dotCatched === null) {
        controle.dotCatched = getDotByPosition(controle.mouse.x, controle.mouse.y);
    }
    else if (controle.mouse.btn0 && controle.mouse.clickMove && controle.dotCatched == null) {
        controle.mouse.selectionArea = {
            init_x: controle.mouse.selectionArea? controle.mouse.selectionArea.init_x : controle.mouse.x,
            init_y: controle.mouse.selectionArea? controle.mouse.selectionArea.init_y : controle.mouse.y,
            end_x: controle.mouse.x,
            end_y: controle.mouse.y,
        }
    }


    controle.mouse.diff = {
        x: controle.mouse.x - controle.mouse.old.x,
        y: controle.mouse.y - controle.mouse.old.y
    }

    runControle();
}

function runSelectionArea() {
    if (!controle.mouse.selectionArea) return;

    let init = getMapaPosition(controle.mouse.selectionArea.init_x, controle.mouse.selectionArea.init_y)
    let end = getMapaPosition(controle.mouse.selectionArea.end_x, controle.mouse.selectionArea.end_y)
    
    let { dots } = getItensInArea(init.x, init.y, end.x, end.y)
    setSelectedItens(dots)

    controle.mouse.selectionArea = null;
}

function setSelectedItens(dots) {
    controle.selectedItens.dots = dots
    controle.selectedItens.length = dots.length
}

function getItensInArea(x1, y1, x2, y2) {
    let area = this.getRetangleByPositions(x1, y1, x2, y2)
    let dots = getDotsInArea(area)

    return { dots }
}

function getRetangleByPositions(x1, y1, x2, y2) {
    let x = Math.min(x1, x2)
    let y = Math.min(y1, y2)

    return {
        x, y,
        w: Math.max(x1, x2) - x,
        h: Math.max(y1, y2) - y    
    }
}

function getLength(p1, p2) {
    return Math.abs(Math.max(p1, p2) - Math.min(p1, p2));
}

function getDotsInArea(area) {
    let dotsInArea = []
    for(dotKey in dots) {
        let dot = dots[dotKey]

        if (checkColisionCircleRetangle(dot.x, dot.y, dot.r, area.x, area.y,  area.w, area.h)) {
            dotsInArea.push(dotKey)
        }
    }
    return dotsInArea;
}



function runControle() {
    // para testes.
    // if(!controle.mouse.isMove) {
    // console.log(controle.mouse.btn0, controle.mouse.clickMove, controle.dotCatched)
    // }

    if(controle.mouse.doubleClick && controle.dotCatched != null) {
        if(!controle.mouse.clickMove) {
            addRandomDotConnection(controle.dotCatched)
        }
    }
    // valida se está clicando e segurando.
    else if (controle.mouse.btn2 && controle.mouse.clickMove) {
        moveTela();
    }
    else if (controle.mouse.btn2 && !controle.mouse.isMove) {
        // TODO: tem que validar o tempo do click.
        console.log('show menu')
    }
    else if (controle.mouse.btn0 && controle.mouse.clickMove) {
        if (controle.dotCatched) {
            if (catchIsInSelectedAred()) {
                moveSelectionArea();
            } else {
                moveDot(controle.dotCatched)
            }
        }
    }
    render();
}

function moveSelectionArea() {
    for(dot of controle.selectedItens.dots) {
        moveDot(dot)
    }
}

function catchIsInSelectedAred() {
    return controle.selectedItens.dots.some(dotKey => dotKey == controle.dotCatched) ?? false;
}

function addRandomDotConnection(dotKey) {
    let qtd = getRandomByRange(3,  6)

    for(let i = 0; i < qtd; i++) {
        let dot = addRandomDot()

        if (dot != dotKey) {
            addConnection(dotKey, dot)
        }
    }

    organizeConnectionPositions(dotKey)

    render()
}

function organizeConnectionPositions(dotKey) {
    let dotConnections = connections.filter(c => c.d1 == dotKey)
    
    if (!dotConnections.length) return

    let dx = dots[dotKey].x
    let dy = dots[dotKey].y
    let margemWidth = 80;
    let margemHeight = 230;

    let width = (dotConnections.length * (DOT_RADIUS*2)) + ((dotConnections.length - 1) * margemWidth)
    let currentX = dx - (width/2);

    for(connection of dotConnections) {
        let dot = dots[connection.d2]
        dot.x = currentX+DOT_RADIUS;
        dot.y = dy + margemHeight;


        currentX += (DOT_RADIUS*2) + margemWidth
    }
}

function checkColisionCircleRetangle(x, y, r, x1, y1, w, h) {
    // Check if the circle is inside the rectangle
    if (x + r < x1 || x - r > x1 + w || y + r < y1 || y - r > y1 + h) {
        return false; // No collision
    }

    // Check if the circle is inside the rectangle
    if (x > x1 && x < x1 + w && y > y1 && y < y1 + h) {
        return true; // Collision
    }

    // Check for collision with rectangle edges
    let closestX = Math.max(x1, Math.min(x, x1 + w));
    let closestY = Math.max(y1, Math.min(y, y1 + h));
    let dx = x - closestX;
    let dy = y - closestY;
    return (dx * dx + dy * dy) < (r * r);
}


function addConnection(dotKey, dotKeyConnection, type) {
    if (dotKey == dotKeyConnection) return

    connections.push({
        d1: dotKey,
        d2: dotKeyConnection,
        description: type || 'Parente'
    })
}

function getRandomByRange(min, max) {
    return Math.floor(Math.floor(Math.random() * (max - min + 1)) + min)
}

function addRandomDot() {
    let margem = 10;
    let x = getRandomByRange(margem, controle.tela.width-margem)
    let y= getRandomByRange(margem, controle.tela.height-margem)
    let r = 30;

    return addDot(x, y, r)
}

function addDot(x, y, r) { 
    dots.push({x, y, r});
    return dots.length - 1;
}


function checkDotColision(d1, d2, margem = 6) {
    return checkCircleColision(d1.x, d1.y, d1.r + margem, d2.x, d2.y, d2.r + margem);
}

function checkCircleColision(x1, y1, r1, x2, y2, r2) {
    let dx = x1 - x2
    let dy = y1 - y2
    let distance = Math.sqrt(dx * dx + dy * dy)
    return distance < (r1 + r2)
}

function moveDot(key) {
    let dot = dots[key]
    let tela = getTelaPosition(dot.x, dot.y);
    tela.x += controle.mouse.diff.x;
    tela.y += controle.mouse.diff.y;

    let {x, y} = getMapaPosition(tela.x, tela.y);

    dot.x = x;
    dot.y = y;
}

function moveTela() {
    let old = getMapaPosition(controle.mouse.old.x, controle.mouse.old.y)
    let current = getMapaPosition(controle.mouse.x, controle.mouse.y)

    let dx = current.x - old.x
    let dy = current.y - old.y


    controle.tela.x += dx
    controle.tela.y += dy
}

function getDotByPosition(x, y) {
    for(dotKey in dots) {
        let dot = dots[dotKey]
        let {x: dx, y: dy} = getTelaPosition(dot.x, dot.y)

        if (getCircleColision(dx, dy, dot.r, x, y)) {
            return dotKey;
        }
    }
}

function getCircleColision(x, y, r, cx, cy) {
    // Calculate the distance between the center of the circle and the point (cx, cy)
    const dx = cx - x;
    const dy = cy - y;
    const distanceSquared = dx * dx + dy * dy;

    // Check if the distance is less than or equal to the radius squared
    return distanceSquared <= r * r;
}


function setTela() {
    controle.tela = {
        width: canva.width,
        height: canva.height,
        x: 0,
        y: 0,
        cx: 0 - canva.width/2,
        cy: 0 - canva.height/2,
        z: 1,
        speed: 1,
    }
    
}

function setCanvaSize() {
    canva.width = window.innerWidth
    canva.height = window.innerHeight
    canva.el.width = canva.width
    canva.el.height = canva.height
}


function setCanva() {
    canva.el = document.getElementById('app')
    canva.ctx = canva.el.getContext("2d")
    setCanvaSize()
}