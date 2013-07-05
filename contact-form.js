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
      //var params = tmpl.find('#idstamp').value
      //var params = EJSON.stringify(formData);
      /*var entries = { 
        "Field1": "Static Test",
        "Field2": "Static Test",
        "Field3": "Static Test",
        "Field4": "Static Test",
        "Field5": "Static Test",
        "Field6": "Static Test",
        "Field103": "Static Test"
      };*/
      
      
      Meteor.call('postToWufoo', function(err, respJson) {
        if(err) {
          window.alert("Error: " + err.reason);
          console.log("error occured on receiving data on server. ", err );
          //Session.set("showBadEmail", true); // From sample project - not used yet
        } else {
          console.log("respJson: ", respJson);
          
        }
      });
      evt.preventDefault();
    }
  });

  Template.wufoo.entries = function() {
    return Session.get("entries") || [];
  }
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

    // Wufoo API Call
  Meteor.methods({
    postToWufoo: function() { //Need to figure out what 'entries' refers to
      console.log("API Call Method was made");
      var apiKey = Meteor.settings.wufooApiKey + ":anypassword@";
      var subdomain = Meteor.settings.wufooSubdomain;
      var formId = Meteor.settings.wufooFormId;
      
      var url = "https://"+ apiKey + subdomain +".wufoo.com/api/v3/forms/"+ formId +"/entries.json";
      //synchronous POST
      var result = Meteor.http.get(url, {timeout:30000});
      if(result.statusCode==200) {
        var respJson = JSON.parse(result.content);
        Session.set("entries", result);
        console.log("response received.");
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
