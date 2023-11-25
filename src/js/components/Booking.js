import {select, templates, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.tablePicked = '';

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.bookings
                                      + '?' + params.booking.join('&'),
      eventsCurrrent: settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsCurrrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrrent);
        console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
      thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }

    //console.log('thisBooking.booked:', thisBooking.booked);
    this.updateDOM();

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailabe = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailabe = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      console.log(thisBooking.booked[thisBooking.date][thisBooking.hour])
      if(
        !allAvailabe
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      table.classList.remove('selected');
    }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  render(element){
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    /* find menu container */
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    /* add element to menu */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.adress = element.querySelector(select.booking.address);
    thisBooking.dom.checkboxWrapper = element.querySelectorAll(select.booking.checkboxWrapper);
    thisBooking.dom.waterCheckbox = document.querySelector("[value='water']");
    thisBooking.dom.breadCheckbox = document.querySelector("[value='bread']");
    thisBooking.dom.bookBTN = document.querySelector('.booking-form');
    console.log(thisBooking.dom.bookBTN)

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.allTables = thisBooking.dom.wrapper.querySelector(select.booking.tableWrapper);
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener("updated", function() {
    });

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener("updated", function() {
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      for(let table of thisBooking.dom.tables){
        table.classList.remove('selected')
      }
    });

    thisBooking.dom.allTables.addEventListener('click', function(event){
      event.preventDefault();
      
      if(event.target.classList.contains('table') === true) {
        if(event.target.classList.contains('booked')){
          window.alert("The table you picked is already taken😞");
        } else {

          if(event.target.classList.contains('selected') == true){
            for(let table of thisBooking.dom.tables){
              table.classList.remove('selected')
            }
            thisBooking.tablePicked = '';
            event.target.classList.remove('selected');
          } else {
            for(let table of thisBooking.dom.tables){
              table.classList.remove('selected')
            }
            thisBooking.tablePicked = event.target.dataset.table;
            event.target.classList.add('selected');
          }
        }
      }
    });

    thisBooking.dom.bookBTN.addEventListener('submit', function(event){
      event.preventDefault();

      thisBooking.sendBooking();
    });

  }
  sendBooking (){
    const thisBooking = this;
  
    const url = settings.db.url + '/' + settings.db.bookings;
  
    const payload = {};
    payload.date =  thisBooking.datePicker.value;
    payload.hour = thisBooking.hourPicker.value;
    payload.table = parseInt(thisBooking.tablePicked);
    payload.duration = thisBooking.hoursAmount.value;
    payload.ppl = thisBooking.peopleAmount.value;
    payload.starters = [];
    payload.phone = thisBooking.dom.phone;
    payload.adress = thisBooking.dom.adress;

    if(thisBooking.dom.waterCheckbox.checked == true){
      payload.starters.push('water')
    } 

    if(thisBooking.dom.breadCheckbox.checked == true){
      payload.starters.push('bread')
    }


  
  
    //for(let prod of thisBooking.products) {
    //  payload.products.push(prod.getData());
    //  console.log(prod.getData())
    //}
  //
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
      fetch(url,options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      })
      .then(function(){
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      })
      .then(function(){
        thisBooking.updateDOM();
      }) 
    
  }
}

export default Booking;