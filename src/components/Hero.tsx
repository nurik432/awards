import Topbar, { HeroSlider } from './Topbar';

interface HeroProps {
  slides: string[];
  badge?: string;
  title?: string;
  description?: string;
  photoBadge?: string;
  btnNominations?: string;
  btnGallery?: string;
  btnWinners?: string;
}

export default function Hero({
  slides,
  badge,
  title,
  description,
  photoBadge,
  btnNominations,
  btnGallery,
  btnWinners,
}: HeroProps) {
  return (
    <header className="hero">
      <div className="wrapper">
        <Topbar />
        <div className="hero-grid">
          <div>
            <div className="badge">
              {badge || 'Годовые номинации и признание лучших сотрудников'}
            </div>
            <h1>{title || 'Farovon Awards'}</h1>
            <p>
              {description ||
                'Премиальный корпоративный сайт награждения с номинациями, архивом победителей, галереей прошлых мероприятий и возможностью подать заявку на самовыдвижение в номинации.'}
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="#nominations">
                {btnNominations || 'Смотреть номинации'}
              </a>
              <a className="btn btn-secondary" href="#gallery">
                {btnGallery || 'Открыть галерею'}
              </a>
              <a className="btn btn-secondary" href="#winners">
                {btnWinners || 'Победители прошлых лет'}
              </a>
            </div>
          </div>
          <div className="hero-photo">
            <HeroSlider slides={slides} />
            <div className="hero-photo-badge">
              {photoBadge || 'Итоги года • церемония признания'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
