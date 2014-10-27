var socket = io.connect();

  // Emit ready event.
socket.emit('prueba')
socket.emit('conectado'); //autenticar
socket.emit('datosUser'); //pedir datos de usuario

socket.on('addMessage', function(data) {
	//console.log(data);
	data.forEach(function(usuario,posicion){
		//alert('El usuario ' + usuario + 'se ha conectado');
	})
      /*message = 'Hey ' + data.name + '!\n\n' 
      message += 'Server says you feel \n'
      message += 'I know these things because sessions work!\n\n'
      message += 'Also, you joined\n'
      alert(message)*/
});

var session = $('.name-session').text();

socket.emit('message', {session:session})


socket.on('recibeDatosUser', function(dataUser){ //recibimos datos de usuario y agregamos al dom
	console.log(dataUser);
	//alert(dataUser.usu_nombre);
	for(var i = 0; i < dataUser.length; i++) {
		//console.log(dataUser[i]['usu_nombre']);
		$('h4.m-o').text(dataUser[i]['usu_nombre']);
		//alert(dataUser[i]['usu_email']);
		$('input#mail_usu').attr('value',dataUser[i]['usu_email']);
		//$('#mail_usu').attr('value',dataUser[i]['usu_email']);
	}

	socket.emit('listUsers', {username:session}); //pedir usuarios conectados
});

socket.on('addListUsers', function(data){
	$('.fa-circle-o').text(data.length);
	$('.fa-circle-o').addClass('no-after');
	//console.log(data);
	var htmlUsers = '';
	for (var i = 0; i < data.length; i++){
		if(data[i]['usu_email'] != $('input#mail_usu').val()){
			htmlUsers += '<div class="media">' +
									'<img class="pull-left" src="img/profile-pics/2.jpg" />' +
									'<div class="media-body">'+
										'<span class="t-overflow p-t-5">' + data[i]['usu_nombre'] + '</span>' +
									'</div>' +
								'</div>';
		}					
		
	}

	$('.listview.narrow').html(htmlUsers);
	//console.log('fin del Array');
})