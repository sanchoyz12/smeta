export const OBJECTS = {
	studio: {
		label: 'Студия', note: '20–55 м²', story: 'Компактная система без лишних устройств: свет, климат и защита воды работают как одно целое.', image: './assets/configurator/object-studio.jpg',
		area: { min: 20, max: 55, value: 34 }, floors: 1, bathrooms: 1,
		rooms: ['entry', 'living', 'kitchen', 'bath']
	},
	apartment: {
		label: '2-комнатная квартира', note: '40–160 м²', story: 'Отдельные сценарии для общей зоны и спальни, стабильная связь и комфорт для каждого дома.', image: './assets/configurator/object-apartment.jpg',
		area: { min: 40, max: 160, value: 68 }, floors: 1, bathrooms: 1,
		rooms: ['entry', 'living', 'kitchen', 'bedroom', 'bath']
	},
	duplex: {
		label: 'Дуплекс', note: '75–240 м²', story: 'Два уровня, ночной маршрут по лестнице и единое управление климатом, светом и безопасностью.', image: './assets/configurator/object-duplex.jpg',
		area: { min: 75, max: 240, value: 118 }, floors: 2, bathrooms: 2,
		rooms: ['entry', 'living', 'kitchen', 'bedroom', 'bath', 'office', 'stairs']
	}
};

export const ROOMS = [
	{ id: 'entry', label: 'Прихожая', note: 'встреча и доступ', detail: 'Мягкий свет, дверь и гостевой доступ.', image: './assets/configurator/scenario-welcome.jpg' },
	{ id: 'living', label: 'Гостиная', note: 'свет и атмосфера', detail: 'Кино-вечер, шторы и голосовое управление.', image: './assets/configurator/scenario-cinema.jpg' },
	{ id: 'kitchen', label: 'Кухня', note: 'быт и безопасность', detail: 'Свет, розетки и контроль воды.', image: './assets/configurator/object-apartment.jpg' },
	{ id: 'bedroom', label: 'Спальня', note: 'сон и климат', detail: 'Тихое пробуждение, воздух и шторы.', image: './assets/configurator/scenario-curtains.jpg' },
	{ id: 'child', label: 'Детская', note: 'мягкий свет ночью', detail: 'Без резкого света и лишнего шума.', image: './assets/configurator/object-studio.jpg' },
	{ id: 'bath', label: 'Ванная', note: 'вода и влажность', detail: 'Протечки, вытяжка и тёплый пол.', image: './assets/configurator/scenario-leak.jpg' },
	{ id: 'office', label: 'Кабинет', note: 'фокус и воздух', detail: 'Свежий воздух и спокойный рабочий свет.', image: './assets/configurator/scenario-climate.jpg' },
	{ id: 'stairs', label: 'Лестница', note: 'свет и безопасность', detail: 'Ночная подсветка между этажами.', image: './assets/configurator/object-duplex.jpg' }
];

