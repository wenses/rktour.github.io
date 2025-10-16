function submit_form(){

	const recipient = "info@revealkilimanjarotour.com";
	const fname = document.getElementById("nf-field-138").value;
	const lname = document.getElementById("nf-field-148").value;
	const country = document.getElementById("nf-field-143").value;
	const phone=document.getElementById("nf-field-140").value;
	const email=document.getElementById("nf-field-139").value;
	const duration=document.getElementById("nf-field-149").value;
	const startday=document.getElementById("nf-field-144").value;
	const endday=document.getElementById("nf-field-275").value;
	const nums=document.getElementById("nf-field-146").value;

	const age0t3=document.getElementById('nf-field-150-0').checked;
	const age4t12=document.getElementById('nf-field-150-1').checked;
	const age13t18=document.getElementById('nf-field-150-2').checked;

	const budget=document.getElementById('nf-field-156').value;
	const currency=document.getElementById('nf-field-152').value;

	const bushonly=document.getElementById('nf-field-153-0').value;
	const bushandbeach=document.getElementById('nf-field-153-1').value;
	const beachonly=document.getElementById('nf-field-153-2').value;

	const description=document.getElementById('nf-field-141').value;

	const email=document.getElementById('nf-field-196-0').checked;
	const whatsapp=document.getElementById('nf-field-196-1').checked;

	alert("This is the form to be submitted via email \nFirst Name:"+fname+"\nLast Name:"+lname+"\nCountry"+country)


	}
