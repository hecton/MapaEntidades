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
    {x: -150, y: 250, r: DOT_RADIUS},
    {x: 150, y: 250, r: DOT_RADIUS},
]
const connections = [
    { d1: 0, d2: 1, description: 'Pai' },
    { d1: 0, d2: 2, description: 'Tio' },
]
const notes = []

// tipos
const TIPO_DOT = 'DOT'
const TIPO_NOTE = 'NOTE'

// configurações de notas
const NOTE_EMPTY_MESSAGE = 'Digite aqui...'


// estilos
DEFAULT_FONT_FAMILY = 'Arial';
DEFAULT_FONT_SIZE = 10;
DEFAULT_FONT_COLOR = 'black';

const style = {
    notes: {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        fontColor: DEFAULT_FONT_COLOR,
        margem: 4
    }
}

const arrowDistance = 3;

const controle = {
    noteToEdit: false,
    tela: {},
    clickedEntity: null,
    selectedItens: {
        dots: [],
        notes: [],
        size: 0,
    },
    
    mouse: {
        x: 0, y: 0, btn0: false, btn2: false, doubleClick: false
    },
}
const renderConfig = {
    scala: 1,
}

// COISAS PARA FAZER
// TODO: limpar area de selecao


let noteTextTest = 'Lorem ipsum dolor sit amet,\n consectetur adipiscing elit. Aenean accumsan dui dolor';
init();
addNote(noteTextTest, 0, 0)
render();

function render() {
    updateRenderConfig()
    clearCanva()
    renderConnections()
    renderDots();
    renderNotes();
    renderSelectionArea()
}

function renderNotes() {
    for(note of notes) {
        renderNote(note)
    }
}


function addNote(text, x, y) {
    let { lines, w, h} = getTextInfos(text ?? NOTE_EMPTY_MESSAGE, style.notes);
    notes.push({
        lines, x, y,
        text,
        w: w + style.notes.margem*2,
        h: h + style.notes.margem*2
    });
}

function getTextInfos(text, style)
{
    let lines = text.split('\n')
    let w = 0;
    let h = style.fontSize*lines.length;

    canva.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
    for(line of lines) {
        let metrics = canva.ctx.measureText(line);

        if(metrics.width > w) {
            w = metrics.width
        }
    }

    return {lines, w, h}
}

function renderNote(note) {
    let box = getRetangleInTela(note)
    let margem = byScala(style.notes.margem)
    let size = byScala(style.notes.fontSize)

    drawRetangle(box)
    renderMultLineText(note.text ? note.lines : [NOTE_EMPTY_MESSAGE], box.x+margem, box.y+margem+size, size, style.notes);
}

function renderMultLineText(lines, x, y, lineHeight, style) {
    canva.ctx.beginPath();
    setFontStyle(style);

    let cy = y;
    for(line of lines) {
        canva.ctx.fillText(line, x, cy);
        cy+=lineHeight
    }
}

function setFontStyle(style) {
    let fontSize = byScala(style.fontSize)
    canva.ctx.font = `${fontSize}px ${style.fontFamily}`;
    canva.ctx.fillStyle = style.fontColor;
    canva.ctx.textAlign = style.textAlign ?? 'left';
}

function drawRetangle(retangle, color) {
    canva.ctx.beginPath(); // Start a new path
    canva.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Set the fill color to a semi-transparent black
    canva.ctx.fillRect(retangle.x, retangle.y, retangle.w, retangle.h); // Draw the rectangle
    canva.ctx.strokeStyle = 'black'; // Set the stroke color to black
    canva.ctx.strokeRect(retangle.x, retangle.y, retangle.w, retangle.h); // Draw the rectangle outline
}

function getRetangleInTela(retangle)
{
    let result = getTelaPosition(note.x, note.y)
    result.w = byScala(retangle.w)
    result.h = byScala(retangle.h)

    return result;
}