export const CATALOG = {
	hub: { title: 'Zigbee-хаб', price: 7750, category: 'base' },
	stationMidi: { title: 'Центр голосового управления', price: 15700, category: 'base', replaces: ['hub'] },
	stationMini: { title: 'Дополнительный голосовой модуль', price: 9000, category: 'base' },
	wifi6: { title: 'Wi‑Fi 6 / mesh', price: 15950, category: 'base' },
	wallPanel: { title: 'Настенная панель управления', price: 26250, category: 'base' },
	commissioning: { title: 'Настройка ядра и сценариев', price: 2000, category: 'base' },
	smartBulb: { title: 'Умная лампа', price: 2800, category: 'light' },
	lightRelay: { title: 'Реле света', price: 5450, category: 'light' },
	smartSwitch: { title: 'Умный выключатель', price: 6500, category: 'light' },
	dimmer: { title: 'Диммер', price: 7575, category: 'light' },
	nightLed: { title: 'Ночная подсветка', price: 6050, category: 'light' },
	curtainDrive: { title: 'Привод штор', price: 9950, category: 'curtains' },
	curtainRetrofit: { title: 'Привод на существующие шторы', price: 11375, category: 'curtains' },
	rollerDrive: { title: 'Привод рулонной шторы', price: 12675, category: 'curtains' },
	motorCornice: { title: 'Моторизованный карниз', price: 17125, category: 'curtains', replaces: ['curtainDrive', 'curtainRetrofit'] },
	humiditySensor: { title: 'Датчик влажности', price: 3525, category: 'climate' },
	climateSensor: { title: 'Датчик температуры и влажности', price: 4725, category: 'climate', replaces: ['humiditySensor'] },
	acControl: { title: 'Управление кондиционером', price: 8175, category: 'climate' },
	floorThermostat: { title: 'Термостат тёплого пола', price: 13500, category: 'climate' },
	brizer: { title: 'Умный бризер', price: 80625, category: 'climate' },
	fanControl: { title: 'Управление вытяжкой', price: 4200, category: 'climate' },
	leakSensor: { title: 'Датчик протечки', price: 6075, category: 'safety' },
	shutoffValve: { title: 'Кран перекрытия воды', price: 22375, category: 'safety' },
	leakKit4: { title: 'Защита от протечек, 4 зоны', price: 46675, category: 'safety' },
	openingSensor: { title: 'Датчик открытия', price: 3375, category: 'access' },
	videoPeephole: { title: 'Видеоглазок', price: 12750, category: 'access' },
	hallCamera: { title: 'Камера входной группы', price: 18000, category: 'access' },
	codeLock: { title: 'Кодовый замок', price: 30125, category: 'access' },
	biometricLock: { title: 'Биометрический замок', price: 45125, category: 'access', replaces: ['codeLock'] },
	noiseSensor: { title: 'Контроль уровня шума', price: 8125, category: 'safety' },
	smartOutlet: { title: 'Умная розетка', price: 2700, category: 'energy' },
	powerRelay: { title: 'Силовое реле', price: 6050, category: 'energy' },
	soilSensor: { title: 'Датчик почвы', price: 4300, category: 'care' },
	growLight: { title: 'Фитосвет', price: 5250, category: 'care' },
	watering: { title: 'Автополив', price: 8750, category: 'care' },
	petCamera: { title: 'Камера для питомца', price: 11625, category: 'care' },
	petFeeder: { title: 'Автокормушка', price: 14625, category: 'care' },
};

export const CATEGORY_LABELS = {
	base: 'Основа системы', light: 'Свет', curtains: 'Шторы', climate: 'Климат и воздух',
	safety: 'Безопасность', access: 'Доступ', energy: 'Энергия', care: 'Забота и быт'
};

const req = (sku, qty = 1, scope = 'home') => ({ sku, qty, scope });

export function deriveMetrics(state) {
	const object = OBJECTS[state.object] || OBJECTS.apartment;
	const area = Number(state.area || object.area.value);
	const bathrooms = Math.max(object.bathrooms || 1, state.rooms.filter((id) => id === 'bath').length);
	const roomCount = Math.max(1, state.rooms.length);
	return {
		area,
		floors: object.floors,
		roomCount,
		bathrooms,
		windows: Math.max(2, Math.ceil(area / 24)),
		lightZones: Math.max(3, Math.ceil(area / 15)),
		climateZones: Math.max(1, Math.ceil(area / 35)),
		acUnits: Math.max(1, Math.ceil(area / 42)),
		leakPoints: 2 + bathrooms * 2,
		nightSegments: Math.min(4, object.floors + (state.household === 'family' ? 1 : 0) + 1),
		smartOutlets: Math.min(7, Math.max(2, Math.ceil(area / 22))),
		brizers: Math.max(1, Math.ceil(area / 60)),
		extraSpeakers: Math.min(3, Math.max(0, Math.ceil(roomCount / 3) - 1)),
		needsWifi6: area > 70 || object.floors > 1
	};
}

