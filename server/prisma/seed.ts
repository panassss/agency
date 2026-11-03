import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  RequestStatus,
  Role,
} from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const services = [
  {
    slug: 'content-marketing',
    icon: 'content',
    title: 'Контент-маркетинг',
    shortDescription:
      'Створюємо корисний контент, яким хочеться ділитися: він залучає аудиторію та приводить органічний трафік.',
    description:
      'Розробляємо контент-стратегію під цілі бізнесу, ведемо блог і соцмережі, готуємо експертні статті, кейси та email-розсилки. Кожен матеріал має чітку мету — від впізнаваності бренду до заявок у відділ продажів.',
  },
  {
    slug: 'graphic-design',
    icon: 'graphic',
    title: 'Графічний дизайн',
    shortDescription:
      'Візуальні історії, що підсилюють бренд: від рекламних макетів до презентацій та пакування.',
    description:
      'Створюємо рекламні креативи, презентації для інвесторів, поліграфію, інфографіку та дизайн пакування. Тримаємо єдиний візуальний стиль у всіх точках контакту з клієнтом.',
  },
  {
    slug: 'digital-marketing',
    icon: 'digital',
    title: 'Цифровий маркетинг',
    shortDescription:
      'Стратегії на основі даних: SEO, контекстна й таргетована реклама, аналітика та оптимізація воронки.',
    description:
      'Налаштовуємо наскрізну аналітику, запускаємо рекламу в Google та Meta, просуваємо сайти в пошуку й щотижня оптимізуємо кампанії за вартістю заявки та окупністю інвестицій.',
  },
  {
    slug: 'web-design',
    icon: 'web',
    title: 'Веб-дизайн і розробка',
    shortDescription:
      'Зручні та швидкі сайти, що відповідають айдентиці бренду й перетворюють відвідувачів на клієнтів.',
    description:
      'Проєктуємо UX, створюємо дизайн і розробляємо адаптивні сайти: лендинги, корпоративні сайти, інтернет-магазини. Дбаємо про швидкість, доступність та SEO-готовність з першого дня.',
  },
  {
    slug: 'it-consulting',
    icon: 'it',
    title: 'IT-консалтинг',
    shortDescription:
      'Допомагаємо обрати й упровадити технології: CRM, автоматизацію процесів, хмарні сервіси.',
    description:
      'Аналізуємо бізнес-процеси, підбираємо та впроваджуємо CRM, ERP і сервіси автоматизації, налаштовуємо інтеграції між системами та навчаємо команду працювати з новими інструментами.',
  },
  {
    slug: 'brand-identity',
    icon: 'brand',
    title: 'Брендинг та айдентика',
    shortDescription:
      'Створюємо впізнаваний бренд, який вирізняє вас серед конкурентів і резонує з цільовою аудиторією.',
    description:
      'Проводимо стратегічну сесію, формуємо позиціонування й тон комунікації, розробляємо назву, логотип, фірмовий стиль і брендбук, з яким легко працювати будь-якому підряднику.',
  },
];

type SeedProject = {
  slug: string;
  service: string;
  title: string;
  subtitle: string;
  client: string;
  location: string;
  date: string;
  coverImage: string;
  featured: boolean;
  challenge: string;
  solution: string;
  result: string;
};

const gallery = [
  '/img/projects/gallery-1.webp',
  '/img/projects/gallery-2.webp',
  '/img/projects/gallery-3.webp',
];

