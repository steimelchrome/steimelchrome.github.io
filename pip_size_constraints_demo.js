const divContainer = document.getElementById('container');
const divWindow = document.getElementById('window');
const divTopLeft = document.getElementById('top-left');
const divTop = document.getElementById('top');
const divTopRight = document.getElementById('top-right');
const divLeft = document.getElementById('left');
const divRight = document.getElementById('right');
const divBottomLeft = document.getElementById('bottom-left');
const divBottom = document.getElementById('bottom');
const divBottomRight = document.getElementById('bottom-right');
const resizeHandles = [
    divTopLeft, divTop, divTopRight,
    divLeft, divRight,
    divBottomLeft, divBottom, divBottomRight
];

function calcMaxAreaRatio() {
    const params = new URLSearchParams(location.search);
    const percent = params.get('percent');
    if (!percent) {
        return 0.8;
    }
    return parseInt(percent) / 100;
}
const maxAreaRatio = calcMaxAreaRatio();

const minWindowWidth = 100;
const minWindowHeight = 100;

let divWindowWidthPx = divContainer.clientWidth / 5;
let divWindowHeightPx = divContainer.clientHeight / 5;
let divWindowTopPx = 20;
let divWindowLeftPx = 20;
let draggedResizeHandle = null;
let isMouseDownOnWindow = false;

function updateDivWindowPosition() {
    divWindow.style.top = `${divWindowTopPx}px`;
    divWindow.style.left = `${divWindowLeftPx}px`;
}

function updateDivWindowSize() {
    divWindow.style.width = `${divWindowWidthPx}px`;
    divWindow.style.height = `${divWindowHeightPx}px`;
}

function getMaxLeftPx() {
    return divContainer.clientWidth - divWindowWidthPx;
}

function getMaxTopPx() {
    return divContainer.clientHeight - divWindowHeightPx;
}

function getMaxArea() {
    return maxAreaRatio * (divContainer.clientWidth * divContainer.clientHeight);
}

function getCurrentArea() {
    return divWindowWidthPx * divWindowHeightPx;
}

resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', evt => {
        // |buttons| is odd if the left mouse button is down, so if it's even, then
        // this isn't a left click.
        if (evt.buttons % 2 == 0) {
            return;
        }
        draggedResizeHandle = handle;
    });
});

divWindow.addEventListener('mousedown', evt => {
    // |buttons| is odd if the left mouse button is down, so if it's even, then
    // this isn't a left click.
    if (evt.buttons % 2 == 0) {
        return;
    }
    isMouseDownOnWindow = true;
});

divContainer.addEventListener('mouseup', evt => {
    draggedResizeHandle = null;
    isMouseDownOnWindow = false;
});

divContainer.addEventListener('mousemove', evt => {
    // |buttons| is odd if the left mouse button is down, so if it's even, then
    // the mouse button is no longer down.
    if (evt.buttons % 2 == 0) {
        draggedResizeHandle = null;
        isMouseDownOnWindow = false;
    }
    if (draggedResizeHandle) {
        onResizeHandleDragged(evt);
    } else if (isMouseDownOnWindow) {
        onWindowDragged(evt);
    }
});

function onWindowDragged(evt) {
    divWindowLeftPx += evt.movementX;
    divWindowTopPx += evt.movementY;

    divWindowLeftPx = Math.max(0, Math.min(getMaxLeftPx(), divWindowLeftPx));
    divWindowTopPx = Math.max(0, Math.min(getMaxTopPx(), divWindowTopPx));
    updateDivWindowPosition();
}

function onResizeHandleDragged(evt) {
    getResizeCalculation(evt).run();
}

function getResizeCalculation(evt) {
    switch(draggedResizeHandle) {
        case divTopLeft:
            return new TopLeftResizeCalculation(evt);
        case divTop:
            return new TopResizeCalculation(evt);
        case divTopRight:
            return new TopRightResizeCalculation(evt);
        case divLeft:
            return new LeftResizeCalculation(evt);
        case divRight:
            return new RightResizeCalculation(evt);
        case divBottomLeft:
            return new BottomLeftResizeCalculation(evt);
        case divBottom:
            return new BottomResizeCalculation(evt);
        case divBottomRight:
            return new BottomRightResizeCalculation(evt);
    }
    throw 'invalid |draggedResizeHandle|';
}