export const SCENARIOS = [
	{
		id: 'welcome', category: 'Свет · Прихожая', title: 'Вы вернулись домой',
		text: 'Мягкий свет включается автоматически при открытии двери, и дом снимает режим ухода.',
		image: './assets/configurator/scenario-welcome.jpg', equipment: 'датчик открытия · выключатель · настройка',
		rooms: ['entry', 'living'], scalable: true,
		reason: () => 'Базовый сценарий, который ощущается каждый день.',
		items: ({ scopeCount }) => [req('openingSensor', 1, 'entrance'), req('smartSwitch', Math.max(1, scopeCount), 'welcome-light')]
	},
	{
		id: 'night', category: 'Комфорт · Ночь', title: 'Ночной маршрут',
		text: 'Ночью горит ровно столько света, сколько нужно, чтобы безопасно пройти — не тревожа сон.',
		image: './assets/configurator/object-studio.jpg', equipment: 'нижняя подсветка · датчик движения · сценарий',
		rooms: ['entry', 'kitchen', 'bedroom', 'child', 'bath', 'stairs'], scalable: true,
		reason: (state) => state.household === 'family' ? 'Особенно полезно семье с детьми.' : 'Никакого яркого верхнего света ночью.',
		items: ({ metrics, scopeCount }) => [req('nightLed', Math.max(1, scopeCount || metrics.nightSegments), 'night-route')]
	},
	{
		id: 'cinema', category: 'Атмосфера · Отдых', title: 'Один жест — и начинается кино',
		text: 'Свет, шторы и управление собираются в спокойный вечерний сценарий — без пяти отдельных команд.',
		image: './assets/configurator/scenario-cinema.jpg', equipment: 'диммер · привод штор · силовое реле',
		rooms: ['living', 'bedroom'], scalable: true,
		reason: () => 'Красивый многокомпонентный сценарий без рутины.',
		items: ({ scopeCount }) => [req('dimmer', Math.max(1, scopeCount), 'cinema'), req('curtainDrive', Math.max(1, scopeCount), 'curtains'), req('powerRelay', 1, 'media')]
	},
	{
		id: 'climate', category: 'Климат · Комфорт', title: 'Дома уже комфортно',
		text: 'Квартира заранее приходит к комфортной температуре и поддерживает её только в нужных комнатах.',
		image: './assets/configurator/scenario-climate.jpg', equipment: 'датчики климата · управление кондиционером',
		rooms: ['living', 'bedroom', 'child', 'office', 'kitchen'], scalable: true,
		reason: () => 'Экономит энергию, когда дома никого нет.',
		items: ({ metrics, scopeCount }) => [req('climateSensor', Math.max(1, scopeCount || metrics.climateZones), 'climate-zones'), req('acControl', Math.max(1, Math.min(scopeCount || metrics.acUnits, metrics.acUnits)), 'air-conditioners')]
	},
	{
		id: 'curtains', category: 'Шторы · Приватность', title: 'Свет и приватность по ритму дня',
		text: 'Шторы открываются утром, защищают от солнца днём и закрываются вечером.',
		image: './assets/configurator/scenario-curtains.jpg', equipment: 'приводы · расписание · ручное управление',
		rooms: ['living', 'bedroom', 'child', 'office', 'kitchen'], scalable: true,
		reason: () => 'Работает автоматически, но всегда доступно вручную.',
		items: ({ state, scopeCount }) => [req(state.buildStage === 'finished' ? 'curtainRetrofit' : 'curtainDrive', Math.max(1, scopeCount), 'curtains')]
	},
	{
		id: 'leaks', category: 'Безопасность · Вода', title: 'Вода под контролем',
		text: 'Датчики вовремя замечают протечку, запускают перекрытие воды и отправляют уведомление.',
		image: './assets/configurator/scenario-leak.jpg', equipment: '4 датчика · электрокран · автоматическое перекрытие',
		rooms: [], scalable: false,
		reason: () => 'Критичный сценарий безопасности — рекомендуем всегда.',
		items: ({ metrics }) => [req('leakKit4', 1, 'water-main'), ...(metrics.leakPoints > 4 ? [req('leakSensor', metrics.leakPoints - 4, 'extra-leak-points')] : [])]
	},
	{
		id: 'access', category: 'Доступ · Вход', title: 'Доступ без передачи ключей',
		text: 'Вы видите гостя, курьера или клинера и выдаёте временный доступ с визуальным подтверждением.',
		image: './assets/configurator/scenario-access.jpg', equipment: 'видеоглазок · кодовый замок · датчик двери',
		rooms: [], scalable: false,
		reason: (state) => state.usage === 'rent' ? 'Подходит для аренды и гостевого доступа.' : 'Удобно для семьи, гостей и сервисов.',
		items: () => [req('videoPeephole', 1, 'entrance'), req('codeLock', 1, 'entrance'), req('openingSensor', 1, 'entrance')]
	},
	{
		id: 'away', category: 'Безопасность · Уход', title: 'Ушли — дом всё проверил',
		text: 'Одна команда отключает управляемые розетки, проверяет окна и запускает эффект присутствия.',
		image: './assets/configurator/scenario-away.jpg', equipment: 'розетки · силовое реле · датчики открытия',
		rooms: [], scalable: false,
		reason: () => 'Одна команда вместо проверки всей квартиры.',
		items: ({ metrics }) => [req('smartOutlet', metrics.smartOutlets, 'managed-outlets'), req('powerRelay', 1, 'away-mode'), req('openingSensor', Math.min(4, metrics.windows), 'windows')]
	},
	{
		id: 'air', category: 'Климат · Воздух', title: 'Всегда свежий воздух',
		text: 'Датчики замечают духоту и влажность, а вентиляция реагирует автоматически.',
		image: './assets/configurator/scenario-air.jpg', equipment: 'датчики климата · вытяжка или бризер',
		rooms: ['living', 'bedroom', 'child', 'office'], scalable: true,
		reason: (state) => state.household === 'family' ? 'Комфортнее для сна и детской.' : 'Свежий воздух без постоянного контроля.',
		items: ({ state, metrics, scopeCount }) => state.budget === 'premium'
			? [req('climateSensor', Math.max(1, scopeCount), 'climate-zones'), req('brizer', metrics.brizers, 'living-zones')]
			: [req('humiditySensor', Math.max(1, scopeCount), 'climate-zones'), req('fanControl', metrics.bathrooms, 'wet-zones')]
	},
	{
		id: 'control', category: 'Управление · Интерфейс', title: 'Дом понимает с полуслова',
		text: 'Свет, климат, шторы и сценарии запускаются голосом, с панели или из приложения.',
		image: './assets/configurator/scenario-voice.jpg', equipment: 'центр управления · приложение · сценарии',
		rooms: ['living', 'bedroom', 'kitchen'], scalable: false,
		reason: (state) => `Учтём выбранный способ управления: ${state.control === 'panel' ? 'панель' : state.control === 'app' ? 'приложение' : state.control === 'minimal' ? 'минимум интерфейсов' : 'голос'}.`,
		items: ({ state, metrics }) => {
			if (state.control === 'panel') return [req('wallPanel', 1, 'core')];
			if (state.control === 'app') return [];
			if (state.control === 'minimal') return [req('stationMini', 1, 'core')];
			return [req('stationMidi', 1, 'core'), ...(metrics.extraSpeakers ? [req('stationMini', metrics.extraSpeakers, 'rooms')] : [])];
		}
	},
	{
		id: 'cleaning', optional: true, category: 'Быт · Уборка', title: 'Уборка, пока никого нет',
		text: 'Робот начинает работу после ухода, а дом заранее освобождает для него спокойное время.',
		image: './assets/configurator/scenario-cleaning.jpg', equipment: 'датчик ухода · умная розетка · интеграция робота',
		rooms: [], scalable: false,
		reason: () => 'Робот и база подбираются отдельно; в смете — инфраструктура запуска.',
		items: () => [req('openingSensor', 1, 'entrance'), req('smartOutlet', 1, 'cleaning-base')]
	},
	{
		id: 'plants', optional: true, category: 'Забота · Растения', title: 'Растения не забыты',
		text: 'Датчики следят за почвой, включают фитосвет и напоминают о поливе или запускают его.',
		image: './assets/configurator/scenario-plants.jpg', equipment: 'датчик почвы · фитосвет · автополив',
		rooms: [], scalable: false,
		reason: () => 'Персональная рекомендация — вы отметили растения.',
		items: () => [req('soilSensor', 1, 'plants'), req('growLight', 1, 'plants'), req('watering', 1, 'plants')]
	},
	{
		id: 'pets', optional: true, category: 'Забота · Питомец', title: 'Питомец под присмотром',
		text: 'Камера покажет, всё ли спокойно, а кормушка сработает по расписанию.',
		image: './assets/configurator/scenario-pets.jpg', equipment: 'поворотная камера · автокормушка',
		rooms: [], scalable: false,
		reason: () => 'Персональная рекомендация — вы отметили питомца.',
		items: () => [req('petCamera', 1, 'pet-zone'), req('petFeeder', 1, 'pet-zone')]
	},
	{
		id: 'rental', optional: true, category: 'Аренда · Контроль', title: 'Гостевой цикл без рутины',
		text: 'Временный доступ, первый вход с приветствием и сценарий выезда работают как один гостевой цикл.',
		image: './assets/configurator/scenario-access.jpg', equipment: 'замок · датчик шума · сценарий выезда',
		rooms: [], scalable: false,
		reason: () => 'Персональная рекомендация для аренды.',
		items: () => [req('codeLock', 1, 'entrance'), req('noiseSensor', 1, 'home')]
	},
	{
		id: 'warmfloor', optional: true, category: 'Климат · Санузел', title: 'Тёплый пол к первому шагу',
		text: 'Пол прогревается к подъёму и снижает температуру, когда дома никого нет.',
		image: './assets/configurator/scenario-climate.jpg', equipment: 'термостат · расписание · ограничение температуры',
		rooms: ['bath'], scalable: true,
		reason: () => 'Добавляет ежедневный комфорт без лишнего расхода энергии.',
		items: ({ metrics }) => [req('floorThermostat', metrics.bathrooms, 'wet-zones')]
	}
];

