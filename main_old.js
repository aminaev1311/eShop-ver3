const API = 'https://raw.githubusercontent.com/aminaev1311/online-store-api/master/responses/';

// let products = [ {
//             id: 1,
//             title: 'macbook',
//             price: '100000'
//         }, 
//         {
//             id: 2,
//             title: 'mouse',
//             price: '1000'
//         },
//         {
//             id: 3,
//             title: 'bag',
//             price: '100'
//         },
//         {
//             id: 4,
//             title: 'pomodoro timer',
//             price: '1000'
//         }
// ];

// let cart = [
//     {
//         id: 1,
//         title: 'macbook',
//         price: '100000',
//         quantity: 2
//     },
//     {
//         id: 4,
//         title: 'pomodoro timer',
//         price: '1000',
//         quantity: 1
//     },
// ];

class Item {
    constructor({id, title, price}) {
        this.id = id;
        this.title = title;
        this.price = price;
    }

    render() {
        return this.toString();
    }
}

class ProductItem extends Item {
    constructor({id, title, price, img="https://via.placeholder.com/200x150"}) {
        super({id, title, price});
        this.img = img;
    }

    render() {
        return `
        <div class="product-item" data-id="${this.id}" data-title="${this.title}" data-price="${this.price}">
            <img src="${this.img}+?text=${this.title}">
            <div class="product-item__desc">
                <h3>${this.title}</h3>
                <p>${this.price}</p>
                <button class="buy-btn" data-id="${this.id}" data-title="${this.title}" data-price="${this.price}">Add to cart</button>
            </div>
        </div>`;
    }
}

class CartItem extends Item {
    constructor({id, title, price, quantity, img="https://via.placeholder.com/50x50"}) {
        super({id, title, price});
        this.quantity = quantity;
        this.img = img;
    }

    render() {
        return `
        <div class="cart-item" data-id="${this.id}" data-title="${this.title}" data-price="${this.price}" data-quantity="${this.quantity}">
            <div class="cart-item__left">
                <img src="${this.img}+?text=${this.title}">
                <div class="cart-item__desc">
                    <h3>${this.title}</h3>
                    <h5>q-ty: <span class="cartItemQuantity">${this.quantity}</span></h5>
                    <p>each: ${this.price}</p>
                </div>
            </div>
            <div class="cart-item__right">
                <h3 class="cartItemTotalPrice">${this.price*this.quantity}</h3>
                <button class="del-btn" data-id="${this.id}" data-title="${this.title}" data-price="${this.price}" data-quantity="${this.quantity}">X</button>
            </div>
        </div>`;
    }
}

class List {
    constructor(container, list = mapping) {
        this.container = container;
        this.list = list;
        this.data = [];
        this.rawData = [];
        this.products = [];
        this.toRender = [];
        this.productsMarkUp = [];
        this.markUp = '';
        this._init();
    }

    getData(url) {
        return fetch(url).then( response => response.json()).catch( err => console.log(err) );
    }

    handleData(myData) {
        this.data = myData;
        this.parseInput();
        this.render();
    }

    parseInput() {
        this.data.forEach( ({id_product, product_name, price}) => {
            this.rawData.push({id: id_product, title: product_name, price: price}); 
        });
    }

    render() {
        this.productsMarkUp = this.rawData.map( (item) => {
            let productItem = new this.list[this.constructor.name](item);
            this.products.push(productItem);
            return productItem.render();
        });
        this.markUp = this.productsMarkUp.reduce( (acc, curr) => acc += curr, '');
        document.querySelector(this.container).insertAdjacentHTML('beforeend', this.markUp);
        return this.markUp;
    }
}

class ProductList extends List {
    constructor(container = '.products') {
        super(container);
        this.getData(API + 'catalogData.json')
            .then( data => {
                this.handleData(data);
            });
    }

