import {templates} from '../settings.js';


class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }
  render(element){
    const thisHome = this

    const generatedHTML = templates.homePage();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;


  }
  initWidgets(){
    const thisHome = this;

    // eslint-disable-next-line no-undef
    /*global Flickity*/
    /*eslint no-undef: "error"*/
    thisHome.dom.carousel = new Flickity('.main-carousel', {
      autoPlay: 3000,
      prevNextButtons: false,
      wrapAround: true,
      cellAlign: 'center',
      contain: true,
    });
  }
}

export default Home;