export function buildDeck(state) {
	const compatible = (scenario) => !scenario.scalable || scenario.rooms.some((room) => state.rooms.includes(room));
	const core = SCENARIOS.filter((scenario) => !scenario.optional && compatible(scenario));
	const score = {
		pets: state.pets ? 100 : -20,
		plants: state.plants ? 100 : -15,
		rental: state.usage === 'rent' || state.usage === 'mixed' ? 95 : -30,
		cleaning: state.household === 'family' ? 75 : 55,
		warmfloor: state.budget === 'premium' ? 92 : state.household === 'family' ? 70 : 50
	};
	const ranked = SCENARIOS.filter((scenario) => scenario.optional && compatible(scenario))
		.sort((a, b) => score[b.id] - score[a.id]);
	const rental = ranked.find((scenario) => scenario.id === 'rental');
	const personal = state.usage === 'rent' && rental
		? [rental, ...ranked.filter((scenario) => scenario.id !== 'rental')].slice(0, 2)
		: ranked.slice(0, 2);
	return [...core, ...personal];
}

export function scopeForScenario(scenario, state) {
	if (!scenario.scalable) return [];
	return state.rooms.filter((room) => scenario.rooms.includes(room));
}

export function requirementsForScenario(scenario, state, customScope) {
	const eligible = scopeForScenario(scenario, state);
	const filteredScope = scenario.scalable && customScope?.length
		? customScope.filter((room) => eligible.includes(room))
		: [];
	const scope = filteredScope.length ? filteredScope : eligible;
	if (scenario.scalable && !scope.length) return [];
	return scenario.items({ state, metrics: deriveMetrics(state), scope, scopeCount: scope.length });
}