const projects: SeedProject[] = [
  {
    slug: 'internet-mahazyn-zerno',
    service: 'web-design',
    title: 'Інтернет-магазин «Зерно»',
    subtitle: 'Креативний UI-дизайн',
    client: 'ТОВ «Зерно Кава»',
    location: 'Київ, вул. Велика Васильківська, 72',
    date: '2025-09-12',
    coverImage: '/img/projects/project-1.webp',
    featured: true,
    challenge:
      'Мережа кав’ярень продавала зерно лише офлайн, а старий сайт не працював на смартфонах. Понад 70% відвідувачів залишали сторінку, не дійшовши до каталогу.',
    solution:
      'Провели UX-дослідження та інтерв’ю з постійними клієнтами.\nСпроєктували мобільний каталог із фільтрами за обсмаженням і способом заварювання.\nЗапустили підписку на регулярні доставки та швидке оформлення в один крок.',
    result:
      'За перші три місяці онлайн-продажі зросли в 3,4 раза, а частка повторних замовлень досягла 41%. Середній час оформлення замовлення скоротився до 50 секунд.',
  },
  {
    slug: 'tsyfrova-stratehiia-agrotech',
    service: 'digital-marketing',
    title: 'Цифрова стратегія для AgroTech',
    subtitle: 'Маркетинг у соціальних мережах',
    client: 'AgroTech Ukraine',
    location: 'Дніпро, просп. Яворницького, 41',
    date: '2025-06-03',
    coverImage: '/img/projects/project-2.webp',
    featured: true,
    challenge:
      'Виробник агродронів виходив на новий ринок і не мав зрозумілої стратегії просування. Рекламний бюджет розпорошувався між каналами без вимірюваного результату.',
    solution:
      'Побудували портрети покупців і карту шляху клієнта.\nНалаштували наскрізну аналітику від реклами до угоди в CRM.\nЗапустили серію відеокейсів з фермерами в соцмережах.',
    result:
      'Вартість кваліфікованого ліда знизилась на 38%, а кількість демо-показів зросла вдвічі. Компанія вперше отримала прогнозований потік заявок.',
  },
  {
    slug: 'aidentyka-lisova-pasika',
    service: 'brand-identity',
    title: 'Айдентика «Лісова пасіка»',
    subtitle: 'Креативний ребрендинг логотипа',
    client: 'ФОП Гуменюк О. В.',
    location: 'Івано-Франківськ, вул. Незалежності, 15',
    date: '2025-11-20',
    coverImage: '/img/projects/project-3.webp',
    featured: true,
    challenge:
      'Сімейна пасіка виходила в мережеві супермаркети, але пакування губилося на полиці серед конкурентів. Бренд не передавав натуральність і карпатське походження продукту.',
    solution:
      'Сформували позиціонування «мед з історією конкретного лісу».\nСтворили новий логотип, палітру та ілюстрації для кожного сорту.\nРозробили брендбук і макети пакування для трьох форматів.',
    result:
      'Продукцію взяли в дві національні мережі, а впізнаваність бренду в регіоні зросла на 27% за опитуванням. Ціну вдалося підняти на 15% без втрати продажів.',
  },
  {
    slug: 'ui-dyzain-fintrack',
    service: 'web-design',
    title: 'UI-дизайн застосунку FinTrack',
    subtitle: 'Дизайн мобільного інтерфейсу',
    client: 'FinTrack',
    location: 'Львів, вул. Городоцька, 120',
    date: '2026-02-14',
    coverImage: '/img/projects/project-4.webp',
    featured: true,
    challenge:
      'Застосунок для обліку фінансів малого бізнесу мав низьку активацію: користувачі не розуміли, з чого почати після реєстрації.',
    solution:
      'Переробили онбординг у три короткі кроки з підказками.\nСтворили дизайн-систему з 60+ компонентів.\nПротестували прототипи на 25 підприємцях до старту розробки.',
    result:
      'Активація нових користувачів зросла з 22% до 58%, а рейтинг застосунку в App Store піднявся до 4,8.',
  },
  {
    slug: 'kontent-stratehiia-medcenter',
    service: 'content-marketing',
    title: 'Контент-стратегія для «МедЦентру»',
    subtitle: 'Експертний блог і розсилки',
    client: 'Клініка «МедЦентр»',
    location: 'Одеса, вул. Дерибасівська, 9',
    date: '2025-03-18',
    coverImage: '/img/projects/project-5.webp',
    featured: false,
    challenge:
      'Приватна клініка повністю залежала від платної реклами. Сайт не мав корисного контенту й майже не отримував трафіку з пошуку.',
    solution:
      'Склали семантичне ядро з 400 запитів пацієнтів.\nЗапустили блог зі статтями, перевіреними лікарями клініки.\nНалаштували тригерні email-розсилки після візиту.',
    result:
      'Органічний трафік зріс у 5 разів за пів року, а 30% записів на прийом тепер надходять з блогу.',
  },
  {
    slug: 'hrafichnyi-dyzain-urban-fest',
    service: 'graphic-design',
    title: 'Графічний дизайн Urban Fest',
    subtitle: 'Візуальна концепція фестивалю',
    client: 'ГО «Urban Fest»',
    location: 'Харків, майдан Свободи, 5',
    date: '2024-08-07',
    coverImage: '/img/projects/project-6.webp',
    featured: false,
    challenge:
      'Міський фестиваль потребував яскравої візуальної концепції, яка працюватиме однаково добре на білбордах, у соцмережах і на мерчі.',
    solution:
      'Створили модульну графічну систему з геометричних форм.\nПідготували понад 120 адаптацій: афіші, банери, сторіз, квитки.\nРозробили лінійку мерчу та навігацію на локації.',
    result:
      'Фестиваль відвідали 18 000 гостей, а охоплення рекламної кампанії в соцмережах перевищило 1,2 млн.',
  },
  {
    slug: 'crm-dlia-logistyky',
    service: 'it-consulting',
    title: 'Упровадження CRM для «ЛогістикПро»',
    subtitle: 'Автоматизація продажів',
    client: 'ТОВ «ЛогістикПро»',
    location: 'Вінниця, вул. Соборна, 64',
    date: '2025-01-27',
    coverImage: '/img/projects/project-7.webp',
    featured: false,
    challenge:
      'Менеджери вели клієнтів у таблицях і месенджерах, через що губилися заявки, а керівник не бачив реальної картини продажів.',
    solution:
      'Провели аудит процесів і описали воронку продажів.\nУпровадили CRM з інтеграцією телефонії та пошти.\nАвтоматизували розрахунок вартості перевезення та нагадування.',
    result:
      'Час обробки заявки скоротився з 4 годин до 25 хвилин, а конверсія в угоду зросла на 19%.',
  },
  {
    slug: 'rebrendynh-kovorkinhu-hub',
    service: 'brand-identity',
    title: 'Ребрендинг коворкінгу HUB 42',
    subtitle: 'Нова айдентика та навігація',
    client: 'HUB 42',
    location: 'Ужгород, вул. Корзо, 3',
    date: '2024-11-05',
    coverImage: '/img/projects/project-2.webp',
    featured: false,
    challenge:
      'Коворкінг змінив концепцію на простір для IT-команд, але старий бренд асоціювався з антикафе.',
    solution:
      'Оновили позиціонування та тон комунікації.\nРозробили новий логотип і систему навігації в просторі.\nОформили соцмережі та сайт у новому стилі.',
    result:
      'Заповнюваність простору зросла з 55% до 92% за чотири місяці, з’явилися корпоративні клієнти на довгострокову оренду.',
  },
  {
    slug: 'seo-dlia-mebliv-dim',
    service: 'digital-marketing',
    title: 'SEO-просування «Меблі Дім»',
    subtitle: 'Пошукова оптимізація магазину',
    client: 'Меблева фабрика «Дім»',
    location: 'Житомир, вул. Київська, 77',
    date: '2026-04-09',
    coverImage: '/img/projects/project-5.webp',
    featured: false,
    challenge:
      'Інтернет-магазин меблів мав тисячі товарів, але сторінки категорій не потрапляли в топ пошуку через технічні помилки та дублікати.',
    solution:
      'Провели технічний аудит і виправили 1 300 помилок індексації.\nПереробили структуру категорій і фільтрів.\nНаписали унікальні описи для ключових категорій.',
    result:
      'Видимість сайту в Google зросла втричі, а дохід з органічного трафіку — на 64% за пів року.',
  },
];

