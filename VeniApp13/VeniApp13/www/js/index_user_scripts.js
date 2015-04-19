(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
     /* button  #btn_vfr_back */
    $(document).on("click", "#btn_vfr_back", function(evt)
    {
         activate_page("#mainpage"); 
    });
    
        /* button  #btn_login_back */
    $(document).on("click", "#btn_login_back", function(evt)
    {
         activate_page("#mainpage"); 
    });
    
        /* button  #btn_vfr_next */
    $(document).on("click", "#btn_vfr_next", function(evt)
    {
         activate_page("#login_page"); 
    });
    
        /* button  #btn_login */
    $(document).on("click", "#btn_login", function(evt)
    {
         activate_page("#login_page"); 
    });
    
        /* button  #btn_register */
    $(document).on("click", "#btn_register", function(evt)
    {
         activate_page("#register_page"); 
    });
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
