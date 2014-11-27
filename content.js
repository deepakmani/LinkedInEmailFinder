$(document).ready(function() {
	// Check if URL is a LinkedIn Search
	if( window.location.href.match(/https:\/\/www.linkedin.com\/vsearch\//) != null)
	{
			// 1. Add the Name Domain and Find Email Button to the DOM
			var li_elements = $('li.result.people');
			$.each(li_elements, function(i, val) {
				// Append the 
				var li_element 		= $(this);
				var name 			= $($('li.result.people .bd h3 a')[i]).text();
				var linkedin_id 	= $($('li.result.people .bd h3 a')[i]).attr('href').match(/id=(\w+)/);
					linkedin_id 	= (linkedin_id != null) ? linkedin_id[1] : "";

				li_element.append('<input style=\"display:none\" value=\"' + linkedin_id + '\" type=text id=\"find_email_linkedin_id_' + i + '\"style=\'width:100px\'></input> ');	
				li_element.append('<br/> <label style=\"display:inline-block; margin-left:70px\"> Name: <br/> <input type=text id=\"find_email_name_' + i + '\" value=\"' + name + '\"style=\'width:150px\'></input> </label>');
				li_element.append('<label style=\"display:inline-block; margin-left: 20px\"> Domain: <br/> <input type=text id=\"find_email_domain_' + i + '\"style=\'width:100px\'></input> </label>');
				li_element.append('<label id=\"domain_lookup_msg_' + i + '\" style=\"display:inline-block; margin-left: 80px\"> Looking Up Domain... </label>');

				// Show spinning wheel

				var profile_url = $($('li.result.people .bd h3 a')[i]).attr('href');
				$.ajax({ 
						url: profile_url,
						success: function(data) {
									var company_url = $(data).find('.miniprofile-container a')[0];
										company_url = (company_url == undefined) ? "No URL" : company_url.getAttribute('href');
									$.ajax({
											 url: company_url, 
					         				 success: function(data) {
					             		     	var out 	= $(data); 
					             		     	// Store website url
					             		     	var website = $(out).find('.website p').text();
					             		     	// Trim the url to get domain
					             		     	var domain 	= website.replace("http://", ""); // Trim http://
					             		     		console.log("Nemam Amma Bhagavan Sharanam Domain:" + domain);
					             		     		domain 	= domain.replace("https://", ""); // Trim https://
					             		     		domain 	= domain.replace("www.", ""); // Trim www
					             		     		domain 	= domain.replace("/", ""); // Trim slash at the end

					             		     		console.log("Nemam Amma Bhagavan Sharanam Domain:" + domain);

					             		     	// Show the domain
					              		    	$('#find_email_domain_' + i).val(domain);
					              		    	$('#domain_lookup_msg_' + i).hide();
					           					li_element.append("<label style=\"display:inline-block;\"> <br/> <span style=\"margin-left:120px; padding:5px\" class=\"btn btn-primary find_email_btn\" id=\"find_email_btn_" + i + "\" > Find Email </span> </label>")				           				
					           					

					           				}, 
					           				error: function(data) {
					           					$('#find_email_domain_' + i).val("No Domain Found");
					           					$('#domain_lookup_msg_' + i).hide();
					           					li_element.append("<label style=\"display:inline-block;\"> <br/> <span style=\"margin-left:120px; padding:5px\" class=\"btn btn-primary find_email_btn\" id=\"find_email_btn_" + i + "\" > Find Email </span> </label>")				           				

					           				}
        							});
						}
				
				}); // Ajax request
			}); // Element.each
 
			// 2. Add event handeler for find email button
	} // If we are on linkedin.com/search

	else if(window.location.href.match(/https:\/\/mail.google.com\//) != null)
	{
		chrome.storage.local.get("rapportive_user_lookup", function(result) {
 			var rapportive_user_lookup = result["rapportive_user_lookup"];
			if (rapportive_user_lookup.status == false)
			{

				console.log("Nemam Amma Bhagavan Sharanam -- On Gmail");

				// Set the status of lookup to true
				var obj 	= {};
				rapportive_user_lookup.status = true;
				obj["rapportive_user_lookup"] = rapportive_user_lookup;


				chrome.storage.local.set(obj, function() {

					if (chrome.extension.lastError) {
						console.log("Error occurred: " + chrome.extension.lastError.message);
					}
					else 
					{
						var email_permutations_arr = create_email_permutations(rapportive_user_lookup);
 
						// Open Compose window
						console.log("Nemam Amma Bhagavan Sharanam -- Opening Compose window");
						document.location.href = "#compose";


						// Wait 10 seconds for the textarea to be available
						setTimeout(function(){
					 		
					 		// Get element 
							var textarea = document.getElementsByTagName('textarea');

							// for_each permutation or until a match is found using closure
							asyncLoop(email_permutations_arr.length, function(loop) 
							{
									// Set the value from email_permutations_array
									var email 			= email_permutations_arr[loop.iteration()]
						 			textarea[0].value 	= email;
						 			
								 	// Click the text area to get rapportive to lookup
						 			var event = new MouseEvent('click', {
												    'view': window,
												    'bubbles': true,
												    'cancelable': true
												});	

				 					textarea[0].dispatchEvent(event);

				 					// Wait for rapportive to provide data
						 			setTimeout(function () {

						 				var linkedin_id = document.getElementsByClassName('link-linkedin');

						 				if (linkedin_id.length != 0)
						 				{
						 					linkedin_id = linkedin_id[0].childNodes[0].getAttribute('href');
						 					linkedin_id = linkedin_id.match(/id=(\w+)/)[1];
						 					console.log("Nemam Amma Bhagavan -- User Has a Linkedin ID:" + linkedin_id);
						 				}
						 				else 
						 				{
						 					console.log("Nemam Amma Bhagavan Sharanam -- User does not have a Linkedin ID:");	
						 					linkedin_id = "none";
						 				}

						 				// Check if linkedin id matches with rapportive_user_lookup.linkedin_id
						 				// If match send message to background script to create a notification
						 				console.log("Nemam Amma Bhagavan Sharanam -- Saved Id" + rapportive_user_lookup.linkedin_id + "Lookedup Id:" + linkedin_id)
						 				if (linkedin_id == rapportive_user_lookup.linkedin_id)
						 				{
						 					// Send message to background.js to show a notification
						 					var user_summary = { 
						 										name: 			rapportive_user_lookup.name,
						 										domain: 		rapportive_user_lookup.domain,
						 										email: 			email,
						 										linkedin_url: 	"http://www.linkedin.com/profile/view?id=" + linkedin_id 
						 									  }

						 					chrome.runtime.sendMessage({action: "Show Email Notification", parameter: user_summary}, function(response) {
  												console.log(response.value);
  												//console.log("Amma Bhagavan Sharanam Added to IDB?" + response.status + " is the status");
											});

						 					// Break out of loop
						 					loop.break();
						 				}
						 				// Clear the entered address 
										textarea.value = "";

										// increment the loop
										loop.next();

		 				 			}, 10 * 1000);	// Set time out for rapportive to display user data

					 		}); // For each email permutation

		 				}, 10 * 1000);  // Set Timeout for waiting for the text field to be ready
					} // if status is stored
				}); // Store status of lookup

			} // If we need to perform a rapportive lookup
			
		}); // get the stored information to perform lookup

	} // If we are on gmail

}); // Document.ready
 

// Name: create_email_permutations
// Descr: Return an array with all the permutations for email id

function create_email_permutations(rapportive_user_lookup)
{
	var names 			= rapportive_user_lookup.name.toLowerCase().split(/\s+/);
	console.log("Nemam Amma Bhagavan Sharanam -- Name:" + rapportive_user_lookup.name);
	console.log("Nemam Amma Bhagavan Sharanam -- Name:" + rapportive_user_lookup.domain);
	var first_name 		= names[0];
	var	last_name 		= (names.length > 1) ? names[names.length - 1] : "";
	var first_initial 	= first_name[0];
	var last_initial	= last_name[0];
	var domain 			= rapportive_user_lookup.domain;
	var middle_initial = "";
	var email_permutations_array = new Array();

	email_permutations_array.push(first_name + "@" + domain);
	email_permutations_array.push(last_name + "@" + domain);
	email_permutations_array.push(first_name + "." + last_name + "@" + domain);
	email_permutations_array.push(first_name + last_name + "@" + domain);
	email_permutations_array.push(first_initial + last_name + "@" + domain);
	email_permutations_array.push(first_initial + "." + last_name + "@" + domain);	
	email_permutations_array.push(first_name + "." + last_initial + "@" + domain);	
	email_permutations_array.push(first_name + last_initial + "@" + domain);
	email_permutations_array.push(first_initial + last_initial + "@" + domain);
	email_permutations_array.push(first_initial + "." + last_initial + "@" + domain);
	email_permutations_array.push(last_name + first_name + "@" + domain);
	email_permutations_array.push(last_name + "." + first_name + "@" + domain);
	email_permutations_array.push(last_name + "." + first_initial + "@" + domain);
	email_permutations_array.push(last_name + first_initial + "@" + domain);
	email_permutations_array.push(last_initial + first_name + "@" + domain);
	email_permutations_array.push(last_initial + "." + first_name + "@" + domain);

	return email_permutations_array; 
}

// Name: asyncLoop 
// Descr: Needed for executing each permutation in the email array
//        after rapportive returns

function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function() {
            if (done) {
                return;
            }
            if (index < iterations) {
                index++;
                func(loop);

            } else {
                done = true;
               // callback();
            }
        },

        iteration: function() {
            return index - 1;
        },

        break: function() {
            done = true;
            //callback();
        }
    };
    loop.next();
    return loop;
}

// Name: function to call after finishing all permutations
function callback() {
	console.log("Nemam Amma Bhagavan Sharanam -- Finished checking email ids");
}
// Name: Click Event Handler for find_email_btn
	// Descr: Launch Gmail and set the parameters for the user to lookup email
	$('body').on("click", ".find_email_btn", function() {
		//store_permutations();
		console.log("Nemam Amma Bhagavan Sharanam");

		// Create a new tab to run gmail
		gmail_url 	= "https://mail.google.com";

		// Store the name, domain and rapportive_lookup status in chrome storage 
		var index 	= $(this).attr('id').match(/find_email_btn_(\d+)/)[1];

		var obj 	= {};

		obj["rapportive_user_lookup"] = { 
											name: 			$('#find_email_name_' + index).val(),
											domain: 		$('#find_email_domain_' + index).val(),
											status: 		false,
											linkedin_id: 	$('#find_email_linkedin_id_' + index).val()
										};

		chrome.storage.local.set(obj, function() {

			if (chrome.extension.lastError) {
				console.log("Error occurred: " + chrome.extension.lastError.message);
			}
			else {
				window.open(gmail_url);
				console.log("Nemam Amma Bhagavan Sharanam gmail url" + gmail_url);
			} // Else if stored
			// Ask background.js to open gmail  
		});
	}); 

// Name: store