function drawTextInBox(text, box, style) {
    let words = text.split(' ');
    let line = '';
    let lines = [];
    let margem = byScala(style.margem);
    let fontSize = byScala(style.fontSize)

    canva.ctx.font = `${fontSize}px ${style.fontFamily}`;
    let maxWidth = box.w - margem * 2;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = canva.ctx.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line)

    let lineHeight = fontSize + margem;
    let y = box.y + margem + fontSize;

    canva.ctx.fillStyle = style.fontColor;
    canva.ctx.textAlign = 'left';

    for (let i = 0; i < lines.length; i++) {
        canva.ctx.fillText(lines[i], box.x + margem, y);
        y += lineHeight;
    }




    // // set blackground color
    // let margem = byScala(style.notes.margem);
    
    // let textBox = getTextSize(note.text, style.notes.fontSize, style.notes.fontFamily, margem)
    // canva.ctx.fillStyle = 'white'; // Set the background color
    // canva.ctx.fillRect(x - (textBox.width/2), y - (textBox.height/2), textBox.width, textBox.height); // Draw the background rectangle
    
    // canva.ctx.font = `${style.notes.fontSize}px ${style.notes.fontFamily}`; // Set the font size and family
    // canva.ctx.fillStyle = style.notes.fontColor; // Set the text color
    // canva.ctx.textAlign = 'center'; // Set the text alignment
    // canva.ctx.textBaseLine = 'middle'; // Set the text alignment
    // canva.ctx.fillText(note.text, x, y+margem);
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
        e.preventDefault()
    }, false);
    document.addEventListener('keydown', (e) => {
        if(controle.noteToEdit) {
            editNoteText(controle.noteToEdit.key, e)
        }
    })
}

function editNoteText(noteKey, keydownEvent) {
    if (!notes[noteKey]) return;
    
    let note = notes[noteKey]
    let text = updateTextByKeydownEvent(note.text, keydownEvent);
    note.text = text;
    
    let { lines, w, h } = getTextInfos(note.text.length ? note.text : NOTE_EMPTY_MESSAGE, style.notes);
    console.log(lines, w, h)
    note.lines = lines;
    note.w = w + style.notes.margem * 2;
    note.h = h + style.notes.margem * 2;
    
    notes[noteKey] = note
    render();
}

function updateTextByKeydownEvent(text, keydownEvent) {
    let newText = text
    if (keydownEvent.key === 'Backspace') {
        if (newText.length > 0) {
            newText = newText.slice(0, -1);
        }
    } else if (keydownEvent.key === 'Enter') {
        newText += '\n';
    } else if (keydownEvent.key.length === 1) {
        newText += keydownEvent.key;
    }
    console.log(text, keydownEvent.key)
    return newText;
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
    if ( !controle.mouse.btn0) {
        if(controle.mouse.selectionArea) {
            runSelectionArea();
        } else if(controle.selectedItens.size == 1) {// TODO: validar isso aqui.
            setSelectedItens();
        }
    }
    else if (controle.mouse.btn0) {// TODO: adicionar click rapido.
        controle.noteToEdit = null;
        setClickedEntity()

        if(!controle.selectedItens.size && !controle.mouse.selectionArea) {
            setClickedEntityOnSelectedItens()
        }

        if(!controle.selectedItens.size) {
            controle.mouse.selectionArea = {
                init_x: controle.mouse.selectionArea? controle.mouse.selectionArea.init_x : controle.mouse.x,
                init_y: controle.mouse.selectionArea? controle.mouse.selectionArea.init_y : controle.mouse.y,
                end_x: controle.mouse.x,
                end_y: controle.mouse.y,
            }
        }
    }


    controle.mouse.diff = {
        x: controle.mouse.x - controle.mouse.old.x,
        y: controle.mouse.y - controle.mouse.old.y
    }

    runControle();
}

function setClickedEntity() {
    controle.clickedEntity = getEntidadeInPosition(controle.mouse.x, controle.mouse.y)
}

function runSelectionArea() {
    // console.log('runSelectionArea')
    // limpa a area de selecao.
    if (!controle.mouse.selectionArea) return setSelectedItens();

    // coloca na perpectiva do mapa.
    let init = getMapaPosition(controle.mouse.selectionArea.init_x, controle.mouse.selectionArea.init_y)
    let end = getMapaPosition(controle.mouse.selectionArea.end_x, controle.mouse.selectionArea.end_y)
    
    // busca os itens dentro mapa.
    let { dots, notes } = getItensInArea(init.x, init.y, end.x, end.y)
    setSelectedItens(dots, notes)

    controle.mouse.selectionArea = null;
}

