
function getCssVar(name) {
    return window.getComputedStyle(document.documentElement).getPropertyValue(name);
}

class Sieve {
    constructor (maxNumber) {
        this.maxNumber = maxNumber;

        /** @type {Boolean[]} */
        this.numbers = Array(maxNumber - 1);  // maxNumber inclusive, but exclude 0 and 1

        for (let i = 2; i <= maxNumber; i++) {
            // if it was not visited yet, mark as prime
            if (this.numbers[i - 2] === undefined) {
                this.numbers[i - 2] = true;

                // check all multiples and mark as not prime
                let j = i;
                while (j <= maxNumber) {
                    j += i;
                    this.numbers[j - 2] = false;
                }
            }
        }
    }

    /**
     * @param {Number} number
     * @returns {Boolean}
     */
    isPrime(number) {
        if (number < 2) {
            return false;
        } else if (number > this.maxNumber) {
            throw new Error(`This sieve only goes up to number ${this.maxNumber}.`);
        }
        return this.numbers[number - 2];
    }
}

class Spiral {

    constructor () {
        this.MAX_NUMBER = 5000;
        this.sieve = new Sieve(this.MAX_NUMBER);

        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.backgroundColor = getCssVar("--background-color");
        this.strokeColor = getCssVar("--stroke-color");

        this.radiusElement = document.getElementById("radius");
        this.radiusElement.addEventListener("input", this.draw.bind(this));
        this.angleElement = document.getElementById("angle");
        this.angleElement.addEventListener("input", this.draw.bind(this));

        this.centerX = 0;
        this.centerY = 0;
        this.numberElements = [];

        window.addEventListener("resize", this.draw.bind(this));

        // this.makeNumbers();
        this.draw();
    }

    makeNumbers() {
        for (let number = 1; number < this.MAX_NUMBER; number++) {
            const span = document.createElement("span");
            span.classList.add("number");
            span.innerText = number.toString();
            this.numberElements.push(span);
            document.body.appendChild(span);
        }
    }

    toSpiral(angle, radius) {
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));
        return [this.centerX + x, this.centerY + y];
    }

    draw() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.centerX = Math.round(window.innerWidth / 2);
        this.centerY = Math.round(window.innerHeight / 2);

        // clear the canvas
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.drawSpiral();
        this.drawNumbers();
    }

    drawSpiral() {
        const diagonal = Math.ceil(Math.sqrt(this.centerX ** 2 + this.centerY ** 2));
        const ctx = this.context;

        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        ctx.moveTo(this.centerX, this.centerY);

        let radius = 0;
        let angle = 0;
        while (radius < diagonal) {  // assures that the whole screen will be covered with the spiral
            ctx.lineTo(...this.toSpiral(angle, radius));

            radius += 0.01;
            angle += 0.005;
            // radius += 2;
            // angle += Math.PI / 4;
        }

        ctx.stroke();
    }

    drawNumbers() {
        const angleStep = parseFloat(this.angleElement.value);
        const radiusStep = parseFloat(this.radiusElement.value);
        console.info(angleStep, radiusStep);

        const awayStep = 4;  //angleStep;
        const chord = 25;
        const rotation = 1;

        let theta = 2.5;  // chord / awayStep;
        let away = 0;

        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        for (let i = 1; i < this.MAX_NUMBER; i++) {
            const around = theta + rotation;

            const x = Math.round(this.centerX + away * Math.cos(around));
            const y = Math.round(this.centerY + away * Math.sin(around));

            if (this.sieve.isPrime(i)) {
                this.context.fillStyle = "blue";
                this.context.font = "bold 7pt monospace";
            } else {
                this.context.fillStyle = "gray";
                this.context.font = "7pt monospace";
            }
            this.context.fillText(i.toString(), x, y);

            away = awayStep * theta;
            theta += chord / away;
        }
    }
}

new Spiral();