class ResizeCalculation {
    constructor(evt) {}

    run () {
        if (divWindowWidthPx + this.deltaWidth < minWindowWidth) {
            this.adjustToDeltaWidth(minWindowWidth - divWindowWidthPx);
        }
        if (divWindowHeightPx + this.deltaHeight < minWindowHeight) {
            this.adjustToDeltaHeight(minWindowHeight - divWindowHeightPx);
        }
        if (divWindowLeftPx + this.deltaLeft < 0) {
            this.adjustToDeltaLeft(-1 * divWindowLeftPx);
        }
        if (divWindowTopPx + this.deltaTop < 0) {
            this.adjustToDeltaTop(-1 * divWindowTopPx);
        }
        if (divWindowLeftPx + divWindowWidthPx + this.deltaWidth - this.deltaLeft > divContainer.clientWidth) {
            this.adjustToDeltaWidth(divContainer.clientWidth - (divWindowLeftPx + divWindowWidthPx) - this.deltaLeft);
        }
        if (divWindowTopPx + divWindowHeightPx + this.deltaHeight - this.deltaTop > divContainer.clientHeight) {
            this.adjustToDeltaHeight(divContainer.clientHeight - (divWindowTopPx + divWindowHeightPx) - this.deltaTop);
        }
        if ((divWindowWidthPx + this.deltaWidth) * (divWindowHeightPx + this.deltaHeight) > getMaxArea()) {
            this.adjustToDeltaArea(getMaxArea() - getCurrentArea());
        }

        divWindowWidthPx += this.deltaWidth;
        divWindowHeightPx += this.deltaHeight;
        divWindowTopPx += this.deltaTop;
        divWindowLeftPx += this.deltaLeft;
        updateDivWindowPosition();
        updateDivWindowSize();
    }

    adjustToDeltaWidth(newDeltaWidth) {
        throw 'NotImplementedError';
    }

    adjustToDeltaHeight(newDeltaHeight) {
        throw 'NotImplementedError';
    }

    adjustToDeltaLeft(newDeltaLeft) {
        throw 'NotImplementedError';
    }

    adjustToDeltaTop(newDeltaTop) {
        throw 'NotImplementedError';
    }

    adjustToDeltaArea(newDeltaArea) {
        throw 'NotImplementedError';
    }

    calcDeltas() {
        throw 'NotImplementedError';
    }
}

class CornerResizeCalculation extends ResizeCalculation {
    constructor(evt) {
        super(evt);
        this.widthRatio = divWindowWidthPx / (divWindowWidthPx + divWindowHeightPx);
        this.heightRatio = 1 - this.widthRatio;
    }

    adjustToDeltaArea(newDeltaArea) {
        // deltaArea = (deltaWidth*currentHeight + deltaHeight*currentWidth + deltaWidth*deltaHeight)
        // deltaArea = (widthRatio*deltaBase*currentHeight + heightRatio*deltaBase*currentWidth + deltabase^2*widthRatio*heightRatio)
        // deltaArea = (widthRatio*heightRatio)deltaBase^2 + (widthRatio*currentHeight+heightRatio*currentWidth)deltaBase
        // a := widthRatio*heightRatio
        // b := widthRatio*currentWidth + heightRatio*currentHeight
        // c := -deltaArea
        // =>
        // deltaBase = (-b +- sqrt(b^2 - 4*a*c))/(2*a)
        const a = this.widthRatio * this.heightRatio;
        const b = (this.widthRatio * divWindowHeightPx) + (this.heightRatio * divWindowWidthPx);
        const c = -1 * newDeltaArea;
        this.deltaBase = ((-1 * b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
        this.calcDeltas();
    }
}

class TopLeftResizeCalculation extends CornerResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = -1 * (evt.movementX + evt.movementY);
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.widthRatio * this.deltaBase;
        this.deltaHeight = this.heightRatio * this.deltaBase;
        this.deltaLeft = -1 * this.deltaWidth;
        this.deltaTop = -1 * this.deltaHeight;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth / this.widthRatio;
        this.calcDeltas();
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight / this.heightRatio;
        this.calcDeltas();
    }

