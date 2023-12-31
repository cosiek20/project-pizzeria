  import {settings, select, classNames} from './settings.js';
  import Product from './components/Product.js';
  import Cart from './components/Cart.js';
  import Booking from './components/Booking.js';
  import Home from './components/Home.js'

  const app = {
    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;

      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.replace('#/', '');

      let pageMatchingHash = thisApp.pages[0].id;
      console.log(thisApp.pages[0].id)

      for(let page of thisApp.pages){
        if(page.id == idFromHash) {
          pageMatchingHash = page.id;
          break;
        }
      }

      thisApp.activatePage(pageMatchingHash);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          const id = clickedElement.getAttribute('href').replace('#', '');

          thisApp.activatePage(id);

          /* change URL hash */
          window.location.hash = '#/' + id;
        })
      }

    },

    activatePage: function(pageId){
      const thisApp = this;

      for(let page of thisApp.pages){
          page.classList.toggle(classNames.pages.active, page.id == pageId);
      }

      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active,
          link.getAttribute('href') == '#' + pageId
          );
      }
    },

    initMenu: function(){
      const thisApp = this;


      for(let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initHome: function(){
      const thisApp = this;

      const homeContainer = document.querySelector(select.containerOf.homePage);
      new Home(homeContainer);

        const order = document.querySelector('.box.order');
        const book = document.querySelector('.box.book')

        order.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
  
        console.log(clickedElement);

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id)
        /* change URL hash */
        window.location.hash = '#/' + id;
      });
      book.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
  
        console.log(clickedElement);

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id)
        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    },

    initBooking: function(){
      const thisApp = this;

      const bookingContainer = document.querySelector(select.containerOf.booking);

      thisApp.Booking = new Booking(bookingContainer);
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      })
    },

    init: function(){
      const thisApp = this;
      thisApp.initPages();
      thisApp.initData();
      thisApp.initCart();
      thisApp.initBooking();
      thisApp.initHome();
    },

  };

  app.init();
