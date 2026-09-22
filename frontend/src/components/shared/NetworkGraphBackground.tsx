import React from 'react'

interface NetworkNode {
  id: string
  x: number
  y: number
  type: 'worker' | 'citizen'
  label?: string
}

interface NetworkEdge {
  from: string
  to: string
  curvature?: number
}

// Pre-defined topological network layout representing cooperative dispatch graph
const NODES: NetworkNode[] = [
  // Cluster Northwest (Hub & Citizens)
  { id: 'w1', x: 180, y: 160, type: 'worker', label: 'W-01' },
  { id: 'c1', x: 100, y: 280, type: 'citizen' },
  { id: 'c2', x: 290, y: 130, type: 'citizen' },
  { id: 'c3', x: 230, y: 310, type: 'citizen' },

  // Central Cooperative Dispatch Hub
  { id: 'w2', x: 520, y: 220, type: 'worker', label: 'W-02' },
  { id: 'w3', x: 720, y: 280, type: 'worker', label: 'W-03' },
  { id: 'c4', x: 420, y: 380, type: 'citizen' },
  { id: 'c5', x: 640, y: 150, type: 'citizen' },
  { id: 'c6', x: 610, y: 440, type: 'citizen' },

  // Cluster Northeast
  { id: 'w4', x: 960, y: 200, type: 'worker', label: 'W-04' },
  { id: 'c7', x: 860, y: 360, type: 'citizen' },
  { id: 'c8', x: 1120, y: 170, type: 'citizen' },
  { id: 'c9', x: 1050, y: 320, type: 'citizen' },
  { id: 'w5', x: 1280, y: 260, type: 'worker', label: 'W-05' },

  // Cluster Southwest & South Central
  { id: 'w6', x: 320, y: 620, type: 'worker', label: 'W-06' },
  { id: 'c10', x: 190, y: 540, type: 'citizen' },
  { id: 'c11', x: 220, y: 740, type: 'citizen' },
  { id: 'c12', x: 450, y: 710, type: 'citizen' },
  { id: 'w7', x: 680, y: 640, type: 'worker', label: 'W-07' },
  { id: 'c13', x: 580, y: 790, type: 'citizen' },

  // Cluster Southeast
  { id: 'w8', x: 1020, y: 610, type: 'worker', label: 'W-08' },
  { id: 'c14', x: 860, y: 690, type: 'citizen' },
  { id: 'c15', x: 1190, y: 550, type: 'citizen' },
  { id: 'c16', x: 1140, y: 720, type: 'citizen' },
  { id: 'w9', x: 1320, y: 680, type: 'worker', label: 'W-09' },
]

const EDGES: NetworkEdge[] = [
  // Northwest Connections
  { from: 'w1', to: 'c1', curvature: 25 },
  { from: 'w1', to: 'c2', curvature: -20 },
  { from: 'w1', to: 'c3', curvature: 15 },
  { from: 'w1', to: 'w2', curvature: -35 },

  // Central Hub Connections
  { from: 'w2', to: 'c4', curvature: 20 },
  { from: 'w2', to: 'c5', curvature: -25 },
  { from: 'w2', to: 'w3', curvature: 15 },
  { from: 'w3', to: 'c5', curvature: 20 },
  { from: 'w3', to: 'c6', curvature: -20 },
  { from: 'w3', to: 'c7', curvature: 30 },
  { from: 'w3', to: 'w4', curvature: -25 },

  // Northeast Connections
  { from: 'w4', to: 'c7', curvature: -20 },
  { from: 'w4', to: 'c8', curvature: 25 },
  { from: 'w4', to: 'c9', curvature: -15 },
  { from: 'w4', to: 'w5', curvature: 30 },
  { from: 'w5', to: 'c8', curvature: -20 },
  { from: 'w5', to: 'c9', curvature: 25 },

  // Central Cross-links to South
  { from: 'c3', to: 'w6', curvature: 30 },
  { from: 'c4', to: 'w6', curvature: -25 },
  { from: 'c6', to: 'w7', curvature: 20 },
  { from: 'c7', to: 'w8', curvature: -30 },

  // Southwest Connections
  { from: 'w6', to: 'c10', curvature: -20 },
  { from: 'w6', to: 'c11', curvature: 25 },
  { from: 'w6', to: 'c12', curvature: -15 },
  { from: 'w6', to: 'w7', curvature: 35 },

  // South Central to Southeast Connections
  { from: 'w7', to: 'c12', curvature: 20 },
  { from: 'w7', to: 'c13', curvature: -25 },
  { from: 'w7', to: 'c14', curvature: 15 },
  { from: 'w7', to: 'w8', curvature: -30 },

  // Southeast Connections
  { from: 'w8', to: 'c14', curvature: 20 },
  { from: 'w8', to: 'c15', curvature: -25 },
  { from: 'w8', to: 'c16', curvature: 30 },
  { from: 'w8', to: 'w9', curvature: -20 },
  { from: 'w9', to: 'c15', curvature: 15 },
  { from: 'w9', to: 'c16', curvature: -25 },
]

