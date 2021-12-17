import { Vector } from "./vector.lib.js";
import { SE_ANIMAT } from "./se-animat.lib.js";
import { SE_PATH } from "./se-path.lib.js";
let isStats = false;
let isInTestEnvir = true;
let imgFiles = ['gold-icon.png', '1C.png', '1D.png', 'star-1.png'];
let app, stats;
let runningStats = [];
let statCount = 0;
let containerSetForHide = [];
window.onload = () => {
    SE.initPixi().then(() => {
        SE.initPCSystem();
        if (isStats)
            SE.initStats();
        if (isInTestEnvir)
            testThings();
    });
    function testThings() {
        showChangingImgDynamically();
        document.body.addEventListener('click', (event) => {
            SE.animat.playBlastGoldIcon(new Vector(event.clientX, event.clientY), new Vector(500, 400));
        });
        let a1E = document.getElementById('a1');
        a1E.addEventListener('click', (event) => {
            SE.animat.playPointRunAlongBox(document.getElementById('a1'));
        });
        let a2E = document.getElementById('a2');
        a2E.addEventListener('click', (event) => {
            SE.animat.playBlastCracker(new Vector(window.innerWidth / 2, window.innerHeight / 2 / 2));
        });
        let a3E = document.getElementById('a3');
        a3E.addEventListener('click', (event) => {
            SE.animat.playPixieDustAroundBox(a3E);
            let vectors = getEBoundary(a3E, 100);
        });
        document.body.addEventListener('click', (event) => {
        });
    }
};
export let SE = {
    Vector: Vector,
    app,
    type: "WebGL",
    isFirstInitPCSystem: true,
    initStats() {
        stats = new Stats();
        stats.domElement.style.position = 'fixed';
        stats.domElement.style.top = '0';
        stats.domElement.style.zIndex = '10000';
        document.body.appendChild(stats.domElement);
    },
    initPixi() {
        if (!PIXI.utils.isWebGLSupported())
            SE.type = 'canvas';
        PIXI.utils.sayHello(SE.type);
        if (SE.type === 'canvas')
            return;
        app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            antialias: true,
        });
        document.body.appendChild(app.view);
        app.renderer.view.style.position = 'absolute';
        app.renderer.view.style.top = '0';
        app.renderer.view.style.left = '0';
        app.renderer.view.style.display = "block";
        app.renderer.view.style.pointerEvents = 'none';
        app.renderer.view.style.zIndex = '10000';
        SE.getFpsRate = function () { return 60 / app.ticker.FPS; };
        window.addEventListener('resize', fitCanvas);
        function fitCanvas() {
            app.view.width = window.innerWidth;
            app.view.height = window.innerHeight;
        }
        SE.app = app;
        return loadImgs(imgFiles);
        function loadImgs(fileNamesWithExt) {
            PIXI.loader.on('progress', loadProgressHandler);
            function loadProgressHandler(loader, resource) {
                console.log(`loaded（${Math.ceil(loader.progress)}%）: ` + resource.url);
            }
            let onloadRes;
            let onloadP = new Promise(res => onloadRes = res);
            PIXI.loader.add(fileNamesWithExt.map(x => 'asset/' + x)).load(onloadRes);
            return onloadP;
        }
    },
    initPCSystem() {
        let funcNames = Object.keys(SE.animat);
        funcNames.map(funcName => {
            if (SE.animat[funcName] instanceof Function)
                SE.animat[funcName]();
        });
        SE.isFirstInitPCSystem = false;
    },
    getFpsRate() { return 1; },
    control: {
        hideAllAnimats() {
            if (containerSetForHide.length === 0)
                containerSetForHide.push(app.stage);
            let ct = new PIXI.Container();
            containerSetForHide.push(ct);
            let names = Object.keys(SE_ANIMAT.pixiItemClips);
            for (let i = 0; i < names.length; i++) {
                let qA = SE_ANIMAT.pixiItemClips[names[i]].queArray;
                for (let j = 0; j < qA.length; j++)
                    ct.addChild(qA[j]);
            }
        },
        unhideAllAnimats() {
            if (containerSetForHide.length <= 1)
                return;
            let csfh = containerSetForHide;
            let names = Object.keys(SE_ANIMAT.pixiItemClips);
            for (let i = 0; i < names.length; i++) {
                let qA = SE_ANIMAT.pixiItemClips[names[i]].queArray;
                for (let j = 0; j < qA.length; j++)
                    csfh[csfh.length - 2].addChild(qA[j]);
            }
            csfh.splice(csfh.length - 1, 1);
        },
        stopAllAnimats() {
            for (let i = 0; i < SE_ANIMAT.particleShellBox.length; i++)
                SE_ANIMAT.particleShellBox[i].lifeMax = 0;
            SE_ANIMAT.particleShellBox = [];
        }
    },
    tool: {
        getEBoundary,
        getEPositionVector(element) {
            let rect = element.getBoundingClientRect();
            return new Vector(rect.left + rect.width / 2, rect.top + rect.height / 2);
        },
        getLocationsFromPercentage(element, vectorsIndicatingPercentage) {
            let rect = element.getBoundingClientRect();
            let vIP = vectorsIndicatingPercentage;
            let resultArray = [];
            for (let i = 0; i < vIP.length; i++) {
                let y = rect.top + vIP[i].y * rect.height;
                let x = rect.left + vIP[i].x * rect.width;
                resultArray.push(new Vector([x, y]));
            }
            return resultArray;
        },
        findRoot(func, targetValue, coverRange, accuracy = 0.01) {
            let smallC = coverRange[0];
            let bigC = coverRange[1];
            let midPoint = (smallC + bigC) / 2;
            let count = 0;
            while (Math.abs(func(midPoint) - targetValue) > accuracy) {
                if ((func(smallC) - targetValue) * (func(midPoint) - targetValue) < 0)
                    bigC = midPoint;
                else
                    smallC = midPoint;
                midPoint = (smallC + bigC) / 2;
                count++;
                if (count == 10000)
                    break;
            }
            return midPoint;
        },
        TurnRgbToHex(r, g, b) {
            function componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }
            return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        },
        checkIfTimeToRemoveAnimat(particles) {
            if (particles[0].isDestroyed) {
                let isAllDestroyed = true;
                for (let i = 0; i < particles.length; i++)
                    if (!particles[i].isDestroyed)
                        isAllDestroyed = false;
                if (isAllDestroyed == true)
                    return true;
                else
                    return false;
            }
            else
                return false;
        },
        runAnimat(particles, other = null) {
            let theStatCount = statCount;
            runningStats.push(theStatCount);
            statCount++;
            app.ticker.add(animat);
            function animat(delta) {
                if (isStats && runningStats[0] === theStatCount)
                    stats.update();
                for (let i = 0; i < particles.length; i++)
                    particles[i].update();
                delta;
                if (SE.tool.checkIfTimeToRemoveAnimat(particles)) {
                    runningStats.splice(runningStats.indexOf(theStatCount));
                    app.ticker.remove(animat);
                }
            }
        },
        warmUpPixiItems(pixiItems) {
            let frameCount = 0;
            pixiItems.map((pixiItem) => {
                pixiItem.alpha = 1;
                SE.app.stage.addChild(pixiItem);
            });
            app.ticker.add(animat);
            function animat() {
                frameCount++;
                if (frameCount == 2) {
                    pixiItems.map((pixiItem) => { pixiItem.alpha = 0; });
                    app.ticker.remove(animat);
                }
            }
        },
        easeOutCubic(t, b, c, d) {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        },
        easeInCubic(t, b, c, d) {
            t /= d;
            return c * t * t * t + b;
        },
        easeInQuint(t, b, c, d) {
            t /= d;
            return c * t * t * t * t * t + b;
        },
        easeOutQuart(t, b, c, d) {
            t /= d;
            t--;
            return -c * (t * t * t * t - 1) + b;
        },
    },
    animat: SE_ANIMAT,
    path: SE_PATH,
    pixiItem: {
        getColoredPoint(radius = 5) {
            let color = SE.tool.TurnRgbToHex(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
            let pixiGraph = new PIXI.Graphics();
            pixiGraph.lineStyle(0);
            pixiGraph.beginFill(color, 0.8);
            pixiGraph.drawCircle(0, 0, radius);
            pixiGraph.endFill();
            return pixiGraph;
        },
        getGoldIcon(size = 20) {
            let goldIcon = createSprite('gold-icon.png');
            goldIcon.width = size;
            goldIcon.height = size;
            goldIcon.anchor.set(0.5);
            return goldIcon;
        },
        getSparkle(size = 20) {
            let sparkle = createSprite('star-1.png');
            sparkle.tint = SE.tool.TurnRgbToHex(0, 168, 24);
            sparkle.width = size + 15 * Math.random();
            sparkle.height = size + 15 * Math.random();
            sparkle.anchor.set(0.5);
            return sparkle;
        },
        getWhiteShiningPoint() {
            let radius = 1.25 + Math.random();
            let pixiGraph = new PIXI.Graphics();
            pixiGraph.lineStyle(0);
            pixiGraph.beginFill(SE.tool.TurnRgbToHex(255, 255, 255), 1);
            pixiGraph.drawCircle(0, 0, radius);
            pixiGraph.endFill();
            pixiGraph.beginFill(SE.tool.TurnRgbToHex(231, 244, 255), .25);
            pixiGraph.drawCircle(0, 0, radius * 2);
            pixiGraph.endFill();
            let w = 2;
            let h = 35;
            pixiGraph.beginFill(SE.tool.TurnRgbToHex(231, 244, 255), .04);
            pixiGraph.drawRect(-w / 2, -h / 2, w, h);
            pixiGraph.endFill();
            return pixiGraph;
        },
        getColoredScrap() {
            let color = SE.tool.TurnRgbToHex(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
            let pixiGraph = new PIXI.Graphics();
            let w = 10;
            let h = 6;
            pixiGraph.lineStyle(0);
            pixiGraph.beginFill(color, 0.8);
            pixiGraph.drawRect(-w / 2, -h / 2, w, h);
            pixiGraph.endFill();
            return pixiGraph;
        },
    },
};
function showChangingImgDynamically() {
    let gold = createSprite('gold-icon.png');
    gold.height = 50;
    gold.width = 50;
    gold.position.set(window.innerWidth / 2, window.innerHeight / 2);
    app.stage.addChild(gold);
    let count = 0;
    setInterval(() => {
        let imgName = imgFiles[2 - (count % 3)];
        gold.texture = findTexture(imgName);
        count++;
    }, 5000);
}
function createSprite(fileNameWithExt) {
    return new PIXI.Sprite(findTexture(fileNameWithExt));
}
function findTexture(fileNameWithExt) {
    return PIXI.loader.resources[`asset/${fileNameWithExt}`].texture;
}
function getEBoundary(element, locaNum) {
    if (locaNum % 4 != 0)
        locaNum -= locaNum % 4;
    let rect = element.getBoundingClientRect();
    let perimeter = 2 * (rect.width + rect.height);
    let distanceBetweenPoints = perimeter / locaNum;
    let axesArray = getEllipseAxesFromElement(element);
    let part1PointCount = 0;
    let part2PointCount = 0;
    let locations = [];
    for (let i = 0; i < locaNum; i++) {
        if (i < Math.floor(rect.width / distanceBetweenPoints)) {
            let x = rect.left + distanceBetweenPoints * i;
            if (x < rect.left + axesArray[0]) {
                part2PointCount++;
                let pointOnEllipse = turnRectToEllipsePosition(axesArray[0], axesArray[1], 2, rect, x, rect.top);
                locations.push(new Vector(pointOnEllipse));
            }
            else if (x < rect.right - axesArray[2]) {
                locations.push(new Vector(x, rect.top));
            }
            else
                locations.push(new Vector(turnRectToEllipsePosition(axesArray[2], axesArray[3], 3, rect, x, rect.top)));
        }
        else if (i < Math.floor((rect.width + rect.height) / distanceBetweenPoints)) {
            let y = distanceBetweenPoints * i - rect.width + rect.top;
            if (y < rect.top + axesArray[3]) {
                let pointOnEllipse = turnRectToEllipsePosition(axesArray[2], axesArray[3], 4, rect, rect.right, y);
                locations.push(new Vector(pointOnEllipse));
            }
            else if (y < rect.bottom - axesArray[5]) {
                locations.push(new Vector(rect.right, y));
            }
            else
                locations.push(new Vector(turnRectToEllipsePosition(axesArray[4], axesArray[5], 5, rect, rect.right, y)));
        }
        else if (i < Math.floor((rect.width * 2 + rect.height) / distanceBetweenPoints)) {
            let x = rect.right - (distanceBetweenPoints * i - rect.width - rect.height);
            if (x > rect.right - axesArray[4]) {
                let pointOnEllipse = turnRectToEllipsePosition(axesArray[4], axesArray[5], 6, rect, x, rect.bottom);
                locations.push(new Vector(pointOnEllipse));
            }
            else if (x > rect.left + axesArray[6]) {
                locations.push(new Vector(x, rect.bottom));
            }
            else
                locations.push(new Vector(turnRectToEllipsePosition(axesArray[6], axesArray[7], 7, rect, x, rect.bottom)));
        }
        else if (i < Math.floor((rect.width * 2 + rect.height * 2) / distanceBetweenPoints)) {
            let y = rect.bottom - (distanceBetweenPoints * i - 2 * rect.width - rect.height);
            if (y > rect.bottom - axesArray[7]) {
                let pointOnEllipse = turnRectToEllipsePosition(axesArray[6], axesArray[7], 8, rect, rect.left, y);
                locations.push(new Vector(pointOnEllipse));
            }
            else if (y > rect.top + axesArray[1]) {
                locations.push(new Vector(rect.left, y));
            }
            else
                locations.push(new Vector(turnRectToEllipsePosition(axesArray[0], axesArray[1], 1, rect, rect.left, y)));
        }
    }
    return locations;
    function getEllipseAxesFromElement(element) {
        let cssStyle = getComputedStyle(element);
        let axesArray = [];
        let borderRadiusStrs = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'];
        for (let i = 0; i < borderRadiusStrs.length; i++) {
            let valueArray = parseBorderRadiusString(cssStyle[borderRadiusStrs[i]]);
            if (valueArray[0] < 1) {
                let widthStr = cssStyle.width.slice(0, cssStyle.width.indexOf('p'));
                let heightStr = cssStyle.height.slice(0, cssStyle.height.indexOf('p'));
                axesArray = axesArray.concat([valueArray[0] * Number(widthStr), valueArray[1] * Number(heightStr)]);
            }
            else
                axesArray = axesArray.concat(valueArray);
        }
        return axesArray;
    }
    function parseBorderRadiusString(styleStr) {
        let pxCount = 0;
        let result;
        for (let i = 0; i < styleStr.length; i++)
            if (styleStr[i] == 'p')
                pxCount++;
        if (pxCount == 0) {
            let valuePartOfPercentageStr = styleStr.slice(0, styleStr.length - 1);
            let valueInDecimal = Number(valuePartOfPercentageStr) / 100;
            result = [valueInDecimal, valueInDecimal];
        }
        else if (pxCount == 1) {
            let valueOfPx = styleStr.slice(0, styleStr.length - 2);
            result = [Number(valueOfPx), Number(valueOfPx)];
        }
        else if (pxCount == 2) {
            let valueOfPxFisrt = styleStr.slice(0, styleStr.indexOf('p'));
            let valueOfPxSecond = styleStr.slice(styleStr.indexOf('x') + 2, styleStr.lastIndexOf('p'));
            result = [Number(valueOfPxFisrt), Number(valueOfPxSecond)];
        }
        return result;
    }
    function turnRectToEllipsePosition(a, b, part, elementRect, x, y) {
        if (a === 0 || b === 0)
            return [x, y];
        let ratioCoeff = Math.pow(a * a * b * b / (a * a + b * b), 0.5);
        let relatX, relatY;
        let ellipseCenterX, ellipseCenterY;
        let scaledX, scaledY;
        let implementX, implementY;
        let resultX, resultY;
        if (part == 1) {
            ellipseCenterY = elementRect.top + b;
            relatY = y - ellipseCenterY;
            scaledY = relatY * ratioCoeff / b;
            implementX = a - getPositivePositionFromEllipse(a, b, -scaledY, 'y');
            resultX = x + implementX;
            resultY = ellipseCenterY + scaledY;
        }
        else if (part == 2) {
            ellipseCenterX = elementRect.left + a;
            relatX = x - ellipseCenterX;
            scaledX = relatX * ratioCoeff / a;
            implementY = b - getPositivePositionFromEllipse(a, b, -scaledX, 'x');
            resultX = ellipseCenterX + scaledX;
            resultY = y + implementY;
        }
        else if (part == 3) {
            ellipseCenterX = elementRect.right - a;
            relatX = x - ellipseCenterX;
            scaledX = relatX * ratioCoeff / a;
            implementY = b - getPositivePositionFromEllipse(a, b, scaledX, 'x');
            resultX = ellipseCenterX + scaledX;
            resultY = y + implementY;
        }
        else if (part == 4) {
            ellipseCenterY = elementRect.top + b;
            relatY = y - ellipseCenterY;
            scaledY = relatY * ratioCoeff / b;
            implementX = -a + getPositivePositionFromEllipse(a, b, -scaledY, 'y');
            resultX = x + implementX;
            resultY = ellipseCenterY + scaledY;
        }
        else if (part == 5) {
            ellipseCenterY = elementRect.bottom - b;
            relatY = y - ellipseCenterY;
            scaledY = relatY * ratioCoeff / b;
            implementX = -a + getPositivePositionFromEllipse(a, b, scaledY, 'y');
            resultX = x + implementX;
            resultY = ellipseCenterY + scaledY;
        }
        else if (part == 6) {
            ellipseCenterX = elementRect.right - a;
            relatX = x - ellipseCenterX;
            scaledX = relatX * ratioCoeff / a;
            implementY = -b + getPositivePositionFromEllipse(a, b, scaledX, 'x');
            resultX = ellipseCenterX + scaledX;
            resultY = y + implementY;
        }
        else if (part == 7) {
            ellipseCenterX = elementRect.left + a;
            relatX = x - ellipseCenterX;
            scaledX = relatX * ratioCoeff / a;
            implementY = -b + getPositivePositionFromEllipse(a, b, -scaledX, 'x');
            resultX = ellipseCenterX + scaledX;
            resultY = y + implementY;
        }
        else if (part == 8) {
            ellipseCenterY = elementRect.bottom - b;
            relatY = y - ellipseCenterY;
            scaledY = relatY * ratioCoeff / b;
            implementX = a - getPositivePositionFromEllipse(a, b, scaledY, 'y');
            resultX = x + implementX;
            resultY = ellipseCenterY + scaledY;
        }
        return [resultX, resultY];
        function getPositivePositionFromEllipse(a, b, input, inputType) {
            let answer = inputType == 'y' ? (1 - input * input / b / b) * a * a : (1 - input * input / a / a) * b * b;
            return Math.pow(Math.abs(answer), 0.5);
        }
    }
}
