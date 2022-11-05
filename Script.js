class Client {
    constructor(sortKey, money) {
        this.sortKey = sortKey;
        this.money = money;
        this.runClient();
    }

    async runClient() {
        await this.getBazaar();
        console.log("1");
        await this.getSkyblockItems();
        console.log("2");
        await this.getRecipes();
        console.log("3");
        this.setupOutputList();
        console.log("4");

        this.sortList();
        this.printList();
    }

    async getBazaar() {
        const url = "https://api.hypixel.net/skyblock/bazaar";
        const rawData = await fetch(url);
        const data = await rawData.json();
        this.bazaar = data.products;
    }

    async getSkyblockItems() {
        const url = "https://api.hypixel.net/resources/skyblock/items";
        const rawData = await fetch(url);
        const data = await rawData.json();
        this.skyblockItems = data.items;
    }

    async getRecipes() {
        const url = "Recipe.json";
        const rawData = await fetch(url);
        console.log(rawData);
        const data = await rawData.json();
        this.recipes = data;
    }

    setupOutputList() {
        let rawOutputList = [];

        this.recipes.forEach(element => {
            let currentFlip = [];

            const multiplicator = 55;

            currentFlip['input'] = []; 
            element.input.forEach(element => {
                let currentInputItem = [];
                currentInputItem['itemID'] = element.itemID;
                currentInputItem['amount'] = element.amount * multiplicator;

                currentFlip['input'].push(currentInputItem);
            });

            currentFlip['output'] = [];
            currentFlip['output']['itemID'] = element.output.itemID;
            currentFlip['output']['amount'] = element.output.amount * multiplicator;

            currentFlip['result'] = [];
            currentFlip['result']['investment'] = 0;
            currentFlip['input'].forEach(element => {
                currentFlip['result']['investment'] += this.bazaar[element.itemID]['sell_summary'][0]['pricePerUnit'] * element.amount;
            });
            currentFlip['result']['sellPrice'] = this.bazaar[currentFlip['output']['itemID']]['sell_summary'][0]['pricePerUnit'] * currentFlip['output']['amount'];
            currentFlip['result']['profit'] = currentFlip['result']['sellPrice'] - currentFlip['result']['investment'];
            currentFlip['result']['percent'] = currentFlip['result']['profit'] * 100 / currentFlip['result']['investment'];

            rawOutputList.push(currentFlip);
        });

        this.baseList = rawOutputList;
    }

    getItemName(itemID) {
        let itemName = "";

        this.skyblockItems.forEach(element => {

            if (element.id == itemID) {
                itemName = element.name;
            }
        });

        if (itemName == "") {
            itemName = itemID;
        }

        return itemName;
    }

    printInputItems(currentElement) {
        let erg = "";

        currentElement.input.forEach(element => {
            erg += `<div class="item">${element.amount}x ${this.getItemName(element.itemID)}</div>`;
        });

        return erg;
    }

    getColor(number) {
        if (number > 0) {
            return "rgb(0, 255, 0)";
        } else if (number < 0) {
            return "rgb(255, 0, 0)";
        } else {
            return "rgb(240, 255, 242)";
        }
    }

    printEndCard(element) {
        let erg = "";

        if (this.sortKey == "profit") {
            erg += `<span style="color: ${this.getColor(element.result.profit)};">${this.formatNumber(element.result.profit)}</span>`;
        } else if (this.sortKey == "percent") {
            erg += `<span style="color: ${this.getColor(element.result.percent)};">${this.formatNumber(element.result.percent)} %</span>`;
        }

        return erg;
    }

    round(number, decimals) {
        return Number(Math.round(number+'e'+decimals)+'e-'+decimals);
    }   

    formatNumber(number) {
        let newNumber = "";

        if (number > 1000000000) {
            newNumber = "+" + this.round((number /  1000000000), 2) + "b";
        } else if (number > 1000000) {
            newNumber = "+" + this.round((number /  1000000), 2) + "m";
        } else if (number > 1000) {
            newNumber = "+" + this.round((number /  1000), 2) + "k";
        } else if (number >= 0) {
            newNumber = "+" + this.round(number, 2);
        } else if (number > -1000) {
            newNumber = this.round(number, 2);
        } else if (number < -1000) {
            newNumber = this.round((number /  1000), 2) + "k";
        } else if (number < -1000000) {
            newNumber = this.round((number /  1000000), 2) + "m";
        } else if (number < -1000000000) {
            newNumber = this.round((number /  1000000000), 2) + "b";
        }
        
        return newNumber;
    }

    sortList() {
        const list = this.baseList;

        let sortKey = this.sortKey;
        let minProfit = 0;
        let minPercent = 0;

        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < (list.length - 1); j++) {
                const one = list[j]['result'][sortKey];
                const two = list[j + 1]['result'][sortKey];
                
                if (one < two) {
                    var tmp = list[j];
                    list[j] = list[j + 1];
                    list[j + 1] = tmp;
                }
            }
        }

        this.outputList = list;
    }

    printList() {
        const div = document.getElementById("output");
        div.innerHTML = "";
        
        this.outputList.forEach(element => {
            div.innerHTML += `
                <div class="flip">
                    <div class="small-show-case">
                        <div class="head-title">${this.getItemName(element.output.itemID)}</div>
                        <div class="end-card">${this.printEndCard(element)}</div>
                    </div>
                    <div class="big-show-case">
                        <div class="inner">
                            <div class="title">${this.getItemName(element.output.itemID)}</div>
                            <div class="input">${this.printInputItems(element)}</div>
                            <div class="line"></div>
                            <div class="output">
                                <div class="small-title">Output</div>
                                <div class="information">${this.formatNumber(element.output.amount)}x ${this.getItemName(element.output.itemID)}</div>
                            </div>
                            <div class="result">
                                <div>
                                    <div class="very-small-title">Investment</div>
                                    <div class="information">${this.formatNumber(element.result.investment)}</div>
                                </div>
                                <div>
                                    <div class="very-small-title">Sell Price</div>
                                    <div class="information">${this.formatNumber(element.result.sellPrice)}</div>
                                </div>
                                <div>
                                    <div class="very-small-title">Profit</div>
                                    <div class="information">${this.formatNumber(element.result.profit)}</div>
                                </div>
                                <div>
                                    <div class="very-small-title">Percent</div>
                                    <div class="information">${this.formatNumber(element.result.percent)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

function getMoney() {
    const input = document.getElementById("money").value;

    if (input >= 1000) {
        return input;
    } else {
        return 1000;
    }
}

async function websiteLoading() {
    new Client("profit", getMoney());
}

function change() {
    if (document.getElementById('sort_option_profit').checked) {
        new Client("profit", getMoney());
    } else if (document.getElementById('sort_option_percent').checked) {
        new Client("percent", getMoney());
    }
}