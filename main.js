let app = new Vue({
    el: '#app',
    data: {
        API: 'https://raw.githubusercontent.com/aminaev1311/online-store-api/master/responses/',
        find: '',
        isVisibleCart: false,
        // products: [{
        //     id: 1,
        //     title: 'macbook',
        //     price: '100000'
        // }, 
        // {
        //     id: 2,
        //     title: 'mouse',
        //     price: '1000'
        // },
        // {
        //     id: 3,
        //     title: 'bag',
        //     price: '100'
        // },
        // {
        //     id: 4,
        //     title: 'pomodoro timer',
        //     price: '1000'
        // }],
        products: [],
        filteredProducts: [],
        // cart: [
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
        // ],
        cart: [],
        filteredCart: [],
    },
    methods: {
        getData(url) {
            return fetch(url).
            then( response => response.json()).
            catch( err => console.log(err) );
        },
        search() {
            let regExp = new RegExp(this.find, 'i');  
            this.filteredProducts = this.products.filter( product => regExp.test(product.title)); 
        },
        addToCart({id, title, price, img}) {
            this.getData(this.API + 'addToBasket.json').then( data => {
                if (data.result === 1) {
                    let index = this.getIndex(id);

                    if (index===-1) {
                        //if not in the cart, add to cart with quantity of 1
                        this.cart.push({id: id, title: title, price: price,  quantity: 1});
                    } else {
                        //if in the cart, update quantity
                        this.cart[index].quantity++;
                    }
                    // this.renderCartTotal(); //TO-DO take care of displaying cart total
                } else {
                    console.log("Error. Cannot add to the cart!");
                }
            });
        },
        getIndex(elemId) {
            return this.cart.findIndex( item => item.id == elemId );
        },
        removeFromCart({id, title, price, quantity, img}) {
            this.getData(this.API + 'deleteFromBasket.json').then( data => {
            if (data.result === 1) {
                let index = this.getIndex(id);

                this.cart[index].quantity--;
                // const cartItemElem = document.querySelector(`.cart-item[data-id="${elemId}"]`);

                if (this.cart[index].quantity===0) {
                    this.cart.splice(index, 1);//remove the product from an array
                    //remove it from the mark-up
                    // cartItemElem.remove();
                } else {
                    //update the mark-up to reflect the reduced quantity
                    // this.updateQuantity(cartItemElem, index);
                    // this.updateTotal(cartItemElem, index); //TO-DO handle the cart total display
                }
                // this.renderCartTotal();
                // this.handleEmptyCart(); //TO-DO handle empty cart
            } else {
                console.log("Error. Cannot remove from the cart!");
            }
        });
        }
    },
    computed: {
        cartTotal() {
            return this.cart.reduce( (acc, curr) => acc+curr.price*curr.quantity, 0);
        }
    },
    beforeCreate() {
        console.log('before created');
    },
    created() {
        //get catalogue data from the server
        console.log('created');
        this.getData(`${this.API}catalogData.json`).then( data => {
                for (let {id_product, product_name, price} of data) {
                    this.products.push({id: id_product, title: product_name, price: price});
                };
                this.filteredProducts = [...this.products];
            });
        //get cart data from the server
        this.getData(`${this.API}getBasket.json`).then( data => {
                for (let {id_product, product_name, price, quantity} of data.contents) {
                    this.cart.push({id: id_product, title: product_name, price: price, quantity: quantity});
                };
            }); 
    },
    mounted() {
        console.log('mounted');
    },

});