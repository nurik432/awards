export interface NominationProp {
  id: string;
  slug: string;
  icon: string;
  title: string;
  description: string;
  eligibility: string[];
  criteria: string[];
  steps: string[];
  googleFormUrl?: string | null;
  formType: string;
  acceptsApplications: boolean;
}

// Единые подписи для двух категорий персонала в номинации «Лучший сотрудник года».
// Тип 1 (должности 1–7): вспомогательный и производственный персонал.
// Тип 2 (должности 8–14): административно-управленческий персонал (АУП).
const EMP_GROUP_A = {
  label: 'Вспомогательный и производственный персонал',
  hint: 'Обслуживающие, сервисные и производственные должности',
};
const EMP_GROUP_B = {
  label: 'Административно-управленческий персонал (АУП)',
  hint: 'Руководители, специалисты и управленческие должности',
};

function EligibilityBlock({ nom }: { nom: NominationProp }) {
  const isBestEmployee = nom.title.toLowerCase().includes('сотрудник');

  if (!isBestEmployee) {
    if (nom.eligibility.length === 0) return null;
    return (
      <div className="block">
        <h4>Кто может участвовать</h4>
        <ul>
          {nom.eligibility.map((item, i) => (
            <li key={i}><span className="dot" /><span>{item}</span></li>
          ))}
        </ul>
      </div>
    );
  }

  const groupA = nom.eligibility.slice(0, 7);
  const groupB = nom.eligibility.slice(7, 14);
  if (groupA.length === 0 && groupB.length === 0) return null;

  return (
    <div className="block">
      <h4>Категории участников</h4>
      <p className="emp-intro">
        Номинация разделена на <strong>две независимые категории</strong> — победитель определяется
        отдельно в каждой. Определите свою категорию по типу должности:
      </p>
      <div className="emp-groups">
        {groupA.length > 0 && (
          <div className="emp-group emp-group-a">
            <div className="emp-group-label">
              {EMP_GROUP_A.label}
            </div>
            <p className="emp-group-hint">{EMP_GROUP_A.hint}</p>
            <ul>
              {groupA.map((item, i) => (
                <li key={i}><span className="dot" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        )}
        {groupB.length > 0 && (
          <div className="emp-group emp-group-b">
            <div className="emp-group-label">
              {EMP_GROUP_B.label}
            </div>
            <p className="emp-group-hint">{EMP_GROUP_B.hint}</p>
            <ul>
              {groupB.map((item, i) => (
                <li key={i}><span className="dot" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StepsBlock({ nom }: { nom: NominationProp }) {
  if (nom.steps.length === 0) return null;
  const isBestEmployee = nom.title.toLowerCase().includes('сотрудник');

  if (!isBestEmployee) {
    return (
      <div className="block">
        <h4>Этапы участия</h4>
        <ol>
          {nom.steps.map((item, i) => (
            <li key={i}><span className="num">{i + 1}</span><span>{item}</span></li>
          ))}
        </ol>
      </div>
    );
  }

  // Split steps at the second "Порядок" occurrence — two separate procedures
  let splitIdx = -1;
  let count = 0;
  for (let i = 0; i < nom.steps.length; i++) {
    if (nom.steps[i].toLowerCase().startsWith('порядок')) {
      count++;
      if (count === 2) { splitIdx = i; break; }
    }
  }
  const isHeader = (s: string) => s.toLowerCase().startsWith('порядок') || s.startsWith('(');
  const rawA = splitIdx > 0 ? nom.steps.slice(0, splitIdx) : nom.steps;
  const rawB = splitIdx > 0 ? nom.steps.slice(splitIdx) : [];
  const stepsA = rawA.filter(s => !isHeader(s));
  const stepsB = rawB.filter(s => !isHeader(s));

  return (
    <div className="block">
      <h4>Этапы участия</h4>
      <p className="emp-intro">
        Порядок определения победителя различается по <strong>категории должности</strong>:
      </p>
      <div className="emp-groups">
        {stepsA.length > 0 && (
          <div className="emp-group emp-group-a">
            <div className="emp-group-label">
              {EMP_GROUP_A.label}
            </div>
            <ol>
              {stepsA.map((item, i) => (
                <li key={i}><span className="num">{i + 1}</span><span>{item}</span></li>
              ))}
            </ol>
          </div>
        )}
        {stepsB.length > 0 && (
          <div className="emp-group emp-group-b">
            <div className="emp-group-label">
              {EMP_GROUP_B.label}
            </div>
            <ol>
              {stepsB.map((item, i) => (
                <li key={i}><span className="num">{i + 1}</span><span>{item}</span></li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function NominationCard({ nom }: { nom: NominationProp }) {
  const canApply = nom.acceptsApplications;
  const isBestEmployee = nom.title.toLowerCase().includes('сотрудник');

  return (
    <article className="card">
      <div className="card-head">
        <div className="icon">{nom.icon}</div>
        <h3>{nom.title}</h3>
      </div>
      <p className="desc">{nom.description}</p>
      {isBestEmployee && (
        <p className="emp-intro">
          Победитель выбирается <strong>отдельно в двух категориях</strong> по типу должности:
          вспомогательный и производственный персонал, а также
          административно-управленческий персонал (АУП).
        </p>
      )}

      <EligibilityBlock nom={nom} />

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

      <StepsBlock nom={nom} />

      {canApply ? (
        <div className="card-actions">
          <a className="apply-btn" href={`/apply?nomination=${nom.id}`}>
            Подать заявку
          </a>
        </div>
      ) : (
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
