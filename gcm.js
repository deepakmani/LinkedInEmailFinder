// STEP 1
// As soon as user has logged in 
// Check if a link is established with the server
// Get the registration id for the chrome extension
// Called when user reloads the extension

// Global variable
var gcm_registrationId; //
var gcm_tweet_count; // Tweets sent during a GCM
chrome.runtime.onInstalled.addListener(function() {
  console.log("Amma Bhagavan Sharanam - On Installed");
  chrome.storage.local.get("registered", function(result) {
    // If already registered, bail out.
    if (result["registered"])
      return;

    // Up to 100 senders are allowed.
    var senderIds = ["101636386530"];
    console.log("Calling GCM Register");
    chrome.gcm.register(senderIds, registerCallback);
  });
});

function gcm_test()
{
    // Up to 100 senders are allowed.
    var senderIds = ["101636386530"];
    console.log("Calling GCM Register");
    chrome.gcm.register(senderIds, registerCallback);
}



// STEP 2
// Perform Registration Callback and send a message
// to the server
function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    console.log("Error:" + chrome.runtime.lastError.message);
    return;
  }

  console.log("Registration ID" + registrationId);
  gcm_registrationId = registrationId;


// Send the registration ID to your application server.
  sendRegistrationId(function(succeed) {
      // Once the registration ID is received by your server,
      // set the flag such that register will not be invoked
      // next time when the app starts up.

      // Callback
      if (succeed) 
      {
        console.log("Amma Bhagavan Sharanam" + succeed);
        chrome.storage.local.set({registered: true});
      }
    });
}

// Send Registration ID to Server after logging in
function sendRegistrationId(callback) {
  // Send the registration ID to your application server
  // in a secure way.
  	$.ajax({
  			type: "POST",
  			url: "http://localhost:4000/register_gcm_client?gcm_registration_id="+ gcm_registrationId,
        dataType: 'json',
  			success: function(data) {
  				console.log("Amma Bhagavan Sharanam" + "Sent registration Id Staus:" + data.name);
          callback = true;

  			},
        error: function(data)
        {
          console.log("Amma Bhagavan Sharanam -- Error" + data.name);
        }

    }); // Ajax Request
}

// STEP 3
// Receive messages
chrome.gcm.onMessage.addListener(function(message) {

	if (message.type = "tweet_header")
	{
		gcm_tweet_count = 0;
	}
	else 
	{
  		// A message is an object with a data property that
  		// consists of key-value pairs.
		var gcm_message = message;

		// For each tweet 
		// 1. Visit linkedin for the User Name
		var user_name = gcm_message.data.tweet.user_name
		var url = 'https://www.linkedin.com/vsearch/f?type=all&keywords=' + user_name 

		// Create a new tab  for content script to filter on linkedin
		chrome.tabs.create({url: url, active:false, index: index});

		// Wait for message from content script that all tweets are filtered
		// All tweets are stored into indexedDB

		setInterval(function(){

		});
		// 3. Store tweet into tweets indexeddb 
		// 4. Show notification
	 	show_tweets_noti();
	 }
});


// Name: content script listener
// Descr: Add listener to message from content script and tweet to indexed-db

/* Content Script */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
     console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension" + request.action);
    if (request.action == "Store Input Field") {
    	response = store_input_field(request.parameter, sendResponse);
    	return true;
    }
    else if(request.action == "Load Input Field") {
    	response = load_input_field(request.parameter, sendResponse);
    	return true;
    }

});


// Name: Add tweet
// Descr: Store tweet into indexeddb


// STEP 4
// Un-register GCM messages

function show_tweets_noti()
{
		var opt = {
            type: "list",
            title: gcm_message.data.tweet_count + " New Tweets for " + gcm_message.data.query,
            message: gcm_message.data.tweet_count + " New Tweets for " + gcm_message.data.query,
            iconUrl: "/images/lance_mate_new.png",
            items: [{ title: "", message:""}],
            buttons: [{
                title: "View New Tweets",
                iconUrl: "/images/lance_mate_new.png"
             }, {
                title: "Amma Bhagavan Sharanam",
                iconUrl: "/images/lance_mate_new.png"
            }]
        };
  console.log("Amma Bhagavan Sharanam");
  var noti_id = "SociaLeads Noti" + moment().unix();
  chrome.notifications.create(noti_id, opt, creationCallback);
}

function creationCallback(){

  //console.log("Amma Bhagavan Sharanam: Notification Created");
}

// Name: open_tweets_idb
// Descr: Open the db for the tweets object store and define its indices
function open_tweets_idb() {
  
          
	idbSupported  = false;
	idbReady    = false;

	  // Check if browser supports indexeddb
	if(window.indexedDB) {
		idbSupported = true;
	}

 	if(idbSupported) {
  
	    // Version can be upgraded if we want another table here
	    var openRequest = indexedDB.open("tweets", 1);
	    

	    openRequest.onupgradeneeded = function(e) {

	    	var thisDB = e.target.result;

	    	if(!thisDB.objectStoreNames.contains("tweets")) {
	     	// Create the jobs store inside the jobs database for the first time
	        	var objectStore = thisDB.createObjectStore("tweets", { keyPath: "status_id" });
	       	} // Store Name

	     	// Version 1
	      	var transaction = e.currentTarget.transaction;

	     	var objectStore = transaction.objectStore("tweets");

	      	if (!objectStore.indexNames.contains("time_window, query")) {
	        	objectStore.createIndex("time_window, query",["time_window", "query"] , {unique: false});
	       	}  
	    } // On upgrade needed
 	} // idbSupported
 } // open_tweets_db

