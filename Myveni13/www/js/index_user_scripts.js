(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
     /* button  #login */
    $(document).on("click", "#login", function(evt)
    {
         activate_page("#login_page"); 
    });
    
    /* button  #register */
    $(document).on("click", "#register", function(evt)
    {
         activate_page("#register_page"); 
    }); 
     
        /* button  #blgback */
    $(document).on("click", "#blgback", function(evt)
    {
         activate_page("#mainpage"); 
    });
    
        /* button  #vfrback */
    $(document).on("click", "#vfrback", function(evt)
    {
         activate_page("#mainpage"); 
    });
    
        /* button  #vfrnext */
    $(document).on("click", "#vfrnext", function(evt)
    {
        if (registeruser()) {
           activate_page("#login_page");
        }
        else {
           activate_page("#register_page");
        }
    });
    
        /* button  #blgnext */
    $(document).on("click", "#blgnext", function(evt)
    {
        if (loginuser()) {
           activate_page("#menu_page"); 
        }
        
    });
    
        /* button  #fetch_btn */
    $(document).on("click", "#fetch_btn", function(evt)
    {
         activate_page("#menu_page"); 
    });
    
        /* button  #show_menu_btn */
    $(document).on("click", "#show_menu_btn", function(evt)
    {
         activate_page("#menu_page"); 
    });
    
        /* button  #checkin_main_menu */
    $(document).on("click", "#checkin_main_menu", function(evt)
    {
         activate_page("#menu_page"); 
    });
    
        /* button  #dir_main_menu */
    $(document).on("click", "#dir_main_menu", function(evt)
    {
         activate_page("#menu_page"); 
    });
    
        /* button  VENI Exit */
    $(document).on("click", ".uib_w_30", function(evt)
    {
         activate_page("#mainpage"); 
    });
    
        /* button  Direction to Facility */
    $(document).on("click", ".uib_w_29", function(evt)
    {
         activate_page("#direction_page"); 
    });
    
        /* button  Check-in at Facility */
    $(document).on("click", ".uib_w_28", function(evt)
    {
         activate_page("#checkin_page"); 
    });
    
        /* button  Show Appointments */
    $(document).on("click", ".uib_w_27", function(evt)
    {
         activate_page("#show_appt"); 
    });
    
        /* button  Fetch Appointments */
    $(document).on("click", ".uib_w_26", function(evt)
    {
         activate_page("#fetch_appt_page"); 
    });
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();

function loginuser() {
    
    var vemail = document.getElementById("email").value;
    var vpassword = document.getElementById("password").value;
    var xresponse = null;
    
    // Validate username and password
    if (vemail === null || vemail === "") {
        alert("Login Email must be filled out");
        return false;
    }
    else if (vpassword === null || vpassword === "") {
        alert("Password must be filled out");
        return false;
    }
    
    var request = $.ajax({
            url: "http://54.183.5.196/veniapi/CurrentUsers",
            type: 'POST',
            data : {"EmailAddress":vemail,"Password":vpassword},
            dataType: 'json'
            });
            request.fail(function( jqXHR, textStatus ) {
              alert("Authentication failed: Invalid email and password");
            });
            request.success(function(data, textStatus, xhr){
                xresponse = xhr.getAllResponseHeaders();
                alert("Authentication successful" + xresponse);
                
                var jsonData = JSON.parse(xresponse);
                for (var i = 0; i < jsonData.counters.length; i++) {
                    var counter = jsonData.counters[i];
                    console.log(counter.counter_name);
                      alert("Json Authentication successful" + jsonData);
                }
                
            });
    
    if (xresponse !== null) {
         return true;
    }
}

function registeruser() {
    var vfname = document.getElementById("fname").value;
    var vlname = document.getElementById("lname").value;
    var vvetid = document.getElementById("vetid").value;
    var vemailid = document.getElementById("emailid").value;
    var vpswd = document.getElementById("pswd").value;
    var vcfmpswd = document.getElementById("cfmpswd").value;    
    var vfacilityid = [302, 501, 503];
    
     // Validate all fields
    if (vfname === null || vfname === "") {
        alert("First name must be filled out");
        return false;
    }
     else if (vlname === null || vlname === "") {
        alert("Last name must be filled out");
        return false;
    }
     else if (vvetid === null || vvetid === 0) {
        alert("Vet ID must be filled out");
        return false;
    }
     else if (vemailid === null || vemailid === "") {
        alert("Email must be filled out");
        return false;
    }
     else if (vpswd === null || vpswd === "") {
        alert("Password must be filled out");
        return false;
    }
     else if (vcfmpswd === null || vcfmpswd === "") {
        alert("Confirm Password must be filled out");
        return false;
    }
     else if (vpswd != vcfmpswd) {
        alert("Password mismatch ");
        return false;
    }
    
    
    var request = $.ajax({url: "http://54.183.5.196/veniapi/NewUsers",
            type: 'POST',
            data:  {"VetId": vvetid, "FirstName": vfname, "LastName": vlname,
                    "EmailAddress": vemailid, "Password": vpswd, "FacilityIds[]": [302, 501, 503] },
            dataType: 'json'
            });
            request.fail(function( jqXHR, textStatus ) {
              alert("Registration failed: Invalid Veni ID");
            });
            request.success(function(data, textStatus, xhr){
                xresponse = xhr.getAllResponseHeaders();
                alert("Registration successful" + xresponse);
            });
}