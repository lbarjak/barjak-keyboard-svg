import BufferPlayer from './bufferplayer.js'

export default class Events {
    constructor(triangles, instrument, numberOfHorizontalTris) {
        ;[this.triangles, this.instrument, this.numberOfHorizontalTris] = [
            triangles,
            instrument,
            numberOfHorizontalTris
        ]
        console.log('inst:', this.instrument)
        this.player = BufferPlayer.getPlayer()
        this.sounds = []
        this.midiOutputs = []
        this.midiOutput = null
        this.midiChannel = 0
        this.init()
        if (navigator.requestMIDIAccess) this.midiInit()
    }

    midiInit = () => {
        navigator
            .requestMIDIAccess()
            .then((response) => {
                const outputs = response.outputs.values()
                for (const output of outputs) {
                    this.midiOutputs.push(output)
                }
                if (this.midiOutputs[0]) this.midiOutput = this.midiOutputs[0]
                console.log(
                    'event.js/Events connected:',
                    this.midiOutputs[0].type,
                    this.midiOutputs[0].name
                )
            })
            .catch((error) => console.warn(error))
    }
    midi = (onoff, serNumOfTri) => {
        let pitch = this.triangles[serNumOfTri].getSound()
        this.midiChannel = Math.floor(serNumOfTri / this.numberOfHorizontalTris)
        if (pitch < 128) {
            this.midiOutput.send([onoff + this.midiChannel, pitch, 127])
            console.log(
                'output:',
                this.midiOutput.name,
                '-',
                'midiEvent:',
                onoff.toString(16)[0],
                ' midiChannel:',
                this.midiChannel,
                ' midiKey:',
                pitch,
                'midiVelocity:',
                127
            )
        }
    }

    soundSwitch = (onOff, serNumOfTri) => {
        let pitch
        pitch = this.triangles[serNumOfTri].getSound()
        if (onOff) {
            if (!this.sounds[pitch]) {
                this.sounds[pitch] = {}
                this.sounds[pitch][serNumOfTri] = false
            }
            if (!this.sounds[pitch][serNumOfTri]) {
                this.sounds[pitch][serNumOfTri] = true
                this.instrument == 'midi'
                    ? this.midi(144, serNumOfTri)
                    : this.player.play(pitch, serNumOfTri)
                this.triangles[serNumOfTri].setSignOn()
            }
        }
        if (!onOff) {
            if (this.sounds[pitch]) {
                this.instrument == 'midi'
                    ? this.midi(128, serNumOfTri)
                    : this.player.stop(pitch, serNumOfTri)
                this.triangles[serNumOfTri].setSignOff()
                this.sounds[pitch][serNumOfTri] = false
            }
        }
    }

    allOff = () => {
        if (this.sounds.length) {
            let pitch
            for (let snOfTri = 0; snOfTri < this.triangles.length; snOfTri++) {
                pitch = this.triangles[snOfTri].getSound()
                this.triangles[snOfTri].setSignOff()
                if (this.sounds[pitch]) {
                    this.instrument == 'midi'
                        ? this.midi(128, snOfTri)
                        : this.player.stop(pitch, snOfTri)
                    this.player.stop(pitch, snOfTri)
                }
                this.sounds = []
            }
        }
    }

    init = () => {
        const musicalKeyboard = document.getElementsByTagName('canvas')[0]
        let isMouseDown
        let prevTriangleSerNum
        let currentTriangleSerNum
        let handleMouse = (e) => {
            if (e.type == 'mousedown') isMouseDown = true
            if (e.type == 'mouseup' || e.type == 'mouseout') isMouseDown = false
            currentTriangleSerNum = getCurrentTriangle(e.clientX, e.clientY)
            if (currentTriangleSerNum && isMouseDown) {
                this.soundSwitch(true, currentTriangleSerNum)
                if (prevTriangleSerNum == currentTriangleSerNum)
                    prevTriangleSerNum = null
            }
            if (prevTriangleSerNum && this.sounds.length > 0) {
                this.soundSwitch(false, prevTriangleSerNum)
                if (!isMouseDown) this.allOff()
            }
            prevTriangleSerNum = currentTriangleSerNum
        }
        musicalKeyboard.addEventListener('mouseout', handleMouse, false)
        musicalKeyboard.addEventListener('mousedown', handleMouse, false)
        musicalKeyboard.addEventListener('mousemove', handleMouse, false)
        musicalKeyboard.addEventListener('mouseup', handleMouse, false)

        let prevTriangles = []
        let handleTouch = (e) => {
            e.preventDefault()
            let currentTriangles = []
            for (let touch in e.touches) {
                currentTriangleSerNum = getCurrentTriangle(
                    e.touches[touch].clientX,
                    e.touches[touch].clientY
                )
                if (currentTriangleSerNum) {
                    this.soundSwitch(true, currentTriangleSerNum)
                    let serNumOfTri = 0
                    for (serNumOfTri in prevTriangles) {
                        if (prevTriangles[serNumOfTri] == currentTriangleSerNum)
                            prevTriangles.splice(serNumOfTri, 1)
                    }
                    currentTriangles.push(currentTriangleSerNum)
                }
            }
            for (let serNumOfTri in prevTriangles) {
                this.soundSwitch(false, prevTriangles[serNumOfTri])
            }
            prevTriangles = currentTriangles
        }
        musicalKeyboard.addEventListener('touchstart', handleTouch, false)
        musicalKeyboard.addEventListener('touchmove', handleTouch, false)
        musicalKeyboard.addEventListener('touchend', handleTouch, false)
        musicalKeyboard.addEventListener('touchcancel', handleTouch, false)

        let getCurrentTriangle = (x, y) => {
            let findIt = this.triangles.find(
                (triangle) => triangle.getCurrentTriangle(x, y) > -1
            )
            return findIt ? findIt.serNumOfTri : null
        }
    }
}
