export interface NominationProp {
  id: string;
  icon: string;
  title: string;
  description: string;
  eligibility: string[];
  criteria: string[];
  steps: string[];
  googleFormUrl?: string | null;
  formType: string;
}

function NominationCard({ nom }: { nom: NominationProp }) {
  const hasApplyForm = nom.formType !== 'basic' || nom.googleFormUrl;

  return (
    <article className="card">
      <div className="card-head">
        <div className="icon">{nom.icon}</div>
        <h3>{nom.title}</h3>
      </div>
      <p className="desc">{nom.description}</p>

      {nom.eligibility.length > 0 && (
        <div className="block">
          <h4>Кто может участвовать</h4>
          <ul>
            {nom.eligibility.map((item, i) => (
              <li key={i}><span className="dot" /><span>{item}</span></li>
            ))}
          </ul>
        </div>
      )}

      {nom.criteria.length > 0 && (
        <div className="block">
          <h4>{nom.steps.length > 0 ? 'Критерии оценки' : 'Метод определения победителя'}</h4>
          <ul>
            {nom.criteria.map((item, i) => (
              <li key={i}><span className="dot" /><span>{item}</span></li>
            ))}
          </ul>
        </div>
      )}

      {nom.steps.length > 0 && (
        <div className="block">
          <h4>Этапы участия</h4>
          <ol>
            {nom.steps.map((item, i) => (
              <li key={i}><span className="num">{i + 1}</span><span>{item}</span></li>
            ))}
          </ol>
        </div>
      )}

      {nom.googleFormUrl && (
        <div className="card-actions">
          <a className="apply-btn" href={nom.googleFormUrl} target="_blank" rel="noopener noreferrer">
            Подать заявку
          </a>
        </div>
      )}

      {!hasApplyForm && (
        <div className="nomination-status">Победитель определяется по итогам внутреннего анализа данных</div>
      )}
    </article>
  );
}

interface NominationsProps {
  nominations: NominationProp[];
  kicker?: string;
  title?: string;
}

export default function Nominations({ nominations, kicker, title }: NominationsProps) {
  return (
    <section id="nominations" className="wrapper">
      <div className="section-title">
        <div className="kicker">{kicker || 'Номинации'}</div>
        <h2>{title || 'Основные категории премии'}</h2>
      </div>
      {nominations.length === 0 ? (
        <div className="white-panel" style={{ textAlign: 'center', padding: '60px', color: '#7f1d1d' }}>
          Номинации ещё не добавлены. Добавьте их через админ-панель.
        </div>
      ) : (
        <div className="cards">
          {nominations.map((nom) => (
            <NominationCard key={nom.id} nom={nom} />
          ))}
        </div>
      )}
    </section>
  );
}
