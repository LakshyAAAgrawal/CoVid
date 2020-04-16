var api;
var to_send;

function send_message_to_all(msg){
	for(var participantId in api._participants){
		if(participantId === api._myUserID){
			continue;
		}
		api.executeCommand('sendEndpointTextMessage', participantId, msg);
	}
}

function msg_recvd_eventhandler(e){
	var curmove = JSON.parse(e.data.eventData.text);
	var tmp = to_send;
	to_send = false;
	updateMovement(curmove);
	to_send = tmp;
}

function jitsi_init(){
	const domain = 'beta.meet.jit.si';
	const options = {
		roomName: 'CoVid_demo',
		width: 600,
		height: 500,
		parentNode: document.querySelector('#meet')
	};
	api = new JitsiMeetExternalAPI(domain, options);
	api.addEventListener("endpointTextMessageReceived", msg_recvd_eventhandler);
	console.log(api);
	to_send = true;
}
