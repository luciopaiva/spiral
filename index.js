
const TAU = Math.PI * 2;

function getCssVar(name) {
    return window.getComputedStyle(document.documentElement).getPropertyValue(name);
}

class PrimeSieve {
    constructor (maxNumber) {
        this.maxNumber = maxNumber;
        this.count = 0;

        /** @type {Boolean[]} */
        this.numbers = Array(maxNumber - 1);  // maxNumber inclusive, but exclude 0 and 1

        for (let i = 2; i <= maxNumber; i++) {
            // if it was not visited yet, mark as prime
            if (this.numbers[i - 2] === undefined) {
                this.numbers[i - 2] = true;
                this.count++;

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
    query(number) {
        if (number < 2) {
            return false;
        } else if (number > this.maxNumber) {
            throw new Error(`This sieve only goes up to number ${this.maxNumber}.`);
        }
        return this.numbers[number - 2];
    }
}

class RandomSieve {
    /**
     * A sieve that selects random numbers. To be used to demonstrate that random numbers don't show patterns.
     *
     * @param {Number} maxNumber
     * @param {Number} threshold - probability for a number to be selected - set this to the probability of a number to
     *                             be a prime, so that the density will be similar to the prime sieve
     */
    constructor (maxNumber, threshold) {
        this.maxNumber = maxNumber;
        this.numbers = Array(maxNumber + 1);

        for (let i = 0; i <= maxNumber; i++) {
            this.numbers[i] = Math.random() < threshold;
        }
    }

    query(number) {
        if (number < 0) {
            return false;
        } else if (number > this.maxNumber) {
            throw new Error(`This sieve only goes up to number ${this.maxNumber}.`);
        }
        return this.numbers[number];
    }
}

class Spiral {

    constructor () {
        this.MAX_NUMBER = 100000;
        this.MAX_NUMBER_BEFORE_UI_SUFFERS = 10000;
        this.primeSieve = new PrimeSieve(this.MAX_NUMBER);
        this.randomSieve = new RandomSieve(this.MAX_NUMBER, this.primeSieve.count / this.MAX_NUMBER);
        this.sieve = null;
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
        this.randomModeElement = document.getElementById("random-mode");
        this.randomModeElement.addEventListener("input", this.draw.bind(this));
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
        this.sieve = this.randomModeElement.checked ? this.randomSieve : this.primeSieve;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.centerX = Math.round(window.innerWidth / 2);
        this.centerY = Math.round(window.innerHeight / 2);

        // clear the canvas
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const numberSpacing = parseFloat(this.numberSpacingElement.value);
        const radiusFactor = parseFloat(this.radiusFactorElement.value);
        console.info(numberSpacing, radiusFactor);
        const diagonal = Math.ceil(Math.sqrt(this.centerX ** 2 + this.centerY ** 2));
        const greatestNumberToShow = this.calculateGreatestNumberToShow(numberSpacing, radiusFactor, diagonal);
        console.info(greatestNumberToShow);

        if (greatestNumberToShow < this.MAX_NUMBER_BEFORE_UI_SUFFERS) {
            this.drawSpiral();
            this.showNumbersElement.disabled = false;
            this.onlyPrimesElement.disabled = false;
        } else {
            this.showNumbersElement.disabled = true;
            this.onlyPrimesElement.disabled = true;
        }
        this.drawNumbers(greatestNumberToShow, radiusFactor, numberSpacing, diagonal);
    }

    drawSpiral() {
        const numberSpacing = 1;  // parseFloat(this.numberSpacingElement.value);
        const radiusFactor = parseFloat(this.radiusFactorElement.value);

        const diagonal = Math.ceil(Math.sqrt(this.centerX ** 2 + this.centerY ** 2));
        const ctx = this.context;

        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        ctx.moveTo(this.centerX, this.centerY);

        let theta = .6;

        let radius = 0;
        let angle = 0;
        while (radius < diagonal) {  // assures that the whole screen will be covered with the spiral
            angle = theta;

            ctx.lineTo(...this.toSpiral(angle, radius));

            radius = radiusFactor * theta;
            theta += numberSpacing / radius;
        }

        ctx.stroke();
    }

    calculateGreatestNumberToShow(step, radiusFactor, diagonal) {
        let theta = 0.6;
        let radius = radiusFactor * theta;
        let greatestNumberToShow = 1;
        while (greatestNumberToShow < this.MAX_NUMBER && radius < diagonal) {
            radius = radiusFactor * theta;
            theta += step / radius;
            greatestNumberToShow++;
        }
        return greatestNumberToShow;
    }

    /**
     * The algorithm here was taken from https://stackoverflow.com/a/13901170/778272
     * Not perfect, but works for spreading dots at regular distances from each other.
     *
     * Other reference: https://math.stackexchange.com/a/2216736
     *
     * @param greatestNumberToShow
     * @param radiusFactor
     * @param numberSpacing
     */
    drawNumbers(greatestNumberToShow, radiusFactor, numberSpacing) {
        const showNumbers = this.showNumbersElement.checked && greatestNumberToShow < this.MAX_NUMBER_BEFORE_UI_SUFFERS;
        const onlyPrimes = this.onlyPrimesElement.checked || greatestNumberToShow >= this.MAX_NUMBER_BEFORE_UI_SUFFERS;

        const rotation = 1;

        let theta = .6;
        let currentRadius = radiusFactor * theta;

        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        for (let i = 1; i < greatestNumberToShow; i++) {
            const currentAngle = theta + rotation;
            const isPrime = this.sieve.query(i);

            const x = Math.round(this.centerX + currentRadius * Math.cos(currentAngle));
            const y = Math.round(this.centerY + currentRadius * Math.sin(currentAngle));

            if (showNumbers) {
                if (isPrime) {
                    this.context.fillStyle = this.primeColor;
                    this.context.font = "bold 7pt monospace";
                    this.context.fillText(i.toString(), x, y);
                } else if (!onlyPrimes) {
                    this.context.fillStyle = this.nonPrimeColor;
                    this.context.font = "7pt monospace";
                    this.context.fillText(i.toString(), x, y);
                }
            } else {
                if (isPrime) {
                    this.context.fillStyle = this.primeColor;
                    this.drawDot(x, y);
                } else if (!onlyPrimes) {
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
