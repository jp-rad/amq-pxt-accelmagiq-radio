/**
 * A Simplified Analytic Attitude Determination Algorithm
 * using Accelerometer and Magnetometer on micro:bit.
 * 
 * It's like magic! This algorithm turns raw data into accurate and efficient quaternion estimations,
 * transforming your projects and making you go, "Wow!" Using the handy micro:bit, it feels like trying
 * out quaternions is pure magic. AccelMagiQ brings a touch of enchantment to the technical world.
 * We hope this helps you in your learning journey and sparks your curiosity about the fascinating
 * world of quaternions.
 * 
 * "AccelMagiQ" refers to this amazing algorithm that combines accelerometer and magnetometer data to
 * create precise quaternion calculations. It's a playful blend of 'acceleration', 'magnetometer', and 'magic' with
 * quaternions ('Q'), making advanced concepts seem like magic!
 */
//% block="AccelMagiQ"
//% weight=95 color=#4b0082 icon="\uf1d8"
//% groups="['Quaternion', 'EulerAngles', 'Sensor', 'Service', 'Radio']"
namespace accelmagiq {

    let initialized = false;
    let onRadioReceivedDataHandler: (q: number[]) => void | undefined = undefined;
    let onRadioReceivedBufferHandler: (receivedBuffer: Buffer) => void;

    function init() {
        if (initialized) return;
        initialized = true;
        radio.onReceivedBuffer(onReceivedBuffer);
    }

    function onReceivedBuffer(receivedBuffer: Buffer): void {
        if (onRadioReceivedDataHandler) {
            const q = bufferAsQuatArray(receivedBuffer);
            if (4 == q.length) {
                onRadioReceivedDataHandler(q);
                return;
            }
        }
        onRadioReceivedBufferHandler(receivedBuffer);
    }

    /**
     * Prepares and sends quaternion data over Radio.
     * This function takes an array of quaternion components, scales each component by 10000 for precision,
     * and calls the sendBuffer function to transmit the data as buffer.
     *
     * @param q - An array containing the quaternion components [w, x, y, z].
     */
    //% block="send data %q"
    //% group="Radio"
    //% weight=93
    export function sendData(q: number[]) {
        const msg = bufferconv.fromArray(q);
        if (msg)
            radio.sendBuffer(msg);
    }

    /**
     * Converts received buffer into an array of quaternion components.
     * This function reads the buffer, extracts quaternion components, and scales them back to their original values.
     *
     * @param receivedBuffer - The buffer containing the quaternion data.
     * @returns An array of quaternion components [w, x, y, z].
     */
    //% block="buffer %receivedBuffer to array"
    //% group="Radio"
    //% weight=92
    //% advanced=true
    export function bufferAsQuatArray(receivedBuffer: Buffer) {
        return bufferconv.toArray(receivedBuffer);
    }

    /**
     * Registers code to run when the radio receives quaternion data.
     * Note: This function uses radio.onReceivedBuffer internally. As an alternative,
     *       you can use the onRadioReceivedBuffer function.
     */
    //% block="on radio received"
    //% draggableParameters=reporter
    //% group="Radio"
    //% weight=91
    export function onRadioReceivedData(cb: (q: number[]) => void) {
        init();
        onRadioReceivedDataHandler = cb;
    }

    /**
     * Registers code to run when the radio receives a buffer.
     */
    //% block="on radio received"
    //% draggableParameters=reporter
    //% group="Radio"
    //% weight=90
    //% blockHidden=1
    export function onRadioReceivedBuffer(cb: (receivedBuffer: Buffer) => void) {
        init();
        onRadioReceivedBufferHandler = cb;
    }

    namespace bufferconv {

        const VAL_SCALE = 10000;
        const NUM_FMT = NumberFormat.Int16LE;
        const OFS_W = 0;
        const OFS_X = 2;
        const OFS_Y = 4;
        const OFS_Z = 6;
        const BUF_SIZE = 8;

        /**
         * Converts a buffer into an array of quaternion components.
         * This function checks the buffer size, reads the quaternion data,
         * and scales the values back to their original scale.
         *
         * @param buf - The buffer containing quaternion data.
         * @returns An array of quaternion components [w, x, y, z], 
         *          or an empty array if the buffer size is incorrect.
         */
        export function toArray(buf: Buffer) {
            if (BUF_SIZE != buf.length)
                return [];
            const w = buf.getNumber(NUM_FMT, OFS_W) / VAL_SCALE;
            const x = buf.getNumber(NUM_FMT, OFS_X) / VAL_SCALE;
            const y = buf.getNumber(NUM_FMT, OFS_Y) / VAL_SCALE;
            const z = buf.getNumber(NUM_FMT, OFS_Z) / VAL_SCALE;
            return [w, x, y, z];
        }

        /**
         * Converts an array of quaternion components into a buffer.
         * This function scales the quaternion components for precision,
         * writes them into a buffer, and returns the buffer.
         *
         * @param q - An array containing the quaternion components [w, x, y, z].
         * @returns A buffer containing the quaternion data,
         *          or undefined if the array length is incorrect.
         */
        export function fromArray(q: number[]) {
            if (4 != q.length)
                return undefined;
            const w10000 = VAL_SCALE * q[0];
            const x10000 = VAL_SCALE * q[1];
            const y10000 = VAL_SCALE * q[2];
            const z10000 = VAL_SCALE * q[3];
            const buf = Buffer.create(BUF_SIZE);
            buf.setNumber(NUM_FMT, OFS_W, w10000);
            buf.setNumber(NUM_FMT, OFS_X, x10000);
            buf.setNumber(NUM_FMT, OFS_Y, y10000);
            buf.setNumber(NUM_FMT, OFS_Z, z10000);
            return buf;
        }
    }
}