function setSelectedItens(dots = [], notes = []) {   
    controle.selectedItens.dots = dots
    controle.selectedItens.notes = notes
    controle.selectedItens.size = dots.length + notes.length
    // console.log('setSelectedItens', ''+controle.selectedItens.size)
}

function getItensInArea(x1, y1, x2, y2) {
    let area = getRetangleByPositions(x1, y1, x2, y2)
    let dots = getDotsInArea(area)
    let notes = getNotesInArea(area)

    return { dots, notes }
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

function getNotesInArea(area) {
    let notesInArea = []
    for(noteKey in notes) {
        let note = notes[noteKey]

        if (checkRetangleColision(area, note)) {
            notesInArea.push(noteKey)
        }
    }
    return notesInArea;
}

function checkRetangleColision(t1, t2) {
    return !(
        t1.x > t2.x + t2.w ||
        t1.x + t1.w < t2.x ||
        t1.y > t2.y + t2.h ||
        t1.y + t1.h < t2.y
    );
}

function getSelectedItem() {
    let selecteds = {...controle.selectedItens}
    if(selecteds.dots.length) {
        return {type: TIPO_DOT, key: selecteds.dots[0]}
    } 
    else if(selecteds.notes.length) {
        return {type: TIPO_NOTE, key: selecteds.notes[0]}
    }

    return null;
}


function runControle() {
    // duplo click com um item selecionado
    let size = controle.selectedItens?.size;
    if(controle.mouse.doubleClick && size == 1 && !controle.mouse.clickMove) {
        let item = getSelectedItem();

        if(item.type === TIPO_DOT) {
            addRandomDotConnection(item.key)
        } else if(item.type === TIPO_NOTE) {
            setToEditNote(item.key)
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
    else if (controle.mouse.btn0 && controle.mouse.clickMove && controle.selectedItens) {
        moveSelectionArea();
    }
    render();
}

function setToEditNote(key) {
    let note = notes[key]
    controle.noteToEdit = {
        position: note.text.length,
        key,
    }
}


function moveSelectionArea() {
    for(dotList of controle.selectedItens.dots) {
        moveDot(dotList)
    }
    
    for(noteList of controle.selectedItens.notes) {
        moveNote(noteList)
    }
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

// TODO: validar para juntar na função de mover o dot.
function moveNote(key) {
    let dot = notes[key]
    let tela = getTelaPosition(dot.x, dot.y);
    tela.x += controle.mouse.diff.x;
    tela.y += controle.mouse.diff.y;

    let {x, y} = getMapaPosition(tela.x, tela.y);

    dot.x = x;
    dot.y = y;
}

function moveTela() {
    controle.tela.x += controle.mouse.diff.x
    controle.tela.y += controle.mouse.diff.y
}

function getEntidadeInPosition(x, y) {
    let dot = getDotByPosition(x, y);
    if(dot) return {dot}

    let note = getNoteByPosition(x,y);
    if (note) return {note}

    return null
}

function setClickedEntityOnSelectedItens() {
    setSelectedItens(
        controle.clickedEntity?.dot? [controle.clickedEntity.dot] : [],
        controle.clickedEntity?.note? [controle.clickedEntity.note] : []
    )
}

function getDotByPosition(x, y) {
    // TODO: testar se está funcionando.
    let {x: mx, y: my} = getMapaPosition(x, y)// TODO: optimizar

    for(dotKey in dots) {
        let dot = dots[dotKey]

        if (getCircleColision(dot.x, dot.y, dot.r, mx, my)) {
            return dotKey;
        }
    }
}

function getNoteByPosition(x, y) {
    let {x: mx, y: my} = getMapaPosition(x, y)// TODO: optimizar

    // TODO: validar se é o notekey que temos que usar.
    for(noteKey in notes) {
        let note = notes[noteKey]

        if (checkPointRentangleColision(mx, my, note.x, note.y, note.w, note.h)) {
            return noteKey;
        }
    }
}

function checkPointRentangleColision(x, y, rx, ry, rw, rh) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
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