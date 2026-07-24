'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Matter from 'matter-js'
import './falling-text.css'

interface FallingTextProps {
  text?: string
  highlightWords?: string[]
  trigger?: 'auto' | 'scroll' | 'click' | 'hover'
  backgroundColor?: string
  wireframes?: boolean
  gravity?: number
  mouseConstraintStiffness?: number
  fontSize?: string
}

/**
 * FallingText —— 基于 matter-js 物理引擎的落差文字效果
 *
 * 默认文字排成行在顶部，点击/触发后散落坠落。
 * 适配博客温润文学调性，高亮词使用品牌强调色。
 */
export function FallingText({
  text = '',
  highlightWords = [],
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '1rem',
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const [effectStarted, setEffectStarted] = useState(false)

  // 拆分文字为单词 span，标记高亮词
  useEffect(() => {
    if (!textRef.current) return
    const words = text.split(' ')
    const newHTML = words
      .map((word) => {
        const isHighlighted = highlightWords.some((hw) => word.startsWith(hw))
        return `<span class="word ${isHighlighted ? 'word--highlight' : ''}">${word}</span>`
      })
      .join(' ')
    textRef.current.innerHTML = newHTML
  }, [text, highlightWords])

  // auto / scroll 触发
  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true)
      return
    }
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 },
      )
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [trigger])

  // 物理引擎初始化
  useEffect(() => {
    if (!effectStarted) return

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } =
      Matter

    if (!containerRef.current || !canvasContainerRef.current || !textRef.current)
      return

    // 如果是 click 触发，容器高度已在 handleTrigger 中展开
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    if (width <= 0 || height <= 0) return

    // 固定容器高度 —— 文字变为绝对定位后不会 collapse
    containerRef.current.style.height = `${height}px`

    const containerRect = containerRef.current.getBoundingClientRect()

    const engine = Engine.create()
    engine.world.gravity.y = gravity

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes,
      },
    })

    // 边界墙体（加厚，防止穿墙逃逸）
    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
    }
    const wallThickness = 120
    const floor = Bodies.rectangle(
      width / 2,
      height + 25,
      width,
      50,
      boundaryOptions,
    )
    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      boundaryOptions,
    )
    const rightWall = Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height * 2,
      boundaryOptions,
    )
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions)

    // 为每个单词创建物理体
    const wordSpans =
      textRef.current.querySelectorAll<HTMLSpanElement>('.word')
    const wordBodies = Array.from(wordSpans).map((elem) => {
      const rect = elem.getBoundingClientRect()
      const x = rect.left - containerRect.left + rect.width / 2
      const y = rect.top - containerRect.top + rect.height / 2

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2,
      })

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: 0,
      })
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05)
      return { elem, body }
    })

    // 初始定位 —— 与 updateLoop 一致的 translate(-50%, -50%) 居中
    wordBodies.forEach(({ elem, body }) => {
      elem.style.position = 'absolute'
      elem.style.left = `${body.position.x}px`
      elem.style.top = `${body.position.y}px`
      elem.style.transform = 'translate(-50%, -50%)'
    })

    // 鼠标交互 —— 让用户可拖拽单词
    const mouse = Mouse.create(containerRef.current)
    // 移除 Matter.js 内部的 wheel 监听器，恢复页面滚动
    const mouseAny = mouse as any
    if (mouseAny.mousewheel) {
      containerRef.current.removeEventListener('wheel', mouseAny.mousewheel)
    }
    mouseAny.mousewheel = () => {}
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    })
    render.mouse = mouse

    World.add(engine.world, [
      floor,
      leftWall,
      rightWall,
      ceiling,
      mouseConstraint,
      ...wordBodies.map((wb) => wb.body),
    ])

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    // 更新循环 —— 将物理位置同步到 DOM，并防止单词逃逸
    const updateLoop = () => {
      const margin = 20
      // 底部放宽：单词正常落在地板处（y ≈ height-10），不触发钳制
      const bottomBound = height + 50
      wordBodies.forEach(({ body, elem }) => {
        let { x, y } = body.position
        // 只有明显穿墙时才拉回
        if (x < -margin || x > width + margin || y < -margin || y > bottomBound) {
          x = Math.max(margin, Math.min(width - margin, x))
          y = Math.max(10, Math.min(height - 10, y))
          Matter.Body.setPosition(body, { x, y })
          Matter.Body.setVelocity(body, { x: 0, y: 0 })
          Matter.Body.setAngularVelocity(body, 0)
        }
        elem.style.left = `${x}px`
        elem.style.top = `${y}px`
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
      })
      Matter.Engine.update(engine)
      requestAnimationFrame(updateLoop)
    }
    updateLoop()

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas)
      }
      World.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness])

  // click / hover 触发
  const handleTrigger = useCallback(() => {
    if (effectStarted) return
    setEffectStarted(true)
  }, [effectStarted])

  useEffect(() => {
    if (!effectStarted && trigger === 'hover' && containerRef.current) {
      const el = containerRef.current
      const onEnter = () => handleTrigger()
      el.addEventListener('mouseenter', onEnter)
      return () => el.removeEventListener('mouseenter', onEnter)
    }
  }, [effectStarted, trigger, handleTrigger])

  const canClick = !effectStarted && trigger === 'click'

  return (
    <div
      ref={containerRef}
      className={`falling-text${canClick ? ' falling-text--ready' : ''}${effectStarted ? ' falling-text--active' : ''}`}
      onClick={canClick ? handleTrigger : undefined}
    >
      <div
        ref={textRef}
        className="falling-text__target"
        style={{ fontSize }}
      />
      <div ref={canvasContainerRef} className="falling-text__canvas" />
    </div>
  )
}
