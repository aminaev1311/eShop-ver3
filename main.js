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
    constructor({id_product, product_name, price}) {
        this.id = id_product;
        this.title = product_name;
        this.price = price;
    }

    render() {
        return this.toString();
    }
}

class ProductItem extends Item {
    constructor({id_product, product_name, price, img="https://via.placeholder.com/200x150"}) {
        super({id_product, product_name, price});
        this.img = img;
    }

    render() {
        return `
        <div class="product-item" data-id="${this.id}">
            <img src="${this.img}+?text=${this.title}">
            <div class="product-item__desc">
                <h3>${this.title}</h3>
                <p>${this.price}</p>
                <button class="buy-btn" data-id="${this.id}">Add to cart</button>
            </div>
        </div>`;
    }
}

class CartItem extends Item {
    constructor({id_product, product_name, price, quantity, img="https://via.placeholder.com/50x50"}) {
        super({id_product, product_name, price});
        this.quantity = quantity;
        this.img = img;
    }

    render() {
        return `
        <div class="cart-item" data-id="${this.id}">
            <div class="cart-item__left">
                <img src="${this.img}+?text=${this.title}">
                <div class="cart-item__desc">
                    <h3>${this.title}</h3>
                    <h5>q-ty: ${this.quantity}</h5>
                    <p>each: ${this.price}</p>
                </div>
            </div>
            <div class="cart-item__right">
                <h3>${this.price*this.quantity}</h3>
                <button class="del-btn" data-id="${this.id}">X</button>
            </div>
        </div>`;
    }
}

class List {
    constructor(container, list = mapping) {
        this.container = container;
        this.list = list;
        this.data = [];
        this.products = [];
        this.productsMarkUp = [];
        this.markUp = '';
        this._init();
    }

    getData(url) {
        return fetch(url).then( response => response.json()).catch( err => console.log(err) );
    }

    handleData(myData) {
        this.data = myData;
        console.log(this.data);
        this.render();
    }

    render() {
        console.log(this.list[this.constructor.name]);
        this.productsMarkUp = this.data.map( item => new this.list[this.constructor.name](item).render() );
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
                console.log("buy this good: " + event.target.dataset.id);
                this.addProduct(+event.target.dataset.id);
                this.updateCart();
            } else {
                console.log("INFORMATION: not a buy button. nothings happens when clicked");
            }
        });
    }

    addProduct(id) {
        console.log("added to cart product with id: " + id);
        //check if this product is already in the cart
        let index = this.data.findIndex( (item) => {
            return item.id_product == id;
        } );
        console.log(index);

        if (index===-1) {
            //if not in the cart, add to cart with quantity of 1
            console.log("not in the cart. Adding");
            let product = this.data.find( (item) => {
                return item.id_product == id;
            } );
            console.log(product);
            this.products.push(product);
        } else {
            //if in the cart, update quantity and total
            console.log("in the cart.");
        }
    }

    updateCart() {
        console.log("Updating cart...");
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
console.log(myCart.container);
console.log(document.querySelector(myCart.container));  


