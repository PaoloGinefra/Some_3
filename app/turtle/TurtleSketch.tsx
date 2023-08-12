'use client'

import { useState } from 'react'
import { Renderer } from 'p5'

import useStatefulSketch from '../p5/useStatefulSketch'
import SketchRenderer from '../p5/SketchRenderer'

import { DrawingRule, Symbol } from '../GPLS/GPLS_interfaces'
import GPLS from '../GPLS/GPLS'

// basically the same drawing rules as Kock Flake
const drawingRules: DrawingRule[] = [
  {
    targetChars: 'F',
    drawing: (params, p, t = 1) => {
      const [len] = params
      p.stroke('#0070A9')
      p.strokeWeight(1)
      p.line(0, 0, len * t, 0)
      p.translate(len * t, 0)
    },
  },
  {
    targetChars: '+',
    drawing: (params, p, t: number = 1) => {
      const [angle] = params
      p.rotate(angle * t)
    },
  },
  {
    targetChars: '-',
    drawing: (params, p, t: number = 1) => {
      const [angle] = params
      p.rotate(-angle * t)
    },
  },
]

export default function ExampleSketch() {
  const [inputState, setInputState] = useState<Record<string, number>>({
    F: 50,
    '+': 60, // NOTE: angles here are in degrees, later are converted into radians
    '-': 60,
  })
  const getParam = (ruleChar: string) => inputState[ruleChar]
  const setParam = (ruleChar: string, value: number) =>
    setInputState({ ...inputState, [ruleChar]: value })

  const [inputString, setInputString] = useState('+F--F++F--F++F--F++F--F++F--F++F--F++F--F++F')

  const lookup: Record<string, number> = {
    ...inputState,
    '+': inputState['+'] * (Math.PI / 180), // degree => radians
    '-': inputState['-'] * (Math.PI / 180),
  }
  const string: Symbol[] = inputString
    .split('')
    .map((char) => ({ char, params: [lookup[char]] }))

  const sketch = useStatefulSketch({ string }, (state, p) => {
    const w = 700
    const h = 550

    let t = 0

    let canvas: Renderer

    p.preload = function () {}

    p.setup = function () {
      canvas = p.createCanvas(w, h)
    }

    p.draw = function () {
      p.background(251, 234, 205)

      // TODO: moveable grid
      p.translate(50, h - 50)
      p.push()

      GPLS.drawString(p, state.current.string, drawingRules, t, true)

      p.pop()

      t += 0.01
    }
  })

  return (
    <div>
      <fieldset>
        <label className="inline-block w-44" htmlFor="forwardSizeSlider">
          Forwards (F) amount
        </label>
        <input
          id="forwardSizeSlider"
          type="range"
          min={1}
          max={100}
          value={getParam('F')}
          onChange={(e) => setParam('F', parseInt(e.target.value))}
        />
        <p className="inline-block">{getParam('F')} px</p>
        <br />

        <label className="inline-block w-44" htmlFor="leftSizeSlider">
          Left (+) angle
        </label>
        <input
          id="leftSizeSlider"
          type="range"
          min={0}
          max={180}
          value={getParam('+')}
          onChange={(e) => setParam('+', parseInt(e.target.value))}
        />
        <p className="inline-block">{getParam('+')}°</p>
        <br />

        <label className="inline-block w-44" htmlFor="rightSizeSlider">
          Right (-) angle
        </label>
        <input
          id="rightSizeSlider"
          type="range"
          min={0}
          max={180}
          value={getParam('-')}
          onChange={(e) => setParam('-', parseInt(e.target.value))}
        />
        <p className="inline-block">{getParam('-')}°</p>
        <br />

        <label className="inline-block w-44" htmlFor="stringInput">
          Input string
        </label>
        <input
          id="stringInput"
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
        />
        <br />

        <button>Draw</button>
      </fieldset>

      <SketchRenderer sketch={sketch} />
    </div>
  )
}