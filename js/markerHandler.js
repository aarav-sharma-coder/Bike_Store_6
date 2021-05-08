var uid = null;

AFRAME.registerComponent("marker-handler",{
    init:async function(){
        if(uid === null){
            this.askUid();
        }
        var bikes = await this.getBikes()
        this.el.addEventListener("markerFound",()=>{
            if(uid !== null){
            var markerId = this.el.id;
            this.handleMarkerFound(bikes ,markerId);
            }
        });
    
        this.el.addEventListener("markerLost",()=>{
            console.log("Marker Lost");
            this.handleMarkerLost();
        });
    },
    
    askUid: function(){
        var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
        swal({
            title: "Welcome!",
            icon: iconUrl,
            content: {
              element: 'input',
              attrributes:{
                placeHolder: "Type your table number",
                type: "number",
                min: 1
              }
            },
            closeOnClickOutside: false,
          }).then(inputValue=>{
            uid = inputValue;
          })
    },
    getOrderSummary: async function (tNumber) {
      return await firebase
        .firestore()
        .collection("uids")
        .doc(uid)
        .get()
        .then(doc => doc.data());
    },
    handleMarkerLost: function(){
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "none";
    },
    handleMarkerFound: function(bikes, markerId){

        var todaysDate = new Date();
        var todaysDay = todaysDate.getDay();
        
        var days=[
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday"
        ]

        var bike = bikes.filter(bike=> bike.id===markerId)[0]
        var model = document.querySelector(`#model-${dish.id}`);
        model.setAttribute("visible", true);

        var ingredientsContainer = document.querySelector(`#main-plane-${bike.id}`);
        ingredientsContainer.setAttribute("visible", true);

        var priceplane = document.querySelector(`#price-plane-${bike.id}`);
        priceplane.setAttribute("visible", true)

        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "flex";
        if(dish.unavailable_days.include(days[todaysDay])){
            swal({
              icon: "warning",
              title: dish.dish_name.toUpperCase(),
              text: "This dish is not available today",
              timer: 2500,
              buttons: false
            });
          }else{
            var model = document.querySelector(`#model-${dish.id}`);
            model.setAttribute("position", bike.model_geometry.position);
            model.setAttribute("rotation", bike.model_geometry.rotation);
            model.setAttribute("scale", bike.model_geometry.scale);
          }
        var on = document.getElementById("onb");
        var os = document.getElementById("osb");
        var rb = document.getElementById("rb");
        var payButton = document.getElementById("pay-button");
        var ratingButton = document.getElementById("rating-button");
        on.addEventListener("click",()=>{
            var ui;
            uid<=9 ? (ui = `U0${uid}`) : ui=`U${uid}`
            this.handleOrder(ui,bike)
            swal({
                icon: "https://i.imgur.com/4NZ6uLY.jpg",
                title: "Bike ordered",
                text: "Your bike will be delivered in 2 weeks.",
                timer: 2000,
                buttons:false
            })
        });
        ratingButton.addEventListener("click", () => this.handleRatings(bike));
        payButton.addEventListener("click", () => this.handlePayment());
        os.addEventListener("click",()=> {this.handleOrderSummary()})
        if(uid !== null){
            rb.addEventListener("click",()=>{
            swal({
                icon: "warning",
                title: "Order Summary",
                text: "Work in progress"
            })
        })
}
    
    },
    handleOrder: function(ui,bike){
        firebase.firestore().collection('bikes').doc(ui).get().then(doc=>{
            var details = doc.data();
      
            if(details["current_orders"][bike.id]){
              details["current_orders"][bike.id]['quantity']+=1;
      
              var currentQuantity = details["current_orders"][bike.id]["quantity"]
              details["current_orders"][bike.id]["subTotal"]=currentQuantity*bike.price
      
            }else {
                details["current_orders"][bike.id] = {
                  item: bike.bike_name,
                  price: bike.price,
                  quantity: 1,
                  subtotal: bike.price * 1
                };
              }
      
              details.total_bill += bike.price;
      
              //Updating db
              firebase
                .firestore()
                .collection("tables")
                .doc(doc.id)
                .update(details);
            });
    },
    getBikes: async function(){
        return await firebase.
                     firestore()
                     .collection('bikes')
                     .get()
                     .then(snap=>{
                         return snap.docs.map(doc=>doc.data());
                     })
    },
    handlePayment: function () {
      // Close Modal
      document.getElementById("modal-div").style.display = "none";
  
      // Getting Table Number
      var ui;
      uid <= 9 ? (ui = `T0${uid}`) : `T${uid}`;
  
      //Reseting current orders and total bill
      firebase
        .firestore()
        .collection("uids")
        .doc(uid)
        .update({
          current_orders: {},
          total_bill: 0
        })
        .then(() => {
          swal({
            icon: "success",
            title: "Thanks For Paying !",
            text: "We Hope You Enjoyed Your Food !!",
            timer: 2500,
            buttons: false
          });
        });
    },
    handleOrderSummary: async function () {   

      //Getting Table Number
      var ui;
      uid <= 9 ? (ui = `T0${uid}`) : `T${uid}`;
  
      //Getting Order Summary from database
      var orderSummary = await this.getOrderSummary(tNumber);
  
      //Changing modal div visibility
      var modalDiv = document.getElementById("modal-div");
      modalDiv.style.display = "flex";
  
      //Get the table element
      var tableBodyTag = document.getElementById("bill-table-body");
  
      //Removing old tr(table row) data
      tableBodyTag.innerHTML = "";
  
      //Get the cuurent_orders key 
      var currentOrders = Object.keys(orderSummary.current_orders);
  
      currentOrders.map(i => {
  
        //Create table row
        var tr = document.createElement("tr");
  
        //Create table cells/columns for ITEM NAME, PRICE, QUANTITY & TOTAL PRICE
        var item = document.createElement("td");
        var price = document.createElement("td");
        var quantity = document.createElement("td");
        var subtotal = document.createElement("td");
  
        //Add HTML content 
        item.innerHTML = orderSummary.current_orders[i].item;
  
        price.innerHTML = "$" + orderSummary.current_orders[i].price;
        price.setAttribute("class", "text-center");
  
        quantity.innerHTML = orderSummary.current_orders[i].quantity;
        quantity.setAttribute("class", "text-center");
  
        subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
        subtotal.setAttribute("class", "text-center");
  
        //Append cells to the row
        tr.appendChild(item);
        tr.appendChild(price);
        tr.appendChild(quantity);
        tr.appendChild(subtotal);
  
        //Append row to the table
        tableBodyTag.appendChild(tr);
      });
  
      //Create a table row to Total bill
      var totalTr = document.createElement("tr");
  
      //Create a empty cell (for not data)
      var td1 = document.createElement("td");
      td1.setAttribute("class", "no-line");
  
      //Create a empty cell (for not data)
      var td2 = document.createElement("td");
      td1.setAttribute("class", "no-line");
  
      //Create a cell for TOTAL
      var td3 = document.createElement("td");
      td1.setAttribute("class", "no-line text-center");
  
      //Create <strong> element to emphasize the text
      var strongTag = document.createElement("strong");
      strongTag.innerHTML = "Total";
  
      td3.appendChild(strongTag);
  
      //Create cell to show total bill amount
      var td4 = document.createElement("td");
      td1.setAttribute("class", "no-line text-right");
      td4.innerHTML = "$" + orderSummary.total_bill;
  
      //Append cells to the row
      totalTr.appendChild(td1);
      totalTr.appendChild(td2);
      totalTr.appendChild(td3);
      totalTr.appendChild(td4);
  
      //Append the row to the table
      tableBodyTag.appendChild(totalTr);
    },
    handleRatings: async function (bike) {
      var ui;
      uid <= 9 ? (ui = `U0${uid}`) : `U${uid}`;
   
      var orderSummary = await this.getOrderSummary(tNumber);
      var currentOrders = Object.keys(orderSummary.current_orders);
      if(currentOrders.length>0 && currentOrders == bike.id){
       document.getElementById("rating-modal-div").style.display = "flex"
       document.getElementById("rating-input").value = "0";
       document.getElementById("feedback-input").value = "";
   
      var btn = document.getElementById("save-rating-button");
     
      btn.addEventListener("click",()=>{
       document.getElementById("rating-modal-div").style.display = "none"
       var rating =  document.getElementById("rating-input").value;
       var feedback = document.getElementById("feedback-input").value
       firebase.firestore().collection("bikes").doc(bike.id).update({last_review: feedback,last_rating:rating}).then(()=>{
         swal({
           icon: "success",
           title: "Rating done",
           text: "Thank you for rating us",
           timer:2500,
           buttons: false
         });
       });
      });
      }
      else{
        swal({
          icon:"warning",
          title: "Oops!",
          text: "No bike found to give ratings!",
          timer: 2500,
          buttons: false
        });
      }
     },
})