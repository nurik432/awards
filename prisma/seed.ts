import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Nominations ────────────────────────────────────────────
  const nominationsData = [
    {
      slug: 'novator',
      title: 'Новатор года',
      icon: '💡',
      description: 'Выявление и поощрение сотрудников, внёсших значительный вклад в развитие компании через внедрение новых идей, проектов и улучшений.',
      criteria: JSON.stringify(['Улучшенный процесс', 'Экономическая эффективность', 'Практическая польза', 'Креативность и новизна подхода']),
      steps: JSON.stringify(['Объявление конкурса', 'Сбор специальных форм от номинантов', 'Отбор участников со стороны комиссии', 'Посещение рабочего места номинанта при необходимости', 'Определение победителей']),
      tags: JSON.stringify(['Любой сотрудник группы компаний', 'Самовыдвижение с обоснованием', 'Руководитель может выдвигать кандидатов', 'Проекты делятся на 3 категории']),
      formType: 'innovator',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdRR0TW_FzuE088ne5wEN58mRKTmrIBU-RpYxoplwM8hjAghQ/viewform?usp=dialog',
    },
    {
      slug: 'sales',
      title: 'Лучшие по продажам',
      icon: '📈',
      description: 'Номинации для сотрудников направлений продаж за стабильное и превосходящее выполнение ключевых показателей.',
      criteria: JSON.stringify(['Стабильное выполнение / перевыполнение KPI', 'Оценка руководителя', 'Вклад в развитие команды и культуры', 'Отсутствие дисциплинарных нарушений']),
      steps: JSON.stringify(['Анализ стабильного выполнения KPI', 'Дополнительная экспертиза: мнение прямого руководителя', 'Работа комиссии', 'Определение победителей по подноминациям']),
      tags: JSON.stringify(['Все сотрудники направлений продаж', 'Участие без подачи заявки — по внутреннему анализу KPI', 'Дополнительно выбирается победитель среди победителей']),
      formType: 'basic',
    },
    {
      slug: 'leader',
      title: 'Лучший руководитель',
      icon: '👔',
      description: 'Награда за вдохновляющее лидерство и результативное управление командой.',
      criteria: JSON.stringify(['Стабильное выполнение / перевыполнение KPI', 'Оценка взаимодействия с другими подразделениями', 'Текучесть персонала', 'Количество подчинённых сотрудников', 'Лояльность и вовлечённость подчинённых сотрудников']),
      steps: JSON.stringify(['Заполнение формы руководителем', 'Анализ и выбор номинантов со стороны комиссии', 'Финальный этап — утверждение Правлением']),
      tags: JSON.stringify(['Руководители подразделений, отделов, команд и участков', 'Обязательное заполнение формы', 'Также допускается предложение со стороны Правления']),
      formType: 'manager',
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdY-Q1dgD4_crTtjWQbyMV_EkcAId2H6HL-q_dHFuGZAb0gJg/viewform?usp=dialog',
    },
    {
      slug: 'mentor',
      title: 'Наставник года',
      icon: '🎓',
      description: 'Награда сотрудникам, которые в течение года официально помогали в обучении и развитии других сотрудников.',
      criteria: JSON.stringify(['Количество сотрудников, прошедших наставничество', 'Функционирующие ученики в компании', 'Сложность обучения сотрудников, прошедших наставничество']),
      steps: JSON.stringify(['Сбор данных', 'Формирование списка номинантов (30 лучших)', 'Оценка комиссией', 'Определение победителей (15 сотрудников)']),
      tags: JSON.stringify(['Все сотрудники компании, которые официально выступали в роли наставника']),
      formType: 'basic',
    },
    {
      slug: 'veteran',
      title: 'Ветераны труда',
      icon: '🏅',
      description: 'Признание сотрудников за многолетнюю стабильную и качественную работу в компании.',
      criteria: JSON.stringify(['Стаж работы в компании 10, 15 или 20 лет', 'Отсутствие дисциплинарных нарушений', 'Рекомендации от руководителей', 'Участие в развитии компании']),
      steps: JSON.stringify(['Формирование списка сотрудников по выслуге лет', 'Качественная оценка личных и профессиональных характеристик', 'Комиссия определяет лучших сотрудников', 'Награждение']),
      tags: JSON.stringify(['Сотрудники со стажем 10 лет', 'Сотрудники со стажем 15 лет', 'Сотрудники со стажем 20 лет']),
      formType: 'basic',
    },
    {
      slug: 'best-employee',
      title: 'Лучший сотрудник года',
      icon: '⭐',
      description: 'За выдающиеся результаты, инициативность, вклад в общее дело и соответствие ценностям компании.',
      criteria: JSON.stringify(['Оценка руководителей и коллег через опрос 360', 'Индивидуальные ID для каждого сотрудника', 'SMS-рассылка на номер телефона для прохождения опроса']),
      steps: JSON.stringify([]),
      tags: JSON.stringify([]),
      formType: 'basic',
    },
    {
      slug: 'team',
      title: 'Команда года',
      icon: '🤝',
      description: 'За выдающиеся коллективные результаты, эффективное взаимодействие и вклад в достижение бизнес-целей компании.',
      criteria: JSON.stringify(['Выполнение / перевыполнение командных KPI', 'Вклад в бизнес-результат', 'Эффективное взаимодействие внутри команды', 'Кросс-функциональное сотрудничество', 'Участие в проектах и улучшениях', 'Отсутствие критических ошибок и дисциплинарных нарушений']),
      steps: JSON.stringify(['Формирование списка команд', 'Аналитическая оценка', 'Комиссионная оценка', 'Определение победителя']),
      tags: JSON.stringify([]),
      formType: 'basic',
    },
    {
      slug: 'ambassador',
      title: 'Амбассадор ценностей компании',
      icon: '❤️',
      description: 'Награда сотруднику, который в ежедневной работе и взаимодействии с коллегами последовательно демонстрирует и продвигает корпоративные ценности компании.',
      criteria: JSON.stringify(['Соответствие корпоративным ценностям в работе', 'Поведение по отношению к коллегам', 'Влияние на командную атмосферу', 'Пример для других сотрудников', 'Участие в развитии корпоративной культуры', 'Отсутствие дисциплинарных нарушений']),
      steps: JSON.stringify(['Оценка руководителей и коллег через опрос 360, раздел «Ценности»', 'Индивидуальные ID сотрудников', 'SMS-рассылка для прохождения опроса']),
      tags: JSON.stringify([]),
      formType: 'basic',
    },
    {
      slug: 'trainer',
      title: 'Лучший тренер года',
      icon: '📚',
      description: 'Награда сотруднику, внёсшему значительный вклад в развитие персонала через обучение, передачу знаний и формирование навыков.',
      criteria: JSON.stringify(['Количество проведённых обучений и тренингов', 'Охват сотрудников', 'Качество обучения по оценке участников']),
      steps: JSON.stringify(['Формирование списка кандидатов', 'Оценка эффективности обучения', 'Оценка участников', 'Комиссионная оценка', 'Определение победителя']),
      tags: JSON.stringify([]),
      formType: 'basic',
    },
  ];

  const createdNominations: Record<string, string> = {};

  for (const nom of nominationsData) {
    const existing = await prisma.nomination.findUnique({ where: { slug: nom.slug } });
    if (existing) {
      createdNominations[nom.slug] = existing.id;
      console.log(`  ↩ Nomination "${nom.title}" already exists, skipping.`);
    } else {
      const created = await prisma.nomination.create({ data: nom });
      createdNominations[nom.slug] = created.id;
      console.log(`  ✅ Created nomination: ${nom.title}`);
    }
  }

  // ── Winners ────────────────────────────────────────────────
  const winnersData = [
    // Новатор года
    { name: 'Юсупов Мухаммадаъзам Шарифчонович', position: 'Координатор', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Мирзобобоев Мирзобарот Муродчонович', position: 'Начальник производства', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Собиров Далерчон Абдусамадович', position: 'Заведующий лабораторией', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Кучкоров Икром Ильхомжонович', position: 'Специалист', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Рачабова Сталина Рахимовна', position: 'Оператор', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Абдурахимова Нодира Умарчоновна', position: 'Оператор', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Махмудова Бахрихон Нарзуллоевна', position: 'Старший оператор', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Файзуллоев Сипаргис Хусейнчонович', position: 'Специалист', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Азимӣ Хусрав Аъзам', position: 'Менеджер', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Урунова Фарангис Рафиевна', position: 'HR BP', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Хомидов Муродчон Рафикчонович', position: 'Инженер', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Расулов Комилчон Мамадалиевич', position: 'Главный механик', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Саидчонов Иномчон Аличонович', position: 'Слесарь-ремонтник', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Вахобов Абдучамил Абдучаборович', position: 'Слесарь-ремонтник', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Турсунов Курбончон Алиевич', position: 'Токарь-фрезеровщик', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Манонов Абдуахад Абдулахайевич', position: 'Инженер-проектировщик', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Низомиддинов Манучехр Чамшедчонович', position: 'Бухгалтер-реализатор', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    { name: 'Разокзода Фуркат Восити', position: 'Бухгалтер', department: 'Farovon Group', nomSlug: 'novator', year: 2025 },
    // Лучший руководитель
    { name: 'Мирзобобоев Мирзохалим', position: 'Директор', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Шарифзода Шарафчон Шариф', position: 'Начальник', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Абдувахобов Абдували Абдуазизович', position: 'Координатор', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Собиров Рустам Эркинчонович', position: 'Главный технолог', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Нуров Баходур Чамшедович', position: 'Начальник', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Обидов Фарход Муминчонович', position: 'Начальник', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Абдувохидов Чамшед Шарифчонович', position: 'Руководитель', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Валиев Максудчон Абдуганиевич', position: 'Начальник производства', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Махмудов Ислом Усмонович', position: 'Главный энергетик', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    { name: 'Наимов Нурулло Насимович', position: 'Начальник отдела', department: 'Farovon Group', nomSlug: 'leader', year: 2025 },
    // Наставник года
    { name: 'Абдалиева Дилрабо Уктамбоевна', position: 'Шеф повар', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Афсахзод Хаттоби', position: 'Начальник смены', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Турсунбоев Зафаржон Султанович', position: 'Главный механик', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Тусматов Акмалчон Рахматчонович', position: 'Начальник смены', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Хочаев Баховаддин Хошимович', position: 'Начальник производства', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Мавлонов Шавкат Абдумаликович', position: 'Начальник отдела', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Курбонов Субхончон Юсупович', position: 'Главный технолог', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Юнусов Баходур Абдурауфович', position: 'Заведующий складом', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Ашуров Мухсинчон Олимчонович', position: 'Начальник', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Эргашев Равшан Махмудчонович', position: 'Старший оператор', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Рахматов Музаффар Пулотович', position: 'Мастер', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Усмонов Азим Хасанович', position: 'Вспомогательный работник', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Ахмедов Сайфулло Курбанович', position: 'Заведующий складом', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Мавлонов Шахзод Абдумаликович', position: 'Начальник отдела', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    { name: 'Чумаев Аминчон Азимчонович', position: 'Координатор', department: 'Farovon Group', nomSlug: 'mentor', year: 2025 },
    // Тренер года
    { name: 'Рабиев Илхомджон Бобочонович', position: 'Главный аудитор', department: 'Farovon Group', nomSlug: 'trainer', year: 2025 },
    { name: 'Кучкоров Икром Ильхомжонович', position: 'Специалист', department: 'Farovon Group', nomSlug: 'trainer', year: 2025 },
  ];

  const existingWinnerCount = await prisma.winner.count();
  if (existingWinnerCount === 0) {
    for (const w of winnersData) {
      const nomId = createdNominations[w.nomSlug];
      if (!nomId) {
        console.log(`  ⚠ Nomination slug "${w.nomSlug}" not found, skipping winner ${w.name}`);
        continue;
      }
      await prisma.winner.create({
        data: {
          name: w.name,
          position: w.position,
          department: w.department,
          nominationId: nomId,
          year: w.year,
        },
      });
    }
    console.log(`  ✅ Created ${winnersData.length} winners`);
  } else {
    console.log(`  ↩ Winners already exist (${existingWinnerCount}), skipping.`);
  }

  // ── Gallery ────────────────────────────────────────────────
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    const galleryImages = [
      '/images/image_2.jpeg', '/images/image_3.jpeg', '/images/image_4.jpeg',
      '/images/image_5.jpeg', '/images/image_6.jpeg', '/images/image_7.jpeg',
      '/images/image_8.jpeg', '/images/image_9.jpeg', '/images/image_10.jpeg',
      '/images/image_11.jpeg', '/images/image_12.jpeg', '/images/image_13.jpeg',
      '/images/image_14.jpeg', '/images/image_15.jpeg',
    ];
    for (let i = 0; i < galleryImages.length; i++) {
      await prisma.gallery.create({
        data: {
          url: galleryImages[i],
          alt: `Farovon Awards • кадр ${i + 1}`,
          album: 'Итоги года 2025',
          orderIndex: i,
          isVisible: true,
        },
      });
    }
    console.log(`  ✅ Created ${galleryImages.length} gallery items`);
  } else {
    console.log(`  ↩ Gallery already has ${galleryCount} items, skipping.`);
  }

  // ── Hero Slides ────────────────────────────────────────────
  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    const slides = ['/images/image_2.jpeg', '/images/image_3.jpeg', '/images/image_4.jpeg'];
    for (let i = 0; i < slides.length; i++) {
      await prisma.heroSlide.create({
        data: { imageUrl: slides[i], orderIndex: i, isActive: true },
      });
    }
    console.log(`  ✅ Created ${slides.length} hero slides`);
  } else {
    console.log(`  ↩ Hero slides already exist (${slideCount}), skipping.`);
  }

  // ── Site Content (Info Cards) ───────────────────────────────
  const siteContentData = [
    { key: 'info_1_title', value: 'Кто участвует' },
    { key: 'info_1_text', value: 'В программе участвуют сотрудники компании, которые работают не менее 6 месяцев. Для части номинаций предусмотрена подача формы, для части — автоматический анализ данных.' },
    { key: 'info_2_title', value: 'Кто определяет победителей' },
    { key: 'info_2_text', value: 'Для определения победителей формируется специальная конкурсная комиссия из представителей компании. В отдельных номинациях финальное утверждение проходит на уровне Правления.' },
    { key: 'info_3_title', value: 'Главный принцип' },
    { key: 'info_3_text', value: 'Все номинации, критерии, этапы и причины выбора победителей объявляются заранее, чтобы обеспечить прозрачность, справедливость и признание заслуг каждого участника.' },
  ];
  for (const item of siteContentData) {
    const existing = await prisma.siteContent.findUnique({ where: { key: item.key } });
    if (!existing) {
      await prisma.siteContent.create({ data: item });
    }
  }
  console.log('  ✅ Site content seeded');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
