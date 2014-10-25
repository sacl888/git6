/*io = io.connect();

io.emit('ready') 

// Listen for the talk event.
io.on('talk', function(data) {
    alert(data.message)
}) 

io.on('recibirUser', function(data){
	console.log(data);
})*/

$(document).ready(function(){
	$.validator.messages.required='Este campo es requerido';
	$.validator.messages.email='Escribe un correo válido';
	$('#box-login').validate({
		rules:{
			user:{
				email: true
			}
		},				
		submitHandler: function(form){			
			var datos = $(form).serialize();
			$.ajax({
				url: "./autenticar",
				type: "POST",
				data:datos,
				cache:false,
				timeout: 5000,
				success: function(data){	
					if(data == ''){
						//console.log(data);
						//io.emit('welcome');
						window.location='/privada';						
					}else{
						console.log(data);
					}
				}
			})
		}
	});
});	