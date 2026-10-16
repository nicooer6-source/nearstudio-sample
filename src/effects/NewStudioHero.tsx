import type { SampleProps } from '../types'
import { NewStudioFluid } from './NewStudioFluid'
import './new-studio-hero.css'

export function NewStudioHero({ interactive, mode, parameters }: { interactive: boolean; mode: SampleProps['mode']; parameters: SampleProps['parameters'] }) {
  return (
    <section className={`new-studio-hero new-studio-hero--${mode}`} aria-label={interactive ? 'New Studio 鼠标流体互动' : 'New Studio 动态流体背景'}>
      <NewStudioFluid interactive={interactive} className="new-studio-fluid" parameters={parameters} />
      <div className="new-studio-copy">
        <h1><em>Transforming</em> Brands,<br />Building <em>Futures</em></h1>
      </div>
      {mode !== 'thumbnail' && <p className="new-studio-subtitle">A New York–based brand transformation studio working across strategy, design, and digital.</p>}
      {interactive && mode !== 'thumbnail' && <div className="new-studio-hint">Move your cursor</div>}
    </section>
  )
}
