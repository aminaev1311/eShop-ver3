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
        console.log(this.data);
        this.render();
    }

    parseInput() {
        this.data.forEach( ({id_product, product_name, price}) => {
            this.rawData.push({id: id_product, title: product_name, price: price}); 
        });
    }

    render() {
        console.log(this.list[this.constructor.name]);
        this.productsMarkUp = this.rawData.map( (item) => {
            let productItem = new this.list[this.constructor.name](item);
            this.products.push(productItem);
            return productItem.render();
        });
        console.log(this.productsMarkUp);
        this.markUp = this.productsMarkUp.reduce( (acc, curr) => acc += curr, '');
        document.querySelector(this.container).insertAdjacentHTML('beforeend', this.markUp);
        console.log(this.markUp);
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
            console.log(term);
            this.search(term);
        });
    }

    search(term) {
        let regExp = new RegExp(term, 'i');
        console.log(regExp);
        this.data.forEach( ({id_product: id, product_name: title}) => {
            console.log(title);
            console.log(regExp.test(title));
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

    _init() {
        /**
         * shows the cart pop-up when the cart button is clicked
         */
        document.querySelector(".cart-btn").addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        });
        //catch clicks inside the products div
        document.querySelector(".products").addEventListener('click', event => {
            console.log(event.target);
            //if it is a buy button
            if (event.target.classList.contains("buy-btn")) {
                console.log("buy this good: " + event.target.dataset.id +" "+ event.target.dataset.title);
                this.addProduct(event.target);
                // this.updateCart(event.target);
            }
        });

        document.querySelector(".cart").addEventListener('click', event => {
            console.log(event.target);
            //if it is a buy button
            if (event.target.classList.contains("del-btn")) {
                console.log("delete this product: " + event.target.dataset.id);
                this.removeProduct(event.target);
            }
        });
    }

    addProduct(elem) {
        console.log(elem);
        const elemId = +elem.dataset.id;
        const elemPrice = +elem.dataset.price;
        const elemTitle = elem.dataset.title;

        console.log("added to cart product with id: " + elemId +" "+ elemTitle);
        //check if this product is already in the cart
        let index = this.products.findIndex( (item) => {
            return item.id == elemId;
        } );
        console.log(index);

        if (index===-1) {
            //if not in the cart, add to cart with quantity of 1
            let cartItem = new CartItem({id: elemId, title: elemTitle, price: elemPrice,  quantity: 1});
            console.log(cartItem);
            this.products.push(cartItem);
            console.log(this.products);
            //add this item to mark-up
            // this.toRender = [cartItem];
            document.querySelector(this.container).insertAdjacentHTML('beforeend', cartItem.render());
        } else {
            //if in the cart, update quantity
            console.log("in the cart.");
            this.products[index].quantity++;
            console.log(this.products);
            const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);
            cartItemElem.querySelector(`.cartItemQuantity`).textContent = this.products[index].quantity;
            cartItemElem.querySelector(`.cartItemTotalPrice`).textContent = this.products[index].quantity*this.products[index].price;
        }
    }

    removeProduct(elem) {
        console.log(elem);
        const elemId = +elem.dataset.id;

        let index = this.products.findIndex( (item) => {
            return item.id == elemId;
        } );
        console.log(index);
        this.products[index].quantity--;
        console.log(this.products[index].quantity);
        const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);

        if (this.products[index].quantity===0) {
            this.products.splice(index, 1);//remove the product from an array
            //remove it from the mark-up
            cartItemElem.remove();
        } else {
            //update the mark-up to reflect the reduced quantity
            cartItemElem.querySelector(`.cartItemQuantity`).textContent = this.products[index].quantity;
            cartItemElem.querySelector(`.cartItemTotalPrice`).textContent = this.products[index].quantity*this.products[index].price;
        }
        console.log(this.products);
    }

    // updateCart(elem) {
    //     console.log("Updating cart element..." + elem);
    //     console.log(elem);
    //     const elemId = +elem.dataset.id;

    //     let index = this.products.findIndex( (item) => {
    //         return item.id == elemId;
    //     } );
    //     console.log(index);
    //     //if the item is not in the cart, then remove from the mark-up
    //     const cartItemElem = document.querySelector(`div.cart-item[data-id="${elemId}"]`);

    //     if (cartItemElem) {
    //         if (index===-1) {
    //         cartItemElem.remove();
    //         } else {
    //             //if the item is in the cart, update quantity and total price in the cart item
    //             console.log(elem);
    //             cartItemElem.querySelector(`.cartItemQuantity`).textContent = this.products[index].quantity;
    //             cartItemElem.querySelector(`.cartItemTotalPrice`).textContent = this.products[index].quantity*this.products[index].price;
    //         }
    //     }

    //     this.toRender.forEach( cartItem => {
    //         document.querySelector(this.container).insertAdjacentHTML('beforeend', cartItem.render() );
    //     });
    // }
}

let mapping = {
    ProductList: ProductItem,
    CartList: CartItem,
}

let list = new ProductList();
console.log(list);
let myCart = new CartList();
console.log(myCart);
console.log(myCart.container);
console.log(document.querySelector(myCart.container));  


