/**
 * tests go here; this will not be compiled when this package is used as an extension.
 */
let quat: number[] = []
input.onButtonPressed(Button.A, function () {
    quat = [
        0,
        -1,
        2,
        -3
    ]
    accelmagiq.sendData(quat)
})
input.onButtonPressed(Button.AB, function () {
    radio.sendBuffer(Buffer.create(4))
})
input.onButtonPressed(Button.B, function () {
    quat = [
        -0.12345,
        1.123345,
        -2.12345,
        3.12345
    ]
    accelmagiq.sendData(quat)
})
accelmagiq.onRadioReceivedData(function (q) {
    serial.writeNumbers(q)
})
accelmagiq.onRadioReceivedBuffer(function (receivedBuffer) {
    serial.writeLine("not data")
})
