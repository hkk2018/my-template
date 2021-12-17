import { Vector } from "./vector.lib.js";
import { SE } from "./se.lib.js";
export let SE_PATH = {
    getPathOfCubicBezier(origin, destination) {
        return function (particle) {
            let p = particle;
            let pv;
            if (p.life === 0) {
                p.variables_CubicBezier = {
                    p0: origin,
                    p1: new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight),
                    p2: new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight),
                    p3: destination,
                    dx: 0,
                    dy: 0
                };
                p.position = origin;
                pv = p.variables_CubicBezier;
            }
            else
                pv = p.variables_CubicBezier;
            let positionNow = moveAlongCubicBezier(pv.p0, pv.p1, pv.p2, pv.p3, SE.tool.easeOutCubic(particle.life, .0125, 1 - .0125, particle.lifeMax));
            p.dx = positionNow.x - p.position.x;
            p.dy = positionNow.y - p.position.y;
            return positionNow;
            function moveAlongCubicBezier(p0, p1, p2, p3, t) {
                let p = new Vector();
                let nt = (1 - t);
                p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * p1.x + 3 * nt * t * t * p2.x + t * t * t * p3.x;
                p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * p1.y + 3 * nt * t * t * p2.y + t * t * t * p3.y;
                return p;
            }
        };
    },
    getPathOfBlastThenSuckedInto(origin, destination, blastRadius = 80, whenToTurnBack = 0.85, angularGrowth = 0.04) {
        return function (particle) {
            let p = particle;
            let pv;
            if (p.life === 0) {
                p.variables_BlastThenSuckedInto = {};
                pv = p.variables_BlastThenSuckedInto;
                pv.angleForScale = 0;
                pv.blastMotionCenter = { x: origin.x, y: origin.y };
                pv.angle = Math.random() * 2 * Math.PI;
                pv.blastRadius = blastRadius * getUpperAlignRand();
                pv.displaceRatio = getDisplaceRatio(whenToTurnBack, angularGrowth) * 1.3;
            }
            else
                pv = p.variables_BlastThenSuckedInto;
            let scale = Math.sin(pv.angleForScale);
            const R = Math.sqrt(Math.pow((destination.x - origin.x), 2) + Math.pow((destination.y - origin.y), 2));
            let finalPosition = new Vector();
            if (pv.angleForScale <= Math.PI) {
                if (pv.angleForScale > whenToTurnBack) {
                    let rSquare = Math.pow((destination.x - p.position.x), 2) + Math.pow((destination.y - p.position.y), 2);
                    let r = Math.sqrt(rSquare);
                    let newAngle = (pv.angleForScale - whenToTurnBack) / (Math.PI - whenToTurnBack) * Math.PI / 2;
                    pv.blastMotionCenter.x += (destination.x - p.position.x) / r * makeToOneGradually(newAngle) * pv.displaceRatio * R * SE.getFpsRate();
                    pv.blastMotionCenter.y += (destination.y - p.position.y) / r * makeToOneGradually(newAngle) * pv.displaceRatio * R * SE.getFpsRate();
                }
                finalPosition.x = scale * pv.blastRadius * Math.sin(pv.angle) + pv.blastMotionCenter.x;
                finalPosition.y = scale * pv.blastRadius * Math.cos(pv.angle) + pv.blastMotionCenter.y;
                let actualRSquare = Math.pow((destination.x - finalPosition.x), 2) + Math.pow((destination.y - finalPosition.y), 2);
                let actualR = Math.sqrt(actualRSquare);
                if (actualR < 10)
                    p.lifeMax = 0;
                pv.angleForScale += angularGrowth * SE.getFpsRate();
                return finalPosition;
            }
            else {
                console.log('BlastThenSuckedInto time is up');
                p.lifeMax = 0;
            }
            function getDisplaceRatio(whenToTurnBack, angularGrowth) {
                function calcTotalDistance(displaceRatio) {
                    let times = Math.ceil((Math.PI - whenToTurnBack) / angularGrowth);
                    let totalDistance = 0;
                    for (let i = 0; i < times; i++) {
                        let angle = Math.PI / 2 * (i + 1) / times;
                        totalDistance += makeToOneGradually(angle) * displaceRatio;
                    }
                    return totalDistance;
                }
                return SE.tool.findRoot(calcTotalDistance, 1, [0, 1]);
            }
        };
    },
    getPathOfRunEllipse(element, segmentNum = 75, shiftRatio = 0.2) {
        let positionVectors = SE.tool.getEBoundary(element, segmentNum);
        let length = positionVectors.length;
        let movedToHeadPart = [];
        for (let i = 0; i < length * shiftRatio; i++)
            movedToHeadPart.push(positionVectors.pop());
        positionVectors = movedToHeadPart.reverse().concat(positionVectors);
        positionVectors.push(positionVectors[0]);
        return function (particle) {
            let positionIndex = Math.floor(particle.life);
            if (positionIndex <= positionVectors.length - 1)
                return positionVectors[positionIndex];
            else
                particle.lifeMax = 0;
        };
    }
};
function getGaussianRand() {
    let rand = 0;
    for (var i = 0; i < 6; i++)
        rand += Math.random();
    return rand / 6;
}
function getUpperAlignRand() {
    let _x = getGaussianRand();
    while (_x > 0.5)
        _x = getGaussianRand();
    return _x * 2;
}
function makeToOneGradually(x) {
    if (x <= Math.PI / 2)
        return 1 - Math.sin(x + Math.PI / 2);
    else
        return 1;
}
