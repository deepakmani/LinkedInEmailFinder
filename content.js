$(document).ready(function() {
	// Check if URL is a LinkedIn Search
	if( window.location.href.match(/https:\/\/www.linkedin.com\/vsearch\//) != null)
	{
			// 1. Add the Name Domain and Find Email Button to the DOM
			var li_elements = $('li.result.people');
			$.each(li_elements, function(i, val) {
				// Append the 
				var li_element = $(this);
				var name = $($('li.result.people .bd h3 a')[i]).text();
				li_element.append('<br/> Name: <input type=text id= id=\"find_email_name_' + i + '\" value=\"' + name + '\"style=\'width:100px\'></input> ');
				li_element.append('Domain: <input type=text id=\"find_email_domain_' + i + '\"style=\'width:100px\'></input> ');

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
					             		     	var domain 	= website.replace("http://", ""); 
					             		     		domain 	= domain.replace("www.", "");
					             		     	// Show the domain
					              		    	$('#find_email_domain_' + i).val(domain);
					           					li_element.append("<span style=\"margin-left:10px\" class=\"btn btn-primary find_email_btn\" id=\"find_email_btn_" + i + "\" > Find Email </span>")				           				
					           				

					           				}, 
					           				error: function(data) {
					           					$('#find_email_domain_' + i).val("No Domain Found");
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
			console.log("Nemam Amma Bhagavan Sharanam -- On Gmail");
			var rapportive_user_lookup = result["rapportive_user_lookup"];
	
			if (rapportive_user_lookup.status == false)
			{

				// Set the status of lookup to true

				// var email_permutations_arr = create_email_permutations(rapportive_user_lookup.name, rapportive_user_lookup.domain);
				var email_permutations_arr = ["vivek.mani@oracle.com", "tushar.makhija@helpshift.com", "joe.marini@google.com"];

				// Open Compose window
				document.location.href = "#compose";


				// Wait 10 seconds for the textarea to be available
				setTimeout(function(){
			 		
					var textarea = document.getElementsByTagName('textarea');

					// for_each permutation or until a match is found using closure
					asyncLoop(email_permutations_arr.length, function(loop) 
					{
							// Set the value from email_permutations_array
				 			textarea[0].value = email_permutations_arr[loop.iteration()];
				 			
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
				 					console.log("Nemam Amma Bhagavan -- User Has a Linkedin ID:" + linkedin_id);
				 				}
				 				else 
				 				{
				 					console.log("Nemam Amma Bhagavan Sharanam -- User does not have a Linkedin ID:");	
				 					linkedin_id = "none";
				 				}

				 				// Check if linkedin id matches with rapportive_user_lookup.linkedin_id
				 				// If match create notification and alert

				 				// Clear the entered address 
								textarea.value = "";

								// increment the loop
								loop.next();

 				 			}, 10 * 1000);	// Set time out for rapportive to display user data

			 		}); // For each email permutation

 				}, 10 * 1000);  // Set Timeout for waiting for the text field to be ready

			} // If perform_rapportive_lookup is false
			
		}); // get the stored information to perform lookup

	} // If we are on gmail




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
											"name": 		$('#find_email_name_' + index).text(),
											"domain": 		$('#find_email_domain_' + index).text(),
											"status": 		false,
											"linkedin_id": 	"",
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

}); // Document.ready
 

// Name: create_email_permutations
// Descr: Return an array with all the permutations for email id

function create_email_permutations()
{
	var first_name = "";
	var last_name  = " ";
	var middle_initial = "";

	email_permutations_array.push(first_name + "." + last_name + "@" + domain);

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
                callback();
            }
        },

        iteration: function() {
            return index - 1;
        },

        break: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}

// Name: Find Email 
// Descr: Delegated event handler to take the parameters for corresponding user
//        Call the rapportive api or run gmail
$('body').on("click", ".find_email_btn", function() {
	//store_permutations();
	console.log("Nemam Amma Bhagavan Sharanam");

	// Create a new tab to run gmail
	gmail_url = "https://mail.google.com";
	console.log("Nemam Amma Bhagavan Sharanam gmail url" + gmail_url);
	// Ask background.js to open gmail  

});

// Name: store
