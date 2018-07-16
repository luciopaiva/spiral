
const TAU = Math.PI * 2;

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
        this.MAX_NUMBER = 100000;
        this.sieve = new Sieve(this.MAX_NUMBER);
        this.dotSize = 5;
        this.halfDotSize = this.dotSize / 2;

        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.backgroundColor = getCssVar("--background-color");
        this.strokeColor = getCssVar("--stroke-color");
        this.primeColor = getCssVar("--prime-color");
        this.nonPrimeColor = getCssVar("--non-prime-color");

        this.numberSpacingElement = document.getElementById("number-spacing");
        this.numberSpacingElement.addEventListener("input", this.draw.bind(this));
        this.radiusFactorElement = document.getElementById("radius-factor");
        this.radiusFactorElement.addEventListener("input", this.draw.bind(this));
        this.showNumbersElement = document.getElementById("show-numbers");
        this.showNumbersElement.addEventListener("input", this.draw.bind(this));
        this.onlyPrimesElement = document.getElementById("only-primes");
        this.onlyPrimesElement.addEventListener("input", this.draw.bind(this));

        this.infoWindow = document.getElementById("info-window");
        this.infoButton = document.getElementById("info-button");
        this.infoButton.addEventListener("click", (event) => {
            this.infoWindow.classList.toggle("hidden");
            event.stopPropagation();
        });
        document.addEventListener("click", () => this.infoWindow.classList.add("hidden"));

        this.centerX = 0;
        this.centerY = 0;

        window.addEventListener("resize", this.draw.bind(this));

        this.draw();
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
        }

        ctx.stroke();
    }

    drawNumbers() {
        const numberSpacing = parseFloat(this.numberSpacingElement.value);
        const radiusFactor = parseFloat(this.radiusFactorElement.value);
        console.info(numberSpacing, radiusFactor);

        const rotation = 1;

        let theta = 2.5;
        let currentRadius = 0;

        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        for (let i = 1; i < this.MAX_NUMBER; i++) {
            const currentAngle = theta + rotation;
            const isPrime = this.sieve.isPrime(i);

            const x = Math.round(this.centerX + currentRadius * Math.cos(currentAngle));
            const y = Math.round(this.centerY + currentRadius * Math.sin(currentAngle));

            if (this.showNumbersElement.checked) {
                if (isPrime) {
                    this.context.fillStyle = this.primeColor;
                    this.context.font = "bold 7pt monospace";
                    this.context.fillText(i.toString(), x, y);
                } else if (!this.onlyPrimesElement.checked) {
                    this.context.fillStyle = this.nonPrimeColor;
                    this.context.font = "7pt monospace";
                    this.context.fillText(i.toString(), x, y);
                }
            } else {
                if (isPrime) {
                    this.context.fillStyle = this.primeColor;
                    this.drawDot(x, y);
                } else if (!this.onlyPrimesElement.checked) {
                    this.context.fillStyle = this.nonPrimeColor;
                    this.drawDot(x, y);
                }
            }

            currentRadius = radiusFactor * theta;
            theta += numberSpacing / currentRadius;
        }
    }

    drawDot(x, y) {
        this.context.beginPath();
        this.context.arc(x, y, this.halfDotSize, 0, TAU);
        this.context.fill();
    }
}

new Spiral();
