import { SE } from "./se.lib.js";
import { Vector } from "./vector.lib.js";
import { SE_PHYSICS } from "./se-physics.lib.js";
let pixiItemClips = {};
let particleShellBox = [];
let context = {
    pixieDustWorld: {
        particles: [],
    }
};
class BasicParticle {
    constructor(pixiItem, lifeMax = undefined, position = new Vector(-10000, -10000), velocity = new Vector(0, 0), setByPath = null, behaviors = [], changeState = null, onEnd = () => { }, id = 'default', group = 'default', size = 1) {
        this.pixiItem = pixiItem;
        this.lifeMax = lifeMax;
        this.position = position;
        this.velocity = velocity;
        this.setByPath = setByPath;
        this.behaviors = behaviors;
        this.changeState = changeState;
        this.onEnd = onEnd;
        this.id = id;
        this.group = group;
        this.size = size;
        this.life = 0;
        this.isUsingpixiItemClipsystem = false;
        this.isDestroyed = false;
        if (pixiItem.isUsingpixiItemClipsystem)
            this.isUsingpixiItemClipsystem = true;
        pixiItem.position.set(position.x, position.y);
        SE.app.stage.addChild(this.pixiItem);
        particleShellBox.push(this);
    }
    update() {
        if (!this.isDestroyed) {
            if (this.life > this.lifeMax) {
                this.isDestroyed = true;
                if (this.isUsingpixiItemClipsystem)
                    this.pixiItem.alpha = 0;
                else
                    this.pixiItem.destroy();
                this.onEnd(this);
            }
            else {
                if (this.setByPath) {
                    let result = this.setByPath(this);
                    if (result != undefined)
                        this.position = result;
                }
                for (let i = 0; i < this.behaviors.length; i++)
                    this.behaviors[i](this);
                this.move();
                if (this.changeState)
                    this.changeState(this);
                this.pixiItem.position.set(this.position.x, this.position.y);
                this.life += 1 * SE.getFpsRate();
            }
        }
    }
    ;
    move() {
        this.position.add(this.velocity.clone().multiply(SE.getFpsRate()));
    }
    toString() {
        return 'Particle(' + this.id + ') ' + this.life + ' pos: ' + this.position + ' vec: ' + this.velocity;
    }
    ;
}
export let SE_ANIMAT = {
    pixiItemClips,
    particleShellBox,
    playAnimation_tutorial(propertiesDecidedFromOutside) {
        if (SE.type === 'canvas')
            return;
        if (!pixiItemClips.playAnimation_tutorial) {
            pixiItemClips.playAnimation_tutorial = {
                type: 'CONTINUOUS',
                queArray: [],
                waitingToPlay: 0
            };
            let backUpNum = 2;
            for (let i = 0; i < backUpNum; i++)
                pixiItemClips.playAnimation_tutorial.queArray.push(SE.pixiItem.getSparkle());
            SE.tool.warmUpPixiItems(pixiItemClips.playAnimation_tutorial.queArray);
            return;
        }
        let particleNum = 1;
        let particles = [];
        class particleForTemplate extends BasicParticle {
            constructor() {
                super(pickOutQueingItem(pixiItemClips.playPixieDustAroundBox, function resetState(pixiItem) {
                    pixiItem.alpha = 1;
                }), 1800, undefined, undefined, null);
            }
        }
        for (let i = 0; i < particleNum; i++)
            particles.push(new particleForTemplate());
        SE.tool.runAnimat(particles);
    },
    playEllipse_test(locations) {
        if (SE.type === 'canvas')
            return;
        if (SE.isFirstInitPCSystem)
            return;
        let localParticles = [];
        class PixieDust extends BasicParticle {
            constructor(position) {
                super(pickOutQueingItem(pixiItemClips.playPixieDustAroundBox, function resetState(pixiItem) {
                    pixiItem.alpha = 1;
                }), 1800, position, undefined, null);
            }
        }
        for (let i = 0; i < locations.length; i++)
            localParticles.push(new PixieDust(locations[i]));
        SE.tool.runAnimat(localParticles);
    },
    playSparkles(element) {
        if (SE.type === 'canvas')
            return;
        if (!pixiItemClips.playSparkles) {
            pixiItemClips.playSparkles = {
                type: 'CONTINUOUS',
                queArray: [],
                waitingToPlay: 0
            };
            let backUpNum = 8;
            for (let i = 0; i < backUpNum; i++) {
                let p = SE.pixiItem.getSparkle();
                pixiItemClips.playSparkles.queArray.push(p);
            }
            SE.tool.warmUpPixiItems(pixiItemClips.playSparkles.queArray);
            return;
        }
        let locations = SE.tool.getLocationsFromPercentage(element, [
            new Vector([0.05, 0.1]),
            new Vector([0.1, 0.8]),
            new Vector([0.9, 0.6]),
            new Vector([0.95, 0.2]),
            new Vector([0.7, 0.05]),
            new Vector([0.3, 0.05]),
            new Vector([0.9, 0.9]),
            new Vector([0.4, 0.85]),
        ]);
        let localParticles = [];
        let period = 240;
        class sparkle extends BasicParticle {
            constructor(position) {
                super(pickOutQueingItem(pixiItemClips.playSparkles, function resetState(pixiItem) {
                    pixiItem.alpha = 1;
                }), undefined, position, undefined, undefined, undefined, function changeState(particle) {
                    let p = particle;
                    let angleForSine = Math.floor(p.life) % period / period * Math.PI;
                    p.pixiItem.alpha = Math.abs(Math.sin(angleForSine));
                });
            }
        }
        for (let i = 0; i < locations.length; i++) {
            let s = new sparkle(locations[i]);
            let adjustFactor = 0.7;
            s.life = i * period / locations.length * adjustFactor;
            localParticles.push(s);
        }
        SE.tool.runAnimat(localParticles);
    },
    playPointRunAlongBox(element) {
        if (SE.type === 'canvas')
            return;
        if (!pixiItemClips.playPointRunAlongBox) {
            pixiItemClips.playPointRunAlongBox = {
                type: 'SELDOM',
                queArray: [],
                waitingToPlay: 0
            };
            let backUpNum = 30;
            for (let i = 0; i < backUpNum; i++) {
                let p = SE.pixiItem.getWhiteShiningPoint();
                p.alpha = SE.tool.easeOutCubic(i, 1, -1, backUpNum - 1);
                p.scale.x = 0.4 + SE.tool.easeOutQuart(i, 1, -1, backUpNum - 1);
                p.scale.y = 0.4 + SE.tool.easeOutQuart(i, 1, -1, backUpNum - 1);
                pixiItemClips.playPointRunAlongBox.queArray.push(p);
            }
            SE.tool.warmUpPixiItems(pixiItemClips.playPointRunAlongBox.queArray);
            return;
        }
        let pointNum = 30;
        let points = [];
        class Comet extends BasicParticle {
            constructor() {
                super(pickOutQueingItem(pixiItemClips.playPointRunAlongBox, function reset(pixiItem) {
                    for (let i = 0; i < pixiItemClips.playPointRunAlongBox.queArray.length; i++)
                        if (pixiItemClips.playPointRunAlongBox.queArray[i] === pixiItem) {
                            pixiItem.alpha = SE.tool.easeOutCubic(i, 1, -1, pixiItemClips.playPointRunAlongBox.queArray.length - 1);
                            break;
                        }
                }), undefined, undefined, undefined, SE.path.getPathOfRunEllipse(element));
            }
            ;
        }
        for (let i = 0; i < pointNum; i++) {
            let c = new Comet();
            c.life -= i;
            points.push(c);
        }
        SE.tool.runAnimat(points);
        let cardReceivedRes;
        new Promise(res => { cardReceivedRes = res; }).then(() => {
            for (let i = 0; i < pointNum; i++)
                points[i].lifeMax = points[0].life;
        });
        SE.animat.stopPointRunAlongBox = function () {
            cardReceivedRes();
        };
    },
    stopPointRunAlongBox() { },
    playFlyingPowder(origin, destination) {
        if (SE.type === 'canvas')
            return;
        if (SE.isFirstInitPCSystem)
            return;
        let powdersNum = 50;
        let powders = [];
        class ColoredFlyingPowder extends BasicParticle {
            constructor() {
                super(SE.pixiItem.getColoredPoint(), undefined, undefined, undefined, SE.path.getPathOfBlastThenSuckedInto(origin, destination));
            }
            ;
        }
        for (let i = 0; i < powdersNum; i++)
            powders.push(new ColoredFlyingPowder());
        SE.tool.runAnimat(powders);
    },
    playBlastGoldIcon(origin, destination) {
        if (SE.type === 'canvas')
            return;
        if (SE.isFirstInitPCSystem)
            return;
        let powdersNum = 50;
        let powders = [];
        class flyingGoldIcon extends BasicParticle {
            constructor() {
                super(SE.pixiItem.getGoldIcon(), undefined, undefined, undefined, SE.path.getPathOfBlastThenSuckedInto(origin, destination));
            }
            ;
        }
        for (let i = 0; i < powdersNum; i++)
            powders.push(new flyingGoldIcon());
        SE.tool.runAnimat(powders);
    },
    playPixieDust(position) {
        if (SE.type === 'canvas')
            return;
        if (SE.isFirstInitPCSystem)
            return;
        let pNum = 12;
        let localParticles = [];
        class PixieDust extends BasicParticle {
            constructor() {
                super(SE.pixiItem.getWhiteShiningPoint(), 60, position.clone().add(new Vector().randomize(25)), undefined, null, [
                    SE_PHYSICS.force(-.015, -.015),
                    SE_PHYSICS.cohesion(50, null, context.pixieDustWorld)
                ], function changeState(particle) {
                    particle.pixiItem.alpha -= 1 / particle.lifeMax * SE.getFpsRate();
                }, function onEnd(particle) {
                    let ps = context.pixieDustWorld.particles;
                    ps.splice(ps.indexOf(particle), 1);
                });
            }
        }
        for (let i = 0; i < pNum; i++)
            localParticles.push(new PixieDust());
        context.pixieDustWorld.particles = context.pixieDustWorld.particles.concat(localParticles);
        SE.tool.runAnimat(localParticles);
    },
    playPixieDustAroundBox(element) {
        if (SE.type === 'canvas')
            return;
        if (!pixiItemClips.playPixieDustAroundBox) {
            pixiItemClips.playPixieDustAroundBox = {
                type: 'FREQUENT',
                queArray: [],
                waitingToPlay: 0
            };
            let backUpNum = 400;
            for (let i = 0; i < backUpNum; i++)
                pixiItemClips.playPixieDustAroundBox.queArray.push(SE.pixiItem.getWhiteShiningPoint());
            SE.tool.warmUpPixiItems(pixiItemClips.playPixieDustAroundBox.queArray);
            return;
        }
        let locations = getLocationsAroundBox(element, 200);
        let localParticles = [];
        class PixieDust extends BasicParticle {
            constructor(position) {
                super(pickOutQueingItem(pixiItemClips.playPixieDustAroundBox, function resetState(pixiItem) {
                    pixiItem.alpha = 1;
                }), 60, position, undefined, null, [
                    SE_PHYSICS.force(-.015, -.015),
                    SE_PHYSICS.cohesion(50, null, context.pixieDustWorld)
                ], function changeState(particle) {
                    particle.pixiItem.alpha -= 1 / particle.lifeMax * SE.getFpsRate();
                }, function onEnd(particle) {
                    let ps = context.pixieDustWorld.particles;
                    ps.splice(ps.indexOf(particle), 1);
                });
            }
        }
        for (let i = 0; i < locations.length; i++)
            localParticles.push(new PixieDust(locations[i]));
        context.pixieDustWorld.particles = context.pixieDustWorld.particles.concat(localParticles);
        SE.tool.runAnimat(localParticles);
    },
    playBlastCracker(origin, scrapNum = 100) {
        if (SE.type === 'canvas')
            return;
        if (!pixiItemClips.playBlastCracker) {
            pixiItemClips.playBlastCracker = {
                type: 'SELDOM',
                queArray: [],
                waitingToPlay: 0
            };
            let backUpNum = scrapNum;
            for (let i = 0; i < backUpNum; i++)
                pixiItemClips.playBlastCracker.queArray.push(SE.pixiItem.getColoredScrap());
            SE.tool.warmUpPixiItems(pixiItemClips.playBlastCracker.queArray);
            return;
        }
        let scraps = [];
        class scrap extends BasicParticle {
            constructor() {
                super(pickOutQueingItem(pixiItemClips.playBlastCracker), 180 + 60 * Math.random(), undefined, undefined, SE.path.getPathOfCubicBezier(origin, new Vector(Math.random() * window.innerWidth, window.innerHeight * 5 / 4)), undefined, function changeState(particle) {
                    particle.pixiItem.rotation = Math.atan2(this.dy, this.dx) + (Math.PI * 0.5);
                    particle.pixiItem.scale.y = Math.sin(Math.PI * 10 * SE.tool.easeOutCubic(particle.life, .0125, 1 - .0125, particle.lifeMax));
                });
            }
        }
        for (let i = 0; i < scrapNum; i++)
            scraps.push(new scrap());
        SE.tool.runAnimat(scraps);
    }
};
function pickOutQueingItem(pixiItemClip, resetFuc = (pixiItem) => { pixiItem.alpha = 1; }) {
    let pc = pixiItemClip;
    let pixiItem = pc.queArray[pc.waitingToPlay];
    pc.waitingToPlay = pc.waitingToPlay === pc.queArray.length - 1 ? 0 : pc.waitingToPlay + 1;
    resetFuc(pixiItem);
    pixiItem.isUsingpixiItemClipsystem = true;
    return pixiItem;
}
function getLocationsAroundBox(element, locaNum) {
    let rect = element.getBoundingClientRect();
    let locations = [];
    for (let i = 0; i < locaNum; i++) {
        if (i % 4 == 0)
            locations.push(new Vector(rect.left + Math.random() * rect.width, rect.top));
        else if (i % 4 == 1)
            locations.push(new Vector(rect.right, rect.top + Math.random() * rect.height));
        else if (i % 4 == 2)
            locations.push(new Vector(rect.left + Math.random() * rect.width, rect.bottom));
        else if (i % 4 == 3)
            locations.push(new Vector(rect.left, rect.top + Math.random() * rect.height));
    }
    return locations;
}
