function _(id) { return document.getElementById(id); }

class Point {
    constructor(x, y){
        this.x = x, 
        this.y = y;
    }
};

const handler = {
    calcPointDistance: function(point1 /*Point*/, point2 /*Point*/) {
        let a = point1.x - point2.x;
        let b = point1.y - point2.y;     
        return Math.sqrt((a*a) + (b*b));
    },

    calcRouteDistance: function(route /*Array<Point>*/) {
        let dist = 0;
        for(let i = 0; i < route.length-1; i++){
            dist += this.calcPointDistance(route[i], route[i+1])
        }
        return dist + this.calcPointDistance(route[route.length-1], route[0]);
    },

    swap: function(route, i, k) {
        var newRoute = route.slice(0, i);
        var reverse = route.slice(i, k).reverse();
        return newRoute.concat(reverse).concat(route.slice(k));
    },

    number: function (max) {
        return Math.floor(Math.random() * max);
    },

    randomRoute: function(n) {
        let route = [];
        for(let i = 0; i < n; i++){ 
            route.push(new Point(this.number(window.innerWidth), this.number(window.innerHeight)));
        } 
        route.push(route[0]);        
        return route;
    }, 

    matrixRoute: function (w, h) {
        let route = [];
        let nH = Math.floor(window.innerHeight / h);
        let nW = Math.floor(window.innerWidth / w);
        for(let i = 0; i < w; i++){ 
            for(let k = 0; k < h; k++){
                route.push(new Point(i*nW + nW/2, k*nH + nH/2));
            }            
        }  
        // route.push(route[0]);
        let shuffleRoute = [];
        while (route.length){
            shuffleRoute.push(route.splice(this.number(route.length), 1)[0]);
        }
        shuffleRoute.push(shuffleRoute[0]);
        return shuffleRoute;
    },

    nextRoute: function(existing_route) {        
        let best_distance = this.calcRouteDistance(existing_route);
        for(let i = 1; i < existing_route.length - 1; i++){
            for(let k = i + 1; k < existing_route.length; k++){
                let new_route = this.swap(existing_route, i, k);
                let new_distance = this.calcRouteDistance(new_route);
                if (new_distance < best_distance) {
                    existing_route = new_route;
                    best_distance = new_distance;
                    return new_route;
                }
            }
        }  
        return  existing_route;
    }

};

const view = {
    pointNumber: _('point-number'),
    iterations: _('iter'),
    distance: _('dist'),
    start: _('start'),
    end: _('end'),
    matrix: _('matrix'),
    solveBtn: _('solve-btn'),

    getPointNumber: function() {
        return Number(this.pointNumber.value);
    },

    setDistance: function(distance) {
        this.distance.innerHTML = distance.toFixed(2);
    },

    isMatrix: function() {
        return this.matrix.checked;
    },

    setIterations: function(txt) {
        this.iterations.innerHTML = txt;
    },

    setStart: function(txt) {
        this.start.innerHTML = txt;
    },

    setEnd: function(txt) {
        this.end.innerHTML = txt;
    },

    setSolveBtnText: function(txt) {
        this.solveBtn.innerHTML = txt;
    }
};

const canvas = {
    ctx:  _('canvas').getContext("2d"),

    renderRoute: function(route) {
        this.ctx.canvas.width  = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight; 

        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.fillStyle = "#FFFF00";
        route.forEach(p => this.ctx.fillRect(p.x - 1, p.y - 1, 3, 3)),

        this.ctx.beginPath();
        this.ctx.moveTo(route[0].x, route[0].y);
        for(let i = 1; i < route.length; i++){
            this.ctx.lineTo(route[i].x, route[i].y);      
        }
        this.ctx.lineTo(route[0].x, route[0].y);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

};

const state = {
    route: [], 
    iterations: 0,
    distance: 0,
    solveJob: false,

    setRoute: function(route) {
        this.route = route;        
    },
    setDistance: function (d) {
        this.distance = d;
    }
};


// events
function start(){ 
    view.pointNumber.value = 6; 
    generate();
}

function generate(){ 
    let n = view.getPointNumber();
    if(view.isMatrix()){
        state.setRoute(handler.matrixRoute(n, n)); 
    }else{
        state.setRoute(handler.randomRoute(n)); 
    }
    state.iterations = 0; 
    state.distance = 0; 
    view.setEnd('--');
    view.setStart('--');
    render();
}

function next(){ 
    iterationStep();
    render();
}

function render() {
    view.setDistance(state.distance);
    view.setIterations(state.iterations);
    view.setSolveBtnText(state.solveJob ? 'Pause' : 'Solve');
    canvas.renderRoute(state.route);
}

function iterationStep() {
    state.iterations++;   
    state.setRoute(handler.nextRoute(state.route));
    state.setDistance(handler.calcRouteDistance(state.route)); 
}

function solveJob() {
    let initd = state.distance;
    iterationStep();
    if(initd != state.distance){        
        render();
        setTimeout(() => { if(state.solveJob) solveJob();}, 0);       
    }else{
        view.setEnd(new Date().toLocaleString());
        state.solveJob = false;
        render();
    } 
}

function solve(){ 
    state.solveJob = !state.solveJob;
    if(state.solveJob){
        view.setEnd('--');
        view.setStart(new Date().toLocaleString());
        solveJob();
    }
}
