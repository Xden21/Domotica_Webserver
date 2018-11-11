var socket = io();
    socket.on('connect', () => {
      socket.emit('start-refresh');
    })

    socket.on('inputReceive', (coilObj) => {
      receiveBoolInput(coilObj.coil, coilObj.value);
    })

    socket.on('toggleReceive', (coilObj) => {
      receiveBoolToggle(coilObj.coil, coilObj.value);
    })
    
    /*
    * Sends click event to server.
    */
    function sendClick (button) {
      socket.emit('buttonClick', button.id)
    }

    /*
    * Sends a toggle event to server.
    */
    function sendBool (toggleButton, bool) {
      socket.emit('buttonToggle', { coil: toggleButton.id, value: bool })
    }

    /*
    * Receives a value of a toggle and sets the appropriate input.
    */
    function receiveBoolToggle(coil, bool) {
      $("#"+coil).prop('checked', bool)
    }

    /*
    * Receives a value of an input and sets the appropriate input.
    */
    function receiveBoolInput(coil, bool) {
      $("#"+coil).toggleClass("on", bool)
    }