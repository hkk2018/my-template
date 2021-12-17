import { Vector } from "./vector.lib.js";
import { SE } from "./se.lib.js";
export let SE_PHYSICS = {
    cohesion(range, speed = .001, contextWorld) {
        range = Math.pow(range || 100, 2);
        speed = speed || .001;
        return function (particle) {
            let center = new Vector();
            let i = 0;
            let l = contextWorld.particles.length;
            let count = 0;
            if (l <= 1)
                return;
            for (; i < l; i++) {
                if (contextWorld.particles[i] === particle || Vector.distanceSquared(contextWorld.particles[i].position, particle.position) > range) {
                    continue;
                }
                center.add(Vector.subtract(contextWorld.particles[i].position, particle.position));
                count++;
            }
            if (count > 0) {
                center.divide(count);
                center.normalize();
                center.multiply(particle.velocity.magnitude);
                center.multiply(.05);
            }
            particle.velocity.add(center.multiply(SE.getFpsRate()));
        };
    },
    separation(distance, contextWorld) {
        distance = Math.pow(distance || 25, 2);
        return function (particle) {
            let heading = new Vector();
            let i = 0;
            let l = contextWorld.particles.length;
            let count = 0;
            let diff;
            if (l <= 1)
                return;
            for (; i < l; i++) {
                if (contextWorld.particles[i] === particle || Vector.distanceSquared(contextWorld.particles[i].position, particle.position) > distance) {
                    continue;
                }
                diff = Vector.subtract(particle.position, contextWorld.particles[i].position);
                diff.normalize();
                heading.add(diff);
                count++;
            }
            if (count > 0) {
                heading.divide(count);
                heading.normalize();
                heading.multiply(particle.velocity.magnitude);
                heading.limit(.1);
            }
            particle.velocity.add(heading.multiply(SE.getFpsRate()));
        };
    },
    alignment(range, contextWorld) {
        range = Math.pow(range || 100, 2);
        return function (particle) {
            let i = 0;
            let l = contextWorld.particles.length;
            let count = 0;
            let heading = new Vector();
            if (l <= 1)
                return;
            for (; i < l; i++) {
                if (contextWorld.particles[i] === particle || Vector.distanceSquared(contextWorld.particles[i].position, particle.position) > range) {
                    continue;
                }
                heading.add(contextWorld.particles[i].velocity);
                count++;
            }
            if (count > 0) {
                heading.divide(count);
                heading.normalize();
                heading.multiply(particle.velocity.magnitude);
                heading.multiply(.1);
            }
            particle.velocity.add(heading.multiply(SE.getFpsRate()));
        };
    },
    force(x, y) {
        return function (particle) {
            particle.velocity.x += x * SE.getFpsRate();
            particle.velocity.y += y * SE.getFpsRate();
        };
    },
    limit(treshold) {
        return function (particle) {
            particle.velocity.limit(treshold);
        };
    },
    attract(forceMultiplier, groups, contextWorld) {
        forceMultiplier = forceMultiplier || 1;
        groups = groups || [];
        return function (particle) {
            let totalForce = new Vector(0, 0);
            let force = new Vector(0, 0);
            let i = 0;
            let l = contextWorld.particles.length;
            let distance;
            let pull;
            let attractor;
            let grouping = groups.length;
            for (; i < l; i++) {
                attractor = contextWorld.particles[i];
                if (attractor === particle || (grouping && groups.indexOf(attractor.group) === -1)) {
                    continue;
                }
                force.x = attractor.position.x - particle.position.x;
                force.y = attractor.position.y - particle.position.y;
                distance = force.magnitude;
                force.normalize();
                force.multiply(attractor.size / distance);
                totalForce.add(force);
            }
            totalForce.multiply(forceMultiplier);
            particle.velocity.add(totalForce.multiply(SE.getFpsRate()));
        };
    },
};
let Random = {
    between(min, max) {
        return min + (Math.random() * (max - min));
    }
};