export function compileEstimate(state) {
	const deck = buildDeck(state);
	const requirements = new Map();
	const origins = new Map();
	const ensure = (item, origin, automatic = false) => {
		const key = `${item.sku}:${item.scope}`;
		const current = requirements.get(key);
		if (!current || current.qty < item.qty) requirements.set(key, { ...item, automatic });
		if (!origins.has(key)) origins.set(key, new Set());
		origins.get(key).add(origin);
	};

	for (const scenario of deck) {
		if (state.decisions?.[scenario.id] !== 'yes') continue;
		for (const item of requirementsForScenario(scenario, state, state.scopes?.[scenario.id])) ensure(item, scenario.title);
	}

	const accepted = deck.filter((scenario) => state.decisions?.[scenario.id] === 'yes');
	if (accepted.length) {
		const hasHub = [...requirements.values()].some((item) => ['hub', 'stationMidi'].includes(item.sku));
		if (!hasHub && !state.existingHub) ensure(req('hub', 1, 'core'), 'Обязательная основа', true);
		if (deriveMetrics(state).needsWifi6 && !state.existingWifi) ensure(req('wifi6', 1, 'network'), 'Стабильная сеть', true);
		ensure(req('commissioning', 1, 'service'), 'Настройка проекта', true);
	}

	for (const [key, item] of requirements) {
		const replacement = [...requirements.values()].find((candidate) =>
			candidate.scope === item.scope
			&& candidate.sku !== item.sku
			&& CATALOG[candidate.sku]?.replaces?.includes(item.sku)
		);
		if (!replacement) continue;
		if (replacement.qty >= item.qty) requirements.delete(key);
		else requirements.set(key, { ...item, qty: item.qty - replacement.qty });
	}

	const lines = [...requirements.entries()].map(([key, item]) => {
		const catalog = CATALOG[item.sku];
		return {
			...item,
			key,
			title: catalog.title,
			category: catalog.category,
			unitPrice: catalog.price,
			total: catalog.price * item.qty,
			origins: [...(origins.get(key) || [])]
		};
	}).sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

	const catalogSubtotal = lines.reduce((sum, line) => sum + line.total, 0);
	const stageFactor = { planning: 1, renovation: 1.04, finished: 1.10 }[state.buildStage] || 1;
	const floorFactor = deriveMetrics(state).floors > 1 ? 1.05 : 1;
	const expectedRaw = catalogSubtotal * stageFactor * floorFactor;
	const round500 = (value) => Math.round(value / 500) * 500;
	const categories = {};
	for (const line of lines) categories[line.category] = (categories[line.category] || 0) + line.total;

	return {
		deck,
		accepted,
		lines,
		categories,
		deviceCount: lines.reduce((sum, line) => sum + line.qty, 0),
		catalogSubtotal: round500(catalogSubtotal),
		expected: round500(expectedRaw),
		range: { from: round500(Math.min(catalogSubtotal, expectedRaw)), to: round500(Math.max(catalogSubtotal, expectedRaw) * 1.08) },
		reserve: Math.max(0, round500(expectedRaw - catalogSubtotal)),
		match: accepted.length ? Math.min(96, 70 + accepted.length * 3) : 0,
		assumptions: [
			'Цены — предварительные ориентиры с типовым монтажом',
			state.buildStage === 'finished' ? 'Учтён резерв на аккуратный монтаж в готовом интерьере' : 'Система планируется вместе с текущим этапом работ',
			deriveMetrics(state).floors > 1 ? 'Учтена сложность нескольких уровней' : null,
			deriveMetrics(state).needsWifi6 && !state.existingWifi ? 'Добавлена стабильная сеть Wi‑Fi 6 / mesh' : 'Используется существующая стабильная Wi‑Fi сеть'
		].filter(Boolean)
	};
}

export function formatPrice(value) {
	return new Intl.NumberFormat('ru-RU').format(Math.round(value || 0)) + ' ₽';
}
