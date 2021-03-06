export default class Shapes {
    constructor(triangleParams, drawing) {
        this.x = Math.round(triangleParams.triangleCenterX)
        this.y = Math.round(triangleParams.triangleCenterY)
        this.edge = Math.round(triangleParams.edgeOfTriangle)
        this.position = triangleParams.mirroring
        this.noteName = triangleParams.noteName
        this.color = triangleParams.color
        this.pitch = triangleParams.pitch
        this.serNumOfTri = triangleParams.serNumOfTri
        this.triangle
        this.hexagon
        this.offArea
        this.text
        this.drawing = drawing
        this.draw()
    }

    draw = (color = this.color) => {
        this.drawOffArea()
        this.drawTriangle()
        this.triangle.fill(color)
        this.triangle.attr({
            stroke: color === 'gray' ? '#999999' : '#808080',
            'stroke-width': 2
        })
        this.text()
        this.drawHexagon()
    }

    isPointInShape = (pointerX, pointerY) => {
        let inside = false
        inside = this.triangle.inside(pointerX, pointerY)
        if (inside) return true
        return false
    }

    drawTriangle = () => {
        let x1 = Math.round(this.x - this.edge / 2)
        let x2 = this.x
        let x3 = Math.round(this.x + this.edge / 2)
        let height = Math.round((this.edge * Math.sqrt(3)) / 2)
        let y1 = Math.round(this.y + (this.position * height) / 2)
        let y2 = Math.round(this.y - (this.position * height) / 2)
        let y3 = y1
        let pointsOfTriangle = () => [
            [x1, y1],
            [x2, y2],
            [x3, y3]
        ]
        this.triangle = this.drawing.polygon(pointsOfTriangle())
        this.triangle.data('serNum', this.serNumOfTri)
        this.triangle.data('type', 'triangle')
    }

    drawHexagon = () => {
        let edge = this.edge * 0.98
        let diff = ((Math.sqrt(3) / 2) * (this.position * this.edge)) / 6
        let side = 0
        let size = edge / 3
        let y = this.y + diff
        let points = [this.x - size, y + size]
        for (side; side <= 6; side++) {
            points.push(this.x + size * Math.cos((side * 2 * Math.PI) / 6))
            points.push(y + size * Math.sin((side * 2 * Math.PI) / 6))
        }
        this.hexagon = this.drawing.polygon(points).fill('gray').opacity(0.0001)
        this.hexagon.data('serNum', this.serNumOfTri)
        this.hexagon.data('type', 'hexagon')
    }

    drawOffArea = () => {
        let e = Math.round(this.edge / 3)
        let h = Math.round((e * Math.sqrt(3)) / 2) * this.position
        let w = e / 2
        let p = [
            [-e, 0],
            [-e, 0],
            [-w, h],
            [w, h],
            [e, 0],
            [w, -h],
            [e, 0],
            [w, h],
            [e, 0],
            [w, -h],
            [-w, -h],
            [-e, 0],
            [-w, -h],
            [w, -h],
            [-w, -h],
            [-e, 0],
            [-w, h],
            [w, h],
            [-w, h]
        ]
        let pointsRel = []
        let x = this.x
        let y = this.y + (this.position * e) / 2.3
        let points = () => {
            for (let i = 0; i < p.length; i++) {
                pointsRel.push((x += p[i][0]))
                pointsRel.push((y += p[i][1]))
            }
        }
        points()
        this.offArea = this.drawing
            .polygon(pointsRel)
            .fill('red')
            .opacity(0.0001)
        this.offArea.data('serNum', this.serNumOfTri)
        this.offArea.data('type', 'offArea')
    }

    text = () => {
        let color = this.color
        let shift = (this.position * this.edge) / 10
        this.text = this.drawing
            .text(this.noteName + ((this.pitch - (this.pitch % 12)) / 12 - 1))
            .x(this.x)
            .y(this.y + shift - 600 / this.edge)
            .fill('none')
            .font({
                family: 'Arial',
                size: this.edge / 5,
                anchor: 'middle',
                stroke: color == 'gray' ? '#999999' : '#808080',
                'stroke-width': 0.5
            })
        if (this.pitch === 69) {
            this.text.stroke('red')
        }
    }

    getSound = () => {
        return this.pitch
    }

    setSignOn = () => {
        let color
        if (this.color != 'gray') {
            color = this.color == 'white' ? '#ffcccc' : '#660000'
            this.triangle.fill(color)
            this.offArea.front()
        }
    }

    setSignOff = () => {
        this.triangle.fill(this.color)
        this.offArea.back()
    }
}
