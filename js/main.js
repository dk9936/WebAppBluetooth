let rxCharacteristic;
let txCharacteristic;
let server;
let connectedDevice;
let type;

document.addEventListener('DOMContentLoaded', () => {
    async function startScanning() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }] // NUS Service UUID
            });

            
            console.log('Discovered devices:', device); 

            server = await device.gatt.connect();
            const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e'); // NUS Service UUID

            rxCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e'); // RX Characteristic UUID
            txCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e'); // TX Characteristic UUID

            console.log('Connected to device:', device.name);
            enableNotifications();
        } catch (error) {
            console.error('Error during scanning:', error);
        }
    }

   

    async function enableNotifications() {
        try {
            await rxCharacteristic.startNotifications();
            rxCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);

            console.log('Notifications enabled for RX characteristic');
        } catch (error) {
            console.error('Error enabling notifications:', error);
        }
    }

    async function getSerialNumber(){
        try{
           const result =  writeHexToCharacteristic("56520241412C56")
           
        }catch(error){
            console.error('Error getting Serial Number :', error);
        }
    }


   

    async function handleNotifications(event) {
        const receivedDataUint8 = event.target.value;
        const dataView = new DataView(receivedDataUint8.buffer);

        console.log('Received data (notification):', dataView);

        // Get the ArrayBufferData as a hex string
        const hexString = Array.from(new Uint8Array(dataView.buffer), byte => byte.toString(16).padStart(2, '0')).join('');

        // Append the new hex data to the existing content
        const currentContent = document.getElementById('receivedData').value;
        const updatedContent = currentContent + hexString;

        document.getElementById('receivedData').value = updatedContent;

    
    }

    async function relayConnect(){
        try{
            writeHexToCharacteristic("56570552454C3131F75603")
        }catch(error){

        }
    }

    async function relayDisconnect(){
        try{
            writeHexToCharacteristic("56570552454C3132F85603")
        }catch(error){

        }
    }
    
    async function writeHexToCharacteristic(command) {
        document.getElementById('receivedData').value = "";
        try {
            console.log("command", command)
            //const hexInput = document.getElementById('writeInput').value;
            if (!command) {
                console.error('Please enter a hex value.');
                return;
            }

            const dataToWrite = new Uint8Array(command.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            
            await txCharacteristic.writeValue(dataToWrite);

            console.log('Hex data written to TX characteristic:', command);
        } catch (error) {
            console.error('Error writing hex to characteristic:', error);
            
        }
    }

    

    function disconnect() {
        if (server && server.connected) {
            server.disconnect();
            console.log('Disconnected from the device');
        } else {
            console.warn('Not connected to any device.');
        }
    }

    function resetMeter(){
        try{
            writeHexToCharacteristic("56570552454C3132F85603")
        }catch(error){

        }
    }

    window.meterRestart = resetMeter;
    window.startScanning = startScanning;
    window.getSerialNumber = getSerialNumber;
    window.relayDisconnect = relayDisconnect;
    window.relayConnect = relayConnect;
    window.disconnect = disconnect;
});
