const InfiniteLoop = require('infinite-loop');
const axios = require('axios');
const readline = require('readline');
var colors = require('colors');
const fs = require('fs');

let ema10 = [];
let ema25 = [];
let ema50 = [];
let ema1Last = 0;
let quantity = 10;
let prices = [];
let buyPrice = 0;
let sellPrice = 0;
let win = 0;

// main
let il = new InfiniteLoop;

//add it by calling .add
il.add(main, []);
il.setInterval(2000);
il.run();

function main() {
    callApi();
    printEMAS();
    buy();
    console.log(quantity)
}

function callApi() {
    axios.get('https://api.binance.com/api/v3/klines?symbol=BNBBTC&interval=1m&limit=200')
        .then(response => {
            for (let i = 0; i < response.data.length; i++) {
                prices.push(Number(response.data[i][4]))
            }
            console.log(new Date(response.data[response.data.length - 1][6]) + " -> " + "");
            ema10 = calculateEMA(prices, 10);
            ema25 = calculateEMA(prices, 25);
            ema50 = calculateEMA(prices, 50);
        })
        .catch(error => {
            console.log(error);
        });

    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout)
}

function printEMAS() {
    let ema1 = Number(ema10[ema10.length - 1]);
    let ema2 = Number(ema25[ema25.length - 1]);
    let ema3 = Number(ema50[ema50.length - 1]);


    if (ema1 > ema1Last) {
        console.log("EMA10 -> " + ema1.toFixed(8).toString().green)
    } else if (ema1 < ema1Last) {
        console.log("EMA10 -> " + ema1.toFixed(8).toString().red)
    } else {
        console.log("EMA10 -> " + ema1.toFixed(8).toString())
    }

    if (ema2 > ema1) {
        console.log("EMA25 -> " + ema2.toFixed(8).toString().green)
    } else if (ema2 < ema1) {
        console.log("EMA25 -> " + ema2.toFixed(8).toString().red)
    } else {
        console.log("EMA25 -> " + ema1.toFixed(8).toString())
    }

    if (ema3 > ema2) {
        console.log("EMA50 -> " + ema3.toFixed(8).toString().green)
    } else if (ema3 < ema2) {
        console.log("EMA50 -> " + ema3.toFixed(8).toString().red)
    } else {
        console.log("EMA50 -> " + ema3.toFixed(8).toString())
    }
    ema1Last = ema1;

}

function buy() {
    let ema1 = Number(ema10[ema10.length - 1]);
    let ema2 = Number(ema25[ema25.length - 1]);
    let ema3 = Number(ema50[ema50.length - 1]);
    if (ema1 && ema2 && ema2) {
	sellPrice = Number(prices[prices.length - 1]);
	if (sellPrice < buyPrice - (buyPrice * 0.3)) {
		fs.appendFile('history.txt', '\nVende 10-' + prices[prices.length - 1] + "-" + Number(prices[prices.length - 1]) * 10 + "-" + win, (err) => {
                    if (err) throw err;
                    console.log('Vende');                               });
                quantity = 10;                         
		win += buyPrice - sellPrice;
	}
        if (ema3 > ema2) {
            if (quantity === 0) {
                sellPrice = Number(prices[prices.length - 1]);
                fs.appendFile('history.txt', '\nVende 10 -' + prices[prices.length - 1] + "-" + Number(prices[prices.length - 1]) * 10 + "-" + win, (err) => {
                    if (err) throw err;
                    console.log('Vende');
                });
                quantity = 10;
                win += buyPrice - sellPrice;
            }
        } else if (ema3 < ema2) {
            if (quantity === 10) {
                buyPrice = Number(prices[prices.length - 1]);
                fs.appendFile('history.txt', '\nCompra 10 -' + prices[prices.length - 1] + "-" + Number(prices[prices.length - 1]) * 10 + "-" + win, (err) => {
                    if (err) throw err;
                    console.log('Compra');
                });
                quantity = 0;
            }
        }
    }
}

function printEMA(ema) {
    let last = 0;
    for (let i = 0; i < ema.length; i++) {
        last = ema[i];
        if (i > 0) {
            if (ema[i - 1] < ema[i]) {
                console.log(ema[i].toFixed(8).green);
            } else {
                console.log(ema[i].toFixed(8).red);
            }
        }
    }
}

function calculateEMA(source, period) {
    const getEMA = (a, r) => a.reduce((p, n, i) => i ? p.concat(2 * n / (r + 1) + p[p.length - 1] * (r - 1) / (r + 1)) : p, [a[0]]);
    return getEMA(source, period);
}



