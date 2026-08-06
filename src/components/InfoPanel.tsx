export interface InfoCard {
  title: string;
  text: string;
}

interface InfoPanelProps {
  cards: InfoCard[];
}

export default function InfoPanel({ cards }: InfoPanelProps) {
  if (cards.length === 0) return null;

  return (
    <section className="wrapper">
      <div className="white-panel">
        <div className="info-grid">
          {cards.map((card, i) => (
            <div key={i} className="info-box">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
