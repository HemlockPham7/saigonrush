import GameCanvas from './components/canvas/GameCanvas.jsx';

/**
 * Layout wrapper: a letterboxed 16:9 stage holding the R3F canvas
 * with a DOM UI layer stacked on top (HUD / menus arrive in Phase 7).
 */
export default function App() {
  return (
    <main className="app-shell">
      <h1 className="visually-hidden">Saigon Rush</h1>
      <section className="game-stage" id="game-stage" aria-label="Saigon Rush game">
        <GameCanvas />
        <div className="ui-layer" id="ui-layer">
          <div className="brand-badge" id="brand-badge">
            <img className="brand-badge__icon" src="/favicon.svg" alt="" />
            <span className="brand-badge__title">SAIGON RUSH</span>
            <span className="brand-badge__tag">Dev Scene</span>
          </div>
        </div>
      </section>
    </main>
  );
}
