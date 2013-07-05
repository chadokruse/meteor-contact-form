if (Meteor.isClient) {

  // Routes

  Meteor.Router.add({
    '/': 'home',
    '/about': 'about',
    '/contact': 'contact',
  });

  Template.home.greeting = function () {
    return "Welcome to contact-form.";
  };

 

  Template.wufoo.events({
    'click #saveForm' : function (evt, tmpl){
      console.log("Form Input Button Clicked");
      // Need to make pretty for Wufoo: Match fields then structure as JSON
      // TODO: DRY it up
      var Field1 = $('#Field1').val();
      var Field2 = $('#Field2').val();
      var Field3 = $("#Field3:checked").val();
      var Field4 = $("#Field4:checked").val();
      var Field5 = $("#Field5:checked").val();
      var Field6 = $("#Field6:checked").val();
      var Field103 = $('#Field103').val();
      var params = { 
        "Field1": Field1,
        "Field2": Field2,
        "Field3": Field3,
        "Field4": Field4,
        "Field5": Field5,
        "Field6": Field6,
        "Field103": Field103
      };
      
      
      Meteor.call('postToWufoo', params, function(err, respJson) {
        if(err) {
          window.alert("Error: " + err.reason);
          console.log("error occured on receiving data on server. ", err );
          //Session.set("showBadEmail", true); // From sample project - not used yet
        } else {
          console.log("respJson: ", respJson);
        }
      });
    }
  });

  Template.wufoo.params = function() {
    return Session.get("params") || [];
  }
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

    // Wufoo API Call
  Meteor.methods({
    postToWufoo: function(params) {
      console.log("API Call Method was made");
      var subdomain = Meteor.settings.wufooSubdomain;
      var formId = Meteor.settings.wufooFormId;
      var url = "https://"+ subdomain +".wufoo.com/api/v3/forms/"+ formId +"/entries.json";
      //synchronous POST
      console.log(url);
      var result = Meteor.http.post(url, 
                                    {auth: Meteor.settings.wufooApiKey +":footastic", 
                                    params: params, 
                                    timeout:30000
                                  });
      console.log("result");
      if(result.statusCode==200) {
        var respJson = JSON.parse(result.content);
        console.log("response received.");
        console.log(respJson)
        return respJson;
      } else {
        // TODO: Add better error handling
        //if(result.statusCode==502) {
        //  some stuff;
        //} else {
        //  some stuff;
        //}
        console.log("Response issue: ", result.statusCode);
        var errorJson = JSON.parse(result.content);
        throw new Meteor.Error(result.statusCode, errorJson.error);
      }
    }
  });
}
