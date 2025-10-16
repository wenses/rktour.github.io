function handleButtonClick(buttonId) {
		//alert('clicked!');
		const recipient = "info@revealkilimanjarotour.com";
	const fname = document.getElementById("nf-field-138").value;
	const lname = document.getElementById("nf-field-148").value;
	const country = document.getElementById("nf-field-143").value;
	const phone=document.getElementById("nf-field-140").value;
	const email=document.getElementById("nf-field-139").value;
	const duration=document.getElementById("nf-field-149").value;
	const startDay=document.getElementById("nf-field-144").value;
	const endDay=document.getElementById("nf-field-275").value;
	const nums=document.getElementById("nf-field-146").value;
	const numsa=document.getElementById("nf-field-147").value;

	const age0t3 = document.getElementById("nf-field-150-0")?.checked || false;
    const age4t12 = document.getElementById("nf-field-150-1")?.checked || false;
    const age13t18 = document.getElementById("nf-field-150-2")?.checked || false;
    const ageGroups = [age0t3 ? "0-3" : "", age4t12 ? "4-12" : "", age13t18 ? "13-18" : ""].filter(Boolean).join(", ") || "None";

    const budget=document.getElementById('nf-field-156').value;
	const currency=document.getElementById('nf-field-152').value;


    const bushOnly = document.getElementById("nf-field-153-0")?.value || "Bush Only";
    const bushAndBeach = document.getElementById("nf-field-153-1")?.value || "Bush and Beach";
    const beachOnly = document.getElementById("nf-field-153-2")?.value || "Beach Only";
    const tripType = [bushOnly, bushAndBeach, beachOnly].find(type => document.getElementById(`nf-field-153-${[0, 1, 2].find(i => document.getElementById(`nf-field-153-${i}`)?.checked)}`)?.value) || "Not selected";

    const description = document.getElementById("nf-field-141")?.value || "";

    const prefEmail = document.getElementById("nf-field-196-0")?.checked || false;
    const prefWhatsapp = document.getElementById("nf-field-196-1")?.checked || false;
    const contactPrefs = [prefEmail ? "Email" : "", prefWhatsapp ? "WhatsApp" : ""].filter(Boolean).join(", ") || "None";

    const formString = `
      SUBMISSION OF QUOTE REQUEST FORM ${recipient}
      First Name: ${fname}
      Last Name: ${lname}
      Country: ${country}
      Phone: ${phone}
      Email: ${email}
      Duration: ${duration}
      Start Day: ${startDay}
      End Day: ${endDay}
      Number of Children: ${nums}
      Children Age groups: ${ageGroups}
      Number of Adults: ${numsa}
      Budget: ${budget} ${currency}
      Trip Type: ${tripType}
      Description: ${description}
      Contact Preferences: ${contactPrefs}

      
    `.trim(); // Queues alert to run after current event cycle
    //alert(formString);
    const subject=encodeURIComponent('SUBMISSION OF FORM QOUTE');
    const message=encodeURIComponent(formString);
    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${message}`;

        // Open the mailto link
        //window.location.href = mailtoLink;
        window.open(mailtoLink,'_blank');
		}