    _init() {
        document.querySelector('.search__input').addEventListener('input', (event) => {
            let term = event.target.value;
            this.search(term);
            this.displayNothingFound();
        });
    }

    search(term) {
        let regExp = new RegExp(term, 'i');
        this.rawData.forEach( ({id, title}) => {
            let itemElem = document.querySelector(`.product-item[data-id="${id}"]`);
            //show only products mathching the search criteria
            if (!regExp.test(title)) { //if the item title doesn't match the criteria hide it
            //first find it in the mark up
            //then add invisible class to its class list
                itemElem.classList.add('invisible');
            } else {//if the item matches the search, show it
                itemElem.classList.remove('invisible');
            }
        });
    }

    displayNothingFound() {
        try {
            document.querySelector('#nothingFound').remove();
        } catch {

        }
        
        let hiddenItemsCount = 0;
        document.querySelectorAll(".product-item").forEach( item => { 
            if (item.classList.contains('invisible')) hiddenItemsCount++;
        });

        if (hiddenItemsCount===this.products.length) { //all the items are invisible, i.e. nothing was found
            document.querySelector('.products').insertAdjacentHTML('beforeend', "<p id='nothingFound'>Nothing found</p>");
        } else {
            try {
                document.querySelector('#nothingFound').remove();
            } catch {
            }
        }
    }
}

class CartList extends List {
    constructor(container = ".cart-items") {
        super(container);
        this.getData(API + 'getBasket.json')
            .then( data => {
                this.handleData(data.contents);
            });
    }

    parseInput() {
        this.data.forEach( ({id_product, product_name, price, quantity}) => {
            this.rawData.push({id: id_product, title: product_name, price: price, quantity: quantity}); 
        });
    }

    render() {
        this.productsMarkUp = this.rawData.map( (item) => {
            let productItem = new this.list[this.constructor.name](item);
            this.products.push(productItem);
            return productItem.render();
        });
        this.markUp = this.productsMarkUp.reduce( (acc, curr) => acc += curr, '');
        document.querySelector(this.container).insertAdjacentHTML('beforeend', this.markUp);
        
        return this.markUp;
    }