const team = [
  {
    name: 'Олена Гордієнко',
    position: 'Засновниця та CEO',
    photo: '/img/team/team-1.webp',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
    order: 1,
  },
  {
    name: 'Андрій Савчук',
    position: 'Керівник з маркетингу',
    photo: '/img/team/team-2.webp',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
    order: 2,
  },
  {
    name: 'Марія Литвин',
    position: 'Керівниця відділу дизайну',
    photo: '/img/team/team-3.webp',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
    order: 3,
  },
];

const testimonials = [
  {
    author: 'Ірина Мельник',
    position: 'CEO освітньої платформи «Eduport»',
    avatar: '/img/testimonials/avatar-1.webp',
    quote:
      'Команда Canvix чесно оцінила наш бізнес і дала конструктивні рекомендації. Завдяки новій стратегії ми подвоїли кількість учнів за рік.',
  },
  {
    author: 'Дмитро Ковальчук',
    position: 'Засновник «Зерно Кава»',
    avatar: '/img/testimonials/avatar-2.webp',
    quote:
      'Новий інтернет-магазин окупився за два місяці. Особливо цінуємо, що хлопці пояснювали кожне рішення цифрами, а не лише красивими макетами.',
  },
  {
    author: 'Світлана Бондар',
    position: 'Маркетинг-директорка AgroTech Ukraine',
    avatar: '/img/testimonials/avatar-3.webp',
    quote:
      'Нарешті ми бачимо, яка реклама приносить угоди. Прозора аналітика й щотижневі звіти зробили маркетинг керованим.',
  },
];