    adjustToDeltaLeft(newDeltaLeft) {
        this.deltaBase = -1 * newDeltaLeft / this.widthRatio;
        this.calcDeltas();
    }

    adjustToDeltaTop(newDeltaTop) {
        this.deltaBase = -1 * newDeltaTop / this.heightRatio;
        this.calcDeltas();
    }
}

class TopResizeCalculation extends ResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = -1 * evt.movementY;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = 0;
        this.deltaHeight = this.deltaBase;
        this.deltaLeft = 0;
        this.deltaTop = -1 * this.deltaHeight;
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight;
        this.calcDeltas();
    }

    adjustToDeltaTop(newDeltaTop) {
        this.deltaBase = newDeltaTop;
        this.calcDeltas();
    }

    adjustToDeltaArea(newDeltaArea) {
        this.deltaBase = newDeltaArea / divWindowWidthPx;
        this.calcDeltas();
    }
}

class TopRightResizeCalculation extends CornerResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = evt.movementX - evt.movementY;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.widthRatio * this.deltaBase;
        this.deltaHeight = this.heightRatio * this.deltaBase;
        this.deltaLeft = 0;
        this.deltaTop = -1 * this.deltaHeight;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth / this.widthRatio;
        this.calcDeltas();
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight / this.heightRatio;
        this.calcDeltas();
    }

    adjustToDeltaTop(newDeltaTop) {
        this.deltaBase = -1 * newDeltaTop / this.heightRatio;
        this.calcDeltas();
    }
}

class LeftResizeCalculation extends ResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = -1 * evt.movementX;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.deltaBase;
        this.deltaHeight = 0;
        this.deltaLeft = -1 * this.deltaWidth;
        this.deltaTop = 0;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth;
        this.calcDeltas();
    }

    adjustToDeltaLeft(newDeltaLeft) {
        this.deltaBase = -1 * newDeltaLeft;
        this.calcDeltas();
    }

    adjustToDeltaArea(newDeltaArea) {
        this.deltaBase = newDeltaArea / divWindowHeightPx;
        this.calcDeltas();
    }
}

class RightResizeCalculation extends ResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = evt.movementX;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.deltaBase;
        this.deltaHeight = 0;
        this.deltaLeft = 0;
        this.deltaTop = 0;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth;
        this.calcDeltas();
    }

    adjustToDeltaArea(newDeltaArea) {
        this.deltaBase = newDeltaArea / divWindowHeightPx;
        this.calcDeltas();
    }
}

class BottomLeftResizeCalculation extends CornerResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = evt.movementY - evt.movementX;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.widthRatio * this.deltaBase;
        this.deltaHeight = this.heightRatio * this.deltaBase;
        this.deltaLeft = -1 * this.deltaWidth;
        this.deltaTop = 0;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth / this.widthRatio;
        this.calcDeltas();
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight / this.heightRatio;
        this.calcDeltas();
    }

    adjustToDeltaLeft(newDeltaLeft) {
        this.deltaBase = -1 * newDeltaLeft / this.widthRatio;
        this.calcDeltas();
    }
}

class BottomResizeCalculation extends ResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = evt.movementY;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = 0;
        this.deltaHeight = this.deltaBase;
        this.deltaLeft = 0;
        this.deltaTop = 0;
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight;
        this.calcDeltas();
    }

    adjustToDeltaArea(newDeltaArea) {
        this.deltaBase = newDeltaArea / divWindowWidthPx;
        this.calcDeltas();
    }
}

class BottomRightResizeCalculation extends CornerResizeCalculation {
    constructor(evt) {
        super(evt);
        this.deltaBase = evt.movementX + evt.movementY;
        this.calcDeltas();
    }

    calcDeltas() {
        this.deltaWidth = this.widthRatio * this.deltaBase;
        this.deltaHeight = this.heightRatio * this.deltaBase;
        this.deltaLeft = 0;
        this.deltaTop = 0;
    }

    adjustToDeltaWidth(newDeltaWidth) {
        this.deltaBase = newDeltaWidth / this.widthRatio;
        this.calcDeltas();
    }

    adjustToDeltaHeight(newDeltaHeight) {
        this.deltaBase = newDeltaHeight / this.heightRatio;
        this.calcDeltas();
    }
}


updateDivWindowPosition();
updateDivWindowSize();