    _init() {
        /**
         * shows the cart pop-up when the cart button is clicked
         */
        document.querySelector(".cart-btn").addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');  
            this.renderCartTotal();
            this.handleEmptyCart();
        });
        //catch clicks inside the products div
        document.querySelector(".products").addEventListener('click', event => {
            //if it is a buy button
            if (event.target.classList.contains("buy-btn")) {
                // this.addProduct(event.target);
                this.asyncAddProduct(event.target);
                // this.updateCart(event.target);
            }
        });

        document.querySelector(".cart").addEventListener('click', event => {
            //if it is a buy button
            if (event.target.classList.contains("del-btn")) {
                // this.removeProduct(event.target);
                this.asyncRemoveProduct(event.target)
            }
        });
    }

    renderCartTotal() {
        // document.querySelector(this.container).insertAdjacentHTML('beforeend', `<p id="total">The total is ${this.calculateTotal()}</p>`);
        try {
            document.querySelector('#total').remove();
        } catch {
            (err) => console.log(err);
        }
        document.querySelector(this.container).insertAdjacentHTML('beforeend', 
        `<div style="text-align:right" id="total">
            <p>The total is ${this.calculateTotal()}</p>
            <a href="cart.html">Detailed cart</a>
        </div>`);
    }

    calculateTotal() {
        return this.products.reduce( (acc, curr) => acc+=curr.price * curr.quantity, 0 );
    }

    addProduct(elem) {
        const elemId = +elem.dataset.id;
        const elemPrice = +elem.dataset.price;
        const elemTitle = elem.dataset.title;

        let index = this.getIndex(elemId);

        if (index===-1) {
            //if not in the cart, add to cart with quantity of 1
            let cartItem = new CartItem({id: elemId, title: elemTitle, price: elemPrice,  quantity: 1});
            this.products.push(cartItem);
            //add this item to mark-up
            document.querySelector(this.container).insertAdjacentHTML('beforeend', cartItem.render());
        } else {
            //if in the cart, update quantity
            this.products[index].quantity++;
            const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);
            this.updateQuantity(cartItemElem, index);
            this.updateTotal(cartItemElem, index);
        }
        this.renderCartTotal();
        this.handleEmptyCart();
    }

    asyncAddProduct(elem) {
        this.getData(API + 'addToBasket.json').then( data => {
            if (data.result === 1) {
                const elemId = +elem.dataset.id;
                const elemPrice = +elem.dataset.price;
                const elemTitle = elem.dataset.title;

                let index = this.getIndex(elemId);

                if (index===-1) {
                    //if not in the cart, add to cart with quantity of 1
                    let cartItem = new CartItem({id: elemId, title: elemTitle, price: elemPrice,  quantity: 1});
                    this.products.push(cartItem);
                    //add this item to mark-up
                    document.querySelector(this.container).insertAdjacentHTML('beforeend', cartItem.render());
                } else {
                    //if in the cart, update quantity
                    this.products[index].quantity++;
                    const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);
                    this.updateQuantity(cartItemElem, index);
                    this.updateTotal(cartItemElem, index);
                }
                this.renderCartTotal();
                this.handleEmptyCart();
            } else {
                console.log("Error. Cannot add to the cart!");
            }
        });
    }

    removeProduct(elem) {
        const elemId = +elem.dataset.id;

        let index = this.getIndex(elemId);

        this.products[index].quantity--;
        const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);

        if (this.products[index].quantity===0) {
            this.products.splice(index, 1);//remove the product from an array
            //remove it from the mark-up
            cartItemElem.remove();
        } else {
            //update the mark-up to reflect the reduced quantity
            this.updateQuantity(cartItemElem, index);
            this.updateTotal(cartItemElem, index);
        }
        this.renderCartTotal();
        this.handleEmptyCart();
    }

    asyncRemoveProduct(elem) {
        this.getData(API + 'deleteFromBasket.json').then( data => {
            if (data.result === 1) {
                const elemId = +elem.dataset.id;

                let index = this.getIndex(elemId);

                this.products[index].quantity--;
                const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);

                if (this.products[index].quantity===0) {
                    this.products.splice(index, 1);//remove the product from an array
                    //remove it from the mark-up
                    cartItemElem.remove();
                } else {
                    //update the mark-up to reflect the reduced quantity
                    this.updateQuantity(cartItemElem, index);
                    this.updateTotal(cartItemElem, index);
                }
                this.renderCartTotal();
                this.handleEmptyCart();
            } else {
                console.log("Error. Cannot remove from the cart!");
            }
        });
    }

    handleEmptyCart() {
        if (this.cartIsEmpty()) {
            this.showCartEmptyMessage();
        } else {
            this.removeCartIsEmptyMessage();
        }
    }

    cartIsEmpty() {
        return this.products.length === 0; 
    }

    showCartEmptyMessage() {
        document.querySelector(this.container).innerHTML = '<p id="emptyCart" style="text-align:right">The cart is empty</p>';
    }

    removeCartIsEmptyMessage() {
        try {
            document.querySelector('#emptyCart').remove();
        } catch {
        }
    }

    getIndex(elemId) {
        return this.products.findIndex( item => item.id == elemId );
    }

    updateQuantity(cartItemElem, index) {
        cartItemElem.querySelector(`.cartItemQuantity`).textContent = this.products[index].quantity;
    }

    updateTotal(cartItemElem, index) {
        cartItemElem.querySelector(`.cartItemTotalPrice`).textContent = this.products[index].quantity*this.products[index].price;
    }
}

let mapping = {
    ProductList: ProductItem,
    CartList: CartItem,
}

let list = new ProductList();
console.log(list);
let myCart = new CartList();
console.log(myCart);


