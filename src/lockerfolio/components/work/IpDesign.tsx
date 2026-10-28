import { IP_DESIGN } from '../../data/content'

/** DESIGN › 03 IP DESIGN */
export default function IpDesign({ active }: { active: boolean }) {
  return (
    <div className="ip" data-active={active}>
      <div className="ip__orb" aria-hidden>
        <span className="ip__orbHi" />
        <span className="ip__orbShade" />
      </div>

      <div className="ip__copy">
        <span className="ip__kicker">{IP_DESIGN.kicker}</span>
        <h1 className="ip__title">{IP_DESIGN.title}</h1>
        <p className="ip__cn">{IP_DESIGN.cn}</p>
        <p className="ip__desc">{IP_DESIGN.desc}</p>

        <ul className="ip__specs">
          {IP_DESIGN.specs.map(s => (
            <li key={s.k}>
              <span>{s.k}</span>
              <em>{s.v}</em>
            </li>
          ))}
        </ul>

        <div className="ip__swatches">
          {IP_DESIGN.swatches.map(s => (
            <span key={s.name} className="ip__sw">
              <i style={{ background: s.hex }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