function getQuadraticPath(
  n1: NetworkNode,
  n2: NetworkNode,
  curvature = 0
): string {
  const mx = (n1.x + n2.x) / 2
  const my = (n1.y + n2.y) / 2
  const dx = n2.x - n1.x
  const dy = n2.y - n1.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * curvature
  const cy = my + ny * curvature

  return `M ${n1.x} ${n1.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${n2.x} ${n2.y}`
}

export function NetworkGraphBackground(): React.JSX.Element {
  const nodeMap = new Map<string, NetworkNode>()
  for (const n of NODES) {
    nodeMap.set(n.id, n)
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-75 dark:opacity-85"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gentle Radial Fade Mask so network is crisp in center and fades seamlessly at edges */}
          <radialGradient
            id="networkRadialGradient"
            cx="50%"
            cy="45%"
            r="60%"
            fx="50%"
            fy="45%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <mask id="networkRadialMask">
            <rect width="1440" height="900" fill="url(#networkRadialGradient)" />
          </mask>

          {/* Gentle pulse animation for floating network aesthetic */}
          <style>
            {`
              @keyframes networkDashFlow {
                to { stroke-dashoffset: -32; }
              }
              @keyframes networkAmbientFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
              }
              .network-edge {
                animation: networkDashFlow 24s linear infinite;
              }
              .network-cluster {
                animation: networkAmbientFloat 12s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        <g mask="url(#networkRadialMask)" className="network-cluster">
          {/* Delicate Curved Dashed Paths */}
          <g
            className="text-amber-600/70 dark:text-amber-400/60"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.25"
            strokeDasharray="4 4"
            opacity="0.18"
          >
            {EDGES.map((edge, idx) => {
              const fromNode = nodeMap.get(edge.from)
              const toNode = nodeMap.get(edge.to)
              if (!fromNode || !toNode) return null
              const pathD = getQuadraticPath(fromNode, toNode, edge.curvature)
              return (
                <path
                  key={`${edge.from}-${edge.to}-${idx}`}
                  d={pathD}
                  className="network-edge"
                  strokeLinecap="round"
                />
              )
            })}
          </g>

          {/* Citizen Nodes (Subtle circular pearls with soft aura) */}
          <g opacity="0.22" className="text-zinc-600 dark:text-amber-200">
            {NODES.filter((n) => n.type === 'citizen').map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r="7"
                  className="fill-amber-500/10 stroke-amber-500/30"
                  strokeWidth="1"
                />
                <circle
                  r="3"
                  className="fill-amber-700/60 dark:fill-amber-300/70"
                />
              </g>
            ))}
          </g>

          {/* Worker Nodes (Prominent cooperative anchors with concentric rings) */}
          <g opacity="0.28">
            {NODES.filter((n) => n.type === 'worker').map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                {/* Outer delicate beacon pulse ring */}
                <circle
                  r="12"
                  className="stroke-amber-500/40 dark:stroke-amber-400/30 fill-amber-500/10"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Middle ring */}
                <circle
                  r="6"
                  className="stroke-amber-600 dark:stroke-amber-400 fill-amber-100 dark:fill-zinc-900"
                  strokeWidth="1.5"
                />
                {/* Core dot */}
                <circle
                  r="2.5"
                  className="fill-amber-600 dark:fill-amber-400"
                />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  )
}
