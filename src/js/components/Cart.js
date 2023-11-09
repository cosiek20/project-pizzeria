import {select, classNames, templates, settings} from './settings.js';
import utils from './utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
  const thisCart = this;

  thisCart.dom = {};
  thisCart.dom.wrapper = element;
  thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
  thisCart.dom.productList = element.querySelector(select.cart.productList);
  thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
  thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
  thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
  thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
  thisCart.dom.form = element.querySelector(select.cart.form);
  thisCart.dom.address = element.querySelector(select.cart.address);
  thisCart.dom.phone = element.querySelector(select.cart.phone);
  }
  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault;
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;


    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElemntFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }
  update(){
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for(let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    if(totalNumber == 0) {
      thisCart.totalPrice = 0;
      deliveryFee = 0;

    } else {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    for(let totalPricePlace of thisCart.dom.totalPrice){
      totalPricePlace.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.deliveryFee = deliveryFee;
}
remove(menuProduct){
  const thisCart = this;

 menuProduct.dom.wrapper.remove();
  const indexOfProduct = thisCart.products.indexOf(menuProduct);
  thisCart.products.splice(indexOfProduct, 1);

  thisCart.update();
}
sendOrder(){
  const thisCart = this;

  const url = settings.db.url + '/' + settings.db.orders;

  const payload = {};
  payload.address = thisCart.dom.address.value;
  payload.phone = thisCart.dom.phone.value;
  payload.totalPrice = thisCart.totalPrice;
  payload.subtotalPrice = thisCart.subtotalPrice;
  payload.totalNumber = thisCart.totalNumber;
  payload.deliveryFee = thisCart.deliveryFee;
  payload.products = [];
  console.log(payload);


  for(let prod of thisCart.products) {
    payload.products.push(prod.getData());
    console.log(prod.getData())
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
  
  fetch(url, options);
}
}

export default Cart;