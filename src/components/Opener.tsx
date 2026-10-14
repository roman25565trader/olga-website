import { Em } from './Em'

/** Открывашка секции: линия · красный тик с меткой · заголовок H2 */
export function Opener({ k, title, aside, text, as = 'h2' }: { k?: string; title?: string | null; aside?: React.ReactNode; text?: string | null; as?: 'h1' | 'h2' }) {
  const H = as
  return (
    <div className="op">
      <div className="op-bar">{k ? <p className="k">{k}</p> : <span />}</div>
      <div className="op-row">
        <H className={as === 'h1' ? 'h1 h1--task' : 'h2'}>
          <Em text={title} />
        </H>
        {aside ? <div className="op-aside">{aside}</div> : null}
      </div>
      {text ? <p className="lead op-x">{text}</p> : null}
    </div>
  )
}