async function seedContent() {
  await prisma.service.createMany({
    data: services.map((service, index) => ({ ...service, order: index + 1 })),
  });
  const serviceIds = new Map(
    (await prisma.service.findMany()).map((service) => [
      service.slug,
      service.id,
    ]),
  );
  await prisma.project.createMany({
    data: projects.map(({ service, date, ...project }) => ({
      ...project,
      date: new Date(date),
      gallery,
      serviceId: serviceIds.get(service)!,
    })),
  });
  await prisma.teamMember.createMany({ data: team });
  await prisma.testimonial.createMany({ data: testimonials });
}

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user',
    );
  }
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail.toLowerCase(),
      name: process.env.ADMIN_NAME ?? 'Адміністратор Canvix',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: Role.ADMIN,
    },
  });
}

async function seedDemoUser() {
  const demo = await prisma.user.upsert({
    where: { email: 'user@canvix.ua' },
    update: {},
    create: {
      name: 'Тарас Шевчук',
      email: 'user@canvix.ua',
      passwordHash: await bcrypt.hash('User12345', 10),
      role: Role.USER,
    },
  });
  const web = await prisma.service.findUnique({
    where: { slug: 'web-design' },
  });
  const brand = await prisma.service.findUnique({
    where: { slug: 'brand-identity' },
  });
  await prisma.request.createMany({
    data: [
      {
        userId: demo.id,
        serviceId: web?.id,
        firstName: 'Тарас',
        lastName: 'Шевчук',
        email: demo.email,
        phone: '+380 67 555 12 34',
        message:
          'Потрібен новий сайт для мережі автосервісів з онлайн-записом.',
        status: RequestStatus.IN_PROGRESS,
      },
      {
        userId: demo.id,
        serviceId: brand?.id,
        firstName: 'Тарас',
        lastName: 'Шевчук',
        email: demo.email,
        phone: '+380 67 555 12 34',
        message:
          'Хочемо оновити логотип і фірмовий стиль до відкриття нової філії.',
        status: RequestStatus.NEW,
      },
    ],
  });
}

/**
 * Runs on every deploy, so demo content is inserted only into an empty database:
 * records the admin edits or deletes later must not reappear after a restart.
 */
async function main() {
  if ((await prisma.service.count()) === 0) {
    await seedContent();
    await seedDemoUser();
  }
  await ensureAdmin();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
