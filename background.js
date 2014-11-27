console.log("Nemam Amma Bhagavan Sharanam");

// Name:  Handler for message from content script
// Descr: Call the notifier method
var user_summary;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  /*console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension" + request.action);
*/    if (request.action == "Show Email Notification") {
    	 console.log("Nemam Amma Bhagavan Sharanam -- Receiving message from Content script");
    	response = show_notifier(request.parameter, sendResponse);
    	return true;
    }
    
    console.log("Nemam Amma Bhagavan Sharanam -- Calling Message Listener" + request.action);
 });


// Name: show_notifier
// Descr: Show notification with found email id
function show_notifier(user_summary, sendResponse)
{


	console.log("Nemam Amma Bhagavan Sharanam -- Calling show_notifier" + user_summary.name + " "  + user_summary.email);
	var opt = {
        type: "list",
        title: "Email Found For " + user_summary.name,
        message: "Email: " +  user_summary.email,
        iconUrl: "/images/email_check.png",
        items: [{ title: "Email: " +  user_summary.email, message:""}],
        buttons: [{
            		title: user_summary.linkedin_url,
            		iconUrl: "/images/email_check.png"
            	}]
    };

    // Call the notifier
    var noti_id = "Linkedin Email Finder";
	chrome.notifications.create(noti_id, opt, creationCallback);

	// Response to the content script
    sendResponse({value:"Showing Desktop Notification"});
    

}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === "Linkedin Email Finder") {
        if (btnIdx === 0) {
            window.open("https://www.linkedin.com/vsearch/id=" + user_summary.linkedin_id);
        } else if (btnIdx === 1) {
            saySorry();
        }
    }
});

function creationCallback()
{

  //console.log("Amma Bhagavan Sharanam: Notification Created");
}