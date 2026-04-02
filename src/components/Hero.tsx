import Topbar, { HeroSlider } from './Topbar';

interface HeroProps {
  slides: string[];
}

export default function Hero({ slides }: HeroProps) {
  return (
    <header className="hero">
      <div className="wrapper">
        <Topbar />
        <div className="hero-grid">
          <div>
            <div className="badge">Годовые номинации и признание лучших сотрудников</div>
            <h1>Farovon Awards</h1>
            <p>
              Премиальный корпоративный сайт награждения с номинациями, архивом победителей,
              галереей прошлых мероприятий и возможностью подать заявку на самовыдвижение в ключевые категории.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#nominations">Смотреть номинации</a>
              <a className="btn btn-secondary" href="#gallery">Открыть галерею</a>
              <a className="btn btn-secondary" href="#winners">Победители прошлых лет</a>
            </div>
          </div>
          <div className="hero-photo">
            <HeroSlider slides={slides} />
            <div className="hero-photo-badge">Итоги года • церемония признания</div>
          </div>
        </div>
      </div>
    </header>
  );
}
