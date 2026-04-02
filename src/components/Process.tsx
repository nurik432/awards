export default function Process() {
  return (
    <section id="process" className="wrapper process">
      <div className="white-panel">
        <div className="process-grid">
          <div className="steps">
            <div className="kicker" style={{ color: '#b91c1c' }}>Прозрачная модель</div>
            <h2 style={{ margin: '10px 0 0', color: '#111827' }}>Как устроен процесс оценки</h2>

            <div className="step">
              <div className="step-badge">1</div>
              <div>Номинации и условия участия объявляются заранее для всех сотрудников.</div>
            </div>
            <div className="step">
              <div className="step-badge">2</div>
              <div>По каждой номинации определяются критерии, источник данных и этапы рассмотрения.</div>
            </div>
            <div className="step">
              <div className="step-badge">3</div>
              <div>Комиссия проводит оценку на основе KPI, форм, опросов 360, экспертных мнений и внутренних данных.</div>
            </div>
            <div className="step">
              <div className="step-badge">4</div>
              <div>По итогам публично озвучивается причина выбора победителей.</div>
            </div>
          </div>

          <div className="gradient-panel">
            <h3>Что уже добавлено</h3>
            <div className="gradient-item">Страница победителей 2025 года с полным списком</div>
            <div className="gradient-item">Онлайн-форма подачи заявок</div>
            <div className="gradient-item">Поиск и фильтр по номинациям</div>
            <div className="gradient-item">Готовая структура для подключения отправки заявок</div>
            <div className="gradient-item">Удобное раскрытие списков по каждой номинации</div>
          </div>
        </div>
      </div>
    </section>
  );
}
