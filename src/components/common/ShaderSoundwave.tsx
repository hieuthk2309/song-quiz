import React, { useEffect, useRef } from 'react';

interface ShaderSoundwaveProps {
  isPlaying?: boolean;
  intensity?: number;
  className?: string;
}

export const ShaderSoundwave: React.FC<ShaderSoundwaveProps> = ({
  isPlaying = true,
  intensity = 1.0,
  className = 'w-full h-full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 640;
      const h = canvas.clientHeight || 360;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      uniform float u_speed;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        
        // Wave parameters
        float numWaves = 5.0;
        float waveHeight = 0.22 * u_intensity;
        float waveFrequency = 9.0;
        float waveSpeed = 2.4 * u_speed;
        
        vec3 color = vec3(0.0);
        
        // Overlapping waves
        for (float i = 0.0; i < 5.0; i++) {
          float offset = i * 0.22;
          float wave = sin(uv.x * waveFrequency + u_time * waveSpeed + offset) * waveHeight;
          float dist = abs(uv.y - 0.5 - wave);
          
          // Material 3 colors (Purple #6750a4 to Teal #17deca to Magenta #dd2269)
          vec3 purpleColor = vec3(0.404, 0.314, 0.643);
          vec3 tealColor = vec3(0.09, 0.87, 0.79);
          vec3 waveColor = mix(purpleColor, tealColor, i / 4.0);
          
          float glow = 0.014 / (dist + 0.018);
          color += waveColor * glow;
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uIntensity = gl.getUniformLocation(prog, 'u_intensity');
    const uSpeed = gl.getUniformLocation(prog, 'u_speed');

    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uIntensity) gl.uniform1f(uIntensity, isPlaying ? intensity : 0.2);
      if (uSpeed) gl.uniform1f(uSpeed, isPlaying ? 1.0 : 0.2);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      try {
        gl.deleteProgram(prog);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(buf);
      } catch {
        // cleanup safe
      }
    };
  }, [isPlaying, intensity]);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};
