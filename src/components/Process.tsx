interface ProcessProps {
  content: Record<string, string>;
}

export default function Process({ content }: ProcessProps) {
  const sc = content;

  const steps = [
    sc['process_step_1'] || 'Номинации и условия участия объявляются заранее для всех сотрудников.',
    sc['process_step_2'] || 'По каждой номинации определяются критерии, источник данных и этапы рассмотрения.',
    sc['process_step_3'] || 'Комиссия проводит оценку на основе KPI, форм, опросов 360, экспертных мнений и внутренних данных.',
    sc['process_step_4'] || 'По итогам публично озвучивается причина выбора победителей.',
  ].filter(Boolean);

  const features = [
    sc['process_feature_1'] || 'Страница победителей 2025 года с полным списком',
    sc['process_feature_2'] || 'Онлайн-форма подачи заявок',
    sc['process_feature_3'] || 'Поиск и фильтр по номинациям',
    sc['process_feature_4'] || 'Готовая структура для подключения отправки заявок',
    sc['process_feature_5'] || 'Удобное раскрытие списков по каждой номинации',
  ].filter(Boolean);

  return (
    <section id="process" className="wrapper process">
      <div className="white-panel">
        <div className="process-grid">
          <div className="steps">
            <div className="kicker" style={{ color: '#b91c1c' }}>
              {sc['process_kicker'] || 'Прозрачная модель'}
            </div>
            <h2 style={{ margin: '10px 0 0', color: '#111827' }}>
              {sc['process_title'] || 'Как устроен процесс оценки'}
            </h2>

            {steps.map((text, i) => (
              <div className="step" key={i}>
                <div className="step-badge">{i + 1}</div>
                <div>{text}</div>
              </div>
            ))}
          </div>

          <div className="gradient-panel">
            <h3>{sc['process_panel_title'] || 'Что уже добавлено'}</h3>
            {features.map((text, i) => (
              <div className="gradient-item" key={i}>{text}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
